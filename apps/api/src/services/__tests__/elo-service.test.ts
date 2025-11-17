import { describe, it, expect, beforeEach } from '@jest/globals';
import { EloService, RankTier } from '../elo-service';

/**
 * ELO Service Tests
 *
 * Tests rank calculations, tier assignments, and ELO math
 */

describe('EloService', () => {
  let eloService: EloService;

  beforeEach(() => {
    eloService = new EloService();
  });

  describe('Rank Tier Classification', () => {
    it('should classify Bronze tier correctly', () => {
      expect(eloService.getTier(0)).toBe(RankTier.BRONZE);
      expect(eloService.getTier(500)).toBe(RankTier.BRONZE);
      expect(eloService.getTier(1199)).toBe(RankTier.BRONZE);
    });

    it('should classify Silver tier correctly', () => {
      expect(eloService.getTier(1200)).toBe(RankTier.SILVER);
      expect(eloService.getTier(1400)).toBe(RankTier.SILVER);
      expect(eloService.getTier(1599)).toBe(RankTier.SILVER);
    });

    it('should classify Gold tier correctly', () => {
      expect(eloService.getTier(1600)).toBe(RankTier.GOLD);
      expect(eloService.getTier(1800)).toBe(RankTier.GOLD);
      expect(eloService.getTier(1999)).toBe(RankTier.GOLD);
    });

    it('should classify Platinum tier correctly', () => {
      expect(eloService.getTier(2000)).toBe(RankTier.PLATINUM);
      expect(eloService.getTier(2200)).toBe(RankTier.PLATINUM);
      expect(eloService.getTier(2399)).toBe(RankTier.PLATINUM);
    });

    it('should classify Diamond tier correctly', () => {
      expect(eloService.getTier(2400)).toBe(RankTier.DIAMOND);
      expect(eloService.getTier(3000)).toBe(RankTier.DIAMOND);
      expect(eloService.getTier(5000)).toBe(RankTier.DIAMOND);
    });
  });

  describe('Rank Updates - Equal Players', () => {
    it('should give winner +16 and loser -16 for equal rank', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1000,
        loserRankPoints: 1000,
      });

      expect(result.winner.rankChange).toBe(16);
      expect(result.loser.rankChange).toBe(-16);
      expect(result.winner.newRank).toBe(1016);
      expect(result.loser.newRank).toBe(984);
    });

    it('should maintain tier for small changes', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1000,
        loserRankPoints: 1000,
      });

      expect(result.winner.previousTier).toBe(RankTier.BRONZE);
      expect(result.winner.newTier).toBe(RankTier.BRONZE);
      expect(result.winner.tierChanged).toBe(false);
    });
  });

  describe('Rank Updates - Underdog Wins', () => {
    it('should give underdog more points for winning', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'underdog',
        loserId: 'favorite',
        winnerRankPoints: 1000,
        loserRankPoints: 1400,
      });

      // Underdog beating higher-rated player should gain more points
      expect(result.winner.rankChange).toBeGreaterThan(16);
      expect(result.loser.rankChange).toBeLessThan(-16);
    });

    it('should give significant points for major upset', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'underdog',
        loserId: 'favorite',
        winnerRankPoints: 1000,
        loserRankPoints: 2000,
      });

      // 1000-point difference upset
      expect(result.winner.rankChange).toBeGreaterThan(25);
    });
  });

  describe('Rank Updates - Favorite Wins', () => {
    it('should give favorite fewer points for expected win', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'favorite',
        loserId: 'underdog',
        winnerRankPoints: 1400,
        loserRankPoints: 1000,
      });

      // Favorite beating lower-rated player should gain fewer points
      expect(result.winner.rankChange).toBeLessThan(16);
      expect(result.winner.rankChange).toBeGreaterThan(0);
    });

    it('should give minimal points for crushing lower-rated player', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'favorite',
        loserId: 'underdog',
        winnerRankPoints: 2000,
        loserRankPoints: 1000,
      });

      // Large rank difference expected win - 1000 point gap results in 0 gain
      expect(result.winner.rankChange).toBeLessThan(1);
      expect(result.winner.rankChange).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tier Transitions', () => {
    it('should detect tier promotion', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1190, // Near Silver threshold
        loserRankPoints: 1190,
      });

      // Should promote to Silver
      expect(result.winner.previousTier).toBe(RankTier.BRONZE);
      expect(result.winner.newTier).toBe(RankTier.SILVER);
      expect(result.winner.tierChanged).toBe(true);
    });

    it('should detect tier demotion', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1210,
        loserRankPoints: 1210, // Near Bronze threshold
      });

      // Loser should demote to Bronze
      expect(result.loser.previousTier).toBe(RankTier.SILVER);
      expect(result.loser.newTier).toBe(RankTier.BRONZE);
      expect(result.loser.tierChanged).toBe(true);
    });

    it('should handle tier promotion near boundary', () => {
      // Equal match at 1199 gives +16, promoting to Silver (1215)
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1199,
        loserRankPoints: 1199,
      });

      // Should promote to Silver with standard K=32 (+16)
      expect(result.winner.newRank).toBe(1215);
      expect(result.winner.newTier).toBe(RankTier.SILVER);
      expect(result.winner.tierChanged).toBe(true);
    });
  });

  describe('Draw Scenarios', () => {
    it('should handle draws with equal rank', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1000,
        loserRankPoints: 1000,
        isDraw: true,
      });

      // Draw should result in no change
      expect(result.winner.rankChange).toBe(0);
      expect(result.loser.rankChange).toBe(0);
    });

    it('should transfer points from favorite to underdog in draw', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'favorite',
        loserId: 'underdog',
        winnerRankPoints: 1400,
        loserRankPoints: 1000,
        isDraw: true,
      });

      // Underdog gains, favorite loses (draw favors underdog)
      expect(result.winner.rankChange).toBeLessThan(0);
      expect(result.loser.rankChange).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should not allow negative rank', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1000,
        loserRankPoints: 10, // Very low rank
      });

      // Loser should not go below 0
      expect(result.loser.newRank).toBeGreaterThanOrEqual(0);
    });

    it('should handle extreme rank differences', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'underdog',
        loserId: 'favorite',
        winnerRankPoints: 500,
        loserRankPoints: 3000,
      });

      // Underdog should gain maximum points
      expect(result.winner.rankChange).toBeCloseTo(32, 0);
      expect(result.loser.rankChange).toBeCloseTo(-32, 0);
    });

    it('should be symmetric for equal players', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1500,
        loserRankPoints: 1500,
      });

      // Winner gain should equal loser loss
      expect(result.winner.rankChange).toBe(-result.loser.rankChange);
    });
  });

  describe('Starting Rank', () => {
    it('should return 1000 as starting rank', () => {
      expect(eloService.getStartingRank()).toBe(1000);
    });

    it('should start in Bronze tier', () => {
      const startingRank = eloService.getStartingRank();
      expect(eloService.getTier(startingRank)).toBe(RankTier.BRONZE);
    });
  });

  describe('Tier Boundaries', () => {
    it('should return correct tier boundaries', () => {
      const boundaries = eloService.getTierBoundaries();

      expect(boundaries[RankTier.BRONZE]).toEqual({ min: 0, max: 1199 });
      expect(boundaries[RankTier.SILVER]).toEqual({ min: 1200, max: 1599 });
      expect(boundaries[RankTier.GOLD]).toEqual({ min: 1600, max: 1999 });
      expect(boundaries[RankTier.PLATINUM]).toEqual({ min: 2000, max: 2399 });
      expect(boundaries[RankTier.DIAMOND]).toEqual({ min: 2400, max: null });
    });
  });

  describe('Win Probability', () => {
    it('should return 50% for equal players', () => {
      const probability = eloService.getExpectedWinProbability(1000, 1000);
      expect(probability).toBeCloseTo(0.5, 2);
    });

    it('should return >50% for higher-rated player', () => {
      const probability = eloService.getExpectedWinProbability(1400, 1000);
      expect(probability).toBeGreaterThan(0.5);
    });

    it('should return <50% for lower-rated player', () => {
      const probability = eloService.getExpectedWinProbability(1000, 1400);
      expect(probability).toBeLessThan(0.5);
    });

    it('should return ~91% for 400-point advantage', () => {
      const probability = eloService.getExpectedWinProbability(1400, 1000);
      expect(probability).toBeCloseTo(0.91, 1);
    });

    it('should approach 100% for massive advantage', () => {
      const probability = eloService.getExpectedWinProbability(3000, 1000);
      expect(probability).toBeGreaterThan(0.99);
    });

    it('should approach 0% for massive disadvantage', () => {
      const probability = eloService.getExpectedWinProbability(1000, 3000);
      expect(probability).toBeLessThan(0.01);
    });
  });

  describe('Realistic Match Scenarios', () => {
    it('should simulate Bronze vs Bronze match', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1050,
        loserRankPoints: 1000,
      });

      // 50 point difference: winner gains 14, loser loses 14
      expect(result.winner.newRank).toBe(1064);
      expect(result.loser.newRank).toBe(986);
      expect(result.winner.newTier).toBe(RankTier.BRONZE);
      expect(result.loser.newTier).toBe(RankTier.BRONZE);
    });

    it('should simulate promotion match', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'player1',
        loserId: 'player2',
        winnerRankPoints: 1195,
        loserRankPoints: 1200,
      });

      expect(result.winner.previousTier).toBe(RankTier.BRONZE);
      expect(result.winner.newTier).toBe(RankTier.SILVER);
      expect(result.winner.tierChanged).toBe(true);
    });

    it('should simulate cross-tier match', () => {
      const result = eloService.calculateRankUpdates({
        winnerId: 'bronze',
        loserId: 'silver',
        winnerRankPoints: 1100,
        loserRankPoints: 1300,
      });

      // Bronze beating Silver - significant gain
      expect(result.winner.rankChange).toBeGreaterThan(20);
      expect(result.loser.rankChange).toBeLessThan(-20);
    });
  });
});
