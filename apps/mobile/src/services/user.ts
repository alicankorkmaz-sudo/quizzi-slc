/**
 * User service for managing user identity and persistence
 * @deprecated This service is deprecated. Use auth-service.ts for authentication instead.
 * Kept for backward compatibility only.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const USER_ID_KEY = '@quizzi/userId';
const USERNAME_KEY = '@quizzi/username';

/**
 * Generate a unique user ID based on device information
 */
function generateUserId(): string {
  // Use device ID if available, otherwise generate random ID
  const deviceId = Constants.deviceId || Constants.sessionId;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  return `user_${deviceId}_${timestamp}_${random}`;
}

/**
 * Get or create user ID
 */
export async function getUserId(): Promise<string> {
  try {
    // Check if we already have a user ID
    let userId = await AsyncStorage.getItem(USER_ID_KEY);

    if (!userId) {
      // Generate new user ID
      userId = generateUserId();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      console.log('[User] Generated new user ID:', userId);
    } else {
      console.log('[User] Retrieved existing user ID:', userId);
    }

    return userId;
  } catch (error) {
    console.error('[User] Error getting user ID:', error);
    // Fallback to session-based ID if storage fails
    return generateUserId();
  }
}

/**
 * Get or create username
 */
export async function getUsername(): Promise<string> {
  try {
    let username = await AsyncStorage.getItem(USERNAME_KEY);

    if (!username) {
      // Generate default username
      const random = Math.random().toString(36).substring(2, 8);
      username = `Player${random}`;
      await AsyncStorage.setItem(USERNAME_KEY, username);
      console.log('[User] Generated new username:', username);
    } else {
      console.log('[User] Retrieved existing username:', username);
    }

    return username;
  } catch (error) {
    console.error('[User] Error getting username:', error);
    return `Player${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * Set username
 */
export async function setUsername(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
    console.log('[User] Updated username:', username);
  } catch (error) {
    console.error('[User] Error setting username:', error);
  }
}

/**
 * Clear user data (for testing/logout)
 */
export async function clearUserData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([USER_ID_KEY, USERNAME_KEY]);
    console.log('[User] Cleared user data');
  } catch (error) {
    console.error('[User] Error clearing user data:', error);
  }
}
