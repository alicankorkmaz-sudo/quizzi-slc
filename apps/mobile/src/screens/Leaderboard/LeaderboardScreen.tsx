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
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingVertical: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  youBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366F1',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierEmoji: {
    fontSize: 14,
  },
  eloText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  currentUserSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 16,
  },
});
