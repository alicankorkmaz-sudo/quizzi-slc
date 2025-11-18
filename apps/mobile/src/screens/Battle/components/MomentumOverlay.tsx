/**
 * MomentumOverlay Component (Story 9.7)
 *
 * Full-screen overlay for dramatic momentum scenarios:
 * - Dominating: 🔥 DOMINATING! (3+ consecutive wins)
 * - Comeback: 💥 EPIC COMEBACK! (winning after being behind)
 * - Flawless: 🏆 FLAWLESS VICTORY! (winning without losing a round)
 *
 * Display: 2s duration, shown after RoundTransition completes
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { MomentumConfig } from '../utils/momentumDetector';

interface MomentumOverlayProps {
  visible: boolean;
  momentum: MomentumConfig | null;
}

export function MomentumOverlay({ visible, momentum }: MomentumOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible && momentum) {
      // Trigger haptic feedback based on momentum type
      switch (momentum.type) {
        case 'flawless':
          // Triple heavy impact for flawless
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
          break;
        case 'comeback':
          // Double impact for comeback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
          break;
        case 'dominating':
          // Single heavy impact for dominating
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }

      // Animate in - more dramatic than round transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, momentum, fadeAnim, scaleAnim]);

  if (!visible || !momentum) return null;

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
      <View style={[styles.container, { backgroundColor: momentum.color }]}>
        <Text style={styles.emoji}>{momentum.emoji}</Text>
        <Text style={styles.title}>{momentum.title}</Text>
        {momentum.type === 'flawless' && (
          <Text style={styles.subtitle}>Perfect performance!</Text>
        )}
        {momentum.type === 'comeback' && (
          <Text style={styles.subtitle}>Never give up!</Text>
        )}
        {momentum.type === 'dominating' && (
          <Text style={styles.subtitle}>Unstoppable!</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Slightly darker for drama
  },
  container: {
    borderRadius: 32,
    paddingHorizontal: 56,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 300,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    textAlign: 'center',
  },
});
