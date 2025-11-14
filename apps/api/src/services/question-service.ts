import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  answers: string[]; // Randomized for player
  correctAnswerIndex: number; // Index after randomization
}

export interface QuestionForMatch {
  id: string;
  category: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
}

interface CachedQuestion {
  id: string;
  category: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

type Category = 'general_knowledge' | 'geography' | 'science' | 'pop_culture' | 'sports';
type Difficulty = 'easy' | 'medium' | 'hard';

class QuestionService {
  // In-memory cache: category -> difficulty -> questions[]
  private questionCache: Map<Category, Map<Difficulty, CachedQuestion[]>> = new Map();

  // Player question history: playerId -> last 50 question IDs (circular buffer)
  private playerHistory: Map<string, string[]> = new Map();

  private readonly HISTORY_SIZE = 50;
  private readonly MATCH_QUESTION_COUNT = 5;
  private cacheInitialized = false;

  /**
   * Initialize question cache from database
   * Call once on server startup
   */
  async initializeCache(): Promise<void> {
    if (this.cacheInitialized) {
      console.log('Question cache already initialized');
      return;
    }

    console.log('Initializing question cache...');
    const startTime = Date.now();

    const allQuestions = await prisma.question.findMany({
      select: {
        id: true,
        category: true,
        difficulty: true,
        questionText: true,
        correctAnswer: true,
        wrongAnswer1: true,
        wrongAnswer2: true,
        wrongAnswer3: true,
      },
    });

    // Organize questions by category and difficulty
    const categories: Category[] = ['general_knowledge', 'geography', 'science', 'pop_culture', 'sports'];
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

    categories.forEach(category => {
      const difficultyMap = new Map<Difficulty, CachedQuestion[]>();

      difficulties.forEach(difficulty => {
        const questions = allQuestions
          .filter(q => q.category === category && q.difficulty === difficulty)
          .map(q => ({
            id: q.id,
            category: q.category,
            difficulty: q.difficulty,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            wrongAnswers: [q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3],
          }));

        difficultyMap.set(difficulty, questions);
        console.log(`Cached ${questions.length} ${difficulty} questions for ${category}`);
      });

      this.questionCache.set(category, difficultyMap);
    });

    this.cacheInitialized = true;
    console.log(`Question cache initialized in ${Date.now() - startTime}ms`);
    console.log(`Total questions cached: ${allQuestions.length}`);
  }

  /**
   * Select 5 questions for a match (2 easy, 2 medium, 1 hard)
   * Ensures no repeats within match or player's last 50 questions
   */
  selectQuestionsForMatch(category: Category, player1Id: string, player2Id: string): QuestionForMatch[] {
    if (!this.cacheInitialized) {
      throw new Error('Question cache not initialized. Call initializeCache() first.');
    }

    const categoryQuestions = this.questionCache.get(category);
    if (!categoryQuestions) {
      throw new Error(`No questions found for category: ${category}`);
    }

    // Get player histories
    const p1History = this.playerHistory.get(player1Id) || [];
    const p2History = this.playerHistory.get(player2Id) || [];
    const excludeIds = new Set([...p1History, ...p2History]);

    // Select questions by difficulty: 2 easy, 2 medium, 1 hard
    const selectedQuestions: QuestionForMatch[] = [];
    const usedIds = new Set<string>();

    // Helper to select questions of specific difficulty
    const selectByDifficulty = (difficulty: Difficulty, count: number) => {
      const questions = categoryQuestions.get(difficulty) || [];
      const available = questions.filter(q => !excludeIds.has(q.id) && !usedIds.has(q.id));

      if (available.length < count) {
        console.warn(
          `Not enough ${difficulty} questions for ${category}. ` +
          `Need ${count}, have ${available.length}. Falling back to all available.`
        );
      }

      // Shuffle and take required count
      const shuffled = this.shuffleArray([...available]);
      const selected = shuffled.slice(0, count);

      selected.forEach(q => {
        usedIds.add(q.id);
        selectedQuestions.push({
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          wrongAnswer1: q.wrongAnswers[0],
          wrongAnswer2: q.wrongAnswers[1],
          wrongAnswer3: q.wrongAnswers[2],
        });
      });
    };

    selectByDifficulty('easy', 2);
    selectByDifficulty('medium', 2);
    selectByDifficulty('hard', 1);

    if (selectedQuestions.length < this.MATCH_QUESTION_COUNT) {
      throw new Error(
        `Could not select enough questions for ${category}. ` +
        `Got ${selectedQuestions.length}, need ${this.MATCH_QUESTION_COUNT}`
      );
    }

    // Shuffle final question order (so difficulty isn't predictable)
    const shuffledQuestions = this.shuffleArray(selectedQuestions);

    // Update player histories
    const questionIds = shuffledQuestions.map(q => q.id);
    this.updatePlayerHistory(player1Id, questionIds);
    this.updatePlayerHistory(player2Id, questionIds);

    // Update lastUsed in database (async, don't await)
    this.updateQuestionUsage(questionIds).catch(err =>
      console.error('Failed to update question usage:', err)
    );

    return shuffledQuestions;
  }

  /**
   * Randomize answer order for a player
   * Returns answers array and correct answer index
   */
  randomizeAnswers(question: QuestionForMatch): Question {
    const answers = [
      question.correctAnswer,
      question.wrongAnswer1,
      question.wrongAnswer2,
      question.wrongAnswer3,
    ];

    // Fisher-Yates shuffle
    const shuffled = this.shuffleArray([...answers]);
    const correctAnswerIndex = shuffled.indexOf(question.correctAnswer);

    return {
      id: question.id,
      category: question.category,
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
      questionText: question.questionText,
      answers: shuffled,
      correctAnswerIndex,
    };
  }

  /**
   * Update player's question history (circular buffer of last 50)
   */
  private updatePlayerHistory(playerId: string, questionIds: string[]): void {
    let history = this.playerHistory.get(playerId) || [];

    // Add new questions
    history.push(...questionIds);

    // Keep only last 50
    if (history.length > this.HISTORY_SIZE) {
      history = history.slice(-this.HISTORY_SIZE);
    }

    this.playerHistory.set(playerId, history);
  }

  /**
   * Update question usage statistics in database (async)
   */
  private async updateQuestionUsage(questionIds: string[]): Promise<void> {
    await prisma.question.updateMany({
      where: { id: { in: questionIds } },
      data: {
        timesUsed: { increment: 1 },
        lastUsed: new Date(),
      },
    });
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Clear player history (useful for testing or player request)
   */
  clearPlayerHistory(playerId: string): void {
    this.playerHistory.delete(playerId);
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats(): Record<string, any> {
    const stats: Record<string, any> = {
      initialized: this.cacheInitialized,
      totalPlayers: this.playerHistory.size,
      categories: {},
    };

    this.questionCache.forEach((difficultyMap, category) => {
      const categoryStats: Record<string, number> = {};
      difficultyMap.forEach((questions, difficulty) => {
        categoryStats[difficulty] = questions.length;
      });
      stats.categories[category] = categoryStats;
    });

    return stats;
  }

  /**
   * Force refresh cache from database
   */
  async refreshCache(): Promise<void> {
    this.cacheInitialized = false;
    this.questionCache.clear();
    await this.initializeCache();
  }
}

// Singleton instance
export const questionService = new QuestionService();
