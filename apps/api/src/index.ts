import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { User } from '@quizzi/types';
import { isDefined } from '@quizzi/utils';
import { serve } from 'bun';
import { wsHandler, initializeWebSocket, shutdownWebSocket } from './websocket';
import { connectionManager } from './websocket/connection-manager';
import { matchManager } from './websocket/match-manager';
import { questionService } from './services/question-service';
import { auth } from './routes/auth';
import { profile } from './routes/profile';
import { statistics } from './routes/statistics';
import { leaderboard } from './routes/leaderboard';
import { authService } from './services/auth-service';
import { requireAuth } from './middleware/auth';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:8081', 'exp://localhost:8081'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  const questionStats = questionService.getCacheStats();

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    monorepo: isDefined({}) ? 'connected' : 'disconnected',
    websocket: {
      connections: connectionManager.getConnectionCount(),
      disconnected: connectionManager.getDisconnectedCount(),
      activeMatches: matchManager.getActiveMatchesCount(),
    },
    questions: questionStats,
  });
});

// API routes
const api = new Hono();

// Mount auth routes (public)
api.route('/auth', auth);

// Mount profile routes (protected)
api.route('/profile', profile);

// Mount statistics routes (protected)
api.route('/statistics', statistics);

// Mount leaderboard routes (protected)
api.route('/leaderboard', leaderboard);

// Protected routes - require authentication
api.use('/users/*', requireAuth);
api.use('/matches/*', requireAuth);
api.use('/questions/*', requireAuth);

api.get('/users/:id', (c) => {
  const id = c.req.param('id');

  const user: User = {
    id,
    username: 'test_player',
    avatar: 'emoji_dog',
    elo: 1000,
    rankTier: 'bronze',
    winRate: 0.65,
    currentStreak: 3,
    matchesPlayed: 42,
    avgResponseTime: 2400,
    premiumStatus: false,
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return c.json(user);
});

api.get('/matches', (c) => {
  return c.json({
    matches: [],
    message: 'Matchmaking endpoint - to be implemented',
  });
});

api.get('/questions', (c) => {
  return c.json({
    questions: [],
    message: 'Question pool endpoint - to be implemented',
  });
});

app.route('/api', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: err.message }, 500);
});

const port = parseInt(process.env.PORT || '3000');

// Initialize question service cache
await questionService.initializeCache();

// Initialize WebSocket infrastructure
initializeWebSocket();

console.log(`🚀 Quizzi API server starting on port ${port}`);
console.log(`📡 WebSocket endpoint: ws://localhost:${port}/ws`);

// Bun.serve handles both HTTP and WebSocket
const server = serve({
  port,
  hostname: '0.0.0.0', // Required for Railway deployment
  fetch(req, server) {
    const url = new URL(req.url);

    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      // Extract token from query params
      const token = url.searchParams.get('token');

      if (!token) {
        return new Response('Missing token parameter', { status: 400 });
      }

      // Validate token asynchronously before upgrading
      const validateAndUpgrade = async () => {
        const validation = await authService.validateToken(token);

        if (!validation.valid || !validation.userId) {
          return new Response('Invalid or expired token', { status: 401 });
        }

        const upgraded = server.upgrade(req, {
          data: {
            userId: validation.userId,
            username: validation.username,
            connectedAt: Date.now(),
          },
        });

        if (upgraded) {
          return undefined;
        }

        return new Response('WebSocket upgrade failed', { status: 500 });
      };

      // Execute async validation
      return validateAndUpgrade();
    }

    // Handle HTTP requests with Hono
    return app.fetch(req, server);
  },
  websocket: wsHandler,
});

console.log(`✅ Server running on http://localhost:${port}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Shutting down server...');
  shutdownWebSocket();
  server.stop();
  process.exit(0);
});
