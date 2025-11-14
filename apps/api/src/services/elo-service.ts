import { calculateEloChange } from '@quizzi/utils';

/**
 * ELO Service
 *
 * Handles rank point calculations and tier assignments after matches.
 * Uses shared calculateEloChange utility from @quizzi/utils.
 */

export enum RankTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export interface RankUpdate {
  playerId: string;
  previousRank: number;
  newRank: number;
  rankChange: number;
  previousTier: RankTier;
  newTier: RankTier;
  tierChanged: boolean;
}

export interface MatchResult {
  winnerId: string;
  loserId: string;
  winnerRankPoints: number;
  loserRankPoints: number;
  isDraw?: boolean; // For future tie support
}

export class EloService {
  private readonly DEFAULT_STARTING_RANK = 1000;
  private readonly K_FACTOR = 32;

  // Tier boundaries
  private readonly TIER_THRESHOLDS = {
    [RankTier.BRONZE]: 0,
    [RankTier.SILVER]: 1200,
    [RankTier.GOLD]: 1600,
    [RankTier.PLATINUM]: 2000,
    [RankTier.DIAMOND]: 2400,
  };

  /**
   * Calculate rank updates for both players after a match
   */
  calculateRankUpdates(result: MatchResult): {
    winner: RankUpdate;
    loser: RankUpdate;
  } {
    const { winnerId, loserId, winnerRankPoints, loserRankPoints, isDraw = false } = result;

    // Calculate ELO changes
    const winnerResult = isDraw ? 0.5 : 1;
    const loserResult = isDraw ? 0.5 : 0;

    const winnerChange = calculateEloChange(
      winnerRankPoints,
      loserRankPoints,
      winnerResult,
      this.K_FACTOR
    );

    const loserChange = calculateEloChange(
      loserRankPoints,
      winnerRankPoints,
      loserResult,
      this.K_FACTOR
    );

    // Calculate new ranks
    const winnerNewRank = Math.max(0, winnerRankPoints + winnerChange);
    const loserNewRank = Math.max(0, loserRankPoints + loserChange);

    // Determine tiers
    const winnerPreviousTier = this.getTier(winnerRankPoints);
    const winnerNewTier = this.getTier(winnerNewRank);
    const loserPreviousTier = this.getTier(loserRankPoints);
    const loserNewTier = this.getTier(loserNewRank);

    return {
      winner: {
        playerId: winnerId,
        previousRank: winnerRankPoints,
        newRank: winnerNewRank,
        rankChange: winnerChange,
        previousTier: winnerPreviousTier,
        newTier: winnerNewTier,
        tierChanged: winnerPreviousTier !== winnerNewTier,
      },
      loser: {
        playerId: loserId,
        previousRank: loserRankPoints,
        newRank: loserNewRank,
        rankChange: loserChange,
        previousTier: loserPreviousTier,
        newTier: loserNewTier,
        tierChanged: loserPreviousTier !== loserNewTier,
      },
    };
  }

  /**
   * Get rank tier based on rank points
   */
  getTier(rankPoints: number): RankTier {
    if (rankPoints >= this.TIER_THRESHOLDS[RankTier.DIAMOND]) return RankTier.DIAMOND;
    if (rankPoints >= this.TIER_THRESHOLDS[RankTier.PLATINUM]) return RankTier.PLATINUM;
    if (rankPoints >= this.TIER_THRESHOLDS[RankTier.GOLD]) return RankTier.GOLD;
    if (rankPoints >= this.TIER_THRESHOLDS[RankTier.SILVER]) return RankTier.SILVER;
    return RankTier.BRONZE;
  }

  /**
   * Get tier boundaries (for UI display)
   */
  getTierBoundaries(): Record<RankTier, { min: number; max: number | null }> {
    return {
      [RankTier.BRONZE]: {
        min: this.TIER_THRESHOLDS[RankTier.BRONZE],
        max: this.TIER_THRESHOLDS[RankTier.SILVER] - 1,
      },
      [RankTier.SILVER]: {
        min: this.TIER_THRESHOLDS[RankTier.SILVER],
        max: this.TIER_THRESHOLDS[RankTier.GOLD] - 1,
      },
      [RankTier.GOLD]: {
        min: this.TIER_THRESHOLDS[RankTier.GOLD],
        max: this.TIER_THRESHOLDS[RankTier.PLATINUM] - 1,
      },
      [RankTier.PLATINUM]: {
        min: this.TIER_THRESHOLDS[RankTier.PLATINUM],
        max: this.TIER_THRESHOLDS[RankTier.DIAMOND] - 1,
      },
      [RankTier.DIAMOND]: {
        min: this.TIER_THRESHOLDS[RankTier.DIAMOND],
        max: null, // No upper limit
      },
    };
  }

  /**
   * Get starting rank for new players
   */
  getStartingRank(): number {
    return this.DEFAULT_STARTING_RANK;
  }

  /**
   * Calculate expected win probability (for display purposes)
   */
  getExpectedWinProbability(playerRank: number, opponentRank: number): number {
    const rankDiff = opponentRank - playerRank;
    return 1 / (1 + Math.pow(10, rankDiff / 400));
  }
}
