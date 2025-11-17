/**
 * Profile Routes for Quizzi
 *
 * Endpoints:
 * - GET /profile - Get current user profile
 * - PATCH /profile - Update username and/or avatar
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { calculateRankTier } from '../lib/rank-calculator';

// Define context variables type
type Variables = {
  userId: string;
  username: string;
  isAnonymous: boolean;
};

const profile = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

// Predefined avatar list
export const AVAILABLE_AVATARS = [
  'default_1',
  'default_2',
  'default_3',
  'default_4',
  'default_5',
  'default_6',
  'default_7',
  'default_8',
] as const;

// Validation schemas
const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(16, 'Username must be at most 16 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .optional(),
  avatar: z.enum(AVAILABLE_AVATARS, {
    errorMap: () => ({ message: 'Invalid avatar selection' }),
  }).optional(),
});

/**
 * GET /profile
 * Get current user's profile
 * Requires authentication
 */
profile.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        elo: true,
        rankTier: true,
        winRate: true,
        currentStreak: true,
        matchesPlayed: true,
        avgResponseTime: true,
        premiumStatus: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        404
      );
    }

    // Calculate current rank tier from rank points
    const calculatedRankTier = calculateRankTier(user.elo);

    // Update rank tier if it has changed
    if (user.rankTier !== calculatedRankTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { rankTier: calculatedRankTier },
      });
      user.rankTier = calculatedRankTier;
    }

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch profile',
      },
      500
    );
  }
});

/**
 * PATCH /profile
 * Update user profile (username and/or avatar)
 * Requires authentication
 *
 * Body: { username?: string, avatar?: string }
 */
profile.patch('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: validationResult.error.errors[0].message,
        },
        400
      );
    }

    const { username, avatar } = validationResult.data;

    // Check if at least one field is provided
    if (!username && !avatar) {
      return c.json(
        {
          success: false,
          error: 'At least one field (username or avatar) must be provided',
        },
        400
      );
    }

    // If username is being updated, check uniqueness
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== userId) {
        return c.json(
          {
            success: false,
            error: 'Username already taken',
          },
          409
        );
      }
    }

    // Build update data object
    const updateData: { username?: string; avatar?: string; isAnonymous?: boolean } = {};

    if (username) {
      updateData.username = username;
      // If user is updating their username, they're no longer anonymous
      updateData.isAnonymous = false;
    }

    if (avatar) {
      updateData.avatar = avatar;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        avatar: true,
        elo: true,
        rankTier: true,
        winRate: true,
        currentStreak: true,
        matchesPlayed: true,
        avgResponseTime: true,
        premiumStatus: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate current rank tier from rank points
    const calculatedRankTier = calculateRankTier(updatedUser.elo);

    // Update rank tier if it has changed
    if (updatedUser.rankTier !== calculatedRankTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { rankTier: calculatedRankTier },
      });
      updatedUser.rankTier = calculatedRankTier;
    }

    return c.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return c.json(
        {
          success: false,
          error: 'User not found',
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: 'Failed to update profile',
      },
      500
    );
  }
});

export { profile };
