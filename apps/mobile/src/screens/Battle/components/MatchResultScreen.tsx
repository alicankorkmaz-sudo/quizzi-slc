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
import { fontSizes, fontWeights } from "../../../theme";

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
    fontSize: 72,              // Hero text
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 36,              // Between 3xl and 4xl
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  flawlessSubtitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
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
    fontSize: fontSizes.base,
    color: '#666',
    marginBottom: 6,
    fontWeight: fontWeights.semiBold,
  },
  scoreText: {
    fontSize: 52,              // Extra large display
    fontWeight: fontWeights.bold,
    color: '#2196F3',
  },
  abandonedText: {
    fontSize: fontSizes.md,
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
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.base,
    color: '#666',
    fontWeight: fontWeights.medium,
  },
  newEloValue: {
    fontSize: 20,              // Not in scale
    color: '#2196F3',
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semiBold,
    color: '#000',
    marginBottom: 6,
  },
  tierChangeText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.base,
    color: '#666',
    fontWeight: fontWeights.medium,
  },
  statValue: {
    fontSize: fontSizes.base,
    color: '#2196F3',
    fontWeight: fontWeights.bold,
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
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: '#fff',
  },
  homeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  homeButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: '#2196F3',
  },
});
