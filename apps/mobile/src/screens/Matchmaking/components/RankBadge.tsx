import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RankTier } from '../../../../../../packages/types/src';

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
    color: '#CD7F32',
    emoji: '🥉',
    minPoints: 0,
    maxPoints: 1199,
  },
  silver: {
    name: 'Silver',
    color: '#C0C0C0',
    emoji: '🥈',
    minPoints: 1200,
    maxPoints: 1599,
  },
  gold: {
    name: 'Gold',
    color: '#FFD700',
    emoji: '🥇',
    minPoints: 1600,
    maxPoints: 1999,
  },
  platinum: {
    name: 'Platinum',
    color: '#00CED1',
    emoji: '💎',
    minPoints: 2000,
    maxPoints: 2399,
  },
  diamond: {
    name: 'Diamond',
    color: '#9370DB',
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  points: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    width: 35,
    textAlign: 'right',
  },
});
