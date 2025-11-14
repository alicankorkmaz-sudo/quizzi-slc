/**
 * Timing constants for WebSocket real-time sync
 * All values in milliseconds
 */
export const Timing = {
  // Match timing
  MATCH_COUNTDOWN: 3000, // 3 seconds before match starts
  ROUND_DURATION: 10000, // 10 seconds per question
  ROUND_PAUSE: 2000, // 2 seconds between rounds
  ROUND_RESULT_DISPLAY: 1000, // 1 second to show answer result

  // Connection management
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  HEARTBEAT_TIMEOUT: 5000, // 5 seconds to respond to ping
  GRACE_PERIOD: 10000, // 10 seconds to reconnect

  // Matchmaking
  MATCHMAKING_INITIAL_RANGE: 200, // ±200 rank points
  MATCHMAKING_EXPAND_TIME: 5000, // Expand after 5 seconds
  MATCHMAKING_EXPANDED_RANGE: 400, // ±400 rank points
  MATCHMAKING_MAX_WAIT: 10000, // Match anyone after 10 seconds

  // Anti-cheat thresholds
  SUSPICIOUS_ANSWER_TIME: 200, // Flag answers faster than 200ms
  MAX_LATENCY_TOLERANCE: 100, // Accept answers within 100ms after timeout
} as const;

/**
 * Error codes for WebSocket communication
 */
export const ErrorCodes = {
  INVALID_MESSAGE: 'invalid_message',
  NOT_IN_MATCH: 'not_in_match',
  MATCH_NOT_FOUND: 'match_not_found',
  INVALID_ROUND: 'invalid_round',
  ANSWER_TOO_LATE: 'answer_too_late',
  ALREADY_ANSWERED: 'already_answered',
  INVALID_ANSWER: 'invalid_answer',
  SERVER_ERROR: 'server_error',
  UNAUTHORIZED: 'unauthorized',
  RATE_LIMIT: 'rate_limit',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
