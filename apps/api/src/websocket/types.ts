import type { Category, RankTier } from '@quizzi/types';
import type { ErrorCode } from './constants';

/**
 * Client → Server Events
 */
export type ClientEvent =
  // Connection & Matchmaking
  | { type: 'ping'; timestamp: number }
  | { type: 'join_queue'; category: Category; elo: number; username?: string }
  | { type: 'cancel_queue'; category?: string }
  | { type: 'match_ready_ack'; matchId: string }

  // In-Match Events
  | {
      type: 'answer_submit';
      matchId: string;
      roundIndex: number;
      answerIndex: number;
      timestamp: number;
    }
  | { type: 'sync_match'; matchId: string }
  | { type: 'round_ready_ack'; matchId: string; roundIndex: number }
  | { type: 'rematch_request'; matchId: string }
  | { type: 'rematch_accept'; matchId: string }
  | { type: 'rematch_decline'; matchId: string }
  | { type: 'leave_match'; matchId: string };

/**
 * Server → Client Events
 */
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
      eloChange: number;
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
  | { type: 'error'; code: ErrorCode; message: string };

/**
 * Supporting Types
 */
export interface OpponentInfo {
  id: string;
  username: string;
  avatar: string;
  rankTier: RankTier;
  elo: number;
  winRate: number;
  currentStreak: number;
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

/**
 * Internal WebSocket Data
 */
export interface WebSocketData {
  userId: string;
  username?: string;
  connectedAt: number;
}
