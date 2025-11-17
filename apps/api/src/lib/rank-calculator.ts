/**
 * Rank Calculator Utility
 *
 * Calculates rank tier based on ELO (rankPoints)
 * These thresholds match the mobile app's RankDisplay component
 */

import type { RankTier } from '../../../../packages/types/src';

export interface RankTierThreshold {
  tier: RankTier;
  minPoints: number;
  maxPoints: number;
}

export const RANK_TIERS: RankTierThreshold[] = [
  { tier: 'bronze', minPoints: 0, maxPoints: 1199 },
  { tier: 'silver', minPoints: 1200, maxPoints: 1599 },
  { tier: 'gold', minPoints: 1600, maxPoints: 1999 },
  { tier: 'platinum', minPoints: 2000, maxPoints: 2399 },
  { tier: 'diamond', minPoints: 2400, maxPoints: 999999 },
];

/**
 * Calculate rank tier from rank points (ELO)
 * @param rankPoints - Player's current ELO rating
 * @returns The corresponding rank tier
 */
export function calculateRankTier(rankPoints: number): RankTier {
  // Ensure rankPoints is at least 0
  const points = Math.max(0, rankPoints);

  // Find the appropriate tier
  for (const tierThreshold of RANK_TIERS) {
    if (points >= tierThreshold.minPoints && points <= tierThreshold.maxPoints) {
      return tierThreshold.tier;
    }
  }

  // Default to bronze if no match (shouldn't happen)
  return 'bronze';
}

/**
 * Get the next tier and points required
 * @param currentRankPoints - Player's current ELO rating
 * @returns Object with next tier info, or null if already at max tier
 */
export function getNextTierInfo(currentRankPoints: number): {
  nextTier: RankTier;
  pointsRequired: number;
  pointsToNext: number;
} | null {
  const currentTier = calculateRankTier(currentRankPoints);

  // Find current tier index
  const currentTierIndex = RANK_TIERS.findIndex(t => t.tier === currentTier);

  // If already at max tier (diamond)
  if (currentTierIndex === RANK_TIERS.length - 1) {
    return null;
  }

  const nextTierData = RANK_TIERS[currentTierIndex + 1];
  const pointsRequired = nextTierData.minPoints;
  const pointsToNext = pointsRequired - currentRankPoints;

  return {
    nextTier: nextTierData.tier,
    pointsRequired,
    pointsToNext: Math.max(0, pointsToNext),
  };
}

/**
 * Get progress percentage within current tier
 * @param rankPoints - Player's current ELO rating
 * @returns Progress as a number between 0 and 1
 */
export function getTierProgress(rankPoints: number): number {
  const currentTier = calculateRankTier(rankPoints);
  const tierData = RANK_TIERS.find(t => t.tier === currentTier);

  if (!tierData) return 0;

  // If max tier, return 100%
  if (currentTier === 'diamond') {
    return 1;
  }

  const tierRange = tierData.maxPoints - tierData.minPoints;
  const pointsInTier = rankPoints - tierData.minPoints;

  return Math.min(Math.max(pointsInTier / tierRange, 0), 1);
}
