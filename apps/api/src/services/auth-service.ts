/**
 * Authentication Service for Quizzi
 *
 * Handles minimal authentication for anonymous and registered users.
 * Uses simple JWT-like tokens for stateless session management.
 */

import { PrismaClient } from '@prisma/client';
import { calculateRankTier } from '../lib/rank-calculator';
import { AVAILABLE_AVATARS } from '../routes/profile';

const prisma = new PrismaClient();

// Simple token generation (CUID-based for simplicity, stateless)
// In production, consider using jose or similar for proper JWTs
const generateAuthToken = (userId: string): string => {
  // Format: userId.timestamp.randomHash
  const timestamp = Date.now().toString(36);
  const randomHash = Math.random().toString(36).substring(2, 15);
  return `${userId}.${timestamp}.${randomHash}`;
};

// Username validation regex: 3-16 chars, alphanumeric + underscore
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

export interface AnonymousUserResult {
  userId: string;
  username: string;
  token: string;
  avatar: string;
  elo: number;
  rankTier: string;
}

export interface RegisterUsernameResult {
  userId: string;
  username: string;
  token: string;
  isAnonymous: boolean;
}

export interface ValidateTokenResult {
  valid: boolean;
  userId?: string;
  username?: string;
  isAnonymous?: boolean;
}

export class AuthService {
  /**
   * Generate a new anonymous user with random username
   * Username format: Quizzi_XXXX (random 4-digit number)
   */
  async generateAnonymousUser(): Promise<AnonymousUserResult> {
    let username: string = '';
    let attempts = 0;
    const maxAttempts = 10;

    // Try to generate unique random username
    while (attempts < maxAttempts) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      username = `Quizzi_${randomNum}`;

      // Check if username is already taken
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (!existing) {
        break;
      }

      attempts++;
    }

    // Fallback: use timestamp-based username if all attempts failed
    if (attempts === maxAttempts || !username) {
      username = `Quizzi_${Date.now().toString().slice(-6)}`;
    }

    // Calculate initial rank tier from default rank points (1000)
    const initialRankPoints = 1000;
    const initialRankTier = calculateRankTier(initialRankPoints);

    // Randomly select an emoji avatar (Story 10.1)
    const randomAvatar = AVAILABLE_AVATARS[
      Math.floor(Math.random() * AVAILABLE_AVATARS.length)
    ];

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        isAnonymous: true,
        avatar: randomAvatar,
        elo: initialRankPoints,
        rankTier: initialRankTier,
      },
    });

    // Generate auth token
    const authToken = generateAuthToken(user.id);

    // Update user with auth token
    await prisma.user.update({
      where: { id: user.id },
      data: { authToken },
    });

    return {
      userId: user.id,
      username: user.username,
      token: authToken,
      avatar: user.avatar,
      elo: user.elo,
      rankTier: user.rankTier,
    };
  }

  /**
   * Register/claim an anonymous account with custom username
   * Validates username format and uniqueness
   */
  async registerUsername(
    userId: string,
    newUsername: string
  ): Promise<RegisterUsernameResult> {
    // Validate username format
    if (!USERNAME_REGEX.test(newUsername)) {
      throw new Error(
        'Invalid username format. Must be 3-16 characters, alphanumeric and underscores only.'
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUsername && existingUsername.id !== userId) {
      throw new Error('Username already taken');
    }

    // Check if user already has a registered username (not anonymous)
    if (!user.isAnonymous) {
      throw new Error('User already has a registered username');
    }

    // Update user with new username and mark as registered
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: newUsername,
        isAnonymous: false,
      },
    });

    return {
      userId: updatedUser.id,
      username: updatedUser.username,
      token: user.authToken!,
      isAnonymous: false,
    };
  }

  /**
   * Validate auth token and return user info
   */
  async validateToken(token: string): Promise<ValidateTokenResult> {
    if (!token) {
      return { valid: false };
    }

    // Extract userId from token (format: userId.timestamp.hash)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const userId = parts[0];

    // Look up user by token (ensures token hasn't been invalidated)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        authToken: token,
      },
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: user.id,
      username: user.username,
      isAnonymous: user.isAnonymous,
    };
  }

  /**
   * Get user by ID (for WebSocket authentication)
   */
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Invalidate auth token (logout)
   */
  async invalidateToken(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { authToken: null },
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
