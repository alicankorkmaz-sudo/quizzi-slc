import type { Category, RankTier } from '../../../../packages/types/src';

// Re-export types from websocket service
export type { ServerEvent, ClientEvent } from '../services/websocket';

/**
 * Supporting Types
 */
export interface OpponentInfo {
  id: string;
  username: string;
  avatar?: string;
  rankTier: RankTier;
  elo: number;
  winRate?: number;
  currentStreak?: number;
}

export interface QuestionInfo {
  id: string;
  text: string;
  category?: Category;
  difficulty?: 'easy' | 'medium' | 'hard';
  answers?: string[];
}

export interface MatchStats {
  avgResponseTime: number;
  fastestAnswer: number;
  accuracy: number;
}

/**
 * Battle UI State
 */
export interface BattleState {
  // Match Info
  matchId: string | null;
  category: Category | null;
  opponent: OpponentInfo | null;

  // Round State
  currentRound: number;
  roundState: 'waiting' | 'starting' | 'active' | 'answered' | 'ended';
  question: QuestionInfo | null;
  answers: string[];
  startTime: number | null;
  endTime: number | null;

  // Answer State
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isCorrect: boolean | null;
  responseTime: number | null;
  roundWinner: string | null; // userId of round winner
  roundWinnerTime: number | null; // Winner's response time in milliseconds

  // Scores
  playerScore: number;
  opponentScore: number;
  isMatchPoint: boolean; // True when either player can win this round
  consecutivePlayerWins: number; // Consecutive rounds won by player in current match
  wasBehind: boolean; // True if player was ever losing (for comeback detection)

  // Connection
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  opponentConnected: boolean;

  // Match State
  matchStatus: 'waiting' | 'countdown' | 'active' | 'ended';
  countdown: number | null;
  winner: string | null;
  eloChange: number | null;
  oldRankPoints?: number;
  newRankPoints?: number;
  oldTier?: string;
  newTier?: string;
  tierChanged?: boolean;
  finalStats: MatchStats | null;
}

export type BattleAction =
  | { type: 'MATCH_FOUND'; payload: { matchId: string; opponent: OpponentInfo; category: Category } }
  | { type: 'MATCH_STARTING'; payload: { countdown: number } }
  | { type: 'MATCH_STARTED' }
  | { type: 'ROUND_START'; payload: { roundIndex: number; question: QuestionInfo; answers: string[]; startTime: number; endTime: number } }
  | { type: 'ROUND_START_ACTIVE' }
  | { type: 'ANSWER_SELECTED'; payload: { answerIndex: number; timestamp: number } }
  | { type: 'ANSWER_RESULT'; payload: { playerId: string; correct: boolean; timeMs: number } }
  | { type: 'ROUND_END'; payload: { winner: string | null; winnerTime?: number; scores: { currentPlayer: number; opponent: number }; correctAnswer: number } }
  | { type: 'ROUND_TIMEOUT'; payload: { correctAnswer: number } }
  | { type: 'MATCH_END'; payload: { winner: string; finalScores: { currentPlayer: number; opponent: number }; eloChange: number; oldRankPoints?: number; newRankPoints?: number; oldTier?: string; newTier?: string; tierChanged?: boolean; stats: MatchStats } }
  | { type: 'MATCH_ABANDONED'; payload: { reason: string } }
  | { type: 'OPPONENT_DISCONNECTED' }
  | { type: 'OPPONENT_RECONNECTED' }
  | { type: 'CONNECTION_STATUS'; payload: { status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' } }
  | { type: 'RESET_BATTLE' };
