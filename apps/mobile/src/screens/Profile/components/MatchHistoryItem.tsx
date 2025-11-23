import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MatchHistory, Category } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';

interface MatchHistoryItemProps {
  match: MatchHistory;
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

export const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({
  match,
}) => {
  const categoryConfig = CATEGORY_CONFIG[match.category];
  const isWin = match.result === 'win';

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getRankChangeColor = (): string => {
    if (match.eloChange > 0) return colors.success;
    if (match.eloChange < 0) return colors.error;
    return colors.textLight;
  };

  const formatRankChange = (): string => {
    if (match.eloChange > 0) {
      return `+${match.eloChange}`;
    }
    return match.eloChange.toString();
  };

  return (
    <View style={[styles.container, isWin ? styles.winContainer : styles.lossContainer]}>
      {/* Result Badge */}
      <View style={[styles.resultBadge, isWin ? styles.winBadge : styles.lossBadge]}>
        <Text style={styles.resultText}>{isWin ? 'WIN' : 'LOSS'}</Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <View style={styles.opponentRow}>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.opponentName}>{match.opponentUsername}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
            <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.displayName}
            </Text>
          </View>
          <Text style={styles.score}>{match.playerScore} - {match.opponentScore}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.timestamp}>{formatDate(match.completedAt)}</Text>
          <View style={styles.rankChangeContainer}>
            <Text style={[styles.rankChange, { color: getRankChangeColor() }]}>
              {formatRankChange()} RP
            </Text>
          </View>
        </View>
      </View>

      {/* Win/Loss Indicator Line */}
      <View style={[styles.indicator, isWin ? styles.winIndicator : styles.lossIndicator]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md - 4,
    flexDirection: 'row',
    alignItems: 'center',
    ...elevation.level1,
    position: 'relative',
    overflow: 'hidden',
  },
  winContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  lossContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  resultBadge: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  winBadge: {
    backgroundColor: colors.successLight + '30',
  },
  lossBadge: {
    backgroundColor: colors.errorLight + '30',
  },
  resultText: {
    ...typography.labelSmall,
  },
  matchInfo: {
    flex: 1,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  vsText: {
    ...typography.caption,
    color: colors.textMuted,
    marginRight: spacing.xs + 2,
  },
  opponentName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  score: {
    ...typography.h6,
    color: colors.text,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rankChangeContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
  },
  rankChange: {
    ...typography.labelSmall,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  winIndicator: {
    backgroundColor: colors.success,
  },
  lossIndicator: {
    backgroundColor: colors.error,
  },
});
