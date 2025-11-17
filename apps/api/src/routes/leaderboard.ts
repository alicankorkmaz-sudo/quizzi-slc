import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { leaderboardService } from '../services/leaderboard-service';

// Define context type with userId
type Env = {
  Variables: {
    userId: string;
    username?: string;
    isAnonymous?: boolean;
  };
};

export const leaderboard = new Hono<Env>();

// GET /api/leaderboard - Get global leaderboard
leaderboard.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const leaderboardData = await leaderboardService.getGlobalLeaderboard(userId);

    return c.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});
