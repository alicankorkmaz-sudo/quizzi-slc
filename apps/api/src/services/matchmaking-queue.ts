import { EventEmitter } from 'events';
import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from '../websocket/types';

/**
 * Matchmaking Queue Service
 *
 * Handles skill-based player pairing for 1v1 quiz battles with:
 * - Category-specific queues
 * - ELO-based matching with expanding ranges
 * - Same-opponent prevention
 * - O(log n) matching performance
 */

export interface QueueEntry {
  playerId: string;
  username: string;
  rankPoints: number;
  category: string;
  socket: ServerWebSocket<WebSocketData>;
  joinedAt: number;
  lastOpponentId?: string;
  expandedRangeTimer?: NodeJS.Timeout;
  anyPlayerTimer?: NodeJS.Timeout;
}

export interface MatchPair {
  player1: QueueEntry;
  player2: QueueEntry;
}

interface CategoryQueue {
  entries: Map<string, QueueEntry>; // playerId -> QueueEntry
  sortedByRank: QueueEntry[]; // Sorted array for binary search
}

export class MatchmakingQueue extends EventEmitter {
  // Category-specific queues
  protected queues: Map<string, CategoryQueue> = new Map();

  // Track last opponent per player (in-memory, can be moved to Redis later)
  protected lastOpponents: Map<string, string> = new Map();

  // Configuration
  private readonly INITIAL_RANGE = 200;
  private readonly EXPANDED_RANGE = 400;
  private readonly EXPAND_TIME_MS = 5000;
  private readonly ANY_PLAYER_TIME_MS = 10000;

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout;
  private readonly STALE_TIMEOUT_MS = 30000; // 30s for stale entries

  constructor() {
    super();

    // Initialize cleanup of stale queue entries
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleEntries();
    }, 10000); // Run every 10 seconds
  }

  /**
   * Add player to matchmaking queue
   */
  addToQueue(entry: Omit<QueueEntry, 'joinedAt'>): void {
    const queueEntry: QueueEntry = {
      ...entry,
      joinedAt: Date.now(),
    };

    // Get or create category queue
    if (!this.queues.has(entry.category)) {
      this.queues.set(entry.category, {
        entries: new Map(),
        sortedByRank: [],
      });
    }

    const categoryQueue = this.queues.get(entry.category)!;

    // Check if player already in queue
    if (categoryQueue.entries.has(entry.playerId)) {
      this.removeFromQueue(entry.playerId, entry.category);
    }

    // Add to queue
    categoryQueue.entries.set(entry.playerId, queueEntry);
    this.insertSorted(categoryQueue, queueEntry);

    // Immediately attempt match with ±200 range
    const match = this.findMatch(queueEntry, this.INITIAL_RANGE);

    if (match) {
      this.createMatch(match);
      return;
    }

    // Set timer to expand range to ±400 at 5 seconds
    queueEntry.expandedRangeTimer = setTimeout(() => {
      const currentEntry = categoryQueue.entries.get(entry.playerId);
      if (!currentEntry) return; // Already matched or removed

      const expandedMatch = this.findMatch(currentEntry, this.EXPANDED_RANGE);

      if (expandedMatch) {
        this.createMatch(expandedMatch);
        return;
      }

      // Set timer to match anyone at 10 seconds
      currentEntry.anyPlayerTimer = setTimeout(() => {
        const stillWaiting = categoryQueue.entries.get(entry.playerId);
        if (!stillWaiting) return; // Already matched or removed

        const anyMatch = this.findMatch(stillWaiting, Infinity);

        if (anyMatch) {
          this.createMatch(anyMatch);
        }
      }, this.ANY_PLAYER_TIME_MS - this.EXPAND_TIME_MS);

    }, this.EXPAND_TIME_MS);
  }

  /**
   * Remove player from queue (on disconnect or cancel)
   */
  removeFromQueue(playerId: string, category: string): boolean {
    const categoryQueue = this.queues.get(category);
    if (!categoryQueue) return false;

    const entry = categoryQueue.entries.get(playerId);
    if (!entry) return false;

    // Clear timers
    if (entry.expandedRangeTimer) {
      clearTimeout(entry.expandedRangeTimer);
    }
    if (entry.anyPlayerTimer) {
      clearTimeout(entry.anyPlayerTimer);
    }

    // Remove from entries map
    categoryQueue.entries.delete(playerId);

    // Remove from sorted array
    const index = categoryQueue.sortedByRank.findIndex(e => e.playerId === playerId);
    if (index !== -1) {
      categoryQueue.sortedByRank.splice(index, 1);
    }

    return true;
  }

  /**
   * Find match for player within rank range
   * Uses binary search for O(log n) performance
   */
  private findMatch(entry: QueueEntry, rankRange: number): MatchPair | null {
    const categoryQueue = this.queues.get(entry.category);
    if (!categoryQueue || categoryQueue.sortedByRank.length < 2) {
      return null;
    }

    const minRank = entry.rankPoints - rankRange;
    const maxRank = entry.rankPoints + rankRange;

    // Find candidates within rank range using binary search
    const startIndex = this.binarySearchLowerBound(categoryQueue.sortedByRank, minRank);
    const endIndex = this.binarySearchUpperBound(categoryQueue.sortedByRank, maxRank);

    // Search for valid opponent
    for (let i = startIndex; i <= endIndex; i++) {
      const candidate = categoryQueue.sortedByRank[i];

      // Skip self
      if (candidate.playerId === entry.playerId) continue;

      // Check rank range
      if (candidate.rankPoints < minRank || candidate.rankPoints > maxRank) continue;

      // Prevent same opponent twice in a row
      if (this.lastOpponents.get(entry.playerId) === candidate.playerId) continue;
      if (this.lastOpponents.get(candidate.playerId) === entry.playerId) continue;

      // Found valid match!
      return {
        player1: entry,
        player2: candidate,
      };
    }

    return null;
  }

  /**
   * Create match and emit event
   */
  private createMatch(pair: MatchPair): void {
    const { player1, player2 } = pair;

    // Remove both players from queue
    this.removeFromQueue(player1.playerId, player1.category);
    this.removeFromQueue(player2.playerId, player2.category);

    // Track last opponents
    this.lastOpponents.set(player1.playerId, player2.playerId);
    this.lastOpponents.set(player2.playerId, player1.playerId);

    // Emit match_found event (handled by match-manager)
    this.emit('match_found', {
      player1: {
        id: player1.playerId,
        username: player1.username,
        rankPoints: player1.rankPoints,
        socket: player1.socket,
      },
      player2: {
        id: player2.playerId,
        username: player2.username,
        rankPoints: player2.rankPoints,
        socket: player2.socket,
      },
      category: player1.category,
      queueTime: Date.now() - player1.joinedAt,
    });
  }

  /**
   * Insert entry into sorted array maintaining rank order
   */
  private insertSorted(categoryQueue: CategoryQueue, entry: QueueEntry): void {
    const { sortedByRank } = categoryQueue;

    // Binary search insertion point
    let left = 0;
    let right = sortedByRank.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedByRank[mid].rankPoints < entry.rankPoints) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    sortedByRank.splice(left, 0, entry);
  }

  /**
   * Binary search: find first index where rankPoints >= targetRank
   */
  private binarySearchLowerBound(arr: QueueEntry[], targetRank: number): number {
    let left = 0;
    let right = arr.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid].rankPoints < targetRank) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  /**
   * Binary search: find last index where rankPoints <= targetRank
   */
  private binarySearchUpperBound(arr: QueueEntry[], targetRank: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
      const mid = Math.ceil((left + right) / 2);
      if (arr[mid].rankPoints > targetRank) {
        right = mid - 1;
      } else {
        left = mid;
      }
    }

    return arr[left]?.rankPoints <= targetRank ? left : -1;
  }

  /**
   * Cleanup stale entries (disconnected players who weren't properly removed)
   */
  private cleanupStaleEntries(): void {
    const now = Date.now();

    for (const [category, categoryQueue] of this.queues) {
      const staleEntries: string[] = [];

      for (const [playerId, entry] of categoryQueue.entries) {
        // Check if entry is stale (>30s in queue) and socket is closed
        if (now - entry.joinedAt > this.STALE_TIMEOUT_MS &&
            entry.socket.readyState !== WebSocket.OPEN) {
          staleEntries.push(playerId);
        }
      }

      // Remove stale entries
      for (const playerId of staleEntries) {
        this.removeFromQueue(playerId, category);
      }
    }
  }

  /**
   * Get queue statistics (useful for monitoring)
   */
  getQueueStats(): Record<string, { queueSize: number; avgRankPoints: number }> {
    const stats: Record<string, { queueSize: number; avgRankPoints: number }> = {};

    for (const [category, categoryQueue] of this.queues) {
      const entries = Array.from(categoryQueue.entries.values());
      const queueSize = entries.length;
      const avgRankPoints = queueSize > 0
        ? entries.reduce((sum, e) => sum + e.rankPoints, 0) / queueSize
        : 0;

      stats[category] = { queueSize, avgRankPoints };
    }

    return stats;
  }

  /**
   * Cleanup on service shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);

    // Clear all timers
    for (const [, categoryQueue] of this.queues) {
      for (const [, entry] of categoryQueue.entries) {
        if (entry.expandedRangeTimer) clearTimeout(entry.expandedRangeTimer);
        if (entry.anyPlayerTimer) clearTimeout(entry.anyPlayerTimer);
      }
    }

    this.queues.clear();
    this.lastOpponents.clear();
    this.removeAllListeners();
  }
}
