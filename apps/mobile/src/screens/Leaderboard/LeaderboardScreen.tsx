import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {
  leaderboardService,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from '../../services/leaderboard-service';
import { typography } from "../../theme";

interface LeaderboardScreenProps {
  token: string;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaderboardService.setToken(token);
    loadLeaderboard();
  }, [token]);

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const result = await leaderboardService.getLeaderboard();
      setData(result);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#6366F1'; // Default purple
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#00CED1';
      case 'diamond':
        return '#9370DB';
      default:
        return '#666666';
    }
  };

  const getTierEmoji = (tier: string): string => {
    switch (tier) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      case 'diamond':
        return '👑';
      default:
        return '🏅';
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === data?.currentUser?.userId;
    const rankColor = getRankColor(item.rank);
    const tierColor = getTierColor(item.rankTier);

    return (
      <View style={[styles.itemContainer, isCurrentUser && styles.currentUserItem]}>
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          <Text style={styles.rankText}>#{item.rank}</Text>
        </View>

        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {item.username}
            </Text>
            {isCurrentUser && <Text style={styles.youBadge}>YOU</Text>}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.tierEmoji]}>{getTierEmoji(item.rankTier)}</Text>
              <Text style={[styles.eloText, { color: tierColor }]}>
                {item.elo.toLocaleString()} ELO
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Win Rate:</Text>
              <Text style={styles.statValue}>
                {(item.winRate * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Games:</Text>
              <Text style={styles.statValue}>{item.matchesPlayed}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentUserPosition = () => {
    if (!data?.currentUser) return null;

    // Check if current user is already in top 50
    const isInTop50 = data.topPlayers.some(p => p.userId === data.currentUser?.userId);
    if (isInTop50) return null;

    return (
      <View style={styles.currentUserSection}>
        <Text style={styles.sectionTitle}>Your Position</Text>
        {renderLeaderboardItem({ item: data.currentUser, index: data.currentUser.rank - 1 })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load leaderboard'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Global Leaderboard</Text>
        <Text style={styles.subtitle}>Top {data.topPlayers.length} of {data.totalPlayers.toLocaleString()} Players</Text>
      </View>

      <FlatList
        data={data.topPlayers}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderCurrentUserPosition}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    ...typography.body,
    color: '#666666',
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
  title: {
    ...typography.h3,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: '#6B7280',
  },
  rankText: {
    ...typography.bodySemiBold,
    color: '#FFFFFF',
  },
  username: {
    ...typography.bodyLarge,
    color: '#111827',
    flex: 1,
  },
  youBadge: {
    ...typography.badge,
    color: '#6366F1',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  eloText: {
    ...typography.bodySemiBold,
  },
  statLabel: {
    ...typography.caption,
    color: '#6B7280',
  },
  statValue: {
    ...typography.captionMedium,
    color: '#111827',
  },
  sectionTitle: {
    ...typography.h6,
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tierEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  currentUserSection: {
    marginTop: 24,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listContent: {
    paddingVertical: 16,
  },
});
