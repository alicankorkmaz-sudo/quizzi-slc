import type { User, CategoryStats, MatchHistory } from '@quizzi/types';

/**
 * Mock user data for testing the Profile Screen
 * Represents a mid-level player with good stats
 */
export const mockUser: User = {
  id: 'user-123',
  username: 'QuizMaster99',
  avatar: 'default_1',
  rankPoints: 1750,
  rankTier: 'gold',
  winRate: 0.64,
  currentStreak: 7,
  matchesPlayed: 142,
  avgResponseTime: 2350, // 2.35 seconds
  premiumStatus: true,
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date(),
};

/**
 * Mock category statistics showing performance across all 5 categories
 */
export const mockCategoryStats: CategoryStats[] = [
  {
    category: 'general_knowledge',
    winRate: 0.72,
    matchesPlayed: 45,
  },
  {
    category: 'geography',
    winRate: 0.58,
    matchesPlayed: 32,
  },
  {
    category: 'science',
    winRate: 0.67,
    matchesPlayed: 28,
  },
  {
    category: 'pop_culture',
    winRate: 0.61,
    matchesPlayed: 22,
  },
  {
    category: 'sports',
    winRate: 0.55,
    matchesPlayed: 15,
  },
];

/**
 * Mock match history showing the last 10 matches
 * Mix of wins and losses with varying rank point changes
 */
export const mockMatchHistory: MatchHistory[] = [
  {
    matchId: 'match-10',
    opponentId: 'user-456',
    opponentUsername: 'SpeedyGonzales',
    category: 'science',
    result: 'win',
    score: '3-2',
    rankPointsChange: 24,
    completedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    matchId: 'match-9',
    opponentId: 'user-789',
    opponentUsername: 'BrainiacKing',
    category: 'general_knowledge',
    result: 'win',
    score: '3-1',
    rankPointsChange: 28,
    completedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    matchId: 'match-8',
    opponentId: 'user-234',
    opponentUsername: 'GeoWhiz',
    category: 'geography',
    result: 'win',
    score: '3-0',
    rankPointsChange: 32,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    matchId: 'match-7',
    opponentId: 'user-567',
    opponentUsername: 'PopCulturePro',
    category: 'pop_culture',
    result: 'loss',
    score: '1-3',
    rankPointsChange: -18,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    matchId: 'match-6',
    opponentId: 'user-890',
    opponentUsername: 'SportsNerd',
    category: 'sports',
    result: 'win',
    score: '3-2',
    rankPointsChange: 22,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    matchId: 'match-5',
    opponentId: 'user-345',
    opponentUsername: 'QuizNinja',
    category: 'general_knowledge',
    result: 'win',
    score: '3-1',
    rankPointsChange: 26,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    matchId: 'match-4',
    opponentId: 'user-678',
    opponentUsername: 'ScienceWiz',
    category: 'science',
    result: 'win',
    score: '3-0',
    rankPointsChange: 30,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    matchId: 'match-3',
    opponentId: 'user-901',
    opponentUsername: 'ThinkFast',
    category: 'pop_culture',
    result: 'loss',
    score: '2-3',
    rankPointsChange: -16,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    matchId: 'match-2',
    opponentId: 'user-123',
    opponentUsername: 'MapMaster',
    category: 'geography',
    result: 'win',
    score: '3-1',
    rankPointsChange: 25,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
  },
  {
    matchId: 'match-1',
    opponentId: 'user-456',
    opponentUsername: 'KnowledgeKing',
    category: 'general_knowledge',
    result: 'loss',
    score: '0-3',
    rankPointsChange: -20,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
];

/**
 * Alternative mock user for testing lower rank tiers
 */
export const mockBronzeUser: User = {
  id: 'user-bronze',
  username: 'Newbie123',
  avatar: 'default_2',
  rankPoints: 450,
  rankTier: 'bronze',
  winRate: 0.42,
  currentStreak: 2,
  matchesPlayed: 25,
  avgResponseTime: 4200,
  premiumStatus: false,
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date(),
};

/**
 * Alternative mock user for testing max tier
 */
export const mockDiamondUser: User = {
  id: 'user-diamond',
  username: 'LegendPlayer',
  avatar: 'premium_5',
  rankPoints: 2850,
  rankTier: 'diamond',
  winRate: 0.78,
  currentStreak: 15,
  matchesPlayed: 500,
  avgResponseTime: 1650,
  premiumStatus: true,
  createdAt: new Date('2024-08-15'),
  updatedAt: new Date(),
};
