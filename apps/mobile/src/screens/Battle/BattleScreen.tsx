import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category } from '../../../../../packages/types/src';
import { useBattleState } from '../../hooks/useBattleState';
import {
  QuestionDisplay,
  AnswerButton,
  Timer,
  ScoreBoard,
  RoundTransition,
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

export const BattleScreen: React.FC<Props> = ({ navigation }) => {
  // TODO: Get these from auth context or user profile
  const userId = 'test_user_id';
  const playerId = 'test_player_id';
  const username = 'TestPlayer';

  const { state, actions } = useBattleState(userId, playerId);
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
        showTransition('timeout', "Time's Up!");
      }

      // Hide transition after 2 seconds
      const timeout = setTimeout(() => {
        setTransitionVisible(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state.roundState, state.isCorrect]);

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
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.matchEndContainer}>
          <Text style={styles.matchEndTitle}>
            {state.winner === playerId ? '🏆 Victory!' : '😔 Defeat'}
          </Text>
          <View style={styles.finalScoreContainer}>
            <Text style={styles.finalScoreText}>
              {state.playerScore} - {state.opponentScore}
            </Text>
          </View>
          {state.rankPointsChange !== null && (
            <Text style={[
              styles.rankChangeText,
              state.rankPointsChange > 0 ? styles.rankChangePositive : styles.rankChangeNegative
            ]}>
              {state.rankPointsChange > 0 ? '+' : ''}{state.rankPointsChange} rank points
            </Text>
          )}
          {state.finalStats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>
                Avg Response: {Math.round(state.finalStats.avgResponseTime)}ms
              </Text>
              <Text style={styles.statText}>
                Fastest Answer: {Math.round(state.finalStats.fastestAnswer)}ms
              </Text>
              <Text style={styles.statText}>
                Accuracy: {Math.round(state.finalStats.accuracy * 100)}%
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.exitButton} onPress={handleLeaveMatch}>
            <Text style={styles.exitButtonText}>Return to Lobby</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
      <View style={styles.content}>
        {/* Header with leave button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeaveMatch} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>← Leave</Text>
          </TouchableOpacity>
          <Text style={styles.categoryText}>{state.category?.replace('_', ' ').toUpperCase()}</Text>
          <View style={styles.leaveButton} />
        </View>

        {/* Scoreboard */}
        <ScoreBoard
          playerUsername={username}
          playerScore={state.playerScore}
          opponent={state.opponent}
          opponentScore={state.opponentScore}
          opponentConnected={state.opponentConnected}
        />

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

        {/* Connection status warning */}
        {!state.opponentConnected && (
          <View style={styles.connectionWarning}>
            <Text style={styles.connectionWarningText}>
              Opponent disconnected. Waiting for reconnection...
            </Text>
          </View>
        )}
      </View>

      {/* Round Transition Overlay */}
      <RoundTransition
        visible={transitionVisible}
        type={transitionType}
        message={transitionMessage}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  answersContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  matchEndContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  matchEndTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  finalScoreContainer: {
    marginBottom: 24,
  },
  finalScoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2196F3',
  },
  rankChangeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
  },
  rankChangePositive: {
    color: '#4CAF50',
  },
  rankChangeNegative: {
    color: '#F44336',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
  },
  statText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  exitButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
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
