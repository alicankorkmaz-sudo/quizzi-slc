/**
 * Hook for accessing user data and authentication
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getStoredAuth,
  anonymousLogin,
  registerUsername as registerUsernameService,
  type AuthData,
} from '../services/auth-service';

export interface UserData {
  userId: string | null;
  username: string | null;
  token: string | null;
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
    await loadAuth();
  }, [loadAuth]);

  return {
    userId: authData?.userId || null,
    username: authData?.username || null,
    token: authData?.token || null,
    isAnonymous: authData?.isAnonymous ?? true,
    isLoading,
    isAuthenticated: !!authData,
    registerUsername,
    refresh,
  };
}
