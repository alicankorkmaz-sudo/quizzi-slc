import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiRainProps {
  active: boolean;
  particleCount?: number;
  colors?: string[];
  duration?: number;
}

/**
 * Confetti rain animation for celebrations
 *
 * Usage:
 * ```tsx
 * <ConfettiRain
 *   active={showConfetti}
 *   particleCount={50}
 *   colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']}
 * />
 * ```
 */
export const ConfettiRain: React.FC<ConfettiRainProps> = ({
  active,
  particleCount = 50,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B801', '#6C5CE7'],
  duration = 3000,
}) => {
  const particlesRef = useRef<ConfettiParticle[]>([]);

  // Initialize particles
  useEffect(() => {
    if (!active) return;

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(-50 - Math.random() * 200), // Start above screen
      rotation: new Animated.Value(Math.random() * 360),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8, // 8-16px
    }));

    // Animate particles falling
    const animations = particlesRef.current.map((particle) => {
      const fallDuration = duration + Math.random() * 1000; // Stagger timing
      const swayAmount = 50 + Math.random() * 100; // Horizontal sway

      return Animated.parallel([
        // Fall down
        Animated.timing(particle.y, {
          toValue: SCREEN_HEIGHT + 100,
          duration: fallDuration,
          useNativeDriver: true,
        }),
        // Sway horizontally
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value + swayAmount,
            duration: fallDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value - swayAmount,
            duration: fallDuration / 2,
            useNativeDriver: true,
          }),
        ]),
        // Spin
        Animated.loop(
          Animated.timing(particle.rotation, {
            toValue: (particle.rotation as any)._value + 720, // Two full rotations
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          })
        ),
      ]);
    });

    Animated.parallel(animations).start();

    // Cleanup
    return () => {
      particlesRef.current.forEach((particle) => {
        particle.y.stopAnimation();
        particle.x.stopAnimation();
        particle.rotation.stopAnimation();
      });
    };
  }, [active, particleCount, colors, duration]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
