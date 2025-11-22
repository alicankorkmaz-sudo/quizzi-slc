import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getSpeedTier, formatResponseTime } from '@quizzi/types';
import { fontSizes, fontWeights } from "../../../theme";

interface RoundTransitionProps {
  visible: boolean;
  type: 'countdown' | 'correct' | 'incorrect' | 'timeout';
  message?: string;
  winnerTime?: number; // Winner's response time in milliseconds
  isPlayerWinner?: boolean; // Whether the current player won
}

export function RoundTransition({ visible, type, message, winnerTime, isPlayerWinner }: RoundTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (type === 'correct') {
        // Enhanced haptic for lightning tier
        if (isPlayerWinner && winnerTime !== undefined) {
          const speedTier = getSpeedTier(winnerTime);
          if (speedTier.tier === 'lightning') {
            // Triple impact for lightning
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else if (type === 'incorrect') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'countdown') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Enhanced animation for lightning tier
      const isLightning = type === 'correct' && isPlayerWinner && winnerTime !== undefined && getSpeedTier(winnerTime).tier === 'lightning';

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: isLightning ? 150 : 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: isLightning ? 4 : 6,
          tension: isLightning ? 60 : 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, type, fadeAnim, scaleAnim]);

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'countdown':
        return {
          backgroundColor: '#2196F3',
          icon: '🎯',
          text: message || 'Get Ready!',
          showTime: false,
        };
      case 'correct': {
        // If player won and we have winner time, show speed celebration
        if (isPlayerWinner && winnerTime !== undefined) {
          const speedTier = getSpeedTier(winnerTime);
          return {
            backgroundColor: speedTier.tier === 'lightning' ? '#FFD700' : '#4CAF50',
            icon: speedTier.emoji,
            text: speedTier.label,
            showTime: true,
            time: formatResponseTime(winnerTime),
            tier: speedTier.tier,
          };
        }
        return {
          backgroundColor: '#4CAF50',
          icon: '✓',
          text: message || 'Correct!',
          showTime: false,
        };
      }
      case 'incorrect': {
        // If player lost and we have opponent's winning time, show it
        const isTooSlow = message === 'Too Slow!';
        if (isTooSlow && !isPlayerWinner && winnerTime !== undefined) {
          return {
            backgroundColor: '#F44336',
            icon: '✗',
            text: message || 'Wrong!',
            showTime: true,
            time: formatResponseTime(winnerTime),
            isOpponentTime: true,
          };
        }
        return {
          backgroundColor: '#F44336',
          icon: '✗',
          text: message || 'Wrong!',
          showTime: false,
        };
      }
      case 'timeout':
        return {
          backgroundColor: '#FF9800',
          icon: '⏱',
          text: message || 'Time\'s Up!',
          showTime: false,
        };
      default:
        return {
          backgroundColor: '#2196F3',
          icon: '•',
          text: message || '',
          showTime: false,
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.text}>{config.text}</Text>
        {config.showTime && config.time && (
          <>
            {config.isOpponentTime && (
              <Text style={styles.opponentLabel}>Opponent:</Text>
            )}
            <Text style={styles.timeText}>{config.time}</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: fontSizes['5xl'],
    marginBottom: 16,
  },
  text: {
    fontSize: 24,              // Not in scale // Not in scale, keep as-is (between '2xl':26 and xl:22)
    fontWeight: fontWeights.bold,
    color: '#fff',
    textAlign: 'center',
  },
  opponentLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
    textAlign: 'center',
  },
  timeText: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.extraBold,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
});
