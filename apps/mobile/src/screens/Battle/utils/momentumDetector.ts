/**
 * Momentum Indicator Detection (Story 9.7)
 *
 * Detects dramatic match scenarios for special celebration banners:
 * - Dominating: 3+ consecutive wins
 * - Comeback: Winning after being behind
 * - Flawless Victory: Winning without losing a round
 */

export type MomentumType = 'dominating' | 'comeback' | 'flawless' | null;

export interface MomentumConfig {
  type: MomentumType;
  emoji: string;
  title: string;
  color: string;
}

export interface MomentumDetectionInput {
  playerScore: number;
  opponentScore: number;
  consecutivePlayerWins: number;
  wasBehind: boolean;
  isPlayerWinner: boolean;
  matchEnded: boolean;
}

/**
 * Detects momentum scenarios during round transitions
 * Priority: Flawless > Comeback > Dominating (only show highest priority)
 */
export function detectMomentum(input: MomentumDetectionInput): MomentumConfig | null {
  const {
    playerScore,
    opponentScore,
    consecutivePlayerWins,
    wasBehind,
    isPlayerWinner,
    matchEnded,
  } = input;

  // Only detect momentum when player wins
  if (!isPlayerWinner) {
    return null;
  }

  // FLAWLESS VICTORY: Match ended and opponent has 0 points
  // Highest priority - only shown at match end
  if (matchEnded && opponentScore === 0) {
    return {
      type: 'flawless',
      emoji: '🏆',
      title: 'FLAWLESS VICTORY!',
      color: '#FFD700', // Gold
    };
  }

  // COMEBACK: Player won after being behind at some point
  // Second priority - can trigger during match or at end
  if (wasBehind && playerScore > opponentScore) {
    return {
      type: 'comeback',
      emoji: '💥',
      title: 'EPIC COMEBACK!',
      color: '#FF6B35', // Orange-red
    };
  }

  // DOMINATING: 3+ consecutive wins
  // Third priority - triggers during match
  if (consecutivePlayerWins >= 3 && !matchEnded) {
    return {
      type: 'dominating',
      emoji: '🔥',
      title: 'DOMINATING!',
      color: '#FF4757', // Red
    };
  }

  return null;
}

/**
 * Determines if momentum indicator should be shown for a given round
 * Called after round ends and transition completes
 */
export function shouldShowMomentum(input: MomentumDetectionInput): boolean {
  const momentum = detectMomentum(input);
  return momentum !== null;
}
