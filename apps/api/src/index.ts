import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { User } from '@quizzi/types';
import { isDefined } from '@quizzi/utils';

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

const port = process.env.PORT || 3000;

console.log(`🚀 Quizzi API server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
