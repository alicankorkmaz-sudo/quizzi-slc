/**
 * Authentication Routes for Quizzi
 *
 * Endpoints:
 * - POST /auth/anonymous - Create anonymous user
 * - POST /auth/register - Register username for anonymous user
 * - GET /auth/validate - Validate auth token
 * - POST /auth/logout - Invalidate token
 */

import { Hono } from 'hono';
import { authService } from '../services/auth-service';
import { z } from 'zod';

const auth = new Hono();

// Validation schemas
const registerUsernameSchema = z.object({
  userId: z.string().cuid(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(16, 'Username must be at most 16 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
});

// Validation schema for token (currently unused but kept for future use)
// const validateTokenSchema = z.object({
//   token: z.string(),
// });

/**
 * POST /auth/anonymous
 * Create a new anonymous user with random username
 */
auth.post('/anonymous', async (c) => {
  try {
    const result = await authService.generateAnonymousUser();

    return c.json(
      {
        success: true,
        data: result,
      },
      201
    );
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      },
      500
    );
  }
});

/**
 * POST /auth/register
 * Register custom username for anonymous user
 *
 * Body: { userId: string, username: string }
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const validationResult = registerUsernameSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: validationResult.error.errors[0].message,
        },
        400
      );
    }

    const { userId, username } = validationResult.data;

    const result = await authService.registerUsername(userId, username);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error registering username:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already taken')) {
        return c.json(
          {
            success: false,
            error: 'Username already taken',
          },
          409
        );
      }

      if (error.message.includes('not found')) {
        return c.json(
          {
            success: false,
            error: 'User not found',
          },
          404
        );
      }

      if (error.message.includes('already has a registered username')) {
        return c.json(
          {
            success: false,
            error: 'User already has a registered username',
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          error: error.message,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: 'Failed to register username',
      },
      500
    );
  }
});

/**
 * GET /auth/validate
 * Validate auth token
 *
 * Headers: Authorization: Bearer <token>
 */
auth.get('/validate', async (c) => {
  try {
    // Extract token from Authorization header
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: 'Missing or invalid Authorization header',
        },
        401
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const result = await authService.validateToken(token);

    if (!result.valid) {
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        401
      );
    }

    return c.json({
      success: true,
      data: {
        userId: result.userId,
        username: result.username,
        isAnonymous: result.isAnonymous,
      },
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to validate token',
      },
      500
    );
  }
});

/**
 * POST /auth/logout
 * Invalidate auth token
 *
 * Body: { userId: string }
 */
auth.post('/logout', async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json(
        {
          success: false,
          error: 'Missing userId',
        },
        400
      );
    }

    await authService.invalidateToken(userId);

    return c.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error logging out:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to logout',
      },
      500
    );
  }
});

export { auth };
