import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category, RankTier } from '../../../../../packages/types/src';
import { CategorySelection } from './CategorySelection';
import { QueueStatus } from './components/QueueStatus';
import { MatchFoundModal } from './components/MatchFoundModal';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { useUser } from '../../hooks/useUser';
import { colors } from '../../theme';
import { getProfile } from '../../services/profile-service';

type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: Category;
  };
  EditProfile: {
    currentProfile: any;
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

// TODO: Get rank points and tier from user profile/backend
const MOCK_RANK = {
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

  // User data
  const { username, token, isLoading: isLoadingUser } = useUser();

  // WebSocket connection
  const { isConnected, send, subscribe } = useWebSocketContext();

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
    console.log('[Matchmaking] Setting up event handlers, isConnected:', isConnected);
    if (!isConnected) return;

    // Queue joined confirmation
    const unsubQueueJoined = subscribe('queue_joined', (event) => {
      console.log('[Matchmaking] Queue joined:', event);
      // Only process queue_joined if we haven't found a match yet
      setMatchmakingState((currentState) => {
        if (currentState === 'match_found') {
          console.log('[Matchmaking] Ignoring queue_joined - match already found');
          return currentState;
        }
        setQueuePosition(event.position);
        return 'searching';
      });
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
      console.log('[Matchmaking] ⭐ MATCH FOUND EVENT RECEIVED:', event);
      console.log('[Matchmaking] Current matchmakingState:', matchmakingState);
      setMatchFoundData({
        matchId: event.matchId,
        opponent: event.opponent,
        category: event.category,
      });
      setMatchmakingState('match_found');
      console.log('[Matchmaking] State updated to match_found');
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
      console.log('[Matchmaking] Cleaning up event subscriptions');
      unsubQueueJoined();
      unsubQueueLeft();
      unsubMatchFound();
      unsubError();
    };
  }, [isConnected, subscribe]); // Removed matchmakingState from deps to prevent re-subscription

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category: Category) => {
      if (!isConnected) {
        Alert.alert('Connection Error', 'Not connected to server. Please try again.');
        return;
      }

      if (!username) {
        Alert.alert('Error', 'User data not loaded. Please try again.');
        return;
      }

      setSelectedCategory(category);

      // Join matchmaking queue
      send({
        type: 'join_queue',
        category,
        rankPoints: MOCK_RANK.rankPoints,
        username: username,
      });
    },
    [isConnected, send, username]
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
    console.log('[Matchmaking] handleMatchFoundComplete called');
    if (!matchFoundData) {
      console.log('[Matchmaking] No match found data, skipping navigation');
      return;
    }

    console.log('[Matchmaking] Navigating to Battle screen with:', matchFoundData);
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

  // Handle profile button press
  const handleProfilePress = useCallback(async () => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to view your profile');
      return;
    }

    try {
      const profile = await getProfile(token);
      navigation.navigate('EditProfile', { currentProfile: profile });
    } catch (error) {
      console.error('[Matchmaking] Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    }
  }, [token, navigation]);

  // Show loading state while user data is being loaded
  if (isLoadingUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Profile button - only show when idle */}
      {matchmakingState === 'idle' && (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
        </TouchableOpacity>
      )}

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
          myRankPoints={MOCK_RANK.rankPoints}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  connectionIndicator: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 5,
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileIcon: {
    fontSize: 24,
  },
});
