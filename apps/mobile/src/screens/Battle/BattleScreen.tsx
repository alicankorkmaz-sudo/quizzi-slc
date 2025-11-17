import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
  MatchPointBanner,
} from './components';

type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: Category;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

export const BattleScreen: React.FC<Props> = ({ navigation, route }) => {
  // User data
  const { userId, username, isLoading: isLoadingUser, refresh: refreshUser } = useUser();

  // Get match info from route params
  const { matchId, opponentUsername, opponentRankPoints, category } = route.params;

  const { state, actions } = useBattleState(userId, userId || '', {
    matchId,
    opponentUsername,
    opponentRankPoints,
    category,
  });
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [transitionType, setTransitionType] = useState<'countdown' | 'correct' | 'incorrect' | 'timeout'>('countdown');
  const [transitionMessage, setTransitionMessage] = useState('');

  // Handle round end transitions
  useEffect(() => {
    if (state.roundState === 'ended') {
      if (state.isCorrect === true) {
        showTransition('correct', 'Correct!');
      } else if (state.isCorrect === false) {
        showTransition('incorrect', 'Wrong!');
      } else {
        // Player didn't answer - check if opponent won
        if (state.roundWinner && state.roundWinner !== userId) {
          showTransition('incorrect', 'Too Slow!');
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
  }, [state.roundState, state.isCorrect, state.roundWinner, userId]);

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
        playerScore={state.playerScore}
        opponent={state.opponent}
        opponentScore={state.opponentScore}
        opponentConnected={state.opponentConnected}
      />

      {/* Match Point Banner - Dramatic indicator when question can finish match */}
      <MatchPointBanner
        visible={state.isMatchPoint && state.roundState === 'active'}
        playerScore={state.playerScore}
        opponentScore={state.opponentScore}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
