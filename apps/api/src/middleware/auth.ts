/**
 * Authentication Middleware for Quizzi API
 *
 * Validates JWT tokens on protected routes
 */

import type { Context, Next } from 'hono';
import { authService } from '../services/auth-service';

/**
 * Middleware to verify authentication token
 * Extracts token from Authorization header and validates it
 * Sets userId and username in context if valid
 */
export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
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

    // Validate token
    const validation = await authService.validateToken(token);

    if (!validation.valid || !validation.userId) {
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        401
      );
    }

    // Set user info in context for downstream handlers
    c.set('userId', validation.userId);
    c.set('username', validation.username);
    c.set('isAnonymous', validation.isAnonymous);

    return await next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return c.json(
      {
        success: false,
        error: 'Authentication failed',
      },
      500
    );
  }
}

/**
 * Optional auth middleware - doesn't reject if no token provided
 * But validates and sets context if token is present
 */
export async function optionalAuth(c: Context, next: Next): Promise<Response | void> {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validation = await authService.validateToken(token);

      if (validation.valid && validation.userId) {
        c.set('userId', validation.userId);
        c.set('username', validation.username);
        c.set('isAnonymous', validation.isAnonymous);
      }
    }

    return await next();
  } catch (error) {
    console.error('[Optional Auth Middleware] Error:', error);
    // Don't fail the request, just log the error
    return await next();
  }
}
