import { connectionManager } from './connection-manager';
import { questionService } from '../services/question-service';
import { matchmakingQueue } from '../services/matchmaking-instance';
import { EloService } from '../services/elo-service';
import { statisticsService } from '../services/statistics-service';
import { PrismaClient } from '@prisma/client';
import type { Category } from '@quizzi/types';
import type { OpponentInfo, MatchStats, QuestionInfo } from './types';
import { Timing, ErrorCodes } from './constants';

const prisma = new PrismaClient();
const eloService = new EloService();

type MatchState = 'waiting' | 'starting' | 'active' | 'paused' | 'ended';
type RoundState = 'waiting' | 'active' | 'ended';

interface RoundSubmission {
  answerIndex: number;
  timestamp: number;
  responseTime: number;
  correct: boolean;
}

interface RoundData {
  state: RoundState;
  questionId: string;
  question: QuestionInfo;
  correctAnswerIndices: {
    [playerId: string]: number; // Different correct index per player due to randomization
  };
  answers: {
    [playerId: string]: string[]; // Player-specific randomized answers
  };
  submissions: {
    [playerId: string]: RoundSubmission;
  };
  winner: string | null;
  startTime: number;
  endTime: number;
  timer: Timer | null;
}

interface Match {
  id: string;
  state: MatchState;
  player1Id: string;
  player2Id: string;
  player1Username: string;
  player2Username: string;
  category: Category;
  scores: {
    [playerId: string]: number;
  };
  currentRound: number;
  rounds: RoundData[];
  createdAt: number;
  startedAt: number | null;
}

/**
 * Manages match state, round progression, and answer validation
 */
export class MatchManager {
  private matches = new Map<string, Match>();
  private playerMatches = new Map<string, string>(); // userId → matchId
  private matchLocks = new Map<string, Promise<void>>();

  /**
   * Create a new match between two players
   */
  async createMatch(
    player1Id: string,
    player2Id: string,
    player1Username: string,
    player2Username: string,
    category: Category
  ): Promise<string> {
    const matchId = crypto.randomUUID();

    const match: Match = {
      id: matchId,
      state: 'waiting',
      player1Id,
      player2Id,
      player1Username,
      player2Username,
      category,
      scores: {
        [player1Id]: 0,
        [player2Id]: 0,
      },
      currentRound: 0,
      rounds: [],
      createdAt: Date.now(),
      startedAt: null,
    };

    this.matches.set(matchId, match);
    this.playerMatches.set(player1Id, matchId);
    this.playerMatches.set(player2Id, matchId);

    console.log(`Match created: ${matchId} - ${player1Id} vs ${player2Id}`);

    // Fetch opponent info for both players
    const [player2Info, player1Info] = await Promise.all([
      this.getOpponentInfo(player2Id, match),
      this.getOpponentInfo(player1Id, match),
    ]);

    // Notify both players with their respective opponent info
    const player1Event = {
      type: 'match_found' as const,
      matchId,
      opponent: player2Info,
      category,
    };
    console.log(`[MatchManager] Sending match_found to player1 (${player1Id}):`, player1Event);
    const sent1 = connectionManager.send(player1Id, player1Event);
    console.log(`[MatchManager] Player1 send result: ${sent1}`);

    const player2Event = {
      type: 'match_found' as const,
      matchId,
      opponent: player1Info,
      category,
    };
    console.log(`[MatchManager] Sending match_found to player2 (${player2Id}):`, player2Event);
    const sent2 = connectionManager.send(player2Id, player2Event);
    console.log(`[MatchManager] Player2 send result: ${sent2}`);

    // Start countdown
    await this.startMatchCountdown(matchId);

    return matchId;
  }

  /**
   * Start 3-2-1 countdown before match begins
   */
  private async startMatchCountdown(matchId: string): Promise<void> {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.state = 'starting';

    // 3-2-1 countdown
    for (let i = 3; i > 0; i--) {
      connectionManager.broadcast([match.player1Id, match.player2Id], {
        type: 'match_starting',
        matchId,
        countdown: i,
      });
      await this.sleep(1000);
    }

    await this.startMatch(matchId);
  }

  /**
   * Start the match and prepare all rounds
   */
  private async startMatch(matchId: string): Promise<void> {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.state = 'active';
    match.startedAt = Date.now();

    // Prepare all 5 rounds (questions will be fetched from question service)
    await this.prepareRounds(match);

    connectionManager.broadcast([match.player1Id, match.player2Id], {
      type: 'match_started',
      matchId,
      currentRound: 0,
    });

    console.log(`Match started: ${matchId}`);

    // Wait 1000ms to allow both Android and iOS clients to navigate to BattleScreen
    // and subscribe to events before sending round_start
    // This prevents timestamp misalignment that causes incorrect timer displays
    await this.sleep(1000);

    // Start first round
    this.startRound(matchId, 0);
  }

  /**
   * Prepare rounds with questions from question service
   * For Best of 5 format, we prepare 15 questions to handle worst-case scenarios
   */
  private async prepareRounds(match: Match): Promise<void> {
    // Select 15 questions to ensure we have enough for Best of 5
    // Even if players keep answering wrong, this should be sufficient
    const selectedQuestions = questionService.selectQuestionsForMatch(
      match.category,
      match.player1Id,
      match.player2Id,
      15 // Prepare 15 questions for worst-case scenarios
    );

    // Randomize answers for each player
    match.rounds = selectedQuestions.map((baseQuestion) => {
      const player1Randomized = questionService.randomizeAnswers(baseQuestion);
      const player2Randomized = questionService.randomizeAnswers(baseQuestion);

      return {
        state: 'waiting' as RoundState,
        questionId: baseQuestion.id,
        question: {
          id: baseQuestion.id,
          text: baseQuestion.questionText,
          category: baseQuestion.category as Category,
          difficulty: baseQuestion.difficulty as 'easy' | 'medium' | 'hard',
        },
        correctAnswerIndices: {
          [match.player1Id]: player1Randomized.correctAnswerIndex,
          [match.player2Id]: player2Randomized.correctAnswerIndex,
        },
        answers: {
          [match.player1Id]: player1Randomized.answers,
          [match.player2Id]: player2Randomized.answers,
        },
        submissions: {},
        winner: null,
        startTime: 0,
        endTime: 0,
        timer: null,
      };
    });

    console.log(
      `Prepared ${match.rounds.length} questions for match ${match.id} (${match.category})`
    );
  }

  /**
   * Dynamically load more questions when running low
   */
  private async loadMoreQuestions(match: Match): Promise<void> {
    try {
      const additionalQuestions = questionService.selectQuestionsForMatch(
        match.category,
        match.player1Id,
        match.player2Id,
        5 // Load 5 more questions at a time
      );

      const newRounds = additionalQuestions.map((baseQuestion) => {
        const player1Randomized = questionService.randomizeAnswers(baseQuestion);
        const player2Randomized = questionService.randomizeAnswers(baseQuestion);

        return {
          state: 'waiting' as RoundState,
          questionId: baseQuestion.id,
          question: {
            id: baseQuestion.id,
            text: baseQuestion.questionText,
            category: baseQuestion.category as Category,
            difficulty: baseQuestion.difficulty as 'easy' | 'medium' | 'hard',
          },
          correctAnswerIndices: {
            [match.player1Id]: player1Randomized.correctAnswerIndex,
            [match.player2Id]: player2Randomized.correctAnswerIndex,
          },
          answers: {
            [match.player1Id]: player1Randomized.answers,
            [match.player2Id]: player2Randomized.answers,
          },
          submissions: {},
          winner: null,
          startTime: 0,
          endTime: 0,
          timer: null,
        };
      });

      match.rounds.push(...newRounds);
      console.log(`Loaded ${newRounds.length} additional questions for match ${match.id}`);
    } catch (error) {
      console.error(`Failed to load additional questions for match ${match.id}:`, error);
    }
  }

  /**
   * Start a specific round
   */
  private startRound(matchId: string, roundIndex: number): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    const round = match.rounds[roundIndex];
    const startTime = Date.now();

    round.state = 'active';
    round.startTime = startTime;
    round.endTime = startTime + Timing.ROUND_DURATION;

    console.log(`Round ${roundIndex} started for match ${matchId}`);

    // Send round start to each player with their randomized answers
    connectionManager.send(match.player1Id, {
      type: 'round_start',
      matchId,
      roundIndex,
      question: round.question,
      answers: round.answers[match.player1Id],
      startTime,
      endTime: round.endTime,
    });

    connectionManager.send(match.player2Id, {
      type: 'round_start',
      matchId,
      roundIndex,
      question: round.question,
      answers: round.answers[match.player2Id],
      startTime,
      endTime: round.endTime,
    });

    // Set timeout for round end
    round.timer = setTimeout(() => {
      this.handleRoundTimeout(matchId, roundIndex);
    }, Timing.ROUND_DURATION);
  }

  /**
   * Handle answer submission from player
   */
  async handleAnswer(
    userId: string,
    matchId: string,
    roundIndex: number,
    answerIndex: number,
    _clientTimestamp: number
  ): Promise<void> {
    // Serialize answer processing for this match to prevent race conditions
    const currentLock = this.matchLocks.get(matchId) || Promise.resolve();

    const newLock = currentLock.then(() => {
      const match = this.matches.get(matchId);
      if (!match) {
        connectionManager.send(userId, {
          type: 'error',
          code: ErrorCodes.MATCH_NOT_FOUND,
          message: 'Match not found',
        });
        return;
      }

      const round = match.rounds[roundIndex];
      if (!round || round.state !== 'active') {
        connectionManager.send(userId, {
          type: 'error',
          code: ErrorCodes.INVALID_ROUND,
          message: 'Round is not active',
        });
        return;
      }

      // Check if player already answered
      if (round.submissions[userId]) {
        connectionManager.send(userId, {
          type: 'error',
          code: ErrorCodes.ALREADY_ANSWERED,
          message: 'You already answered this round',
        });
        return;
      }

      const serverTime = Date.now();

      // Check timeout (server time is authority)
      if (serverTime > round.endTime + Timing.MAX_LATENCY_TOLERANCE) {
        connectionManager.send(userId, {
          type: 'error',
          code: ErrorCodes.ANSWER_TOO_LATE,
          message: 'Time expired',
        });
        return;
      }

      const responseTime = serverTime - round.startTime;
      const isCorrect = answerIndex === round.correctAnswerIndices[userId];

      // Anti-cheat: Log suspiciously fast answers
      if (responseTime < Timing.SUSPICIOUS_ANSWER_TIME) {
        console.warn(
          `Suspicious answer speed: ${userId} answered in ${responseTime}ms`
        );
      }

      // Record submission
      round.submissions[userId] = {
        answerIndex,
        timestamp: serverTime,
        responseTime,
        correct: isCorrect,
      };

      // Broadcast answer event to both players
      connectionManager.broadcast([match.player1Id, match.player2Id], {
        type: 'round_answer',
        matchId,
        roundIndex,
        playerId: userId,
        correct: isCorrect,
        timeMs: responseTime,
      });

      console.log(
        `Answer received: ${userId} - ${isCorrect ? 'CORRECT' : 'WRONG'} in ${responseTime}ms`
      );

      // If correct and no winner yet, mark as winner
      if (isCorrect && !round.winner) {
        round.winner = userId;
        match.scores[userId]++;

        console.log(`Round winner: ${userId}. Score: ${match.scores[userId]}`);

        // End round after showing result
        setTimeout(() => this.endRound(matchId, roundIndex), Timing.ROUND_RESULT_DISPLAY);
      }
      // If both players have submitted and both are wrong, end round early
      else if (Object.keys(round.submissions).length === 2 && !round.winner) {
        const allWrong = Object.values(round.submissions).every(s => !s.correct);
        if (allWrong) {
          console.log(`Both players answered incorrectly in round ${roundIndex}. Ending early.`);
          // End round after showing result
          setTimeout(() => this.endRound(matchId, roundIndex), Timing.ROUND_RESULT_DISPLAY);
        }
      }
    });

    this.matchLocks.set(matchId, newLock);
  }

  /**
   * Handle round timeout (no correct answer)
   */
  private handleRoundTimeout(matchId: string, roundIndex: number): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    const round = match.rounds[roundIndex];
    if (round.state !== 'active') return;

    console.log(`Round ${roundIndex} timeout for match ${matchId}`);

    // Notify players with their correct answer index
    connectionManager.send(match.player1Id, {
      type: 'round_timeout',
      matchId,
      roundIndex,
      correctAnswer: round.correctAnswerIndices[match.player1Id],
    });

    connectionManager.send(match.player2Id, {
      type: 'round_timeout',
      matchId,
      roundIndex,
      correctAnswer: round.correctAnswerIndices[match.player2Id],
    });

    // End round after showing correct answer
    setTimeout(() => this.endRound(matchId, roundIndex), Timing.ROUND_PAUSE);
  }

  /**
   * End a round and check match completion
   */
  private endRound(matchId: string, roundIndex: number): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    const round = match.rounds[roundIndex];
    round.state = 'ended';

    if (round.timer) {
      clearTimeout(round.timer);
      round.timer = null;
    }

    console.log(`Round ${roundIndex} ended for match ${matchId}`);

    // Get winner's response time if there was a winner
    const winnerTime = round.winner ? round.submissions[round.winner]?.responseTime : undefined;

    // Broadcast round end with player-specific scores
    connectionManager.send(match.player1Id, {
      type: 'round_end',
      matchId,
      roundIndex,
      winner: round.winner,
      winnerTime,
      scores: {
        currentPlayer: match.scores[match.player1Id],
        opponent: match.scores[match.player2Id],
      },
      correctAnswer: round.correctAnswerIndices[match.player1Id],
    });

    connectionManager.send(match.player2Id, {
      type: 'round_end',
      matchId,
      roundIndex,
      winner: round.winner,
      winnerTime,
      scores: {
        currentPlayer: match.scores[match.player2Id],
        opponent: match.scores[match.player1Id],
      },
      correctAnswer: round.correctAnswerIndices[match.player2Id],
    });

    // Check if match is over (first to 3 wins - Best of 5)
    const maxScore = Math.max(
      match.scores[match.player1Id],
      match.scores[match.player2Id]
    );

    if (maxScore >= 3) {
      // Someone reached 3 correct answers - match is over
      setTimeout(() => this.endMatch(matchId), Timing.ROUND_PAUSE);
      return;
    }

    // Check if we're running out of questions (less than 3 remaining)
    if (roundIndex >= match.rounds.length - 3) {
      console.warn(`Match ${matchId} running low on questions. Loading more...`);
      // Dynamically load more questions
      this.loadMoreQuestions(match).catch(err => {
        console.error('Failed to load more questions:', err);
      });
    }

    // Check if we've completely run out of questions
    if (roundIndex >= match.rounds.length - 1) {
      // Absolute failsafe - end match with current scores
      console.error(`Match ${matchId} ending - no more questions available`);
      setTimeout(() => this.endMatch(matchId), Timing.ROUND_PAUSE);
      return;
    }

    // Start next round
    setTimeout(() => {
      match.currentRound++;
      this.startRound(matchId, match.currentRound);
    }, Timing.ROUND_PAUSE);
  }

  /**
   * End the match and calculate final stats
   */
  private async endMatch(matchId: string): Promise<void> {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.state = 'ended';

    const winner =
      match.scores[match.player1Id] > match.scores[match.player2Id]
        ? match.player1Id
        : match.player2Id;

    const loser = winner === match.player1Id ? match.player2Id : match.player1Id;

    console.log(`Match ended: ${matchId}. Winner: ${winner}`);

    // Fetch current rank points for both players
    const [player1Data, player2Data] = await Promise.all([
      prisma.user.findUnique({
        where: { id: match.player1Id },
        select: { elo: true, rankTier: true },
      }),
      prisma.user.findUnique({
        where: { id: match.player2Id },
        select: { elo: true, rankTier: true },
      }),
    ]);

    if (!player1Data || !player2Data) {
      console.error(`Failed to fetch player data for match ${matchId}`);
      return;
    }

    // Calculate ELO changes
    const winnerCurrentRank = winner === match.player1Id ? player1Data.elo : player2Data.elo;
    const loserCurrentRank = loser === match.player1Id ? player1Data.elo : player2Data.elo;

    console.log(`[ELO] Input data - Winner: ${winner} (${winnerCurrentRank}), Loser: ${loser} (${loserCurrentRank})`);

    const eloResult = eloService.calculateRankUpdates({
      winnerId: winner,
      loserId: loser,
      winnerRankPoints: winnerCurrentRank,
      loserRankPoints: loserCurrentRank,
    });

    console.log(`[ELO] Calculation result:`, {
      winner: {
        id: eloResult.winner.playerId,
        previousRank: eloResult.winner.previousRank,
        newRank: eloResult.winner.newRank,
        change: eloResult.winner.rankChange,
        tier: `${eloResult.winner.previousTier} → ${eloResult.winner.newTier}`,
      },
      loser: {
        id: eloResult.loser.playerId,
        previousRank: eloResult.loser.previousRank,
        newRank: eloResult.loser.newRank,
        change: eloResult.loser.rankChange,
        tier: `${eloResult.loser.previousTier} → ${eloResult.loser.newTier}`,
      },
    });

    // Update both players' rank points and tier in database
    try {
      console.log(`[DB] Updating winner ${eloResult.winner.playerId}: elo=${eloResult.winner.newRank}, rankTier=${eloResult.winner.newTier}`);
      console.log(`[DB] Updating loser ${eloResult.loser.playerId}: elo=${eloResult.loser.newRank}, rankTier=${eloResult.loser.newTier}`);

      const [winnerUpdate, loserUpdate] = await Promise.all([
        prisma.user.update({
          where: { id: eloResult.winner.playerId },
          data: {
            elo: eloResult.winner.newRank,
            rankTier: eloResult.winner.newTier,
            matchesPlayed: { increment: 1 },
          },
        }),
        prisma.user.update({
          where: { id: eloResult.loser.playerId },
          data: {
            elo: eloResult.loser.newRank,
            rankTier: eloResult.loser.newTier,
            matchesPlayed: { increment: 1 },
          },
        }),
      ]);

      console.log(`[DB] Winner after update: elo=${winnerUpdate.elo}, rankTier=${winnerUpdate.rankTier}`);
      console.log(`[DB] Loser after update: elo=${loserUpdate.elo}, rankTier=${loserUpdate.rankTier}`);
      console.log(`✅ Database updated successfully for match ${matchId}`);
    } catch (error) {
      console.error(`❌ Failed to update database for match ${matchId}:`, error);
      throw error;
    }

    // Calculate stats for each player
    const stats1 = this.calculateMatchStats(match, match.player1Id);
    const stats2 = this.calculateMatchStats(match, match.player2Id);

    // Determine rank points change for each player
    const player1RankChange = match.player1Id === winner ? eloResult.winner.rankChange : eloResult.loser.rankChange;
    const player2RankChange = match.player2Id === winner ? eloResult.winner.rankChange : eloResult.loser.rankChange;

    // Persist match result in database
    await prisma.match.create({
      data: {
        id: matchId,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        category: match.category,
        winnerId: winner,
        player1Score: match.scores[match.player1Id],
        player2Score: match.scores[match.player2Id],
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Update all statistics
    await statisticsService.updateMatchStatistics(
      matchId,
      winner,
      loser,
      match.player1Id,
      match.player2Id,
      match.category,
      stats1,
      stats2,
      player1RankChange,
      player2RankChange
    );

    console.log(
      `ELO updated - ${eloResult.winner.playerId}: ${eloResult.winner.rankChange > 0 ? '+' : ''}${eloResult.winner.rankChange} (${eloResult.winner.previousRank} → ${eloResult.winner.newRank})`
    );
    console.log(
      `ELO updated - ${eloResult.loser.playerId}: ${eloResult.loser.rankChange > 0 ? '+' : ''}${eloResult.loser.rankChange} (${eloResult.loser.previousRank} → ${eloResult.loser.newRank})`
    );

    // Prepare tier change data
    const player1TierData = match.player1Id === winner ? eloResult.winner : eloResult.loser;
    const player2TierData = match.player2Id === winner ? eloResult.winner : eloResult.loser;

    // Send match end to both players with player-specific scores and ELO changes
    connectionManager.send(match.player1Id, {
      type: 'match_end',
      matchId,
      winner,
      finalScores: {
        currentPlayer: match.scores[match.player1Id],
        opponent: match.scores[match.player2Id],
      },
      eloChange: player1RankChange,
      oldRankPoints: player1TierData.previousRank,
      newRankPoints: player1TierData.newRank,
      oldTier: player1TierData.previousTier,
      newTier: player1TierData.newTier,
      tierChanged: player1TierData.tierChanged,
      stats: stats1,
    });

    connectionManager.send(match.player2Id, {
      type: 'match_end',
      matchId,
      winner,
      finalScores: {
        currentPlayer: match.scores[match.player2Id],
        opponent: match.scores[match.player1Id],
      },
      eloChange: player2RankChange,
      oldRankPoints: player2TierData.previousRank,
      newRankPoints: player2TierData.newRank,
      oldTier: player2TierData.previousTier,
      newTier: player2TierData.newTier,
      tierChanged: player2TierData.tierChanged,
      stats: stats2,
    });

    // Cleanup player mappings
    this.playerMatches.delete(match.player1Id);
    this.playerMatches.delete(match.player2Id);

    // Clear last opponent tracking to allow immediate rematch in testing
    // In production, you might want to add a delay before clearing this
    matchmakingQueue.clearLastOpponent(match.player1Id);
    matchmakingQueue.clearLastOpponent(match.player2Id);
    console.log(`Cleared last opponent tracking for ${match.player1Id} and ${match.player2Id}`);

    // Keep match in memory for 5 minutes for potential rematch
    setTimeout(() => {
      this.matches.delete(matchId);
      console.log(`Match ${matchId} removed from memory`);
    }, 300000);
  }

  /**
   * Handle player disconnect during match
   */
  handlePlayerDisconnect(
    userId: string,
    matchId: string,
    graceEndTime: number
  ): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    console.log(`Pausing match ${matchId} due to ${userId} disconnect`);

    // Pause match
    this.pauseMatch(matchId);

    // Notify opponent
    const opponentId = this.getOpponentId(match, userId);
    connectionManager.send(opponentId, {
      type: 'opponent_disconnected',
      matchId,
      graceEndTime,
    });
  }

  /**
   * Handle player reconnect
   */
  handlePlayerReconnect(userId: string, matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    console.log(`Resuming match ${matchId} - ${userId} reconnected`);

    // Resume match
    this.resumeMatch(matchId);

    // Notify opponent
    const opponentId = this.getOpponentId(match, userId);
    connectionManager.send(opponentId, {
      type: 'opponent_reconnected',
      matchId,
    });

    // Send current match state to reconnected player
    this.sendMatchState(userId, match);
  }

  /**
   * Abandon match due to disconnect
   */
  abandonMatch(matchId: string, disconnectedUserId: string): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    console.log(`Match ${matchId} abandoned - ${disconnectedUserId} did not reconnect`);

    match.state = 'ended';

    // Notify opponent
    const opponentId = this.getOpponentId(match, disconnectedUserId);
    connectionManager.send(opponentId, {
      type: 'match_abandoned',
      matchId,
      reason: 'opponent_timeout',
    });

    // Cleanup
    this.playerMatches.delete(match.player1Id);
    this.playerMatches.delete(match.player2Id);

    // Clean up round timers
    match.rounds.forEach((round) => {
      if (round.timer) clearTimeout(round.timer);
    });

    this.matches.delete(matchId);
  }

  /**
   * Pause match (stop timers)
   */
  private pauseMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.state = 'paused';

    const round = match.rounds[match.currentRound];
    if (round && round.timer) {
      clearTimeout(round.timer);
      round.timer = null;
    }
  }

  /**
   * Resume match (restart timers)
   */
  private resumeMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match || match.state !== 'paused') return;

    match.state = 'active';

    const round = match.rounds[match.currentRound];
    if (round && round.state === 'active') {
      const timeLeft = round.endTime - Date.now();
      if (timeLeft > 0) {
        round.timer = setTimeout(() => {
          this.handleRoundTimeout(matchId, match.currentRound);
        }, timeLeft);
      } else {
        this.handleRoundTimeout(matchId, match.currentRound);
      }
    }
  }

  /**
   * Send full match state to reconnected player
   */
  private sendMatchState(userId: string, match: Match): void {
    if (match.state === 'active' || match.state === 'paused') {
      const round = match.rounds[match.currentRound];

      // Safety check: ensure round is properly initialized
      if (!round || !round.question) {
        console.error(`Round ${match.currentRound} not initialized for match ${match.id}`);
        return;
      }

      connectionManager.send(userId, {
        type: 'round_start',
        matchId: match.id,
        roundIndex: match.currentRound,
        question: round.question,
        answers: round.answers[userId],
        startTime: round.startTime,
        endTime: round.endTime,
      });
    }
  }

  /**
   * Sync match state for a player who just navigated to BattleScreen
   * Public method called when client requests match state sync
   */
  syncMatchState(userId: string, matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match) {
      console.error(`Cannot sync match state - match ${matchId} not found`);
      return;
    }

    console.log(`Syncing match state for ${userId} in match ${matchId}, state: ${match.state}`);

    // Send match_started if match is active
    if (match.state === 'active' || match.state === 'paused') {
      connectionManager.send(userId, {
        type: 'match_started',
        matchId: match.id,
        currentRound: match.currentRound,
      });

      // Send current round state
      this.sendMatchState(userId, match);
    }
  }

  /**
   * Calculate match statistics for a player
   */
  private calculateMatchStats(match: Match, userId: string): MatchStats {
    const submissions = match.rounds
      .map((r) => r.submissions[userId])
      .filter((s) => s !== undefined);

    if (submissions.length === 0) {
      return {
        avgResponseTime: 0,
        fastestAnswer: 0,
        accuracy: 0,
      };
    }

    const responseTimes = submissions.map((s) => s.responseTime);
    const avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const fastestAnswer = Math.min(...responseTimes);
    const accuracy = (submissions.filter((s) => s.correct).length / submissions.length) * 100;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      fastestAnswer: Math.round(fastestAnswer),
      accuracy: Math.round(accuracy),
    };
  }

  /**
   * Get opponent ID for a player in a match
   */
  private getOpponentId(match: Match, playerId: string): string {
    return playerId === match.player1Id ? match.player2Id : match.player1Id;
  }

  /**
   * Get opponent info from match data
   */
  private async getOpponentInfo(opponentId: string, match: Match): Promise<OpponentInfo> {
    const username = opponentId === match.player1Id ? match.player1Username : match.player2Username;

    // Fetch user data from database
    const userData = await prisma.user.findUnique({
      where: { id: opponentId },
      select: {
        avatar: true,
        rankTier: true,
        elo: true,
        winRate: true,
        currentStreak: true,
      },
    });

    // Fallback to defaults if user not found
    if (!userData) {
      console.warn(`User data not found for opponent ${opponentId}, using defaults`);
      return {
        id: opponentId,
        username,
        avatar: 'default_1',
        rankTier: 'bronze',
        elo: 1000,
        winRate: 0,
        currentStreak: 0,
      };
    }

    return {
      id: opponentId,
      username,
      avatar: userData.avatar,
      rankTier: userData.rankTier as any,
      elo: userData.elo,
      winRate: userData.winRate,
      currentStreak: userData.currentStreak,
    };
  }


  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get match for a player
   */
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  /**
   * Get player's current match ID
   */
  getPlayerMatch(userId: string): string | undefined {
    return this.playerMatches.get(userId);
  }

  /**
   * Get active matches count
   */
  getActiveMatchesCount(): number {
    return this.matches.size;
  }
}

export const matchManager = new MatchManager();
