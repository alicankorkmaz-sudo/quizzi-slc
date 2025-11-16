import { z } from 'zod';

// ============================================================================
// User/Player Types
// ============================================================================

export const RankTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export type RankTier = z.infer<typeof RankTierSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
  avatar: z.string(),
  rankPoints: z.number().int().min(0),
  rankTier: RankTierSchema,
  winRate: z.number().min(0).max(1),
  currentStreak: z.number().int().min(0),
  matchesPlayed: z.number().int().min(0),
  avgResponseTime: z.number().int().min(0),
  premiumStatus: z.boolean(),
  isAnonymous: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CategoryStatsSchema = z.object({
  category: z.string(),
  winRate: z.number().min(0).max(1),
  matchesPlayed: z.number().int().min(0),
});

export type CategoryStats = z.infer<typeof CategoryStatsSchema>;

// ============================================================================
// Question Types
// ============================================================================

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const CategorySchema = z.enum([
  'general_knowledge',
  'geography',
  'science',
  'pop_culture',
  'sports',
]);
export type Category = z.infer<typeof CategorySchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  category: CategorySchema,
  difficulty: DifficultySchema,
  questionText: z.string().max(160),
  answers: z.array(z.string()).length(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  lastUsedTimestamp: z.date().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

// ============================================================================
// Match Types
// ============================================================================

export const MatchStatusSchema = z.enum(['pending', 'active', 'completed', 'abandoned']);
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

export const ConnectionStatusSchema = z.enum(['connected', 'disconnected', 'reconnecting']);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

export const RoundResultSchema = z.object({
  roundNumber: z.number().int().min(1).max(5),
  questionId: z.string(),
  player1Answer: z.number().int().min(0).max(3).optional(),
  player2Answer: z.number().int().min(0).max(3).optional(),
  player1ResponseTime: z.number().int().min(0).optional(),
  player2ResponseTime: z.number().int().min(0).optional(),
  winnerId: z.string().optional(),
});

export type RoundResult = z.infer<typeof RoundResultSchema>;

export const MatchStateSchema = z.object({
  matchId: z.string(),
  player1Id: z.string(),
  player2Id: z.string(),
  category: CategorySchema,
  currentRound: z.number().int().min(1).max(5),
  player1Score: z.number().int().min(0).max(3),
  player2Score: z.number().int().min(0).max(3),
  questions: z.array(QuestionSchema).length(5),
  roundResults: z.array(RoundResultSchema),
  status: MatchStatusSchema,
  startTime: z.date(),
  player1ConnectionStatus: ConnectionStatusSchema,
  player2ConnectionStatus: ConnectionStatusSchema,
});

export type MatchState = z.infer<typeof MatchStateSchema>;

export const MatchHistorySchema = z.object({
  matchId: z.string(),
  opponentId: z.string(),
  opponentUsername: z.string(),
  category: CategorySchema,
  result: z.enum(['win', 'loss']),
  score: z.string(), // e.g., "3-1"
  rankPointsChange: z.number().int(),
  completedAt: z.date(),
});

export type MatchHistory = z.infer<typeof MatchHistorySchema>;

// ============================================================================
// WebSocket Event Types
// ============================================================================

export const WSEventTypeSchema = z.enum([
  'matchmaking_start',
  'matchmaking_found',
  'match_start',
  'question_sync',
  'answer_submitted',
  'round_result',
  'match_end',
  'player_disconnected',
  'player_reconnected',
  'connection_lost',
  'error',
]);

export type WSEventType = z.infer<typeof WSEventTypeSchema>;

export const WSMessageSchema = z.object({
  type: WSEventTypeSchema,
  payload: z.unknown(),
  timestamp: z.date(),
});

export type WSMessage = z.infer<typeof WSMessageSchema>;

// ============================================================================
// API Request/Response Types
// ============================================================================

// Auth types
export const AnonymousUserResponseSchema = z.object({
  userId: z.string(),
  username: z.string(),
  authToken: z.string(),
  isAnonymous: z.boolean(),
});

export type AnonymousUserResponse = z.infer<typeof AnonymousUserResponseSchema>;

export const RegisterUsernameRequestSchema = z.object({
  userId: z.string(),
  username: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
});

export type RegisterUsernameRequest = z.infer<typeof RegisterUsernameRequestSchema>;

export const RegisterUsernameResponseSchema = z.object({
  userId: z.string(),
  username: z.string(),
  authToken: z.string(),
  isAnonymous: z.boolean(),
});

export type RegisterUsernameResponse = z.infer<typeof RegisterUsernameResponseSchema>;

export const ValidateTokenResponseSchema = z.object({
  userId: z.string(),
  username: z.string(),
  isAnonymous: z.boolean(),
});

export type ValidateTokenResponse = z.infer<typeof ValidateTokenResponseSchema>;

export const CreateUserRequestSchema = z.object({
  username: z.string().min(3).max(16).regex(/^[a-zA-Z0-9_]+$/),
  avatar: z.string().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const StartMatchmakingRequestSchema = z.object({
  userId: z.string(),
  category: CategorySchema,
});

export type StartMatchmakingRequest = z.infer<typeof StartMatchmakingRequestSchema>;

export const SubmitAnswerRequestSchema = z.object({
  matchId: z.string(),
  userId: z.string(),
  roundNumber: z.number().int().min(1).max(5),
  answerIndex: z.number().int().min(0).max(3),
  responseTime: z.number().int().min(0),
});

export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;

// ============================================================================
// Utility Types
// ============================================================================

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
