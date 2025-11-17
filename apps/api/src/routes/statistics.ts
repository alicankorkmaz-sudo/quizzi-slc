/**
 * Statistics Routes for Quizzi
 *
 * Endpoints:
 * - GET /statistics - Get comprehensive user statistics
 * - GET /statistics/category - Get category-specific performance
 * - GET /statistics/history - Get match history
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { statisticsService } from '../services/statistics-service';

// Define context variables type
type Variables = {
  userId: string;
  username: string;
  isAnonymous: boolean;
};

const statistics = new Hono<{ Variables: Variables }>();

/**
 * GET /statistics
 * Get comprehensive user statistics
 * Requires authentication
 */
statistics.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const userStats = await statisticsService.getUserStatistics(userId);

    if (!userStats) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      500
    );
  }
});

/**
 * GET /statistics/category
 * Get category-specific performance
 * Requires authentication
 */
statistics.get('/category', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const categoryPerformance = await statisticsService.getCategoryPerformance(userId);

    return c.json({
      success: true,
      data: categoryPerformance,
    });
  } catch (error) {
    console.error('Error fetching category performance:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch category performance',
      },
      500
    );
  }
});

/**
 * GET /statistics/history
 * Get match history (last 10 matches by default)
 * Query params: ?limit=10
 * Requires authentication
 */
statistics.get('/history', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return c.json(
        {
          success: false,
          error: 'Invalid limit parameter (must be between 1 and 50)',
        },
        400
      );
    }

    const matchHistory = await statisticsService.getMatchHistory(userId, limit);

    return c.json({
      success: true,
      data: matchHistory,
    });
  } catch (error) {
    console.error('Error fetching match history:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch match history',
      },
      500
    );
  }
});

export { statistics };
