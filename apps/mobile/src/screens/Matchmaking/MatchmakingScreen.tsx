import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category, RankTier } from '../../../../../packages/types/src';
import { CategorySelection } from './CategorySelection';
import { QueueStatus } from './components/QueueStatus';
import { MatchFoundModal } from './components/MatchFoundModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import { colors } from '../../theme';

type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: Category;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Matchmaking'>;

interface MatchFoundData {
  matchId: string;
  opponent: {
    id: string;
    username: string;
    rankPoints: number;
    rankTier: RankTier;
  };
  category: Category;
}

// TODO: Replace with actual user data from auth context
const MOCK_USER = {
  id: 'user_123',
  username: 'Player1',
  rankPoints: 1000,
  rankTier: 'bronze' as RankTier,
};

export const MatchmakingScreen: React.FC<Props> = ({ navigation }) => {
  const [matchmakingState, setMatchmakingState] = useState<
    'idle' | 'searching' | 'match_found'
  >('idle');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | undefined>(undefined);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchFoundData, setMatchFoundData] = useState<MatchFoundData | null>(null);

  // WebSocket connection
  const { isConnected, send, subscribe } = useWebSocket(MOCK_USER.id);

  // Timer for elapsed time in queue
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (matchmakingState === 'searching') {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [matchmakingState]);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    // Queue joined confirmation
    const unsubQueueJoined = subscribe('queue_joined', (event) => {
      console.log('[Matchmaking] Queue joined:', event);
      setQueuePosition(event.position);
      setMatchmakingState('searching');
    });

    // Queue left confirmation
    const unsubQueueLeft = subscribe('queue_left', () => {
      console.log('[Matchmaking] Queue left');
      setMatchmakingState('idle');
      setSelectedCategory(null);
      setQueuePosition(undefined);
      setElapsedTime(0);
    });

    // Match found
    const unsubMatchFound = subscribe('match_found', (event) => {
      console.log('[Matchmaking] Match found:', event);
      setMatchFoundData({
        matchId: event.matchId,
        opponent: event.opponent,
        category: event.category,
      });
      setMatchmakingState('match_found');
    });

    // Error handling
    const unsubError = subscribe('error', (event) => {
      console.error('[Matchmaking] Error:', event);
      Alert.alert('Error', event.message);

      // Reset state on error
      if (matchmakingState === 'searching') {
        setMatchmakingState('idle');
        setSelectedCategory(null);
      }
    });

    return () => {
      unsubQueueJoined();
      unsubQueueLeft();
      unsubMatchFound();
      unsubError();
    };
  }, [isConnected, subscribe, matchmakingState]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category: Category) => {
      if (!isConnected) {
        Alert.alert('Connection Error', 'Not connected to server. Please try again.');
        return;
      }

      setSelectedCategory(category);

      // Join matchmaking queue
      send({
        type: 'join_queue',
        category,
        rankPoints: MOCK_USER.rankPoints,
        username: MOCK_USER.username,
      });
    },
    [isConnected, send]
  );

  // Handle queue cancellation
  const handleCancelQueue = useCallback(() => {
    if (!selectedCategory) return;

    send({
      type: 'cancel_queue',
      category: selectedCategory,
    });

    // Immediately update UI
    setMatchmakingState('idle');
    setSelectedCategory(null);
    setQueuePosition(undefined);
    setElapsedTime(0);
  }, [send, selectedCategory]);

  // Handle match found modal completion
  const handleMatchFoundComplete = useCallback(() => {
    if (!matchFoundData) return;

    // Navigate to Battle screen
    navigation.navigate('Battle', {
      matchId: matchFoundData.matchId,
      opponentUsername: matchFoundData.opponent.username,
      opponentRankPoints: matchFoundData.opponent.rankPoints,
      category: matchFoundData.category,
    });

    // Reset state
    setMatchmakingState('idle');
    setSelectedCategory(null);
    setMatchFoundData(null);
  }, [matchFoundData, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {matchmakingState === 'idle' && (
        <CategorySelection onCategorySelect={handleCategorySelect} />
      )}

      {matchmakingState === 'searching' && selectedCategory && (
        <QueueStatus
          category={selectedCategory}
          queuePosition={queuePosition}
          elapsedTime={elapsedTime}
          onCancel={handleCancelQueue}
        />
      )}

      {matchmakingState === 'match_found' && matchFoundData && (
        <MatchFoundModal
          visible={true}
          opponentUsername={matchFoundData.opponent.username}
          opponentRankTier={matchFoundData.opponent.rankTier}
          opponentRankPoints={matchFoundData.opponent.rankPoints}
          myRankPoints={MOCK_USER.rankPoints}
          onAnimationComplete={handleMatchFoundComplete}
        />
      )}

      {/* Connection status indicator (dev only) */}
      {__DEV__ && (
        <View
          style={[
            styles.connectionIndicator,
            { backgroundColor: isConnected ? colors.success : colors.error },
          ]}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  connectionIndicator: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
