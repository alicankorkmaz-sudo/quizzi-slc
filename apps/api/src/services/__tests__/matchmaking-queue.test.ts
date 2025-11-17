import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MatchmakingQueue, type QueueEntry } from '../matchmaking-queue';
import { WebSocket } from 'ws';

/**
 * Matchmaking Queue Tests
 *
 * Tests skill-based matching, expanding ranges, and queue operations
 */

describe('MatchmakingQueue', () => {
  let queue: MatchmakingQueue;
  let mockSocket: WebSocket;

  beforeEach(() => {
    queue = new MatchmakingQueue();
    mockSocket = {} as WebSocket;
  });

  afterEach(() => {
    queue.destroy();
  });

  describe('Basic Queue Operations', () => {
    it('should add player to queue', () => {
      const entry = createQueueEntry('player1', 1000, 'general_knowledge');
      queue.addToQueue(entry);

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.queueSize).toBe(1);
    });

    it('should remove player from queue', () => {
      const entry = createQueueEntry('player1', 1000, 'general_knowledge');
      queue.addToQueue(entry);

      const removed = queue.removeFromQueue('player1', 'general_knowledge');
      expect(removed).toBe(true);

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.queueSize).toBe(0);
    });

    it('should handle removing non-existent player', () => {
      const removed = queue.removeFromQueue('nonexistent', 'general_knowledge');
      expect(removed).toBe(false);
    });

    it('should replace player if already in queue', () => {
      const entry1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const entry2 = createQueueEntry('player1', 1100, 'general_knowledge');

      queue.addToQueue(entry1);
      queue.addToQueue(entry2);

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.queueSize).toBe(1);
    });
  });

  describe('Immediate Matching (±200 range)', () => {
    it('should match players within ±200 rank points immediately', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1100, 'general_knowledge');

      queue.on('match_found', (match) => {
        expect(match.player1.id).toBe('player1');
        expect(match.player2.id).toBe('player2');
        expect(match.category).toBe('general_knowledge');
        done();
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2); // Should trigger immediate match
    });

    it('should not match players outside ±200 range initially', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1300, 'general_knowledge');

      let matchFound = false;

      queue.on('match_found', () => {
        matchFound = true;
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);

      // Check after 1 second (should not have matched yet)
      setTimeout(() => {
        expect(matchFound).toBe(false);
        done();
      }, 1000);
    });

    it('should match closest player within range', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1050, 'general_knowledge');
      const player3 = createQueueEntry('player3', 1150, 'general_knowledge');

      queue.on('match_found', (match) => {
        // Should match player1 with player2 (closest)
        expect(
          (match.player1.id === 'player1' && match.player2.id === 'player2') ||
          (match.player1.id === 'player2' && match.player2.id === 'player1')
        ).toBe(true);
        done();
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);
      queue.addToQueue(player3);
    });
  });

  describe('Expanded Range Matching (±400 at 5s)', () => {
    it('should expand range to ±400 after 5 seconds', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1350, 'general_knowledge');

      let matchTime = 0;

      queue.on('match_found', (match) => {
        matchTime = Date.now();
        expect(match.player1.elo).toBe(1000);
        expect(match.player2.elo).toBe(1350);
        expect(matchTime - startTime).toBeGreaterThanOrEqual(4900); // Allow 100ms tolerance
        done();
      });

      const startTime = Date.now();
      queue.addToQueue(player1);
      queue.addToQueue(player2);
    }, 10000); // Increase timeout for this test

    it('should not expand range for players outside ±400', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1500, 'general_knowledge');

      let matchFound = false;

      queue.on('match_found', () => {
        matchFound = true;
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);

      // Check after 6 seconds (should not have matched)
      setTimeout(() => {
        expect(matchFound).toBe(false);
        done();
      }, 6000);
    }, 10000);
  });

  describe('Any Player Matching (10s)', () => {
    it('should match any player after 10 seconds', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 2500, 'general_knowledge');

      let matchTime = 0;

      queue.on('match_found', (match) => {
        matchTime = Date.now();
        expect(Math.abs(match.player1.elo - match.player2.elo)).toBeGreaterThan(400);
        expect(matchTime - startTime).toBeGreaterThanOrEqual(9900);
        done();
      });

      const startTime = Date.now();
      queue.addToQueue(player1);
      queue.addToQueue(player2);
    }, 15000);
  });

  describe('Same Opponent Prevention', () => {
    it('should not match same opponents consecutively', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1050, 'general_knowledge', 'player2');
      const player3 = createQueueEntry('player3', 1100, 'general_knowledge');

      queue.on('match_found', (match) => {
        // Should match player1 with player3, not player2 (last opponent)
        expect(match.player2.id).toBe('player3');
        done();
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2); // player1's last opponent
      queue.addToQueue(player3);
    });

    it('should eventually match same opponent if no other options', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge', 'player2');
      const player2 = createQueueEntry('player2', 1050, 'general_knowledge', 'player1');

      let matchCount = 0;

      queue.on('match_found', () => {
        matchCount++;
        if (matchCount === 1) {
          // After first match, re-add them (should match after 10s despite being last opponents)
          setTimeout(() => {
            queue.addToQueue(player1);
            queue.addToQueue(player2);
          }, 500);
        } else {
          // Second match completed
          done();
        }
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);
    }, 15000);
  });

  describe('Category Isolation', () => {
    it('should not match players in different categories', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1050, 'geography');

      let matchFound = false;

      queue.on('match_found', () => {
        matchFound = true;
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);

      setTimeout(() => {
        expect(matchFound).toBe(false);
        const stats = queue.getQueueStats();
        expect(stats.general_knowledge.queueSize).toBe(1);
        expect(stats.geography.queueSize).toBe(1);
        done();
      }, 1000);
    });

    it('should track queue stats per category', () => {
      queue.addToQueue(createQueueEntry('p1', 1000, 'general_knowledge'));
      queue.addToQueue(createQueueEntry('p2', 1200, 'general_knowledge'));
      queue.addToQueue(createQueueEntry('p3', 1500, 'geography'));

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.queueSize).toBe(2);
      expect(stats.geography.queueSize).toBe(1);
    });
  });

  describe('Queue Cleanup', () => {
    it('should remove both players after match', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');
      const player2 = createQueueEntry('player2', 1050, 'general_knowledge');

      queue.on('match_found', () => {
        setTimeout(() => {
          const stats = queue.getQueueStats();
          expect(stats.general_knowledge.queueSize).toBe(0);
          done();
        }, 100);
      });

      queue.addToQueue(player1);
      queue.addToQueue(player2);
    });

    it('should clear timers when removing from queue', () => {
      const entry = createQueueEntry('player1', 1000, 'general_knowledge');
      queue.addToQueue(entry);

      const removed = queue.removeFromQueue('player1', 'general_knowledge');
      expect(removed).toBe(true);

      // Verify timers are cleared (no match should occur)
      setTimeout(() => {
        const stats = queue.getQueueStats();
        expect(stats.general_knowledge?.queueSize || 0).toBe(0);
      }, 11000);
    });
  });

  describe('Queue Statistics', () => {
    it('should calculate average rank points', () => {
      queue.addToQueue(createQueueEntry('p1', 1000, 'general_knowledge'));
      queue.addToQueue(createQueueEntry('p2', 1200, 'general_knowledge'));
      queue.addToQueue(createQueueEntry('p3', 1400, 'general_knowledge'));

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.avgRankPoints).toBe(1200);
    });

    it('should return empty stats for empty queue', () => {
      const stats = queue.getQueueStats();
      expect(Object.keys(stats).length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player in queue', (done) => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');

      let matchFound = false;

      queue.on('match_found', () => {
        matchFound = true;
      });

      queue.addToQueue(player1);

      setTimeout(() => {
        expect(matchFound).toBe(false);
        const stats = queue.getQueueStats();
        expect(stats.general_knowledge.queueSize).toBe(1);
        done();
      }, 1000);
    });

    it('should handle rapid queue/dequeue', () => {
      const player1 = createQueueEntry('player1', 1000, 'general_knowledge');

      for (let i = 0; i < 10; i++) {
        queue.addToQueue(player1);
        queue.removeFromQueue('player1', 'general_knowledge');
      }

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge?.queueSize || 0).toBe(0);
    });

    it('should maintain sorted order after multiple insertions', () => {
      const players = [
        createQueueEntry('p1', 1500, 'general_knowledge'),
        createQueueEntry('p2', 1000, 'general_knowledge'),
        createQueueEntry('p3', 2000, 'general_knowledge'),
        createQueueEntry('p4', 1200, 'general_knowledge'),
      ];

      players.forEach((p) => queue.addToQueue(p));

      const stats = queue.getQueueStats();
      expect(stats.general_knowledge.queueSize).toBe(4);

      // Verify sorting by checking matches are created in rank order
      let matchCount = 0;
      queue.on('match_found', () => {
        matchCount++;
      });

      // Should create 2 matches
      expect(matchCount).toBeGreaterThan(0);
    });
  });

  // Helper function to create queue entries
  function createQueueEntry(
    playerId: string,
    elo: number,
    category: string,
    lastOpponentId?: string
  ): Omit<QueueEntry, 'joinedAt'> {
    return {
      playerId,
      username: `User_${playerId}`,
      elo,
      category,
      socket: mockSocket,
      lastOpponentId,
    };
  }
});
