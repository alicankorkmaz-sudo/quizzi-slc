import { connectionManager } from './connection-manager';
import { matchManager } from './match-manager';
import type { ClientEvent } from './types';
import { ErrorCodes } from './constants';

/**
 * Route incoming WebSocket messages to appropriate handlers
 */
export async function handleMessage(userId: string, data: unknown): Promise<void> {
  try {
    const event = data as ClientEvent;

    switch (event.type) {
      case 'ping':
        handlePing(userId, event.timestamp);
        break;

      case 'join_queue':
        await handleJoinQueue(userId, event.category, event.rankPoints);
        break;

      case 'cancel_queue':
        handleCancelQueue(userId);
        break;

      case 'answer_submit':
        await handleAnswerSubmit(
          userId,
          event.matchId,
          event.roundIndex,
          event.answerIndex,
          event.timestamp
        );
        break;

      case 'leave_match':
        handleLeaveMatch(userId, event.matchId);
        break;

      default:
        connectionManager.send(userId, {
          type: 'error',
          code: ErrorCodes.INVALID_MESSAGE,
          message: `Unknown event type: ${(event as any).type}`,
        });
    }
  } catch (error) {
    console.error(`Error handling message from ${userId}:`, error);
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}

/**
 * Handle ping/pong for heartbeat
 */
function handlePing(userId: string, timestamp: number): void {
  connectionManager.handlePong(userId);
  connectionManager.send(userId, {
    type: 'pong',
    timestamp,
    serverTime: Date.now(),
  });
}

/**
 * Handle join matchmaking queue
 * TODO: Integrate with matchmaking queue service
 */
async function handleJoinQueue(
  userId: string,
  category: string,
  rankPoints: number
): Promise<void> {
  console.log(`Player ${userId} joining queue: ${category} (${rankPoints} points)`);

  // TODO: Implement matchmaking queue
  // For now, create a test match immediately
  connectionManager.send(userId, {
    type: 'queue_joined',
    position: 1,
    category: category as any,
  });

  // Simulate finding a match after 2 seconds
  setTimeout(async () => {
    // Create a mock opponent
    const mockOpponentId = `opponent_${Date.now()}`;

    await matchManager.createMatch(userId, mockOpponentId, category as any);
  }, 2000);
}

/**
 * Handle cancel matchmaking queue
 */
function handleCancelQueue(userId: string): void {
  console.log(`Player ${userId} cancelled queue`);

  // TODO: Remove from matchmaking queue

  connectionManager.send(userId, {
    type: 'queue_left',
  });
}

/**
 * Handle answer submission
 */
async function handleAnswerSubmit(
  userId: string,
  matchId: string,
  roundIndex: number,
  answerIndex: number,
  timestamp: number
): Promise<void> {
  // Validate that user is in this match
  const playerMatchId = matchManager.getPlayerMatch(userId);

  if (playerMatchId !== matchId) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NOT_IN_MATCH,
      message: 'You are not in this match',
    });
    return;
  }

  await matchManager.handleAnswer(userId, matchId, roundIndex, answerIndex, timestamp);
}

/**
 * Handle leave match
 */
function handleLeaveMatch(userId: string, matchId: string): void {
  console.log(`Player ${userId} leaving match ${matchId}`);

  const playerMatchId = matchManager.getPlayerMatch(userId);

  if (playerMatchId !== matchId) {
    return;
  }

  // Abandon the match
  matchManager.abandonMatch(matchId, userId);
}
