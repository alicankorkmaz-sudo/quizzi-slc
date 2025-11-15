import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  startTime: number | null;
  endTime: number | null;
  isActive: boolean;
}

export function Timer({ startTime, endTime, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isActive || !startTime || !endTime) {
      setTimeLeft(10);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
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
    if (timeLeft > 7) return '#4CAF50';
    if (timeLeft > 3) return '#FF9800';
    return '#F44336';
  };

  const progressPercentage = (timeLeft / 10) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercentage}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      <Text style={[styles.timerText, { color: getProgressColor() }]}>
        {timeLeft}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    width: 40,
    textAlign: 'right',
  },
});
