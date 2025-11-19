import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import type {
  UserStatistics,
  CategoryStats,
  MatchHistory,
} from '@quizzi/types';

const AUTH_STORAGE_KEY = '@quizzi/auth';
import { API_URL } from '../../config';

interface StatisticsScreenProps {
  onRefresh?: () => void;
  autoRefreshOnMatchEnd?: boolean;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  onRefresh,
  autoRefreshOnMatchEnd = true,
}) => {
  const { subscribe } = useWebSocketContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryStats[]
  >([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchStatisticsRef = useRef<() => Promise<void>>();

  const fetchStatistics = async () => {
    try {
      // Get auth token from storage
      const authDataStr = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!authDataStr) {
        setError('Not logged in');
        setLoading(false);
        return;
      }

      const authData = JSON.parse(authDataStr);
      const authToken = authData.token;

      if (!authToken) {
        setError('No auth token found');
        setLoading(false);
        return;
      }

      setError(null);

      // Fetch user statistics
      const statsResponse = await fetch(`${API_URL}/api/statistics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch category performance
      const categoryResponse = await fetch(
        `${API_URL}/api/statistics/category`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        if (categoryData.success) {
          setCategoryPerformance(categoryData.data);
        }
      }

      // Fetch match history
      const historyResponse = await fetch(
        `${API_URL}/api/statistics/history?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setMatchHistory(historyData.data);
        }
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load statistics'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Store fetchStatistics in ref so we can use it in event handler
  useEffect(() => {
    fetchStatisticsRef.current = fetchStatistics;
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Auto-refresh statistics after match ends
  useEffect(() => {
    if (!autoRefreshOnMatchEnd) return;

    const unsubscribe = subscribe('match_end', () => {
      console.log('Match ended, auto-refreshing statistics...');
      // Wait a brief moment for database updates to complete
      setTimeout(() => {
        fetchStatisticsRef.current?.();
      }, 500);
    });

    return unsubscribe;
  }, [subscribe, autoRefreshOnMatchEnd]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
    onRefresh?.();
  };

  const formatResponseTime = (ms: number): string => {
    if (ms === 0) return 'N/A';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCategory = (category: string): string => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const matchDate = new Date(date);
    const diffMs = now.getTime() - matchDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return matchDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6C63FF"
          />
        }
      >
        {/* Overall Statistics */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(stats.winRate * 100).toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {formatResponseTime(stats.avgResponseTime)}
                </Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.matchesPlayed}</Text>
                <Text style={styles.statLabel}>Matches Played</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.matchesWon}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Performance</Text>

            {categoryPerformance.map((cat) => (
              <View key={cat.category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>
                    {formatCategory(cat.category)}
                  </Text>
                  <Text style={styles.categoryWinRate}>
                    {(cat.winRate * 100).toFixed(0)}% Win Rate
                  </Text>
                </View>

                <View style={styles.categoryStats}>
                  <Text style={styles.categoryStatText}>
                    {cat.matchesPlayed} matches
                  </Text>
                  {cat.avgResponseTime && cat.avgResponseTime > 0 && (
                    <Text style={styles.categoryStatText}>
                      {formatResponseTime(cat.avgResponseTime)} avg
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Match History */}
        {matchHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last 10 Matches</Text>

            {matchHistory.map((match) => (
              <View key={match.matchId} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <Text
                    style={[
                      styles.matchResult,
                      match.result === 'win'
                        ? styles.matchWin
                        : styles.matchLoss,
                    ]}
                  >
                    {match.result === 'win' ? 'WIN' : 'LOSS'}
                  </Text>
                  <Text style={styles.matchScore}>
                    {match.playerScore} - {match.opponentScore}
                  </Text>
                  <Text style={styles.matchDate}>
                    {formatDate(match.completedAt)}
                  </Text>
                </View>

                <Text style={styles.matchOpponent}>
                  vs {match.opponentUsername}
                </Text>

                <View style={styles.matchDetails}>
                  <Text style={styles.matchCategory}>
                    {formatCategory(match.category)}
                  </Text>
                  <Text style={styles.matchStat}>
                    {match.accuracy}% accuracy
                  </Text>
                  <Text style={styles.matchStat}>
                    {formatResponseTime(match.avgResponseTime)} avg
                  </Text>
                  <Text
                    style={[
                      styles.matchRankChange,
                      match.eloChange >= 0
                        ? styles.rankPositive
                        : styles.rankNegative,
                    ]}
                  >
                    {match.eloChange >= 0 ? '+' : ''}
                    {match.eloChange} ELO
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Data Message */}
        {!stats && categoryPerformance.length === 0 && matchHistory.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No statistics available yet.</Text>
            <Text style={styles.emptySubtext}>
              Play some matches to see your stats!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryWinRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryStatText: {
    fontSize: 14,
    color: '#666',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchResult: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchWin: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  matchLoss: {
    color: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  matchDate: {
    fontSize: 12,
    color: '#999',
  },
  matchOpponent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  matchDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  matchCategory: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  matchStat: {
    fontSize: 14,
    color: '#666',
  },
  matchRankChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankPositive: {
    color: '#4CAF50',
  },
  rankNegative: {
    color: '#F44336',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
