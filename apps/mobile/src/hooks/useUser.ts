/**
 * Hook for accessing user data and authentication
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getStoredAuth,
  anonymousLogin,
  registerUsername as registerUsernameService,
  refreshProfileData,
  type AuthData,
} from '../services/auth-service';

export interface UserData {
  userId: string | null;
  username: string | null;
  token: string | null;
  rankPoints: number | null;
  rankTier: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  registerUsername: (newUsername: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage user authentication and data
 */
export function useUser(): UserData {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check for stored auth
      const stored = await getStoredAuth();

      if (stored) {
        console.log('[useUser] Using stored auth:', stored.username);
        setAuthData(stored);
      } else {
        // No stored auth - perform anonymous login
        console.log('[useUser] No stored auth, performing anonymous login');
        const newAuth = await anonymousLogin();
        setAuthData(newAuth);
      }
    } catch (error) {
      console.error('[useUser] Error loading auth:', error);
      // On error, try anonymous login as fallback
      try {
        const fallbackAuth = await anonymousLogin();
        setAuthData(fallbackAuth);
      } catch (fallbackError) {
        console.error('[useUser] Fallback anonymous login failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // Debug: Log when authData changes
  useEffect(() => {
    if (authData) {
      console.log('[useUser] authData state changed:', {
        username: authData.username,
        elo: authData.elo,
        rankTier: authData.rankTier
      });
    }
  }, [authData]);

  const registerUsername = useCallback(
    async (newUsername: string) => {
      if (!authData) {
        throw new Error('Not authenticated');
      }

      const updatedAuth = await registerUsernameService(
        authData.userId,
        newUsername,
        authData.token
      );
      setAuthData(updatedAuth);
    },
    [authData]
  );

  const refresh = useCallback(async () => {
    console.log('[useUser] refresh() called');

    // Get fresh stored auth to get current token
    const currentAuth = await getStoredAuth();

    if (currentAuth?.token) {
      console.log('[useUser] Refreshing profile data from API...');
      console.log('[useUser] Current auth data:', {
        username: currentAuth.username,
        elo: currentAuth.elo,
        rankTier: currentAuth.rankTier
      });

      const updatedAuth = await refreshProfileData(currentAuth.token);

      if (updatedAuth) {
        console.log('[useUser] Setting updated auth data:', {
          username: updatedAuth.username,
          elo: updatedAuth.elo,
          rankTier: updatedAuth.rankTier
        });
        setAuthData(updatedAuth);
        console.log('[useUser] Auth data updated in state');
        return;
      } else {
        console.error('[useUser] Failed to get updated auth data from API');
      }
    }

    // Fallback to loading from storage
    console.log('[useUser] Falling back to loading from storage');
    await loadAuth();
  }, [loadAuth]);

  return {
    userId: authData?.userId || null,
    username: authData?.username || null,
    token: authData?.token || null,
    rankPoints: authData?.elo || null,
    rankTier: authData?.rankTier || null,
    isAnonymous: authData?.isAnonymous ?? true,
    isLoading,
    isAuthenticated: !!authData,
    registerUsername,
    refresh,
  };
}
