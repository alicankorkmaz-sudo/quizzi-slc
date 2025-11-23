import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RankTier } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';

interface RankDisplayProps {
  rankTier: RankTier;
  elo: number;
}

interface TierConfig {
  name: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  minPoints: number;
  maxPoints: number;
}

const TIER_CONFIG: Record<RankTier, TierConfig> = {
  bronze: {
    name: 'Bronze',
    color: colors.bronze,
    gradientStart: colors.bronze,
    gradientEnd: colors.bronze,
    minPoints: 0,
    maxPoints: 1199,
  },
  silver: {
    name: 'Silver',
    color: colors.silver,
    gradientStart: colors.silver,
    gradientEnd: colors.silver,
    minPoints: 1200,
    maxPoints: 1599,
  },
  gold: {
    name: 'Gold',
    color: colors.gold,
    gradientStart: colors.gold,
    gradientEnd: colors.gold,
    minPoints: 1600,
    maxPoints: 1999,
  },
  platinum: {
    name: 'Platinum',
    color: colors.platinum,
    gradientStart: colors.platinum,
    gradientEnd: colors.platinum,
    minPoints: 2000,
    maxPoints: 2399,
  },
  diamond: {
    name: 'Diamond',
    color: colors.diamond,
    gradientStart: colors.diamond,
    gradientEnd: colors.diamond,
    minPoints: 2400,
    maxPoints: 999999,
  },
};

export const RankDisplay: React.FC<RankDisplayProps> = ({
  rankTier,
  elo,
}) => {
  const config = TIER_CONFIG[rankTier];

  const calculateProgress = (): number => {
    if (rankTier === 'diamond') {
      return 1; // Diamond is max tier
    }

    const tierRange = config.maxPoints - config.minPoints;
    const pointsInTier = elo - config.minPoints;
    return Math.min(Math.max(pointsInTier / tierRange, 0), 1);
  };

  const getNextTierPoints = (): number | null => {
    if (rankTier === 'diamond') return null;
    return config.maxPoints + 1;
  };

  const progress = calculateProgress();
  const nextTierPoints = getNextTierPoints();

  return (
    <View style={styles.container}>
      {/* Rank Badge */}
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.badgeEmoji}>
          {rankTier === 'bronze' && '🥉'}
          {rankTier === 'silver' && '🥈'}
          {rankTier === 'gold' && '🥇'}
          {rankTier === 'platinum' && '💎'}
          {rankTier === 'diamond' && '👑'}
        </Text>
        <Text style={styles.tierName}>{config.name}</Text>
      </View>

      {/* Points Display */}
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>ELO</Text>
        <Text style={styles.pointsValue}>{elo.toLocaleString()}</Text>
      </View>

      {/* Progress Bar */}
      {nextTierPoints !== null && (
        <View style={styles.progressSection}>
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
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {config.minPoints.toLocaleString()}
            </Text>
            <Text style={styles.progressNextTier}>
              Next: {nextTierPoints.toLocaleString()}
            </Text>
            <Text style={styles.progressLabel}>
              {config.maxPoints.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Diamond Max Tier Message */}
      {rankTier === 'diamond' && (
        <View style={styles.maxTierContainer}>
          <Text style={styles.maxTierText}>Maximum Rank Achieved!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...elevation.level2,
  },
  badge: {
    alignSelf: 'center',
    borderRadius: borderRadius.round,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...elevation.level3,
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  tierName: {
    ...typography.h5,
    color: colors.textWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pointsLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  pointsValue: {
    ...typography.h3,
    color: colors.text,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressNextTier: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  maxTierContainer: {
    marginTop: spacing.md - 4,
    padding: spacing.md - 4,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  maxTierText: {
    ...typography.bodySemiBold,
    color: colors.diamond,
  },
});
