import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { User } from '@quizzi/types';
import { isDefined } from '@quizzi/utils';
import { serve } from 'bun';
import { wsHandler, initializeWebSocket, shutdownWebSocket } from './websocket';
import { connectionManager } from './websocket/connection-manager';
import { matchManager } from './websocket/match-manager';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:8081', 'exp://localhost:8081'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    monorepo: isDefined({}) ? 'connected' : 'disconnected',
    websocket: {
      connections: connectionManager.getConnectionCount(),
      disconnected: connectionManager.getDisconnectedCount(),
      activeMatches: matchManager.getActiveMatchesCount(),
    },
  });
});

// API routes
const api = new Hono();

api.get('/users/:id', (c) => {
  const id = c.req.param('id');

  const user: User = {
    id,
    username: 'test_player',
    avatar: 'default_1',
    rankPoints: 1000,
    rankTier: 'bronze',
    winRate: 0.65,
    currentStreak: 3,
    matchesPlayed: 42,
    avgResponseTime: 2400,
    premiumStatus: false,
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

// Initialize WebSocket infrastructure
initializeWebSocket();

console.log(`🚀 Quizzi API server starting on port ${port}`);
console.log(`📡 WebSocket endpoint: ws://localhost:${port}/ws`);

// Bun.serve handles both HTTP and WebSocket
const server = serve({
  port,
  fetch(req, server) {
    const url = new URL(req.url);

    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      // Extract userId from query params (in production, use JWT token)
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return new Response('Missing userId parameter', { status: 400 });
      }

      const upgraded = server.upgrade(req, {
        data: {
          userId,
          connectedAt: Date.now(),
        },
      });

      if (upgraded) {
        return undefined;
      }

      return new Response('WebSocket upgrade failed', { status: 500 });
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
