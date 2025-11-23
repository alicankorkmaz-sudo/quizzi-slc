import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

/**
 * Spacing system for consistent layout
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius scale for visual depth
 */
export const borderRadius = {
  xs: 4,   // Small elements, badges
  sm: 8,   // Buttons, inputs
  md: 12,  // Cards, modals
  lg: 16,  // Large cards, sheets
  xl: 20,  // Extra large containers
  xxl: 24, // Full-screen modals
  round: 999, // Fully rounded (pills, avatars)
};

// ============================================================================
// ELEVATION SYSTEM - Platform-specific shadow rendering
// ============================================================================

/**
 * Elevation levels for consistent depth hierarchy
 *
 * Level 0: Flat (no shadow)
 * Level 1: Slightly raised (cards, buttons at rest)
 * Level 2: Raised (elevated cards, floating action button)
 * Level 3: High (dropdown menus, tooltips)
 * Level 4: Very high (modal overlays)
 * Level 5: Maximum (important modals, dialogs)
 */

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Creates platform-appropriate shadow styles
 * iOS uses shadow properties, Android uses elevation
 */
const createShadow = (
  offsetHeight: number,
  radius: number,
  opacity: number,
  elevation: number,
  color: string = '#000'
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetHeight },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

/**
 * Standard elevation levels with neutral shadows
 */
export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: createShadow(1, 3, 0.1, 2),   // Subtle - cards at rest
  level2: createShadow(2, 6, 0.12, 4),  // Medium - elevated cards
  level3: createShadow(4, 10, 0.15, 8), // High - dropdowns, tooltips
  level4: createShadow(8, 16, 0.18, 12), // Very high - modals
  level5: createShadow(12, 24, 0.22, 16), // Maximum - important dialogs
};

/**
 * Legacy shadows (for backwards compatibility)
 * @deprecated Use elevation system instead
 */
export const shadows = {
  sm: elevation.level1,
  md: elevation.level2,
  lg: elevation.level3,
};

/**
 * Colored shadows for brand elements
 * Creates depth with brand colors instead of just black
 */
export const coloredShadows = {
  // Primary brand shadows
  primary: {
    light: createShadow(2, 6, 0.15, 4, colors.shadowPrimary),
    medium: createShadow(4, 10, 0.2, 8, colors.shadowPrimary),
    strong: createShadow(8, 16, 0.25, 12, colors.shadowPrimary),
  },

  // Secondary shadows
  secondary: {
    light: createShadow(2, 6, 0.15, 4, colors.shadowSecondary),
    medium: createShadow(4, 10, 0.2, 8, colors.shadowSecondary),
    strong: createShadow(8, 16, 0.25, 12, colors.shadowSecondary),
  },

  // Success shadows
  success: {
    light: createShadow(2, 6, 0.15, 4, colors.shadowSuccess),
    medium: createShadow(4, 10, 0.2, 8, colors.shadowSuccess),
    strong: createShadow(8, 16, 0.25, 12, colors.shadowSuccess),
  },

  // Error shadows
  error: {
    light: createShadow(2, 6, 0.15, 4, colors.shadowError),
    medium: createShadow(4, 10, 0.2, 8, colors.shadowError),
    strong: createShadow(8, 16, 0.25, 12, colors.shadowError),
  },
};

// ============================================================================
// GLOW EFFECTS - Subtle lighting for focus states
// ============================================================================

/**
 * Glow effects for focused/active states
 * Creates a soft halo around interactive elements
 */
export const glowEffects = {
  // Primary glow (for main CTAs)
  primary: {
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0, // No elevation, just glow
  },

  // Secondary glow
  secondary: {
    shadowColor: colors.secondaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
  },

  // Success glow (for correct answers)
  success: {
    shadowColor: colors.successGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 0,
  },

  // Error glow (for incorrect answers)
  error: {
    shadowColor: colors.errorGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 0,
  },

  // Focus glow (keyboard navigation)
  focus: {
    shadowColor: colors.focusRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
  },
};

// ============================================================================
// BORDER GLOW EFFECTS - Subtle borders with glow
// ============================================================================

/**
 * Border glow combines a solid border with a soft outer glow
 * Perfect for focused input fields and interactive elements
 */
export const borderGlow = {
  primary: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...glowEffects.primary,
  },

  secondary: {
    borderWidth: 2,
    borderColor: colors.secondary,
    ...glowEffects.secondary,
  },

  success: {
    borderWidth: 2,
    borderColor: colors.success,
    ...glowEffects.success,
  },

  error: {
    borderWidth: 2,
    borderColor: colors.error,
    ...glowEffects.error,
  },

  focus: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...glowEffects.focus,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines elevation with colored shadow
 * Useful for buttons that need both depth and brand color
 */
export const createElevatedBrandShadow = (
  level: 1 | 2 | 3 | 4 | 5,
  color: string
): ShadowStyle => {
  const baseElevation = elevation[`level${level}`];
  return {
    ...baseElevation,
    shadowColor: color,
  };
};

/**
 * Creates a custom glow effect with any color
 */
export const createCustomGlow = (
  color: string,
  radius: number = 12,
  opacity: number = 1
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: 0,
});

/**
 * Press animation shadow (slightly reduced for pressed state)
 * Use this when animating button press
 */
export const createPressedShadow = (baseElevation: ShadowStyle): ShadowStyle => ({
  ...baseElevation,
  shadowOffset: {
    width: 0,
    height: Math.max(1, baseElevation.shadowOffset.height / 2),
  },
  shadowRadius: Math.max(2, baseElevation.shadowRadius / 2),
  elevation: Math.max(1, baseElevation.elevation / 2),
});
