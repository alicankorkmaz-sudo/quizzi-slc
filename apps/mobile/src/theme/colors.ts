/**
 * Quizzi Color Palette
 * Enhanced with vibrant, emotional colors and visual depth
 * Optimized for mobile readability with high contrast and tactile feel
 */

export const colors = {
  // ============================================================================
  // PRIMARY BRAND COLORS - Vibrant and energetic
  // ============================================================================
  primary: '#6C5CE7',           // Main brand purple
  primaryLight: '#A29BFE',      // Light variant
  primaryDark: '#5F4DD1',       // Dark variant
  primaryVibrant: '#7C6EF2',    // More saturated for CTAs
  primaryGlow: 'rgba(108, 92, 231, 0.4)', // Glow effect

  // Secondary - Warm, inviting accent
  secondary: '#FF6B9D',         // Warm pink
  secondaryLight: '#FFB3CC',    // Light pink
  secondaryDark: '#E85C8A',     // Dark pink
  secondaryGlow: 'rgba(255, 107, 157, 0.4)', // Glow effect

  // ============================================================================
  // CATEGORY COLORS - High contrast, vibrant
  // ============================================================================
  generalKnowledge: '#FF6B9D',  // Warm pink
  geography: '#4ECDC4',         // Turquoise
  science: '#95E1D3',           // Mint
  popCulture: '#FFE66D',        // Sunny yellow
  sports: '#FF6B35',            // Vibrant orange

  // ============================================================================
  // RANK TIER COLORS - Metallic with depth
  // ============================================================================
  bronze: '#CD7F32',
  bronzeGlow: 'rgba(205, 127, 50, 0.3)',
  silver: '#C0C0C0',
  silverGlow: 'rgba(192, 192, 192, 0.3)',
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.4)',
  platinum: '#E5E4E2',
  platinumGlow: 'rgba(229, 228, 226, 0.3)',
  diamond: '#B9F2FF',
  diamondGlow: 'rgba(185, 242, 255, 0.4)',

  // ============================================================================
  // UI SURFACES - Layered elevation
  // ============================================================================
  background: '#F8F9FA',        // App background
  surface: '#FFFFFF',           // Cards, modals (elevation 1)
  surfaceElevated: '#FFFFFF',   // Elevated cards (elevation 2)
  surfaceDark: '#1A1A2E',       // Dark mode surface

  // ============================================================================
  // TEXT COLORS - High contrast
  // ============================================================================
  text: '#2D3436',              // Primary text (dark)
  textLight: '#636E72',         // Secondary text (medium)
  textMuted: '#95A5A6',         // Tertiary text (light)
  textWhite: '#FFFFFF',         // White text on dark backgrounds

  // ============================================================================
  // STATUS COLORS - Emotional, warm tones
  // ============================================================================
  success: '#00D68F',           // Vibrant green (more saturated)
  successLight: '#5EEAD4',      // Light success
  successGlow: 'rgba(0, 214, 143, 0.3)', // Success glow

  error: '#FF3B57',             // Vibrant red (warmer)
  errorLight: '#FF6B82',        // Light error
  errorGlow: 'rgba(255, 59, 87, 0.3)', // Error glow

  warning: '#FDCB6E',           // Warm yellow
  warningLight: '#FFE5A3',      // Light warning
  warningGlow: 'rgba(253, 203, 110, 0.3)', // Warning glow

  info: '#74B9FF',              // Sky blue
  infoLight: '#A8D5FF',         // Light info
  infoGlow: 'rgba(116, 185, 255, 0.3)', // Info glow

  // ============================================================================
  // INTERACTIVE STATES - Clear feedback
  // ============================================================================
  // Hover states (slightly lighter/brighter)
  primaryHover: '#7D6EF7',
  secondaryHover: '#FF7DAA',
  successHover: '#00E5A0',
  errorHover: '#FF4D68',

  // Pressed states (slightly darker)
  primaryPressed: '#5B4DC0',
  secondaryPressed: '#E85C8A',
  successPressed: '#00C07E',
  errorPressed: '#E6364D',

  // Focus states (with glow)
  focusRing: 'rgba(108, 92, 231, 0.5)',
  focusRingSecondary: 'rgba(255, 107, 157, 0.5)',

  // ============================================================================
  // BORDERS & DIVIDERS
  // ============================================================================
  border: '#E1E8ED',            // Default border
  borderLight: '#F1F3F5',       // Light border
  borderMedium: '#D1D8DD',      // Medium border
  divider: 'rgba(0, 0, 0, 0.08)', // Subtle divider

  // ============================================================================
  // SHADOWS - Platform-optimized
  // ============================================================================
  shadow: 'rgba(0, 0, 0, 0.1)',       // Default shadow
  shadowMedium: 'rgba(0, 0, 0, 0.15)', // Medium shadow
  shadowDark: 'rgba(0, 0, 0, 0.25)',   // Dark shadow

  // Colored shadows for brand elements
  shadowPrimary: 'rgba(108, 92, 231, 0.2)',
  shadowSecondary: 'rgba(255, 107, 157, 0.2)',
  shadowSuccess: 'rgba(0, 214, 143, 0.2)',
  shadowError: 'rgba(255, 59, 87, 0.2)',

  // ============================================================================
  // OVERLAYS & BACKDROPS
  // ============================================================================
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)',  // Light overlay
  overlayDark: 'rgba(0, 0, 0, 0.7)',   // Dark overlay
  scrim: 'rgba(0, 0, 0, 0.6)',         // Bottom sheet scrim

  // ============================================================================
  // DISABLED STATES
  // ============================================================================
  disabled: '#DFE6E9',          // Disabled background
  disabledText: '#B2BEC3',      // Disabled text

  // ============================================================================
  // MATCH UI - High contrast
  // ============================================================================
  player1: '#6C5CE7',           // Player 1 (primary)
  player2: '#FF6B9D',           // Player 2 (secondary)
  correct: '#00D68F',           // Correct answer (vibrant green)
  incorrect: '#FF3B57',         // Incorrect answer (vibrant red)
};

/**
 * Gradient definitions for visual depth
 * Use with LinearGradient from expo-linear-gradient
 */
export const gradients = {
  // Primary brand gradients
  primary: ['#7C6EF2', '#6C5CE7', '#5F4DD1'],
  primarySubtle: ['#A29BFE', '#6C5CE7'],
  primaryVertical: {
    colors: ['#7C6EF2', '#6C5CE7'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Secondary gradients
  secondary: ['#FFB3CC', '#FF6B9D', '#E85C8A'],
  secondarySubtle: ['#FFB3CC', '#FF6B9D'],

  // Success gradients (for positive feedback)
  success: ['#5EEAD4', '#00D68F'],
  successGlow: ['rgba(94, 234, 212, 0.4)', 'rgba(0, 214, 143, 0.1)'],

  // Error gradients
  error: ['#FF6B82', '#FF3B57'],
  errorGlow: ['rgba(255, 107, 130, 0.4)', 'rgba(255, 59, 87, 0.1)'],

  // Rank gradients
  gold: ['#FFD700', '#FFA500'],
  goldShine: ['#FFED4E', '#FFD700', '#FFA500'],
  diamond: ['#B9F2FF', '#7DD3FC', '#38BDF8'],

  // Background gradients
  surfaceGlow: ['rgba(108, 92, 231, 0.05)', 'rgba(255, 255, 255, 0)'],
  shimmer: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0)'],
};

export type ColorKey = keyof typeof colors;
export type GradientKey = keyof typeof gradients;
