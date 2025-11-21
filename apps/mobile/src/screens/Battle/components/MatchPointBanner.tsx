import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

interface MatchPointBannerProps {
  visible: boolean;
  playerScore: number;
  opponentScore: number;
  style?: any;
}

/**
 * Dramatic banner shown when current question can finish the match
 */
export function MatchPointBanner({
  visible,
  playerScore,
  opponentScore,
  style,
}: MatchPointBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible, pulseAnim]);

  if (!visible) {
    return null;
  }

  // Determine who's at match point
  const playerAtMatchPoint = playerScore === 2;
  const opponentAtMatchPoint = opponentScore === 2;
  const bothAtMatchPoint = playerAtMatchPoint && opponentAtMatchPoint;

  let message = '';
  let bannerStyle = styles.bannerDefault;

  if (bothAtMatchPoint) {
    message = '⚡ MATCH POINT - BOTH ⚡';
    bannerStyle = styles.bannerBoth;
  } else if (playerAtMatchPoint) {
    message = '🔥 YOUR MATCH POINT 🔥';
    bannerStyle = styles.bannerPlayer;
  } else if (opponentAtMatchPoint) {
    message = '⚠️ OPPONENT MATCH POINT ⚠️';
    bannerStyle = styles.bannerOpponent;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        bannerStyle,
        style,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.subtext}>Winner takes all!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 6,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bannerDefault: {
    backgroundColor: '#FFC107',
    borderColor: '#FFA000',
  },
  bannerPlayer: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  bannerOpponent: {
    backgroundColor: '#F44336',
    borderColor: '#C62828',
  },
  bannerBoth: {
    backgroundColor: '#FF6F00',
    borderColor: '#E65100',
  },
  text: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 3,
    opacity: 0.9,
  },
});
