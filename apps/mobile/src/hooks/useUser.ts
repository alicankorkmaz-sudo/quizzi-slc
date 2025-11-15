/**
 * Hook for accessing user data
 */

import { useState, useEffect } from 'react';
import { getUserId, getUsername } from '../services/user';

export interface UserData {
  userId: string | null;
  username: string | null;
  isLoading: boolean;
}

/**
 * Hook to get user ID and username
 */
export function useUser(): UserData {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true);
        const [id, name] = await Promise.all([getUserId(), getUsername()]);
        setUserId(id);
        setUsername(name);
      } catch (error) {
        console.error('[useUser] Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  return { userId, username, isLoading };
}
