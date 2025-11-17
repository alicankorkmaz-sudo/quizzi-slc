import { useReducer, useEffect, useCallback } from 'react';
import type { BattleState, BattleAction } from '../types/battle';
import { useWebSocketContext } from '../contexts/WebSocketContext';

/**
 * Initial battle state
 */
const initialState: BattleState = {
  // Match Info
  matchId: null,
  category: null,
  opponent: null,

  // Round State
  currentRound: 0,
  roundState: 'waiting',
  question: null,
  answers: [],
  startTime: null,
  endTime: null,

  // Answer State
  selectedAnswer: null,
  correctAnswer: null,
  isCorrect: null,
  responseTime: null,
  roundWinner: null,

  // Scores
  playerScore: 0,
  opponentScore: 0,
  isMatchPoint: false,

  // Connection
  connectionStatus: 'disconnected',
  opponentConnected: true,

  // Match State
  matchStatus: 'waiting',
  countdown: null,
  winner: null,
  rankPointsChange: null,
  finalStats: null,
};

/**
 * Battle state reducer
 */
function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'MATCH_FOUND':
      return {
        ...state,
        matchId: action.payload.matchId,
        opponent: action.payload.opponent,
        category: action.payload.category,
        matchStatus: 'waiting',
      };

    case 'MATCH_STARTING':
      return {
        ...state,
        matchStatus: 'countdown',
        countdown: action.payload.countdown,
      };

    case 'MATCH_STARTED':
      return {
        ...state,
        matchStatus: 'active',
        countdown: null,
      };

    case 'ROUND_START': {
      // Check if this is match point (either player has 2 points)
      const isMatchPoint = state.playerScore === 2 || state.opponentScore === 2;

      return {
        ...state,
        currentRound: action.payload.roundIndex + 1, // Convert 0-indexed to 1-indexed
        roundState: 'active',
        question: action.payload.question,
        answers: action.payload.answers,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
        selectedAnswer: null,
        correctAnswer: null,
        isCorrect: null,
        responseTime: null,
        roundWinner: null,
        isMatchPoint,
      };
    }

    case 'ANSWER_SELECTED':
      return {
        ...state,
        selectedAnswer: action.payload.answerIndex,
        responseTime: action.payload.timestamp - (state.startTime || action.payload.timestamp),
        roundState: 'answered',
      };

    case 'ANSWER_RESULT':
      // Only update if this is the player's answer result
      return state;

    case 'ROUND_END':
      return {
        ...state,
        roundState: 'ended',
        correctAnswer: action.payload.correctAnswer,
        roundWinner: action.payload.winner,
        // Only set isCorrect if player actually answered (selectedAnswer is not null)
        isCorrect: state.selectedAnswer !== null
          ? state.selectedAnswer === action.payload.correctAnswer
          : null,
        playerScore: action.payload.scores.currentPlayer,
        opponentScore: action.payload.scores.opponent,
      };

    case 'ROUND_TIMEOUT':
      return {
        ...state,
        roundState: 'ended',
        correctAnswer: action.payload.correctAnswer,
        // Only set isCorrect if player answered
        isCorrect: state.selectedAnswer !== null
          ? state.selectedAnswer === action.payload.correctAnswer
          : null,
      };

    case 'MATCH_END':
      return {
        ...state,
        matchStatus: 'ended',
        winner: action.payload.winner,
        rankPointsChange: action.payload.rankPointsChange,
        oldRankPoints: action.payload.oldRankPoints,
        newRankPoints: action.payload.newRankPoints,
        oldTier: action.payload.oldTier,
        newTier: action.payload.newTier,
        tierChanged: action.payload.tierChanged,
        finalStats: action.payload.stats,
        playerScore: action.payload.finalScores.currentPlayer,
        opponentScore: action.payload.finalScores.opponent,
      };

    case 'MATCH_ABANDONED':
      return {
        ...state,
        matchStatus: 'ended',
        roundState: 'ended',
      };

    case 'OPPONENT_DISCONNECTED':
      return {
        ...state,
        opponentConnected: false,
      };

    case 'OPPONENT_RECONNECTED':
      return {
        ...state,
        opponentConnected: true,
      };

    case 'CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload.status,
      };

    case 'RESET_BATTLE':
      return initialState;

    default:
      return state;
  }
}

/**
 * Hook for managing battle state with WebSocket integration
 */
export function useBattleState(
  _userId: string | null,
  _playerId: string,
  initialMatchData?: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: any;
  }
) {
  const [state, dispatch] = useReducer(battleReducer, {
    ...initialState,
    // Initialize with match data from route params if available
    ...(initialMatchData
      ? {
          matchId: initialMatchData.matchId,
          category: initialMatchData.category,
          opponent: {
            id: 'temp', // Will be updated when match_found is received
            username: initialMatchData.opponentUsername,
            avatar: 'default_1',
            rankTier: 'bronze',
            rankPoints: initialMatchData.opponentRankPoints,
            winRate: 0.5,
          },
          matchStatus: 'active', // Match has already started by the time we navigate to BattleScreen
        }
      : {}),
  });
  const { connectionStatus, send, subscribe } = useWebSocketContext();

  // Update connection status
  useEffect(() => {
    dispatch({ type: 'CONNECTION_STATUS', payload: { status: connectionStatus } });
  }, [connectionStatus]);

  // NOTE: Sync mechanism disabled - the 500ms delay in match-manager.ts ensures
  // both clients have time to navigate and subscribe before round_start is sent
  // This prevents timestamp misalignment that caused 13-14 second timer issues

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Match lifecycle events
    unsubscribers.push(
      subscribe('match_found', (event) => {
        if (event.type === 'match_found') {
          dispatch({
            type: 'MATCH_FOUND',
            payload: {
              matchId: event.matchId,
              opponent: event.opponent,
              category: event.category,
            },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('match_starting', (event) => {
        if (event.type === 'match_starting') {
          dispatch({
            type: 'MATCH_STARTING',
            payload: { countdown: event.countdown },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('match_started', (event) => {
        if (event.type === 'match_started') {
          dispatch({ type: 'MATCH_STARTED' });
        }
      })
    );

    // Round events
    unsubscribers.push(
      subscribe('round_start', (event) => {
        if (event.type === 'round_start') {
          dispatch({
            type: 'ROUND_START',
            payload: {
              roundIndex: event.roundIndex,
              question: event.question,
              answers: event.answers,
              startTime: event.startTime,
              endTime: event.endTime,
            },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('round_answer', (event) => {
        if (event.type === 'round_answer') {
          dispatch({
            type: 'ANSWER_RESULT',
            payload: {
              playerId: event.playerId,
              correct: event.correct,
              timeMs: event.timeMs,
            },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('round_end', (event) => {
        if (event.type === 'round_end') {
          dispatch({
            type: 'ROUND_END',
            payload: {
              winner: event.winner,
              scores: event.scores,
              correctAnswer: event.correctAnswer,
            },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('round_timeout', (event) => {
        if (event.type === 'round_timeout') {
          dispatch({
            type: 'ROUND_TIMEOUT',
            payload: { correctAnswer: event.correctAnswer },
          });
        }
      })
    );

    // Match end
    unsubscribers.push(
      subscribe('match_end', (event) => {
        if (event.type === 'match_end') {
          dispatch({
            type: 'MATCH_END',
            payload: {
              winner: event.winner,
              finalScores: event.finalScores,
              rankPointsChange: event.rankPointsChange,
              oldRankPoints: event.oldRankPoints,
              newRankPoints: event.newRankPoints,
              oldTier: event.oldTier,
              newTier: event.newTier,
              tierChanged: event.tierChanged,
              stats: event.stats,
            },
          });
        }
      })
    );

    unsubscribers.push(
      subscribe('match_abandoned', (event) => {
        if (event.type === 'match_abandoned') {
          dispatch({
            type: 'MATCH_ABANDONED',
            payload: { reason: event.reason },
          });
        }
      })
    );

    // Connection events
    unsubscribers.push(
      subscribe('opponent_disconnected', () => {
        dispatch({ type: 'OPPONENT_DISCONNECTED' });
      })
    );

    unsubscribers.push(
      subscribe('opponent_reconnected', () => {
        dispatch({ type: 'OPPONENT_RECONNECTED' });
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe]);

  // Submit answer
  const submitAnswer = useCallback(
    (answerIndex: number) => {
      if (!state.matchId || state.roundState !== 'active') {
        return;
      }

      const timestamp = Date.now();

      dispatch({
        type: 'ANSWER_SELECTED',
        payload: { answerIndex, timestamp },
      });

      send({
        type: 'answer_submit',
        matchId: state.matchId,
        roundIndex: state.currentRound - 1, // Convert back to 0-indexed
        answerIndex,
        timestamp,
      });
    },
    [state.matchId, state.currentRound, state.roundState, send]
  );

  // Join matchmaking queue
  const joinQueue = useCallback(
    (category: string, rankPoints: number, username: string) => {
      send({
        type: 'join_queue',
        category: category as any,
        rankPoints,
        username,
      });
    },
    [send]
  );

  // Cancel matchmaking
  const cancelQueue = useCallback((category: string) => {
    send({ type: 'cancel_queue', category: category as any });
  }, [send]);

  // Leave match
  const leaveMatch = useCallback(() => {
    if (state.matchId) {
      send({ type: 'leave_match', matchId: state.matchId });
      dispatch({ type: 'RESET_BATTLE' });
    }
  }, [state.matchId, send]);

  // Reset battle state
  const resetBattle = useCallback(() => {
    dispatch({ type: 'RESET_BATTLE' });
  }, []);

  return {
    state,
    actions: {
      submitAnswer,
      joinQueue,
      cancelQueue,
      leaveMatch,
      resetBattle,
    },
  };
}
