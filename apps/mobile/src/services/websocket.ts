/**
 * WebSocket service for real-time communication with backend
 * Handles matchmaking, match events, and connection management
 */

import type { Category, RankTier } from '../../../../packages/types/src';

export interface OpponentInfo {
  id: string;
  username: string;
  avatar: string;
  rankTier: RankTier;
  rankPoints: number;
  winRate: number;
}

export interface QuestionInfo {
  id: string;
  text: string;
  category: Category;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MatchStats {
  avgResponseTime: number;
  fastestAnswer: number;
  accuracy: number;
}

export type ServerEvent =
  // Connection
  | { type: 'pong'; timestamp: number; serverTime: number }
  | { type: 'connected'; userId: string; serverTime: number }
  | { type: 'queue_joined'; position: number; category: Category }
  | { type: 'queue_left' }

  // Match Lifecycle
  | {
      type: 'match_found';
      matchId: string;
      opponent: OpponentInfo;
      category: Category;
    }
  | { type: 'match_starting'; matchId: string; countdown: number }
  | { type: 'match_started'; matchId: string; currentRound: number }

  // Round Events
  | {
      type: 'round_start';
      matchId: string;
      roundIndex: number;
      question: QuestionInfo;
      answers: string[];
      startTime: number;
      endTime: number;
    }
  | {
      type: 'round_answer';
      matchId: string;
      roundIndex: number;
      playerId: string;
      correct: boolean;
      timeMs: number;
    }
  | {
      type: 'round_end';
      matchId: string;
      roundIndex: number;
      winner: string | null;
      scores: { currentPlayer: number; opponent: number };
      correctAnswer: number;
    }
  | {
      type: 'round_timeout';
      matchId: string;
      roundIndex: number;
      correctAnswer: number;
    }

  // Match End
  | {
      type: 'match_end';
      matchId: string;
      winner: string;
      finalScores: { currentPlayer: number; opponent: number };
      rankPointsChange: number;
      oldRankPoints?: number;
      newRankPoints?: number;
      oldTier?: string;
      newTier?: string;
      tierChanged?: boolean;
      stats: MatchStats;
    }

  // Connection Events
  | {
      type: 'opponent_disconnected';
      matchId: string;
      graceEndTime: number;
    }
  | { type: 'opponent_reconnected'; matchId: string }
  | {
      type: 'match_abandoned';
      matchId: string;
      reason: 'opponent_timeout' | 'opponent_left' | 'grace_period_expired';
    }

  // Rematch
  | { type: 'rematch_requested'; matchId: string; requesterId: string }
  | { type: 'rematch_declined'; matchId: string }
  | { type: 'rematch_cancelled'; matchId: string }

  // Errors
  | { type: 'error'; code: string; message: string };

export type ClientEvent =
  | {
      type: 'ping';
      timestamp: number;
    }
  | {
      type: 'join_queue';
      category: Category;
      rankPoints: number;
      username: string;
    }
  | {
      type: 'cancel_queue';
      category: Category;
    }
  | {
      type: 'answer_submit';
      matchId: string;
      roundIndex: number;
      answerIndex: number;
      timestamp: number;
    }
  | {
      type: 'sync_match';
      matchId: string;
    }
  | {
      type: 'leave_match';
      matchId: string;
    };

export interface WebSocketConfig {
  url: string;
  userId: string;
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<ServerEvent['type'], Set<(event: any) => void>> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.config.url}?token=${encodeURIComponent(this.config.token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          this.config.onConnect?.();
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as ServerEvent;
            console.log('[WebSocket] ⭐ Received message:', data.type, data);
            this.handleMessage(data);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.config.onError?.(error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.stopPingInterval();
          this.config.onDisconnect?.();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPingInterval();
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Send event to server
   */
  send(event: ClientEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('[WebSocket] Cannot send, not connected');
    }
  }

  /**
   * Subscribe to server events
   */
  on<T extends ServerEvent['type']>(
    eventType: T,
    handler: (event: Extract<ServerEvent, { type: T }>) => void
  ): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler as any);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler as any);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: ServerEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  /**
   * Start ping interval for heartbeat
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.send({
        type: 'ping',
        timestamp: Date.now(),
      });
    }, 30000); // 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error);
      });
    }, delay);
  }
}
