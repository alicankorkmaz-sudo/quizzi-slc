/**
 * Quizzi Color Palette
 * Optimized for mobile readability and SLC scope
 */

export const colors = {
  // Primary brand colors
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5F4DD1',

  // Category colors
  generalKnowledge: '#FF6B9D',
  geography: '#4ECDC4',
  science: '#95E1D3',
  popCulture: '#FFE66D',
  sports: '#FF6B35',

  // Rank tier colors
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',

  // UI colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceDark: '#1A1A2E',

  // Text colors
  text: '#2D3436',
  textLight: '#636E72',
  textWhite: '#FFFFFF',

  // Status colors
  success: '#00B894',
  error: '#D63031',
  warning: '#FDCB6E',
  info: '#74B9FF',

  // State colors
  disabled: '#DFE6E9',
  border: '#E1E8ED',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Match UI
  player1: '#6C5CE7',
  player2: '#FF6B9D',
  correct: '#00B894',
  incorrect: '#D63031',
};

export type ColorKey = keyof typeof colors;
