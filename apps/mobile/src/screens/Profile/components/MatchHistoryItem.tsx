import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MatchHistory, Category } from '../../../../../../packages/types/src';

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
    color: '#6C63FF',
  },
  geography: {
    icon: '🌍',
    displayName: 'Geography',
    color: '#00BCD4',
  },
  science: {
    icon: '🔬',
    displayName: 'Science',
    color: '#4CAF50',
  },
  pop_culture: {
    icon: '🎬',
    displayName: 'Pop Culture',
    color: '#FF9800',
  },
  sports: {
    icon: '⚽',
    displayName: 'Sports',
    color: '#F44336',
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
    if (match.eloChange > 0) return '#00C853';
    if (match.eloChange < 0) return '#D32F2F';
    return '#666666';
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  winContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#00C853',
  },
  lossContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  resultBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  winBadge: {
    backgroundColor: '#E8F5E9',
  },
  lossBadge: {
    backgroundColor: '#FFEBEE',
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchInfo: {
    flex: 1,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vsText: {
    fontSize: 12,
    color: '#999999',
    marginRight: 6,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
  },
  rankChangeContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rankChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  winIndicator: {
    backgroundColor: '#00C853',
  },
  lossIndicator: {
    backgroundColor: '#D32F2F',
  },
});
