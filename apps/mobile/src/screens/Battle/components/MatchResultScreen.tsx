import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MatchStats } from '../../../services/websocket';

interface MatchResultScreenProps {
  isVictory: boolean;
  isAbandoned: boolean;
  playerScore: number;
  opponentScore: number;
  eloChange: number | null;
  oldRankPoints?: number;
  newRankPoints?: number;
  oldTier?: string;
  newTier?: string;
  stats: MatchStats | null;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  isVictory,
  isAbandoned,
  playerScore,
  opponentScore,
  eloChange,
  oldTier,
  newTier,
  stats,
  onPlayAgain,
  onReturnHome,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const rankChangeAnim = useRef(new Animated.Value(0)).current;

  const tierChanged = oldTier && newTier && oldTier !== newTier;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Fade in and scale up the result
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Slide up score and stats
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // 3. Animate rank change
      Animated.spring(rankChangeAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideUpAnim, rankChangeAnim]);

  const getResultEmoji = () => {
    if (isAbandoned) return '⚠️';
    return isVictory ? '🏆' : '😔';
  };

  const getResultTitle = () => {
    if (isAbandoned) return 'Match Ended';
    return isVictory ? 'Victory!' : 'Defeat';
  };

  const getResultColor = () => {
    if (isAbandoned) return '#FF9800';
    return isVictory ? '#4CAF50' : '#F44336';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Result Title with Animation */}
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{getResultEmoji()}</Text>
          <Text style={[styles.resultTitle, { color: getResultColor() }]}>
            {getResultTitle()}
          </Text>
        </Animated.View>

        {/* Score and Stats with Slide Up Animation */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Final Score */}
          {!isAbandoned && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Final Score</Text>
              <Text style={styles.scoreText}>
                {playerScore} - {opponentScore}
              </Text>
            </View>
          )}

          {isAbandoned && (
            <Text style={styles.abandonedText}>Opponent disconnected</Text>
          )}

          {/* ELO Change */}
          {eloChange !== null && !isAbandoned && (
            <Animated.View
              style={[
                styles.rankChangeContainer,
                {
                  opacity: rankChangeAnim,
                  transform: [
                    {
                      scale: rankChangeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[
                  styles.rankChangeText,
                  eloChange > 0
                    ? styles.rankChangePositive
                    : styles.rankChangeNegative,
                ]}
              >
                {eloChange > 0 ? '+' : ''}
                {eloChange} ELO
              </Text>
            </Animated.View>
          )}

          {/* Tier Change Announcement */}
          {tierChanged && (
            <Animated.View
              style={[
                styles.tierChangeContainer,
                {
                  opacity: rankChangeAnim,
                  transform: [{ scale: rankChangeAnim }],
                },
              ]}
            >
              <Text style={styles.tierChangeLabel}>New Rank Tier!</Text>
              <Text style={styles.tierChangeText}>
                {oldTier?.toUpperCase()} → {newTier?.toUpperCase()}
              </Text>
            </Animated.View>
          )}

          {/* Response Time Statistics */}
          {stats && !isAbandoned && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Your Performance</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg Response Time</Text>
                <Text style={styles.statValue}>
                  {(stats.avgResponseTime / 1000).toFixed(2)}s
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Fastest Answer</Text>
                <Text style={styles.statValue}>
                  {(stats.fastestAnswer / 1000).toFixed(2)}s
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={styles.statValue}>
                  {Math.round(stats.accuracy)}%
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.playAgainButton]}
            onPress={onPlayAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={onReturnHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#2196F3',
  },
  abandonedText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  rankChangeContainer: {
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  rankChangeText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  rankChangePositive: {
    color: '#4CAF50',
  },
  rankChangeNegative: {
    color: '#F44336',
  },
  tierChangeContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    width: '100%',
  },
  tierChangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tierChangeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '700',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  homeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
});
