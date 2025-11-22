import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category } from '../../../../../packages/types/src';
import { useBattleState } from '../../hooks/useBattleState';
import { useUser } from '../../hooks/useUser';
import {
  QuestionDisplay,
  AnswerButton,
  Timer,
  ScoreBoard,
  RoundTransition,
  MatchResultScreen,
} from './components';
import { MomentumOverlay } from './components/MomentumOverlay';
import { detectMomentum } from './utils/momentumDetector';
import { useAudio } from '../../hooks/useAudio';
import { SoundType, BGMType } from '../../types/audio';
import { useScreenShake } from '../../hooks/useScreenShake';
import { ErrorFlash } from '../../components/ErrorFlash';
import { fontSizes, fontWeights } from "../../theme";

type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentAvatar?: string;
    opponentRankPoints: number;
    category: Category;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

export const BattleScreen: React.FC<Props> = ({ navigation, route }) => {
  // User data
  const { userId, username, avatar, isLoading: isLoadingUser, refresh: refreshUser } = useUser();

  // Audio feedback
  const { playSound, playBGM, stopBGM, setBGMRate } = useAudio();

  // Screen shake and visual effects
  const { shakeAnim, shake } = useScreenShake();
  const [showErrorFlash, setShowErrorFlash] = useState(false);

  // Get match info from route params
  const { matchId, opponentUsername, opponentAvatar, opponentRankPoints, category } = route.params;

  const { state, actions } = useBattleState(userId, userId || '', {
    matchId,
    opponentUsername,
    opponentAvatar,
    opponentRankPoints,
    category,
  });
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [transitionType, setTransitionType] = useState<'countdown' | 'correct' | 'incorrect' | 'timeout'>('countdown');
  const [transitionMessage, setTransitionMessage] = useState('');

  // Momentum overlay state
  const [momentumVisible, setMomentumVisible] = useState(false);
  const [momentumConfig, setMomentumConfig] = useState<ReturnType<typeof detectMomentum>>(null);

  // Track opponent score for shake effect
  const prevOpponentScoreRef = useRef(state.opponentScore);

  // Handle round end transitions
  useEffect(() => {
    if (state.roundState === 'ended') {
      if (state.isCorrect === true) {
        showTransition('correct', 'Correct!');
        playSound(SoundType.ANSWER_CORRECT);
      } else if (state.isCorrect === false) {
        // Wrong answer - screen shake + red flash
        showTransition('incorrect', 'Wrong!');
        playSound(SoundType.ANSWER_WRONG);
        shake({ intensity: 'heavy', duration: 500 });
        setShowErrorFlash(true);
      } else {
        // Player didn't answer - check if opponent won
        if (state.roundWinner && state.roundWinner !== userId) {
          showTransition('incorrect', 'Too Slow!');
          playSound(SoundType.ANSWER_WRONG);
          // Light shake for timeout (less jarring than wrong answer)
          shake({ intensity: 'medium', duration: 400 });
          setShowErrorFlash(true);
        } else {
          showTransition('timeout', "Time's Up!");
        }
      }

      // Hide transition after 1.2 seconds
      const timeout = setTimeout(() => {
        setTransitionVisible(false);
      }, 1200);

      return () => clearTimeout(timeout);
    } else {
      // Hide transition when round state changes from 'ended' to anything else
      setTransitionVisible(false);
    }
    return undefined;
  }, [state.roundState, state.isCorrect, state.roundWinner, userId, playSound]);

  // Handle momentum indicators (shown after round transition)
  useEffect(() => {
    if (state.roundState === 'ended') {
      // Detect momentum after a delay (let round transition complete first)
      const momentumTimeout = setTimeout(() => {
        const isPlayerWinner = state.roundWinner === userId;
        const momentum = detectMomentum({
          playerScore: state.playerScore,
          opponentScore: state.opponentScore,
          consecutivePlayerWins: state.consecutivePlayerWins,
          wasBehind: state.wasBehind,
          isPlayerWinner,
          matchEnded: false, // Don't show flawless during rounds
        });

        if (momentum) {
          setMomentumConfig(momentum);
          setMomentumVisible(true);

          // Hide momentum after 2 seconds
          setTimeout(() => {
            setMomentumVisible(false);
          }, 2000);
        }
      }, 1200); // Show after round transition completes

      return () => clearTimeout(momentumTimeout);
    }
    return undefined;
  }, [state.roundState, state.playerScore, state.opponentScore, state.consecutivePlayerWins, state.wasBehind, state.roundWinner, userId]);

  // Handle match starting countdown
  useEffect(() => {
    if (state.matchStatus === 'countdown' && state.countdown !== null) {
      showTransition('countdown', `${state.countdown}`);

      const timeout = setTimeout(() => {
        setTransitionVisible(false);
      }, 800);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state.matchStatus, state.countdown]);

  // Handle round starting - Clear any transitions when round becomes active
  useEffect(() => {
    if (state.roundState === 'active') {
      setTransitionVisible(false);
    }
  }, [state.roundState]);

  // Track if BGM has been started
  const bgmStartedRef = useRef(false);

  // Start BGM when match starts (countdown or active)
  useEffect(() => {
    // Start BGM on countdown (if server sends it) or when match becomes active
    if ((state.matchStatus === 'countdown' || state.matchStatus === 'active') && !bgmStartedRef.current) {
      playBGM({ type: BGMType.BATTLE, fadeInDuration: 1500 });
      bgmStartedRef.current = true;
    }
  }, [state.matchStatus, playBGM]);

  // Stop BGM with fade-out when match ends
  useEffect(() => {
    if (state.matchStatus === 'ended') {
      stopBGM({ fadeOutDuration: 2000 });
      bgmStartedRef.current = false; // Reset for next match
    }
  }, [state.matchStatus, stopBGM]);

  // Handle BGM tempo increase during critical moments (last 10s)
  const handleTimerUpdate = useCallback((timeLeft: number) => {
    if (timeLeft <= 10 && timeLeft > 0) {
      // Gradually increase tempo from 1.0 to 1.15 as time decreases
      // When timeLeft = 10, rate = 1.0
      // When timeLeft = 1, rate = 1.15
      const rate = 1.0 + (10 - timeLeft) * 0.015;
      setBGMRate(rate);
    } else if (timeLeft > 10) {
      // Reset to normal tempo
      setBGMRate(1.0);
    }
  }, [setBGMRate]);

  // Shake screen when opponent scores (light shake for awareness)
  useEffect(() => {
    if (state.opponentScore > prevOpponentScoreRef.current && prevOpponentScoreRef.current > 0) {
      // Opponent just scored - light shake
      shake({ intensity: 'light', duration: 300 });
    }

    prevOpponentScoreRef.current = state.opponentScore;
  }, [state.opponentScore, shake]);

  const showTransition = (type: typeof transitionType, message: string) => {
    setTransitionType(type);
    setTransitionMessage(message);
    setTransitionVisible(true);
  };

  const handleAnswerPress = (answerIndex: number) => {
    if (state.roundState === 'active' && state.selectedAnswer === null) {
      actions.submitAnswer(answerIndex);
    }
  };

  const handleLeaveMatch = () => {
    actions.leaveMatch();
    navigation.goBack();
  };

  const handlePlayAgain = async () => {
    console.log('[BattleScreen] Play Again clicked');
    try {
      // Refresh user data to get updated ELO
      console.log('[BattleScreen] Refreshing user data...');
      await refreshUser();
      console.log('[BattleScreen] User data refreshed');

      // Reset battle state
      console.log('[BattleScreen] Resetting battle state...');
      actions.resetBattle();

      // Navigate to Matchmaking
      console.log('[BattleScreen] Navigating to Matchmaking...');
      navigation.navigate('Matchmaking');
      console.log('[BattleScreen] Navigation complete');
    } catch (error) {
      console.error('[BattleScreen] Error in handlePlayAgain:', error);
    }
  };

  const handleReturnHome = async () => {
    console.log('[BattleScreen] Return Home clicked');
    try {
      // Refresh user data to get updated ELO
      console.log('[BattleScreen] Refreshing user data...');
      await refreshUser();
      console.log('[BattleScreen] User data refreshed');

      // Reset battle state
      console.log('[BattleScreen] Resetting battle state...');
      actions.resetBattle();

      // Navigate to Matchmaking
      console.log('[BattleScreen] Navigating to Matchmaking...');
      navigation.navigate('Matchmaking');
      console.log('[BattleScreen] Navigation complete');
    } catch (error) {
      console.error('[BattleScreen] Error in handleReturnHome:', error);
    }
  };

  // Render loading state for user data
  if (isLoadingUser || !userId || !username) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render loading state
  if (state.connectionStatus === 'connecting' || state.connectionStatus === 'reconnecting') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>
            {state.connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render match ended state
  if (state.matchStatus === 'ended') {
    // Check if match was abandoned (no winner means abandoned)
    const isAbandoned = !state.winner;
    const isVictory = state.winner === userId;

    return (
      <MatchResultScreen
        isVictory={isVictory}
        isAbandoned={isAbandoned}
        playerScore={state.playerScore}
        opponentScore={state.opponentScore}
        eloChange={state.eloChange}
        oldRankPoints={state.oldRankPoints}
        newRankPoints={state.newRankPoints}
        oldTier={state.oldTier}
        newTier={state.newTier}
        stats={state.finalStats}
        winningTime={isVictory ? state.roundWinnerTime ?? undefined : undefined}
        consecutiveWins={state.consecutivePlayerWins}
        isMatchPoint={state.isMatchPoint}
        onPlayAgain={handlePlayAgain}
        onReturnHome={handleReturnHome}
      />
    );
  }

  // Render waiting for match
  if (!state.matchId || state.matchStatus === 'waiting') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Waiting for match to start...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render active battle
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.shakeContainer,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {/* Header with leave button - Fixed at top */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeaveMatch} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>← Leave</Text>
          </TouchableOpacity>
          <Text style={styles.categoryText}>{state.category?.replace('_', ' ').toUpperCase()}</Text>
          <View style={styles.leaveButton} />
        </View>

        {/* Scoreboard - Fixed below header */}
        <ScoreBoard
          playerUsername={username}
          playerAvatar={avatar || undefined}
          playerScore={state.playerScore}
          opponent={state.opponent}
          opponentScore={state.opponentScore}
          opponentConnected={state.opponentConnected}
          showMatchPointBanner={state.isMatchPoint && state.roundState === 'active'}
        />

        {/* Scrollable content area */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Question Section */}
          {state.question && (
            <>
              <QuestionDisplay
                question={state.question}
                roundNumber={state.currentRound}
              />

              {/* Timer */}
              <Timer
                startTime={state.startTime}
                endTime={state.endTime}
                isActive={state.roundState === 'active'}
                isStarting={state.roundState === 'starting'}
                onTimeUpdate={handleTimerUpdate}
              />

              {/* Answer Options */}
              <View style={styles.answersContainer}>
                {state.answers.map((answer, index) => (
                  <AnswerButton
                    key={index}
                    answer={answer}
                    index={index}
                    onPress={handleAnswerPress}
                    isSelected={state.selectedAnswer === index}
                    isCorrect={state.correctAnswer === index ? true : (state.selectedAnswer === index ? state.isCorrect : null)}
                    isDisabled={state.roundState !== 'active' || state.selectedAnswer !== null}
                    showResult={state.roundState === 'ended'}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Connection status warning - Fixed at bottom */}
        {!state.opponentConnected && (
          <View style={styles.connectionWarning}>
            <Text style={styles.connectionWarningText}>
              Opponent disconnected. Waiting for reconnection...
            </Text>
          </View>
        )}

        {/* Round Transition Overlay */}
        <RoundTransition
          visible={transitionVisible}
          type={transitionType}
          message={transitionMessage}
          winnerTime={state.roundWinnerTime ?? undefined}
          isPlayerWinner={state.roundWinner === userId}
        />

        {/* Momentum Overlay (shown after round transition) */}
        <MomentumOverlay
          visible={momentumVisible}
          momentum={momentumConfig}
        />
      </Animated.View>

      {/* Error Flash - Outside shake container for full screen effect */}
      <ErrorFlash
        visible={showErrorFlash}
        onComplete={() => setShowErrorFlash(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shakeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leaveButton: {
    width: 60,
  },
  leaveButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: '#F44336',
  },
  categoryText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: '#666',
    letterSpacing: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  answersContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: fontSizes.md,
    color: '#666',
  },
  connectionWarning: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectionWarningText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: '#fff',
    textAlign: 'center',
  },
});
