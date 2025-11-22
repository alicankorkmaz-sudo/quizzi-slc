import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from "../../../theme";

interface StatsCardProps {
  winRate: number;
  currentStreak: number;
  matchesPlayed: number;
  avgResponseTime: number;
}

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color = '#6C63FF' }) => (
  <View style={styles.statItem}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export const StatsCard: React.FC<StatsCardProps> = ({
  winRate,
  currentStreak,
  matchesPlayed,
  avgResponseTime,
}) => {
  const formatWinRate = (): string => {
    return `${(winRate * 100).toFixed(1)}%`;
  };

  const formatResponseTime = (): string => {
    if (avgResponseTime < 1000) {
      return `${avgResponseTime}ms`;
    }
    return `${(avgResponseTime / 1000).toFixed(2)}s`;
  };

  const getWinRateColor = (): string => {
    if (winRate >= 0.6) return '#00C853'; // Excellent (green)
    if (winRate >= 0.5) return '#FFB300'; // Good (orange)
    return '#D32F2F'; // Needs improvement (red)
  };

  const getStreakColor = (): string => {
    if (currentStreak >= 5) return '#00C853'; // Hot streak
    if (currentStreak >= 3) return '#FFB300'; // Good streak
    return '#666666'; // Normal
  };

  const getResponseTimeColor = (): string => {
    if (avgResponseTime <= 2000) return '#00C853'; // Very fast
    if (avgResponseTime <= 4000) return '#FFB300'; // Good
    return '#D32F2F'; // Slow
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <StatItem
          icon="🏆"
          label="Win Rate"
          value={formatWinRate()}
          color={getWinRateColor()}
        />
        <StatItem
          icon="🔥"
          label="Current Streak"
          value={currentStreak.toString()}
          color={getStreakColor()}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.grid}>
        <StatItem
          icon="🎮"
          label="Matches Played"
          value={matchesPlayed.toString()}
          color="#6C63FF"
        />
        <StatItem
          icon="⚡"
          label="Avg Response"
          value={formatResponseTime()}
          color={getResponseTimeColor()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    ...typography.labelSmall,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    ...typography.h5,
  },
});
