/**
 * Authentication service for anonymous login and username registration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const AUTH_STORAGE_KEY = '@quizzi/auth';

// API base URL (update for production)
const API_BASE_URL = 'http://localhost:3000';

export interface AuthData {
  userId: string;
  username: string;
  token: string;
  isAnonymous: boolean;
}

export interface AnonymousLoginResponse {
  userId: string;
  username: string;
  token: string;
}

export interface RegisterUsernameResponse {
  userId: string;
  username: string;
  token: string;
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

    const data: AnonymousLoginResponse = await response.json();

    const authData: AuthData = {
      userId: data.userId,
      username: data.username,
      token: data.token,
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
        newUsername,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed: ${response.status}`);
    }

    const data: RegisterUsernameResponse = await response.json();

    const authData: AuthData = {
      userId: data.userId,
      username: data.username,
      token: data.token,
      isAnonymous: false,
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
    console.log('[AuthService] Retrieved stored auth:', authData.username);

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
