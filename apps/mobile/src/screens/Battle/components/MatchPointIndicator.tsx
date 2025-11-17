import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MatchPointIndicatorProps {
  score: number;
  maxScore?: number;
  isPlayer?: boolean;
}

/**
 * Visual indicator showing match progress (dots for first to 3 wins)
 */
export function MatchPointIndicator({
  score,
  maxScore = 3,
  isPlayer = false,
}: MatchPointIndicatorProps) {
  const dots = Array.from({ length: maxScore }, (_, index) => index < score);

  return (
    <View style={styles.container}>
      {dots.map((filled, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            filled
              ? isPlayer
                ? styles.dotFilledPlayer
                : styles.dotFilledOpponent
              : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  dotEmpty: {
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  dotFilledPlayer: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  dotFilledOpponent: {
    borderColor: '#FF5722',
    backgroundColor: '#FF5722',
  },
});
