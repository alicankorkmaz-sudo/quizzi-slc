import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TimerProps {
  startTime: number | null;
  endTime: number | null;
  isActive: boolean;
  isStarting?: boolean;
}

export function Timer({ startTime, endTime, isActive, isStarting = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chargingAnim = useRef(new Animated.Value(0)).current;
  const hapticTriggeredRef = useRef<Set<number>>(new Set());

  // Reset haptic triggers when a new round starts
  useEffect(() => {
    if (isActive && startTime && endTime) {
      hapticTriggeredRef.current.clear();
    }
  }, [startTime, endTime, isActive]);

  // Trigger haptic feedback at specific time milestones
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const triggerHaptic = async (intensity: 'light' | 'medium' | 'heavy') => {
      // Only trigger once per time milestone
      if (hapticTriggeredRef.current.has(timeLeft)) return;
      hapticTriggeredRef.current.add(timeLeft);

      try {
        if (Platform.OS === 'ios') {
          // iOS: Use impact feedback with different weights
          if (intensity === 'light') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (intensity === 'medium') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        } else {
          // Android: Use notification feedback with different types
          if (intensity === 'light') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else if (intensity === 'medium') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
      } catch (error) {
        // Silently fail if haptics are not supported or disabled
        console.log('[Timer] Haptic feedback failed:', error);
      }
    };

    // Trigger haptics at specific milestones
    if (timeLeft === 5) {
      triggerHaptic('light');
    } else if (timeLeft === 3) {
      triggerHaptic('medium');
    } else if (timeLeft === 1) {
      triggerHaptic('heavy');
    }
  }, [timeLeft, isActive]);

  // Pulsing animation when time < 3s
  useEffect(() => {
    if (!isActive || timeLeft >= 3) {
      // Reset animation when not urgent
      pulseAnim.setValue(1);
      return;
    }

    // Create looping pulse animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      pulseAnim.setValue(1);
    };
  }, [timeLeft, isActive, pulseAnim]);

  // Charging animation for "Get Ready" phase
  useEffect(() => {
    if (isStarting) {
      // Reset charging animation
      chargingAnim.setValue(0);
      // Animate to full over 800ms (approximate round start delay)
      Animated.timing(chargingAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false, // Width doesn't support native driver
      }).start();
    } else {
      chargingAnim.setValue(0);
    }
  }, [isStarting, chargingAnim]);

  useEffect(() => {
    // If not active or missing timestamps, don't update timer (keep current value frozen)
    if (!isActive || !startTime || !endTime) {
      return;
    }

    // Update timer based on absolute server time
    const updateTimer = () => {
      const now = Date.now();
      // Calculate remaining time based on target end time
      // This handles reconnection and clock sync better than relative duration
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every 100ms for smooth countdown
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [startTime, endTime, isActive]);

  const getProgressColor = () => {
    if (isStarting) return '#2196F3'; // Blue for "Get Ready"
    if (timeLeft > 7) return '#4CAF50';
    if (timeLeft > 3) return '#FF9800';
    return '#F44336';
  };

  const progressPercentage = isStarting
    ? chargingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    })
    : `${(timeLeft / 10) * 100}%`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressPercentage as any,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      <Text style={[styles.timerText, { color: getProgressColor(), fontSize: isStarting ? 14 : 20 }]}>
        {isStarting ? 'READY' : `${timeLeft}s`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    width: 60,
    textAlign: 'right',
  },
});
