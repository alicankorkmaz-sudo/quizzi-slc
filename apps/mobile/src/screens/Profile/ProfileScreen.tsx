import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import type { User, CategoryStats, MatchHistory } from '@quizzi/types';
import { RankDisplay } from './components/RankDisplay';
import { StatsCard } from './components/StatsCard';
import { CategoryStats as CategoryStatsComponent } from './components/CategoryStats';
import { MatchHistoryItem } from './components/MatchHistoryItem';

interface ProfileScreenProps {
  user: User;
  categoryStats: CategoryStats[];
  matchHistory: MatchHistory[];
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  categoryStats,
  matchHistory,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            {user.premiumStatus && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{user.username}</Text>
        </View>

        {/* Rank Display */}
        <RankDisplay
          rankTier={user.rankTier}
          rankPoints={user.rankPoints}
        />

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <StatsCard
            winRate={user.winRate}
            currentStreak={user.currentStreak}
            matchesPlayed={user.matchesPlayed}
            avgResponseTime={user.avgResponseTime}
          />
        </View>

        {/* Category Stats */}
        {categoryStats.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Category Performance</Text>
            <CategoryStatsComponent categoryStats={categoryStats} />
          </View>
        )}

        {/* Match History */}
        {matchHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            {matchHistory.map((match) => (
              <MatchHistoryItem key={match.matchId} match={match} />
            ))}
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
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  historySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
});
