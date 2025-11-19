import { API_URL } from '../config';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  elo: number;
  rankTier: string;
  matchesPlayed: number;
  winRate: number;
}

export interface LeaderboardResponse {
  topPlayers: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  totalPlayers: number;
}

class LeaderboardService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async getLeaderboard(): Promise<LeaderboardResponse> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_URL}/api/leaderboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  }
}

export const leaderboardService = new LeaderboardService();
