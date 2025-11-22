import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MatchStats } from '../../../services/websocket';
import { getVictoryMessage } from '../utils/victoryMessages';
import { detectMomentum } from '../utils/momentumDetector';
import { ConfettiRain } from '../../../components/ConfettiRain';

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
  winningTime?: number; // Final round winning time in ms (only for victories)
  consecutiveWins: number; // Consecutive rounds won in this match
  isMatchPoint: boolean; // Whether this was a match point round
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  isVictory,
  isAbandoned,
  playerScore,
  opponentScore,
  eloChange,
  newRankPoints,
  oldTier,
  newTier,
  stats,
  winningTime,
  consecutiveWins,
  isMatchPoint,
  onPlayAgain,
  onReturnHome,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const rankChangeAnim = useRef(new Animated.Value(0)).current;

  const tierChanged = oldTier && newTier && oldTier !== newTier;

  useEffect(() => {
    // Start confetti on victory
    if (isVictory && !isAbandoned) {
      setShowConfetti(true);
    }

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

  // Detect flawless victory (priority over normal victory message)
  const isFlawlessVictory = isVictory && opponentScore === 0;
  const flawlessMomentum = isFlawlessVictory
    ? detectMomentum({
        playerScore,
        opponentScore,
        consecutivePlayerWins: consecutiveWins,
        wasBehind: false, // Can't be behind in flawless
        isPlayerWinner: true,
        matchEnded: true,
      })
    : null;

  // Get context-aware victory message
  const victoryMessage = isVictory && !isFlawlessVictory
    ? getVictoryMessage(winningTime, consecutiveWins, isMatchPoint)
    : null;

  const getResultEmoji = () => {
    if (isAbandoned) return '⚠️';
    if (flawlessMomentum) return flawlessMomentum.emoji;
    if (isVictory && victoryMessage) return victoryMessage.emoji;
    return isVictory ? '🏆' : '😔';
  };

  const getResultTitle = () => {
    if (isAbandoned) return 'Match Ended';
    if (flawlessMomentum) return flawlessMomentum.title;
    if (isVictory && victoryMessage) return victoryMessage.title;
    return isVictory ? 'Victory!' : 'Defeat';
  };

  const getResultColor = () => {
    if (isAbandoned) return '#FF9800';
    if (flawlessMomentum) return flawlessMomentum.color;
    if (isVictory && victoryMessage) return victoryMessage.color;
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
          {flawlessMomentum && (
            <Text style={styles.flawlessSubtitle}>Perfect performance!</Text>
          )}
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

          {/* New ELO Display */}
          {newRankPoints !== undefined && !isAbandoned && (
            <Animated.View
              style={[
                styles.newEloContainer,
                {
                  opacity: rankChangeAnim,
                },
              ]}
            >
              <Text style={styles.newEloLabel}>New ELO</Text>
              <Text style={styles.newEloValue}>{newRankPoints}</Text>
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

      {/* Confetti rain on victory */}
      <ConfettiRain
        active={showConfetti}
        particleCount={60}
        duration={4000}
        colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B801', '#6C5CE7', '#2196F3']}
      />
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
    marginBottom: 24,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  flawlessSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 10,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 52,
    fontWeight: '700',
    color: '#2196F3',
  },
  abandonedText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
  },
  rankChangeContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  rankChangeText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  rankChangePositive: {
    color: '#4CAF50',
  },
  rankChangeNegative: {
    color: '#F44336',
  },
  newEloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  newEloLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  newEloValue: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: '700',
  },
  tierChangeContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    width: '100%',
  },
  tierChangeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  tierChangeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    width: '100%',
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '700',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  playAgainButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  homeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  homeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2196F3',
  },
});
