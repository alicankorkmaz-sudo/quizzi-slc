import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  angle: number;
  velocity: number;
  color: string;
}

interface ParticleBurstProps {
  active: boolean;
  x: number;
  y: number;
  particleCount?: number;
  colors?: string[];
  size?: number;
  spread?: number;
  duration?: number;
}

/**
 * Particle burst effect for celebrations (e.g., correct answer)
 *
 * Usage:
 * ```tsx
 * <ParticleBurst
 *   active={showBurst}
 *   x={100}
 *   y={200}
 *   particleCount={12}
 *   colors={['#4CAF50', '#8BC34A']}
 * />
 * ```
 */
export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  active,
  x,
  y,
  particleCount = 12,
  colors = ['#FFD700', '#FFA500', '#FF6B6B'],
  size = 8,
  spread = 80,
  duration = 800,
}) => {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;

    // Create particles in a circular burst pattern
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const angle = (360 / particleCount) * i;
      const velocity = spread * (0.8 + Math.random() * 0.4); // Randomize velocity slightly

      return {
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        angle,
        velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // Animate burst
    const animations = particlesRef.current.map((particle) => {
      // Calculate end position based on angle
      const rad = (particle.angle * Math.PI) / 180;
      const endX = Math.cos(rad) * particle.velocity;
      const endY = Math.sin(rad) * particle.velocity;

      return Animated.parallel([
        // Move outward
        Animated.timing(particle.x, {
          toValue: endX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: endY,
          duration,
          useNativeDriver: true,
        }),
        // Scale down
        Animated.timing(particle.scale, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: duration * 0.8, // Fade faster than movement
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();

    // Cleanup
    return () => {
      particlesRef.current.forEach((particle) => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.scale.stopAnimation();
        particle.opacity.stopAnimation();
      });
    };
  }, [active, particleCount, colors, spread, duration]);

  if (!active) return null;

  return (
    <View
      style={[
        styles.container,
        {
          left: x,
          top: y,
        },
      ]}
      pointerEvents="none"
    >
      {particlesRef.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
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
    position: 'absolute',
    zIndex: 9998,
  },
  particle: {
    position: 'absolute',
    borderRadius: 4,
  },
});
