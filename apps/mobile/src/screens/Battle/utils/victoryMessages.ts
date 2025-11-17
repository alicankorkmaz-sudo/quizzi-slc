import { getSpeedTier, formatResponseTime } from '@quizzi/types';

export interface VictoryMessageConfig {
  emoji: string;
  title: string;
  color: string;
}

/**
 * Get context-aware victory message based on match circumstances
 * Priority order: Match Point > Streak > Clutch > Speed Tier
 *
 * @param winningTime - Player's winning response time in ms (for final round)
 * @param consecutiveWins - Number of consecutive rounds won in this match
 * @param isMatchPoint - Whether this was a match point round
 * @returns Victory message configuration with emoji, title, and color
 */
export function getVictoryMessage(
  winningTime: number | undefined,
  consecutiveWins: number,
  isMatchPoint: boolean
): VictoryMessageConfig {
  // Priority 1: Match Point (winning round in a close match)
  if (isMatchPoint && winningTime !== undefined) {
    return {
      emoji: '🏆',
      title: `MATCH POINT! ${formatResponseTime(winningTime)}`,
      color: '#FFD700',
    };
  }

  // Priority 2: Streak (3+ consecutive rounds won)
  if (consecutiveWins >= 3 && winningTime !== undefined) {
    return {
      emoji: '🔥',
      title: `ON FIRE! ${formatResponseTime(winningTime)}`,
      color: '#FF6B35',
    };
  }

  // Priority 3: Clutch (slow win >8s)
  if (winningTime !== undefined && winningTime > 8000) {
    return {
      emoji: '⏰',
      title: `CLUTCH! ${formatResponseTime(winningTime)}`,
      color: '#FF9800',
    };
  }

  // Priority 4: Speed Tier (default celebration based on speed)
  if (winningTime !== undefined) {
    const speedTier = getSpeedTier(winningTime);
    return {
      emoji: speedTier.emoji,
      title: `${speedTier.label} ${formatResponseTime(winningTime)}`,
      color: speedTier.tier === 'lightning' ? '#FFD700' : '#4CAF50',
    };
  }

  // Fallback: Generic victory
  return {
    emoji: '🏆',
    title: 'Victory!',
    color: '#4CAF50',
  };
}
