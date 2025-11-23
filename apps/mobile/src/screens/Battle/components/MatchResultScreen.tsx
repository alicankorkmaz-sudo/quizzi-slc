import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MatchStats } from '../../../services/websocket';
import { getVictoryMessage } from '../utils/victoryMessages';
import { detectMomentum } from '../utils/momentumDetector';
import { ConfettiRain } from '../../../components/ConfettiRain';
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  pressStates,
  focusStates,
  typography,
  createPressAnimation,
} from '../../../theme';

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

  // Focus states
  const [playAgainFocused, setPlayAgainFocused] = useState(false);
  const [homeFocused, setHomeFocused] = useState(false);

  // Press animations
  const playAgainScale = useRef(new Animated.Value(1)).current;
  const homeScale = useRef(new Animated.Value(1)).current;
  const playAgainPress = createPressAnimation(playAgainScale);
  const homePress = createPressAnimation(homeScale);

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
          {/* Play Again Button */}
          <Animated.View style={{ transform: [{ scale: playAgainScale }] }}>
            <Pressable
              onPress={onPlayAgain}
              onPressIn={playAgainPress.pressIn}
              onPressOut={playAgainPress.pressOut}
              onFocus={() => setPlayAgainFocused(true)}
              onBlur={() => setPlayAgainFocused(false)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Play another match"
              style={({ pressed }) => [
                styles.button,
                styles.playAgainButton,
                pressed ? pressStates.success.pressed : pressStates.success.rest,
                playAgainFocused && focusStates.success,
              ]}
            >
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </Pressable>
          </Animated.View>

          {/* Return Home Button */}
          <Animated.View style={{ transform: [{ scale: homeScale }] }}>
            <Pressable
              onPress={onReturnHome}
              onPressIn={homePress.pressIn}
              onPressOut={homePress.pressOut}
              onFocus={() => setHomeFocused(true)}
              onBlur={() => setHomeFocused(false)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Return to home screen"
              style={({ pressed }) => [
                styles.button,
                styles.homeButton,
                pressed && elevation.level1,
                pressed && styles.homeButtonPressed,
                homeFocused && focusStates.primary,
              ]}
            >
              <Text style={styles.homeButtonText}>Return to Home</Text>
            </Pressable>
          </Animated.View>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md - 4,
  },
  resultTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  flawlessSubtitle: {
    ...typography.body,
    color: colors.gold,
    marginTop: spacing.sm + 2,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg - 4,
  },
  scoreLabel: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.xs + 2,
  },
  scoreText: {
    ...typography.comboMultiplier,
    color: colors.primary,
  },
  abandonedText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xl - 4,
    textAlign: 'center',
  },
  rankChangeContainer: {
    marginBottom: spacing.lg - 4,
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    ...elevation.level1,
  },
  rankChangeText: {
    ...typography.h5,
    textAlign: 'center',
  },
  rankChangePositive: {
    color: colors.success,
  },
  rankChangeNegative: {
    color: colors.error,
  },
  newEloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg - 4,
    gap: spacing.sm,
  },
  newEloLabel: {
    ...typography.bodyMedium,
    color: colors.textLight,
  },
  newEloValue: {
    ...typography.h5,
    color: colors.primary,
  },
  tierChangeContainer: {
    marginBottom: spacing.lg - 4,
    padding: spacing.md,
    borderRadius: borderRadius.lg - 2,
    backgroundColor: colors.gold,
    alignItems: 'center',
    width: '100%',
    ...elevation.level2,
  },
  tierChangeLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  tierChangeText: {
    ...typography.h4,
    color: colors.text,
  },
  statsContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg - 2,
    padding: spacing.md,
    marginBottom: spacing.xl - 4,
    width: '100%',
    ...elevation.level1,
  },
  statsTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.md - 2,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  statLabel: {
    ...typography.bodyMedium,
    color: colors.textLight,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.primary,
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.md - 4,
  },
  button: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xl - 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  playAgainButton: {
    // Styles from pressStates.success applied dynamically
  },
  playAgainButtonText: {
    ...typography.buttonPrimary,
    color: colors.textWhite,
  },
  homeButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  homeButtonPressed: {
    backgroundColor: colors.primaryLight,
    opacity: 0.1,
  },
  homeButtonText: {
    ...typography.buttonPrimary,
    color: colors.primary,
  },
});
