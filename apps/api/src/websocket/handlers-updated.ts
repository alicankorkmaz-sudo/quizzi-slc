import { connectionManager } from './connection-manager';
import { matchManager } from './match-manager';
import { matchmakingQueue } from '../services/matchmaking-instance';
import type { ClientEvent } from './types';
import { ErrorCodes } from './constants';

/**
 * Updated handlers with integrated matchmaking queue
 *
 * This file demonstrates how to integrate the MatchmakingQueue service
 * with existing WebSocket handlers.
 */

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
        await handleJoinQueue(
          userId,
          event.category,
          event.rankPoints,
          event.username
        );
        break;

      case 'cancel_queue':
        handleCancelQueue(userId, event.category || '');
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

      case 'sync_match':
        handleSyncMatch(userId, event.matchId);
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
 */
async function handleJoinQueue(
  userId: string,
  category: string,
  rankPoints: number,
  username?: string
): Promise<void> {
  // Check if player is already in a match
  const existingMatch = matchManager.getPlayerMatch(userId);
  if (existingMatch) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.ALREADY_IN_MATCH,
      message: 'You are already in a match',
    });
    return;
  }

  // Get player socket
  const socket = connectionManager.getSocket(userId);
  if (!socket) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NO_CONNECTION,
      message: 'WebSocket connection not found',
    });
    return;
  }

  console.log(`Player ${userId} joining queue: ${category} (${rankPoints} points)`);

  // Get last opponent to prevent consecutive rematches
  const lastOpponentId = matchmakingQueue.getLastOpponent(userId);

  // Add to matchmaking queue
  matchmakingQueue.addToQueue({
    playerId: userId,
    username: username || 'Player',
    rankPoints,
    category,
    socket,
    lastOpponentId,
  });

  // Notify player they've joined queue
  connectionManager.send(userId, {
    type: 'queue_joined',
    position: matchmakingQueue.getQueuePosition(userId, category),
    category: category as any,
  });
}

/**
 * Handle cancel matchmaking queue
 */
function handleCancelQueue(userId: string, category: string): void {
  console.log(`Player ${userId} cancelled queue`);

  const removed = matchmakingQueue.removeFromQueue(userId, category);

  if (removed) {
    connectionManager.send(userId, {
      type: 'queue_left',
    });
  } else {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NOT_IN_QUEUE,
      message: 'You are not in the queue',
    });
  }
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

/**
 * Handle sync match state request
 * This is called when BattleScreen mounts and needs to catch up on the current match/round state
 */
function handleSyncMatch(userId: string, matchId: string): void {
  console.log(`Player ${userId} requesting sync for match ${matchId}`);

  const playerMatchId = matchManager.getPlayerMatch(userId);

  if (playerMatchId !== matchId) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NOT_IN_MATCH,
      message: 'You are not in this match',
    });
    return;
  }

  // Send current match state
  matchManager.syncMatchState(userId, matchId);
}
