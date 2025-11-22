import { TextStyle } from 'react-native';

/**
 * Typography System for Quizzi
 *
 * This system provides:
 * - Consistent font scales across the app
 * - Semantic text styles for common use cases
 * - Easy integration with custom fonts
 * - TypeScript support for type safety
 */

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

/**
 * Font families - Update these when adding custom fonts
 * Default: System fonts (San Francisco on iOS, Roboto on Android)
 */
export const fontFamilies = {
  regular: undefined, // Will use system default. Replace with 'YourFont-Regular'
  medium: undefined,  // Will use system default. Replace with 'YourFont-Medium'
  semiBold: undefined, // Will use system default. Replace with 'YourFont-SemiBold'
  bold: undefined,    // Will use system default. Replace with 'YourFont-Bold'
} as const;

/**
 * Font weights - Standard numeric weights
 * Use these instead of string weights for better cross-platform consistency
 */
export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

// ============================================================================
// TYPE SCALE
// ============================================================================

/**
 * Font size scale - Based on current app usage
 * Follows a consistent scale for visual hierarchy
 */
export const fontSizes = {
  tiny: 10,    // Badges, micro-labels
  xs: 12,      // Labels, hints, captions
  sm: 14,      // Secondary text, round counter
  base: 15,    // Button labels, standard text
  md: 16,      // Username, primary text
  lg: 17,      // Questions, important content
  xl: 22,      // Large icons, emphasis
  '2xl': 26,   // Momentum text
  '3xl': 32,   // Score numbers
  '4xl': 48,   // Large headings
  '5xl': 64,   // Combo multiplier, hero text
} as const;

/**
 * Line heights - Relative to font size
 * Provides comfortable reading and visual balance
 */
export const lineHeights = {
  tight: 1.2,   // For large headings
  snug: 1.35,   // For scores and numbers
  normal: 1.5,  // For body text
  relaxed: 1.6, // For questions and important text
} as const;

/**
 * Letter spacing - For specific use cases
 * Measured in pixels
 */
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// ============================================================================
// SEMANTIC TEXT STYLES
// ============================================================================

/**
 * Base text style creator
 * Helper function to create consistent text styles
 */
const createTextStyle = (
  size: number,
  weight: TextStyle['fontWeight'],
  lineHeight?: number,
  letterSpacingValue?: number,
  fontFamily?: string
): TextStyle => ({
  fontSize: size,
  fontWeight: weight,
  ...(lineHeight && { lineHeight: size * lineHeight }),
  ...(letterSpacingValue && { letterSpacing: letterSpacingValue }),
  ...(fontFamily && { fontFamily }),
});

/**
 * Typography styles organized by purpose
 */
export const typography = {
  // ============================================================================
  // HEADINGS
  // ============================================================================
  h1: createTextStyle(fontSizes['5xl'], fontWeights.extraBold, lineHeights.tight, undefined, fontFamilies.bold),
  h2: createTextStyle(fontSizes['4xl'], fontWeights.bold, lineHeights.tight, undefined, fontFamilies.bold),
  h3: createTextStyle(fontSizes['3xl'], fontWeights.bold, lineHeights.snug, undefined, fontFamilies.bold),
  h4: createTextStyle(fontSizes['2xl'], fontWeights.bold, lineHeights.snug, undefined, fontFamilies.bold),
  h5: createTextStyle(fontSizes.xl, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),
  h6: createTextStyle(fontSizes.lg, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),

  // ============================================================================
  // BODY TEXT
  // ============================================================================
  bodyLarge: createTextStyle(fontSizes.lg, fontWeights.regular, lineHeights.relaxed, undefined, fontFamilies.regular),
  body: createTextStyle(fontSizes.md, fontWeights.regular, lineHeights.normal, undefined, fontFamilies.regular),
  bodyMedium: createTextStyle(fontSizes.md, fontWeights.medium, lineHeights.normal, undefined, fontFamilies.medium),
  bodySemiBold: createTextStyle(fontSizes.md, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),
  bodySmall: createTextStyle(fontSizes.base, fontWeights.regular, lineHeights.normal, undefined, fontFamilies.regular),

  // ============================================================================
  // SPECIAL PURPOSE
  // ============================================================================

  // Scores & Numbers
  scoreDisplay: createTextStyle(fontSizes['3xl'], fontWeights.bold, lineHeights.snug, undefined, fontFamilies.bold),
  comboMultiplier: createTextStyle(fontSizes['5xl'], fontWeights.extraBold, lineHeights.tight, undefined, fontFamilies.bold),
  momentumText: createTextStyle(fontSizes['2xl'], fontWeights.bold, lineHeights.snug, undefined, fontFamilies.bold),

  // Questions & Answers
  questionText: createTextStyle(fontSizes.lg, fontWeights.semiBold, lineHeights.relaxed, undefined, fontFamilies.semiBold),
  answerButton: createTextStyle(fontSizes.base, fontWeights.medium, lineHeights.normal, undefined, fontFamilies.medium),
  answerButtonLarge: createTextStyle(fontSizes.md, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),

  // UI Elements
  username: createTextStyle(fontSizes.md, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),
  roundCounter: createTextStyle(fontSizes.sm, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),
  timerText: createTextStyle(fontSizes.sm, fontWeights.bold, lineHeights.normal, undefined, fontFamilies.bold),

  // Badges & Labels
  badge: createTextStyle(fontSizes.tiny, fontWeights.bold, lineHeights.normal, letterSpacing.wide, fontFamilies.bold),
  labelSmall: createTextStyle(fontSizes.xs, fontWeights.medium, lineHeights.normal, undefined, fontFamilies.medium),
  labelLarge: createTextStyle(fontSizes.sm, fontWeights.semiBold, lineHeights.normal, undefined, fontFamilies.semiBold),

  // VS & Dividers
  vsDivider: createTextStyle(fontSizes.sm, fontWeights.bold, lineHeights.normal, letterSpacing.widest, fontFamilies.bold),

  // Captions & Hints
  caption: createTextStyle(fontSizes.xs, fontWeights.regular, lineHeights.normal, undefined, fontFamilies.regular),
  captionMedium: createTextStyle(fontSizes.xs, fontWeights.medium, lineHeights.normal, undefined, fontFamilies.medium),
  hint: createTextStyle(fontSizes.tiny, fontWeights.regular, lineHeights.normal, undefined, fontFamilies.regular),

  // ============================================================================
  // BUTTONS
  // ============================================================================
  buttonPrimary: createTextStyle(fontSizes.md, fontWeights.semiBold, undefined, undefined, fontFamilies.semiBold),
  buttonSecondary: createTextStyle(fontSizes.base, fontWeights.medium, undefined, undefined, fontFamilies.medium),
  buttonSmall: createTextStyle(fontSizes.sm, fontWeights.medium, undefined, undefined, fontFamilies.medium),

  // ============================================================================
  // MATCH RESULT
  // ============================================================================
  matchResultTitle: createTextStyle(fontSizes['2xl'], fontWeights.bold, lineHeights.tight, undefined, fontFamilies.bold),
  matchResultSubtitle: createTextStyle(fontSizes.md, fontWeights.medium, lineHeights.normal, undefined, fontFamilies.medium),
  rankChange: createTextStyle(fontSizes.lg, fontWeights.bold, lineHeights.normal, undefined, fontFamilies.bold),
} as const;

// ============================================================================
// DYNAMIC TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Animation-ready text style modifier
 * Use this to create styles that will be animated (scale, color, etc.)
 *
 * @example
 * const animatedScoreStyle = createAnimatableText(typography.scoreDisplay);
 */
export const createAnimatableText = (baseStyle: TextStyle): TextStyle => ({
  ...baseStyle,
  // Ensure these properties are set for smooth animations
  includeFontPadding: false, // Android: prevents extra padding during scale animations
  textAlignVertical: 'center', // Android: keeps text centered during animations
});

/**
 * Get font style by weight
 * Helper to apply correct font family based on weight when using custom fonts
 *
 * @example
 * <Text style={getFontStyle('bold')}>Bold Text</Text>
 */
export const getFontStyle = (weight: keyof typeof fontWeights): TextStyle => {
  const numericWeight = fontWeights[weight];

  // Map weight to font family (customize when adding custom fonts)
  let fontFamily = fontFamilies.regular;

  if (numericWeight === '500') {
    fontFamily = fontFamilies.medium;
  } else if (numericWeight === '600') {
    fontFamily = fontFamilies.semiBold;
  } else if (numericWeight === '700' || numericWeight === '800') {
    fontFamily = fontFamilies.bold;
  }

  return {
    fontWeight: numericWeight,
    ...(fontFamily && { fontFamily }),
  };
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
export type TypographyStyle = keyof typeof typography;
