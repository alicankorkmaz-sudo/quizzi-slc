import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  elo: number;
  rankTier: string;
  matchesPlayed: number;
  winRate: number;
}

export interface LeaderboardResponse {
  topPlayers: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  totalPlayers: number;
}

class LeaderboardService {
  /**
   * Get global leaderboard with top 50 players and current user's position
   */
  async getGlobalLeaderboard(userId: string): Promise<LeaderboardResponse> {
    // Get top 50 players ordered by ELO
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        elo: true,
        rankTier: true,
        matchesPlayed: true,
        winRate: true,
      },
      orderBy: {
        elo: 'desc',
      },
      take: 50,
    });

    // Get current user's data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        elo: true,
        rankTier: true,
        matchesPlayed: true,
        winRate: true,
      },
    });

    // Get total number of players
    const totalPlayers = await prisma.user.count();

    // Map top players to leaderboard entries with ranks
    const topPlayers: LeaderboardEntry[] = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      elo: user.elo,
      rankTier: user.rankTier,
      matchesPlayed: user.matchesPlayed,
      winRate: user.winRate,
    }));

    // Find current user's rank if not in top 50
    let currentUserEntry: LeaderboardEntry | null = null;

    if (currentUser) {
      // Check if user is in top 50
      const topPlayerIndex = topPlayers.findIndex(p => p.userId === userId);

      if (topPlayerIndex !== -1) {
        // User is in top 50, use existing entry
        currentUserEntry = topPlayers[topPlayerIndex];
      } else {
        // User is not in top 50, calculate their rank
        const userRank = await prisma.user.count({
          where: {
            elo: {
              gt: currentUser.elo,
            },
          },
        });

        currentUserEntry = {
          rank: userRank + 1,
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          elo: currentUser.elo,
          rankTier: currentUser.rankTier,
          matchesPlayed: currentUser.matchesPlayed,
          winRate: currentUser.winRate,
        };
      }
    }

    return {
      topPlayers,
      currentUser: currentUserEntry,
      totalPlayers,
    };
  }
}

export const leaderboardService = new LeaderboardService();
