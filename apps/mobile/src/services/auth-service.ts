/**
 * Authentication service for anonymous login and username registration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const AUTH_STORAGE_KEY = '@quizzi/auth';

// API base URL (update for production)
// Use 10.0.2.2 for Android emulator to access host machine's localhost
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api'
  : 'http://localhost:3000/api';

export interface AuthData {
  userId: string;
  username: string;
  token: string;
  avatar: string;
  elo: number;
  rankTier: string;
  isAnonymous: boolean;
}

export interface AnonymousLoginResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    token: string;
    avatar: string;
    elo: number;
    rankTier: string;
  };
}

export interface RegisterUsernameResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    token: string;
    isAnonymous: boolean;
  };
}

/**
 * Perform anonymous login with backend
 */
export async function anonymousLogin(): Promise<AuthData> {
  try {
    console.log('[AuthService] Attempting anonymous login...');

    const response = await fetch(`${API_BASE_URL}/auth/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Anonymous login failed: ${response.status}`);
    }

    const result: AnonymousLoginResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid response from server');
    }

    const authData: AuthData = {
      userId: result.data.userId,
      username: result.data.username,
      token: result.data.token,
      avatar: result.data.avatar,
      elo: result.data.elo,
      rankTier: result.data.rankTier,
      isAnonymous: true,
    };

    // Store auth data
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[AuthService] Anonymous login successful:', authData.username);

    return authData;
  } catch (error) {
    console.error('[AuthService] Anonymous login error:', error);
    throw error;
  }
}

/**
 * Register a custom username (converts anonymous to registered)
 */
export async function registerUsername(
  userId: string,
  newUsername: string,
  currentToken: string
): Promise<AuthData> {
  try {
    console.log('[AuthService] Registering username:', newUsername);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        userId,
        username: newUsername,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Registration failed: ${response.status}`);
    }

    const result: RegisterUsernameResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid response from server');
    }

    // Get current stored auth to preserve avatar, elo, and rankTier
    const storedAuth = await getStoredAuth();

    const authData: AuthData = {
      userId: result.data.userId,
      username: result.data.username,
      token: result.data.token,
      avatar: storedAuth?.avatar || 'default_1',
      elo: storedAuth?.elo || 1000,
      rankTier: storedAuth?.rankTier || 'bronze',
      isAnonymous: result.data.isAnonymous,
    };

    // Update stored auth data
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[AuthService] Username registered successfully:', authData.username);

    return authData;
  } catch (error) {
    console.error('[AuthService] Username registration error:', error);
    throw error;
  }
}

/**
 * Get stored authentication data
 */
export async function getStoredAuth(): Promise<AuthData | null> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      console.log('[AuthService] No stored auth found');
      return null;
    }

    const authData: AuthData = JSON.parse(stored);

    // Handle legacy auth data that doesn't have rankTier
    if (!authData.rankTier) {
      console.log('[AuthService] Legacy auth data, adding default rankTier');
      authData.rankTier = 'bronze'; // Default to bronze for legacy users
      // Update stored auth with rankTier
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    }

    console.log('[AuthService] Retrieved stored auth:', authData.username, 'ELO:', authData.elo, 'Tier:', authData.rankTier);

    return authData;
  } catch (error) {
    console.error('[AuthService] Error retrieving stored auth:', error);
    return null;
  }
}

/**
 * Clear authentication data (logout)
 */
export async function logout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('[AuthService] Logged out successfully');
  } catch (error) {
    console.error('[AuthService] Error during logout:', error);
    throw error;
  }
}

/**
 * Validate username format
 * 3-16 chars, alphanumeric + underscore
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username || username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters',
    };
  }

  if (username.length > 16) {
    return {
      isValid: false,
      error: 'Username must be 16 characters or less',
    };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { isValid: true };
}
