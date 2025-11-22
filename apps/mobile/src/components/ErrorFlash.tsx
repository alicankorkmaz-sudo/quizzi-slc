import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

interface ErrorFlashProps {
  visible: boolean;
  onComplete?: () => void;
}

/**
 * Red flash overlay for error states
 *
 * Usage:
 * ```tsx
 * const [showFlash, setShowFlash] = useState(false);
 *
 * <ErrorFlash
 *   visible={showFlash}
 *   onComplete={() => setShowFlash(false)}
 * />
 * ```
 */
export const ErrorFlash: React.FC<ErrorFlashProps> = ({
  visible,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Flash in quickly
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        // Fade out smoothly
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [visible, fadeAnim, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F44336', // Material Red
    zIndex: 9999,
  },
});
