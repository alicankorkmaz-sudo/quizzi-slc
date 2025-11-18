/**
 * Statistics Service for Quizzi
 *
 * Handles all statistics calculations and tracking:
 * - User overall statistics
 * - Category-specific performance
 * - Match history
 * - Streak tracking
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchStats {
  avgResponseTime: number;
  fastestAnswer: number;
  accuracy: number;
}

export interface UserStatistics {
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  avgResponseTime: number;
}

export interface CategoryPerformanceData {
  category: string;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  avgResponseTime: number;
}

export interface MatchHistoryEntry {
  matchId: string;
  opponentId: string;
  opponentUsername: string;
  category: string;
  result: 'win' | 'loss';
  playerScore: number;
  opponentScore: number;
  avgResponseTime: number;
  fastestAnswer: number;
  accuracy: number;
  eloChange: number;
  completedAt: Date;
}

export class StatisticsService {
  /**
   * Update all statistics after a match completes
   */
  async updateMatchStatistics(
    matchId: string,
    winnerId: string,
    _loserId: string,
    player1Id: string,
    player2Id: string,
    category: string,
    player1Stats: MatchStats,
    player2Stats: MatchStats,
    player1EloBefore: number,
    player1EloAfter: number,
    player1EloChange: number,
    player2EloBefore: number,
    player2EloAfter: number,
    player2EloChange: number
  ): Promise<void> {
    // Update match record with detailed stats and ELO context
    await prisma.match.update({
      where: { id: matchId },
      data: {
        player1AvgResponseTime: player1Stats.avgResponseTime,
        player2AvgResponseTime: player2Stats.avgResponseTime,
        player1FastestAnswer: player1Stats.fastestAnswer,
        player2FastestAnswer: player2Stats.fastestAnswer,
        player1Accuracy: player1Stats.accuracy,
        player2Accuracy: player2Stats.accuracy,
        player1EloBefore: player1EloBefore,
        player1EloAfter: player1EloAfter,
        player1EloChange: player1EloChange,
        player2EloBefore: player2EloBefore,
        player2EloAfter: player2EloAfter,
        player2EloChange: player2EloChange,
      },
    });

    // Update user statistics for both players
    await Promise.all([
      this.updateUserStats(player1Id, winnerId === player1Id, player1Stats.avgResponseTime),
      this.updateUserStats(player2Id, winnerId === player2Id, player2Stats.avgResponseTime),
    ]);

    // Update category performance for both players
    await Promise.all([
      this.updateCategoryPerformance(
        player1Id,
        category,
        winnerId === player1Id,
        player1Stats.avgResponseTime
      ),
      this.updateCategoryPerformance(
        player2Id,
        category,
        winnerId === player2Id,
        player2Stats.avgResponseTime
      ),
    ]);
  }

  /**
   * Update user-level statistics
   */
  private async updateUserStats(
    userId: string,
    won: boolean,
    matchAvgResponseTime: number
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        matchesPlayed: true,
        matchesWon: true,
        matchesLost: true,
        currentStreak: true,
        longestStreak: true,
        avgResponseTime: true,
      },
    });

    if (!user) return;

    const newMatchesPlayed = user.matchesPlayed + 1;
    const newMatchesWon = won ? user.matchesWon + 1 : user.matchesWon;
    const newMatchesLost = won ? user.matchesLost : user.matchesLost + 1;
    const newWinRate = newMatchesWon / newMatchesPlayed;

    // Update streak
    let newCurrentStreak: number;
    let newLongestStreak = user.longestStreak;

    if (won) {
      newCurrentStreak = user.currentStreak + 1;
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      newCurrentStreak = 0;
    }

    // Calculate cumulative average response time
    const newAvgResponseTime = Math.round(
      (user.avgResponseTime * user.matchesPlayed + matchAvgResponseTime) / newMatchesPlayed
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        matchesPlayed: newMatchesPlayed,
        matchesWon: newMatchesWon,
        matchesLost: newMatchesLost,
        winRate: newWinRate,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        avgResponseTime: newAvgResponseTime,
      },
    });
  }

  /**
   * Update category-specific performance
   */
  private async updateCategoryPerformance(
    userId: string,
    category: string,
    won: boolean,
    matchAvgResponseTime: number
  ): Promise<void> {
    const existing = await prisma.categoryPerformance.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
    });

    if (existing) {
      const newMatchesPlayed = existing.matchesPlayed + 1;
      const newMatchesWon = won ? existing.matchesWon + 1 : existing.matchesWon;
      const newWinRate = newMatchesWon / newMatchesPlayed;
      const newAvgResponseTime = Math.round(
        (existing.avgResponseTime * existing.matchesPlayed + matchAvgResponseTime) /
          newMatchesPlayed
      );

      await prisma.categoryPerformance.update({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
        data: {
          matchesPlayed: newMatchesPlayed,
          matchesWon: newMatchesWon,
          winRate: newWinRate,
          avgResponseTime: newAvgResponseTime,
        },
      });
    } else {
      await prisma.categoryPerformance.create({
        data: {
          userId,
          category,
          matchesPlayed: 1,
          matchesWon: won ? 1 : 0,
          winRate: won ? 1.0 : 0.0,
          avgResponseTime: matchAvgResponseTime,
        },
      });
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        winRate: true,
        currentStreak: true,
        longestStreak: true,
        matchesPlayed: true,
        matchesWon: true,
        matchesLost: true,
        avgResponseTime: true,
      },
    });

    if (!user) return null;

    return {
      winRate: user.winRate,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      matchesPlayed: user.matchesPlayed,
      matchesWon: user.matchesWon,
      matchesLost: user.matchesLost,
      avgResponseTime: user.avgResponseTime,
    };
  }

  /**
   * Get category performance for a user
   */
  async getCategoryPerformance(userId: string): Promise<CategoryPerformanceData[]> {
    const categoryStats = await prisma.categoryPerformance.findMany({
      where: { userId },
      orderBy: { matchesPlayed: 'desc' },
    });

    return categoryStats.map((stat) => ({
      category: stat.category,
      matchesPlayed: stat.matchesPlayed,
      matchesWon: stat.matchesWon,
      winRate: stat.winRate,
      avgResponseTime: stat.avgResponseTime,
    }));
  }

  /**
   * Get match history for a user (last N matches)
   */
  async getMatchHistory(userId: string, limit = 10): Promise<MatchHistoryEntry[]> {
    // Get matches where user was player1 or player2
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    // For each match, fetch opponent data
    const matchHistory = await Promise.all(
      matches.map(async (match) => {
        const isPlayer1 = match.player1Id === userId;
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
        const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
        const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
        const won = match.winnerId === userId;

        // Fetch opponent username
        const opponent = await prisma.user.findUnique({
          where: { id: opponentId },
          select: { username: true },
        });

        // Get ELO change from match record
        const eloChange = isPlayer1 ? match.player1EloChange : match.player2EloChange;

        const playerStats = isPlayer1
          ? {
              avgResponseTime: match.player1AvgResponseTime,
              fastestAnswer: match.player1FastestAnswer,
              accuracy: match.player1Accuracy,
            }
          : {
              avgResponseTime: match.player2AvgResponseTime,
              fastestAnswer: match.player2FastestAnswer,
              accuracy: match.player2Accuracy,
            };

        return {
          matchId: match.id,
          opponentId,
          opponentUsername: opponent?.username || 'Unknown',
          category: match.category,
          result: won ? ('win' as const) : ('loss' as const),
          playerScore,
          opponentScore,
          avgResponseTime: playerStats.avgResponseTime,
          fastestAnswer: playerStats.fastestAnswer,
          accuracy: playerStats.accuracy,
          eloChange,
          completedAt: match.completedAt!,
        };
      })
    );

    return matchHistory;
  }
}

export const statisticsService = new StatisticsService();
