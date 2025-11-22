import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RankTier } from '../../../../../../packages/types/src';
import { typography, fontSizes, fontWeights } from "../../../theme";

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
    color: '#CD7F32',
    gradientStart: '#CD7F32',
    gradientEnd: '#8B4513',
    minPoints: 0,
    maxPoints: 1199,
  },
  silver: {
    name: 'Silver',
    color: '#C0C0C0',
    gradientStart: '#E8E8E8',
    gradientEnd: '#A9A9A9',
    minPoints: 1200,
    maxPoints: 1599,
  },
  gold: {
    name: 'Gold',
    color: '#FFD700',
    gradientStart: '#FFD700',
    gradientEnd: '#FFA500',
    minPoints: 1600,
    maxPoints: 1999,
  },
  platinum: {
    name: 'Platinum',
    color: '#00CED1',
    gradientStart: '#00CED1',
    gradientEnd: '#20B2AA',
    minPoints: 2000,
    maxPoints: 2399,
  },
  diamond: {
    name: 'Diamond',
    color: '#9370DB',
    gradientStart: '#9370DB',
    gradientEnd: '#8A2BE2',
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    alignSelf: 'center',
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeEmoji: {
    fontSize: fontSizes['4xl'],
    marginBottom: 4,
  },
  tierName: {
    fontSize: 20,              // Not in scale
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: fontSizes.sm,
    color: '#666666',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: '#333333',
  },
  progressSection: {
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: '#999999',
  },
  progressNextTier: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
    color: '#6C63FF',
  },
  maxTierContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0E6FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  maxTierText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: '#9370DB',
  },
});
