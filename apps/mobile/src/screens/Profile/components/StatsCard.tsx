import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';

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

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color = colors.primary }) => (
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
    if (winRate >= 0.6) return colors.success; // Excellent (green)
    if (winRate >= 0.5) return colors.warning; // Good (orange)
    return colors.error; // Needs improvement (red)
  };

  const getStreakColor = (): string => {
    if (currentStreak >= 5) return colors.success; // Hot streak
    if (currentStreak >= 3) return colors.warning; // Good streak
    return colors.textLight; // Normal
  };

  const getResponseTimeColor = (): string => {
    if (avgResponseTime <= 2000) return colors.success; // Very fast
    if (avgResponseTime <= 4000) return colors.warning; // Good
    return colors.error; // Slow
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
          color={colors.primary}
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg - 4,
    ...elevation.level2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textLight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    ...typography.h5,
  },
});
