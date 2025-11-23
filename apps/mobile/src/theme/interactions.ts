import { Animated } from 'react-native';
import { colors } from './colors';
import { elevation, glowEffects, createPressedShadow } from './spacing';

/**
 * Interaction States System
 *
 * Provides consistent visual feedback for interactive elements
 * - Press states with haptic feedback
 * - Focus states for accessibility
 * - Active/selected states
 * - Disabled states
 * - Loading states
 */

// ============================================================================
// PRESS STATES
// ============================================================================

/**
 * Press state styles for buttons and interactive elements
 * Combines scale, shadow, and color changes
 */
export const pressStates = {
  // Primary button press
  primary: {
    rest: {
      backgroundColor: colors.primary,
      ...elevation.level2,
      transform: [{ scale: 1 }],
    },
    pressed: {
      backgroundColor: colors.primaryPressed,
      ...createPressedShadow(elevation.level2),
      transform: [{ scale: 0.97 }],
    },
    hover: {
      backgroundColor: colors.primaryHover,
      ...elevation.level3,
      transform: [{ scale: 1 }],
    },
  },

  // Secondary button press
  secondary: {
    rest: {
      backgroundColor: colors.secondary,
      ...elevation.level2,
      transform: [{ scale: 1 }],
    },
    pressed: {
      backgroundColor: colors.secondaryPressed,
      ...createPressedShadow(elevation.level2),
      transform: [{ scale: 0.97 }],
    },
    hover: {
      backgroundColor: colors.secondaryHover,
      ...elevation.level3,
      transform: [{ scale: 1 }],
    },
  },

  // Success button press
  success: {
    rest: {
      backgroundColor: colors.success,
      ...elevation.level2,
      transform: [{ scale: 1 }],
    },
    pressed: {
      backgroundColor: colors.successPressed,
      ...createPressedShadow(elevation.level2),
      transform: [{ scale: 0.97 }],
    },
    hover: {
      backgroundColor: colors.successHover,
      ...elevation.level3,
      transform: [{ scale: 1 }],
    },
  },

  // Error/danger button press
  error: {
    rest: {
      backgroundColor: colors.error,
      ...elevation.level2,
      transform: [{ scale: 1 }],
    },
    pressed: {
      backgroundColor: colors.errorPressed,
      ...createPressedShadow(elevation.level2),
      transform: [{ scale: 0.97 }],
    },
    hover: {
      backgroundColor: colors.errorHover,
      ...elevation.level3,
      transform: [{ scale: 1 }],
    },
  },

  // Subtle/ghost button press (no background)
  ghost: {
    rest: {
      backgroundColor: 'transparent',
      transform: [{ scale: 1 }],
    },
    pressed: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      transform: [{ scale: 0.97 }],
    },
    hover: {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
      transform: [{ scale: 1 }],
    },
  },

  // Card press (subtle)
  card: {
    rest: {
      ...elevation.level1,
      transform: [{ scale: 1 }],
    },
    pressed: {
      ...createPressedShadow(elevation.level1),
      transform: [{ scale: 0.98 }],
    },
    hover: {
      ...elevation.level2,
      transform: [{ scale: 1 }],
    },
  },
};

// ============================================================================
// FOCUS STATES
// ============================================================================

/**
 * Focus states for accessibility (keyboard navigation)
 * Adds visible focus ring for keyboard users
 */
export const focusStates = {
  primary: {
    ...glowEffects.focus,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  secondary: {
    ...glowEffects.focus,
    borderWidth: 2,
    borderColor: colors.secondary,
  },

  success: {
    ...glowEffects.success,
    borderWidth: 2,
    borderColor: colors.success,
  },

  error: {
    ...glowEffects.error,
    borderWidth: 2,
    borderColor: colors.error,
  },

  // Subtle focus for cards/containers
  subtle: {
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.focusRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
};

// ============================================================================
// ACTIVE/SELECTED STATES
// ============================================================================

/**
 * Active/selected states for toggles, tabs, and selections
 */
export const activeStates = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...elevation.level1,
  },

  secondary: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    ...elevation.level1,
  },

  success: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    ...elevation.level1,
  },

  // Subtle active (for tabs, chips)
  subtle: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },

  // Outline active (for outline buttons)
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
  },
};

// ============================================================================
// DISABLED STATES
// ============================================================================

/**
 * Disabled states for non-interactive elements
 */
export const disabledStates = {
  button: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },

  text: {
    color: colors.disabledText,
    opacity: 0.5,
  },

  container: {
    backgroundColor: colors.disabled,
    borderColor: colors.border,
    opacity: 0.5,
  },
};

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Loading states for async operations
 */
export const loadingStates = {
  button: {
    opacity: 0.7,
  },

  overlay: {
    backgroundColor: colors.overlayLight,
  },

  spinner: {
    primary: colors.primary,
    secondary: colors.textLight,
    white: colors.textWhite,
  },
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Animation timing presets for consistent motion
 */
export const animationTimings = {
  instant: 0,        // Instant feedback
  fast: 150,         // Quick interactions (press, hover)
  normal: 250,       // Standard transitions
  slow: 350,         // Emphasis animations
  glacial: 500,      // Deliberate, dramatic animations
};

/**
 * Spring animation configs for natural motion
 */
export const springConfigs = {
  // Bouncy spring for playful interactions
  bouncy: {
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  },

  // Smooth spring for elegant transitions
  smooth: {
    tension: 280,
    friction: 20,
    useNativeDriver: true,
  },

  // Stiff spring for quick, snappy feedback
  snappy: {
    tension: 400,
    friction: 15,
    useNativeDriver: true,
  },

  // Gentle spring for subtle movements
  gentle: {
    tension: 180,
    friction: 25,
    useNativeDriver: true,
  },
};

/**
 * Timing animation configs
 */
export const timingConfigs = {
  fast: {
    duration: animationTimings.fast,
    useNativeDriver: true,
  },

  normal: {
    duration: animationTimings.normal,
    useNativeDriver: true,
  },

  slow: {
    duration: animationTimings.slow,
    useNativeDriver: true,
  },
};

// ============================================================================
// INTERACTION HELPERS
// ============================================================================

/**
 * Creates a press animation
 * Returns animated values for smooth press feedback
 */
export const createPressAnimation = (
  scale: Animated.Value,
  duration: number = animationTimings.fast
) => ({
  pressIn: () => {
    Animated.timing(scale, {
      toValue: 0.97,
      duration,
      useNativeDriver: true,
    }).start();
  },
  pressOut: () => {
    Animated.spring(scale, {
      toValue: 1,
      ...springConfigs.smooth,
    }).start();
  },
});

/**
 * Creates a glow pulse animation
 * For emphasis or attention-grabbing
 */
export const createGlowPulse = (
  opacity: Animated.Value,
  duration: number = 1000
) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Creates a scale bounce animation
 * For playful feedback (correct answers, achievements)
 */
export const createScaleBounce = (
  scale: Animated.Value,
  targetScale: number = 1.1
) => {
  return Animated.sequence([
    Animated.spring(scale, {
      toValue: targetScale,
      ...springConfigs.bouncy,
    }),
    Animated.spring(scale, {
      toValue: 1,
      ...springConfigs.bouncy,
    }),
  ]);
};

/**
 * Creates a shimmer animation
 * For loading states or highlighting new content
 */
export const createShimmer = (
  translateX: Animated.Value,
  width: number
) => {
  return Animated.loop(
    Animated.timing(translateX, {
      toValue: width,
      duration: 1500,
      useNativeDriver: true,
    })
  );
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PressStateVariant = keyof typeof pressStates;
export type FocusStateVariant = keyof typeof focusStates;
export type ActiveStateVariant = keyof typeof activeStates;
