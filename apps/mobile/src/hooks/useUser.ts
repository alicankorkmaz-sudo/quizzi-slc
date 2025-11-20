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
import { API_URL } from '../config';

export interface UserData {
  userId: string | null;
  username: string | null;
  avatar: string | null;
  token: string | null;
  elo: number | null;
  rankTier: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  registerUsername: (newUsername: string) => Promise<void>;
  refresh: () => Promise<void>;
  setAuth: (data: AuthData) => void;
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
        console.log('[useUser] Found stored auth:', stored.username);

        // Validate the stored token by testing it against the API
        try {
          const testResponse = await fetch(`${API_URL}/api/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${stored.token}`,
            },
          });

          if (testResponse.ok) {
            console.log('[useUser] Token is valid, using stored auth');
            setAuthData(stored);
          } else {
            console.log('[useUser] Stored token invalid (status:', testResponse.status, '), re-authenticating');
            const newAuth = await anonymousLogin();
            setAuthData(newAuth);
          }
        } catch (tokenTestError) {
          console.error('[useUser] Error validating token, re-authenticating:', tokenTestError);
          const newAuth = await anonymousLogin();
          setAuthData(newAuth);
        }
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

  const setAuth = useCallback((data: AuthData) => {
    console.log('[useUser] Manually setting auth data:', data.username);
    setAuthData(data);
    setIsLoading(false);
  }, []);

  return {
    userId: authData?.userId || null,
    username: authData?.username || null,
    avatar: authData?.avatar || null,
    token: authData?.token || null,
    elo: authData?.elo || null,
    rankTier: authData?.rankTier || null,
    isAnonymous: authData?.isAnonymous ?? true,
    isLoading,
    isAuthenticated: !!authData,
    registerUsername,
    refresh,
    setAuth,
  };
}
