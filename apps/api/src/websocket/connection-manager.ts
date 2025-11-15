import type { ServerWebSocket } from 'bun';
import type { ServerEvent, WebSocketData } from './types';
import { Timing } from './constants';

interface ConnectionData {
  userId: string;
  ws: ServerWebSocket<WebSocketData>;
  connectedAt: number;
  lastPing: number;
}

interface DisconnectedPlayer {
  userId: string;
  matchId: string;
  disconnectedAt: number;
  graceEndTime: number;
  graceTimeout: Timer;
}

/**
 * Manages all WebSocket connections, heartbeat, and reconnection logic
 */
export class ConnectionManager {
  private connections = new Map<string, ConnectionData>();
  private disconnectedPlayers = new Map<string, DisconnectedPlayer>();
  private heartbeatInterval: Timer | null = null;

  /**
   * Initialize connection manager and start heartbeat
   */
  initialize(): void {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, Timing.HEARTBEAT_INTERVAL);

    console.log('ConnectionManager initialized');
  }

  /**
   * Add new WebSocket connection or handle reconnection
   */
  addConnection(userId: string, ws: ServerWebSocket<WebSocketData>): void {
    // Check if this is a reconnection
    const disconnectInfo = this.disconnectedPlayers.get(userId);
    if (disconnectInfo) {
      this.handleReconnect(userId, ws);
      return;
    }

    // New connection
    this.connections.set(userId, {
      userId,
      ws,
      connectedAt: Date.now(),
      lastPing: Date.now(),
    });

    this.send(userId, {
      type: 'connected',
      userId,
      serverTime: Date.now(),
    });

    console.log(`Connection added: ${userId}`);
  }

  /**
   * Remove WebSocket connection
   */
  removeConnection(userId: string, matchId?: string): void {
    this.connections.delete(userId);

    if (matchId) {
      this.handleDisconnect(userId, matchId);
    }

    console.log(`Connection removed: ${userId}`);
  }

  /**
   * Send event to specific user
   */
  send(userId: string, event: ServerEvent): boolean {
    const conn = this.connections.get(userId);
    if (!conn) {
      console.error(`[ConnectionManager] No connection found for user: ${userId}`);
      console.log(`[ConnectionManager] Active connections:`, Array.from(this.connections.keys()));
      return false;
    }

    if (conn.ws.readyState !== 1) {
      // WebSocket.OPEN = 1
      console.error(`[ConnectionManager] WebSocket not open for user: ${userId}, state: ${conn.ws.readyState}`);
      return false;
    }

    try {
      conn.ws.send(JSON.stringify(event));
      console.log(`[ConnectionManager] Successfully sent ${event.type} to ${userId}`);
      return true;
    } catch (error) {
      console.error(`Failed to send to ${userId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast event to multiple users
   */
  broadcast(userIds: string[], event: ServerEvent): void {
    userIds.forEach((userId) => this.send(userId, event));
  }

  /**
   * Check if user is currently connected
   */
  isConnected(userId: string): boolean {
    return this.connections.has(userId);
  }

  /**
   * Get WebSocket for a user
   */
  getSocket(userId: string): ServerWebSocket<WebSocketData> | undefined {
    return this.connections.get(userId)?.ws;
  }

  /**
   * Handle pong response from client
   */
  handlePong(userId: string): void {
    const conn = this.connections.get(userId);
    if (conn) {
      conn.lastPing = Date.now();
    }
  }

  /**
   * Handle player disconnection with grace period
   */
  private handleDisconnect(userId: string, matchId: string): void {
    const now = Date.now();
    const graceEndTime = now + Timing.GRACE_PERIOD;

    console.log(
      `Player ${userId} disconnected from match ${matchId}. Grace period: ${Timing.GRACE_PERIOD}ms`
    );

    // Schedule match abandonment after grace period
    const graceTimeout = setTimeout(() => {
      if (this.disconnectedPlayers.has(userId)) {
        this.abandonMatch(userId, matchId);
      }
    }, Timing.GRACE_PERIOD);

    this.disconnectedPlayers.set(userId, {
      userId,
      matchId,
      disconnectedAt: now,
      graceEndTime,
      graceTimeout,
    });

    // Notify match manager to pause match (imported dynamically to avoid circular dependency)
    import('./match-manager').then(({ matchManager }) => {
      matchManager.handlePlayerDisconnect(userId, matchId, graceEndTime);
    });
  }

  /**
   * Handle player reconnection within grace period
   */
  private handleReconnect(userId: string, ws: ServerWebSocket<WebSocketData>): void {
    const disconnectInfo = this.disconnectedPlayers.get(userId);
    if (!disconnectInfo) {
      console.warn(`Reconnect called for ${userId} but no disconnect info found`);
      return;
    }

    const now = Date.now();

    // Check if grace period expired
    if (now > disconnectInfo.graceEndTime) {
      console.log(`Grace period expired for ${userId}`);
      this.send(userId, {
        type: 'match_abandoned',
        matchId: disconnectInfo.matchId,
        reason: 'grace_period_expired',
      });
      this.disconnectedPlayers.delete(userId);
      return;
    }

    // Successful reconnection
    console.log(`Player ${userId} reconnected to match ${disconnectInfo.matchId}`);

    clearTimeout(disconnectInfo.graceTimeout);
    this.disconnectedPlayers.delete(userId);

    // Add connection
    this.connections.set(userId, {
      userId,
      ws,
      connectedAt: now,
      lastPing: now,
    });

    // Notify match manager to resume match
    import('./match-manager').then(({ matchManager }) => {
      matchManager.handlePlayerReconnect(userId, disconnectInfo.matchId);
    });
  }

  /**
   * Abandon match after grace period expires
   */
  private abandonMatch(userId: string, matchId: string): void {
    console.log(`Abandoning match ${matchId} - player ${userId} did not reconnect`);

    this.disconnectedPlayers.delete(userId);

    // Notify match manager
    import('./match-manager').then(({ matchManager }) => {
      matchManager.abandonMatch(matchId, userId);
    });
  }

  /**
   * Send heartbeat ping to all connected clients
   */
  private performHeartbeat(): void {
    const now = Date.now();

    for (const [userId, conn] of this.connections.entries()) {
      if (conn.ws.readyState === 1) {
        // WebSocket.OPEN
        this.send(userId, {
          type: 'pong',
          timestamp: now,
          serverTime: now,
        });
      } else {
        // Connection is not open, remove it
        this.connections.delete(userId);
        console.log(`Removed stale connection: ${userId}`);
      }
    }
  }

  /**
   * Shutdown connection manager
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Clear all grace period timeouts
    for (const disconnectInfo of this.disconnectedPlayers.values()) {
      clearTimeout(disconnectInfo.graceTimeout);
    }

    // Close all connections gracefully
    for (const conn of this.connections.values()) {
      conn.ws.close(1000, 'Server shutting down');
    }

    this.connections.clear();
    this.disconnectedPlayers.clear();

    console.log('ConnectionManager shutdown complete');
  }

  /**
   * Get connection count for monitoring
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get disconnected players count
   */
  getDisconnectedCount(): number {
    return this.disconnectedPlayers.size;
  }
}

export const connectionManager = new ConnectionManager();
