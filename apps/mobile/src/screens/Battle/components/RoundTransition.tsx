import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface RoundTransitionProps {
  visible: boolean;
  type: 'countdown' | 'correct' | 'incorrect' | 'timeout';
  message?: string;
}

export function RoundTransition({ visible, type, message }: RoundTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (type === 'correct') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'incorrect') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'countdown') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
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
        };
      case 'correct':
        return {
          backgroundColor: '#4CAF50',
          icon: '✓',
          text: message || 'Correct!',
        };
      case 'incorrect':
        return {
          backgroundColor: '#F44336',
          icon: '✗',
          text: message || 'Wrong!',
        };
      case 'timeout':
        return {
          backgroundColor: '#FF9800',
          icon: '⏱',
          text: message || 'Time\'s Up!',
        };
      default:
        return {
          backgroundColor: '#2196F3',
          icon: '•',
          text: message || '',
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
    fontSize: 64,
    marginBottom: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});
