import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RankTier } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';

interface RankBadgeProps {
  rankTier: RankTier;
  elo: number;
}

interface TierConfig {
  name: string;
  color: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
}

const TIER_CONFIG: Record<RankTier, TierConfig> = {
  bronze: {
    name: 'Bronze',
    color: colors.bronze,
    emoji: '🥉',
    minPoints: 0,
    maxPoints: 1199,
  },
  silver: {
    name: 'Silver',
    color: colors.silver,
    emoji: '🥈',
    minPoints: 1200,
    maxPoints: 1599,
  },
  gold: {
    name: 'Gold',
    color: colors.gold,
    emoji: '🥇',
    minPoints: 1600,
    maxPoints: 1999,
  },
  platinum: {
    name: 'Platinum',
    color: colors.platinum,
    emoji: '💎',
    minPoints: 2000,
    maxPoints: 2399,
  },
  diamond: {
    name: 'Diamond',
    color: colors.diamond,
    emoji: '👑',
    minPoints: 2400,
    maxPoints: 999999,
  },
};

export const RankBadge: React.FC<RankBadgeProps> = ({ rankTier, elo }) => {
  const config = TIER_CONFIG[rankTier];

  const calculateProgress = (): number => {
    if (rankTier === 'diamond') {
      return 1; // Diamond is max tier
    }

    const tierRange = config.maxPoints - config.minPoints;
    const pointsInTier = elo - config.minPoints;
    return Math.min(Math.max(pointsInTier / tierRange, 0), 1);
  };

  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.tierName}>{config.name}</Text>
        <Text style={styles.points}>{elo.toLocaleString()} ELO</Text>
        {rankTier !== 'diamond' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md - 4,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    ...elevation.level2,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.level2,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md - 4,
  },
  tierName: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.xs - 2,
  },
  points: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs + 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xs - 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.xs - 1,
  },
  progressText: {
    ...typography.labelSmall,
    color: colors.textMuted,
    width: 35,
    textAlign: 'right',
  },
});
