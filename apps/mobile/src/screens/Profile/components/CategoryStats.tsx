import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CategoryStats as CategoryStatsType, Category } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';

interface CategoryStatsProps {
  categoryStats: CategoryStatsType[];
}

interface CategoryConfig {
  icon: string;
  displayName: string;
  color: string;
}

const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  general_knowledge: {
    icon: '🧠',
    displayName: 'General Knowledge',
    color: colors.generalKnowledge,
  },
  geography: {
    icon: '🌍',
    displayName: 'Geography',
    color: colors.geography,
  },
  science: {
    icon: '🔬',
    displayName: 'Science',
    color: colors.science,
  },
  pop_culture: {
    icon: '🎬',
    displayName: 'Pop Culture',
    color: colors.popCulture,
  },
  sports: {
    icon: '⚽',
    displayName: 'Sports',
    color: colors.sports,
  },
};

interface CategoryBarProps {
  categoryStats: CategoryStatsType;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ categoryStats }) => {
  const config = CATEGORY_CONFIG[categoryStats.category as Category];
  const winRatePercentage = categoryStats.winRate * 100;

  const getPerformanceLevel = (): string => {
    if (winRatePercentage >= 70) return 'Excellent';
    if (winRatePercentage >= 60) return 'Great';
    if (winRatePercentage >= 50) return 'Good';
    if (winRatePercentage >= 40) return 'Fair';
    return 'Practice More';
  };

  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryIcon}>{config.icon}</Text>
          <View style={styles.categoryText}>
            <Text style={styles.categoryName}>{config.displayName}</Text>
            <Text style={styles.categoryMatches}>
              {categoryStats.matchesPlayed} matches
            </Text>
          </View>
        </View>
        <View style={styles.categoryStats}>
          <Text style={[styles.winRate, { color: config.color }]}>
            {winRatePercentage.toFixed(0)}%
          </Text>
          <Text style={styles.performanceLevel}>{getPerformanceLevel()}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${winRatePercentage}%`,
              backgroundColor: config.color,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  categoryStats,
}) => {
  // Sort by win rate descending
  const sortedStats = [...categoryStats].sort(
    (a, b) => b.winRate - a.winRate
  );

  return (
    <View style={styles.container}>
      {sortedStats.map((stats) => (
        <CategoryBar key={stats.category} categoryStats={stats} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...elevation.level2,
  },
  categoryItem: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md - 4,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginBottom: spacing.xs - 2,
  },
  categoryMatches: {
    ...typography.caption,
    color: colors.textMuted,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  winRate: {
    ...typography.h5,
    marginBottom: spacing.xs - 2,
  },
  performanceLevel: {
    ...typography.hint,
    color: colors.textMuted,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.xs,
  },
});
