import { MatchmakingQueue } from './matchmaking-queue';
import { matchManager } from '../websocket/match-manager';
import { connectionManager } from '../websocket/connection-manager';
import { ErrorCodes } from '../websocket/constants';
import type { Category } from '@quizzi/types';

/**
 * Singleton instance of MatchmakingQueue with match creation integration
 */

class MatchmakingQueueInstance extends MatchmakingQueue {
  constructor() {
    super();

    // Listen for match_found events and create matches
    this.on('match_found', async (data) => {
      const { player1, player2, category, queueTime } = data;

      console.log(
        `Match found! ${player1.username} vs ${player2.username} in ${category} (queue: ${queueTime}ms)`
      );

      // Create match via MatchManager
      try {
        const matchId = await matchManager.createMatch(
          player1.id,
          player2.id,
          category as Category
        );

        console.log(`Match created: ${matchId}`);

        // Track matchmaking metrics (can be sent to monitoring service)
        this.recordMetric({
          event: 'match_created',
          queueTime,
          category,
          rankDifference: Math.abs(player1.rankPoints - player2.rankPoints),
        });
      } catch (error) {
        console.error('Failed to create match:', error);

        // Return players to queue if match creation failed
        connectionManager.send(player1.id, {
          type: 'error',
          code: ErrorCodes.MATCH_CREATION_FAILED,
          message: 'Failed to create match. Please try again.',
        });

        connectionManager.send(player2.id, {
          type: 'error',
          code: ErrorCodes.MATCH_CREATION_FAILED,
          message: 'Failed to create match. Please try again.',
        });
      }
    });
  }

  /**
   * Get last opponent for a player (to prevent consecutive rematches)
   */
  getLastOpponent(playerId: string): string | undefined {
    return this.lastOpponents.get(playerId);
  }

  /**
   * Get queue position for display purposes
   */
  getQueuePosition(playerId: string, category: string): number {
    const categoryQueue = this.queues.get(category);
    if (!categoryQueue) return 0;

    const index = categoryQueue.sortedByRank.findIndex(e => e.playerId === playerId);
    return index === -1 ? 0 : index + 1;
  }

  /**
   * Record matchmaking metrics (can be sent to analytics/monitoring)
   */
  private recordMetric(data: {
    event: string;
    queueTime: number;
    category: string;
    rankDifference: number;
  }): void {
    // TODO: Send to monitoring service (DataDog, CloudWatch, etc.)
    console.log('[METRIC]', JSON.stringify(data));
  }
}

// Export singleton instance
export const matchmakingQueue = new MatchmakingQueueInstance();
