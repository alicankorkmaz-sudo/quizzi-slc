import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category, RankTier } from '../../../../../packages/types/src';
import { CategorySelection } from './CategorySelection';
import { QueueStatus } from './components/QueueStatus';
import { MatchFoundModal } from './components/MatchFoundModal';
import { RankBadge } from './components/RankBadge';
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
  Statistics: undefined;
  Leaderboard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Matchmaking'>;

interface MatchFoundData {
  matchId: string;
  opponent: {
    id: string;
    username: string;
    elo: number;
    rankTier: RankTier;
  };
  category: Category;
}

export const MatchmakingScreen: React.FC<Props> = ({ navigation }) => {
  const [matchmakingState, setMatchmakingState] = useState<
    'idle' | 'searching' | 'match_found'
  >('idle');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | undefined>(undefined);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchFoundData, setMatchFoundData] = useState<MatchFoundData | null>(null);

  // Safe area insets
  const insets = useSafeAreaInsets();

  // User data
  const { username, token, elo, rankTier, isLoading: isLoadingUser, refresh: refreshUser } = useUser();

  // WebSocket connection
  const { isConnected, send, subscribe } = useWebSocketContext();

  // Refresh user data and reset state when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[MatchmakingScreen] Screen focused');
      console.log('[MatchmakingScreen] Current state:', {
        matchmakingState,
        selectedCategory,
        isConnected
      });

      // Reset matchmaking state when returning from battle
      if (matchmakingState === 'match_found') {
        console.log('[MatchmakingScreen] Resetting from match_found state');
        setMatchmakingState('idle');
        setSelectedCategory(null);
        setMatchFoundData(null);
      }

      // Refresh user data
      console.log('[MatchmakingScreen] Refreshing user data');
      refreshUser();
    });

    return unsubscribe;
  }, [navigation, refreshUser, matchmakingState, selectedCategory, isConnected]);

  // Debug: Log rank data
  useEffect(() => {
    console.log('[MatchmakingScreen] Rank data:', { elo, rankTier });
  }, [elo, rankTier]);

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
      console.log('[MatchmakingScreen] Category selected:', category);
      console.log('[MatchmakingScreen] State check:', {
        isConnected,
        username,
        elo,
        matchmakingState
      });

      if (!isConnected) {
        console.error('[MatchmakingScreen] Not connected to server');
        Alert.alert('Connection Error', 'Not connected to server. Please try again.');
        return;
      }

      if (!username) {
        console.error('[MatchmakingScreen] Username not available');
        Alert.alert('Error', 'User data not loaded. Please try again.');
        return;
      }

      console.log('[MatchmakingScreen] Setting selected category and joining queue');
      setSelectedCategory(category);

      // Join matchmaking queue
      const queueMessage = {
        type: 'join_queue' as const,
        category,
        elo: elo || 1000,
        username: username,
      };
      console.log('[MatchmakingScreen] Sending join_queue:', queueMessage);
      send(queueMessage);
    },
    [isConnected, send, username, elo, matchmakingState]
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
      opponentRankPoints: matchFoundData.opponent.elo,
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
      {/* Top buttons - only show when idle */}
      {matchmakingState === 'idle' && (
        <>
          {/* Leaderboard button */}
          <TouchableOpacity
            style={[styles.leaderboardButton, { top: insets.top + 8 }]}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.7}
          >
            <View style={styles.leaderboardIconContainer}>
              <Text style={styles.leaderboardIcon}>🏆</Text>
            </View>
          </TouchableOpacity>

          {/* Statistics button */}
          <TouchableOpacity
            style={[styles.statsButton, { top: insets.top + 8 }]}
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.7}
          >
            <View style={styles.statsIconContainer}>
              <Text style={styles.statsIcon}>📊</Text>
            </View>
          </TouchableOpacity>

          {/* Profile button */}
          <TouchableOpacity
            style={[styles.profileButton, { top: insets.top + 8 }]}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <View style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {matchmakingState === 'idle' && (
        <View style={[styles.idleContainer, { paddingTop: 60 }]}>
          {/* Rank Badge */}
          <RankBadge
            rankTier={(rankTier as RankTier) || 'bronze'}
            elo={elo || 1000}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Battle</Text>
            <Text style={styles.subtitle}>Select a category to start matchmaking</Text>
          </View>

          {/* Category Selection */}
          <CategorySelection onCategorySelect={handleCategorySelect} />
        </View>
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
          opponentRankPoints={matchFoundData.opponent.elo}
          myRankPoints={elo || 1000}
          onAnimationComplete={handleMatchFoundComplete}
        />
      )}

      {/* Connection status indicator (dev only) */}
      {__DEV__ && (
        <View
          style={[
            styles.connectionIndicator,
            {
              top: insets.top + 8,
              backgroundColor: isConnected ? colors.success : colors.error,
            },
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
  idleContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  connectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
  },
  leaderboardButton: {
    position: 'absolute',
    top: 8,
    right: 128,
    zIndex: 10,
  },
  leaderboardIconContainer: {
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
  leaderboardIcon: {
    fontSize: 24,
  },
  statsButton: {
    position: 'absolute',
    top: 8,
    right: 72,
    zIndex: 10,
  },
  statsIconContainer: {
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
  statsIcon: {
    fontSize: 24,
  },
  profileButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
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
