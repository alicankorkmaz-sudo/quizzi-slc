/**
 * Profile service for fetching and updating user profile
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AvatarId } from '../utils/avatars';

// Storage keys
const AUTH_STORAGE_KEY = '@quizzi/auth';

// Production API URL
import { API_URL } from '../config';

// Production API URL
const API_BASE_URL = `${API_URL}/api`;

export type Avatar = AvatarId;

export interface ProfileData {
  id: string;
  username: string;
  avatar: string;
  elo: number;
  rankTier: string;
  winRate: number;
  currentStreak: number;
  matchesPlayed: number;
  avgResponseTime: number;
  premiumStatus: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: Avatar;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  error?: string;
}

/**
 * Get current user's profile from backend
 */
export async function getProfile(token: string): Promise<ProfileData> {
  try {
    console.log('[ProfileService] Fetching profile...');

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch profile: ${response.status}`);
    }

    const result: ProfileResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid response from server');
    }

    console.log('[ProfileService] Profile fetched successfully');
    return result.data;
  } catch (error) {
    console.error('[ProfileService] Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update user profile (username and/or avatar)
 */
export async function updateProfile(
  token: string,
  updates: UpdateProfileRequest
): Promise<ProfileData> {
  try {
    console.log('[ProfileService] Updating profile...', updates);

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update profile: ${response.status}`);
    }

    const result: ProfileResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid response from server');
    }

    // Update stored auth data with new username/avatar
    await updateStoredAuth(result.data);

    console.log('[ProfileService] Profile updated successfully');
    return result.data;
  } catch (error) {
    console.error('[ProfileService] Error updating profile:', error);
    throw error;
  }
}

/**
 * Update stored auth data with new profile information
 */
async function updateStoredAuth(profileData: ProfileData): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      console.warn('[ProfileService] No stored auth found to update');
      return;
    }

    const authData = JSON.parse(stored);

    // Update with new profile data
    authData.username = profileData.username;
    authData.avatar = profileData.avatar;
    authData.isAnonymous = profileData.isAnonymous;
    authData.elo = profileData.elo;
    authData.rankTier = profileData.rankTier;

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[ProfileService] Stored auth updated');
  } catch (error) {
    console.error('[ProfileService] Error updating stored auth:', error);
  }
}

/**
 * Validate username format (client-side validation)
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
