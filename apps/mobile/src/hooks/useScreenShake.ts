import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ShakeConfig {
  intensity?: ShakeIntensity;
  duration?: number; // Total duration in ms
  frequency?: number; // Number of shakes
}

/**
 * Hook for screen shake animations
 *
 * Usage:
 * ```tsx
 * const { shakeAnim, shake } = useScreenShake();
 *
 * // Apply to container
 * <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
 *   {children}
 * </Animated.View>
 *
 * // Trigger shake
 * shake({ intensity: 'medium' });
 * ```
 */
export function useScreenShake() {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(
    (config: ShakeConfig = {}) => {
      const {
        intensity = 'medium',
        duration = 400,
        frequency = 4,
      } = config;

      // Determine shake amplitude based on intensity
      const amplitude = {
        light: 5,
        medium: 10,
        heavy: 15,
      }[intensity];

      // Reset to 0
      shakeAnim.setValue(0);

      // Create shake sequence
      const shakeSequence: Animated.CompositeAnimation[] = [];

      for (let i = 0; i < frequency; i++) {
        // Alternate direction: right, left, right, left...
        const direction = i % 2 === 0 ? amplitude : -amplitude;

        // Decay amplitude over time for smooth finish
        const decayFactor = 1 - (i / frequency) * 0.6;
        const currentAmplitude = direction * decayFactor;

        shakeSequence.push(
          Animated.timing(shakeAnim, {
            toValue: currentAmplitude,
            duration: duration / (frequency * 2),
            useNativeDriver: true,
          })
        );
      }

      // Return to center with smooth decay
      shakeSequence.push(
        Animated.spring(shakeAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      );

      Animated.sequence(shakeSequence).start();
    },
    [shakeAnim]
  );

  return {
    shakeAnim,
    shake,
  };
}
