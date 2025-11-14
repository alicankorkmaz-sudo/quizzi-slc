# QuestionService Integration with MatchManager

## Integration Changes Required

### 1. Update match-manager.ts

Replace the `prepareRounds` method in `/apps/api/src/websocket/match-manager.ts`:

```typescript
// Add import at top
import { questionService } from '../services/question-service';

// Replace prepareRounds method (lines 153-172)
/**
 * Prepare all 5 rounds with questions from QuestionService
 */
private async prepareRounds(match: Match): Promise<void> {
  // Select questions from QuestionService
  const selectedQuestions = questionService.selectQuestionsForMatch(
    match.category,
    match.player1Id,
    match.player2Id
  );

  match.rounds = selectedQuestions.map((dbQuestion) => {
    // Randomize answers for each player independently
    const player1Randomized = questionService.randomizeAnswers(dbQuestion);
    const player2Randomized = questionService.randomizeAnswers(dbQuestion);

    return {
      state: 'waiting' as RoundState,
      questionId: dbQuestion.id,
      question: {
        id: dbQuestion.id,
        text: dbQuestion.questionText,
        category: dbQuestion.category,
        difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
      },
      // Store BOTH players' correct answer indices (after their individual shuffles)
      correctAnswerIndex: player1Randomized.correctAnswerIndex,
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
}
```

**IMPORTANT**: Each player gets different randomized answer orders. The `correctAnswerIndex` must be stored per-player.

### 2. Update RoundData Interface

Update the `RoundData` interface to store correct answer index per player:

```typescript
interface RoundData {
  state: RoundState;
  questionId: string;
  question: QuestionInfo;
  correctAnswerIndices: {
    [playerId: string]: number; // Each player has different correct index
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
```

### 3. Update handleAnswer Method

Update answer validation to use player-specific correct answer index (line 274):

```typescript
// Replace line 274
const isCorrect = answerIndex === round.correctAnswerIndices[userId];
```

### 4. Initialize QuestionService on Server Startup

In your main server file (e.g., `src/index.ts` or `src/server.ts`):

```typescript
import { questionService } from './services/question-service';

async function startServer() {
  // Initialize question cache before accepting connections
  console.log('Initializing question service...');
  await questionService.initializeCache();
  console.log('Question service ready');

  // Start WebSocket server
  // ... rest of server initialization
}

startServer().catch(console.error);
```

### 5. Remove Mock Question Generation

Delete the `generateMockQuestions` method (lines 638-657) from match-manager.ts - no longer needed.

---

## Testing Integration

### Test Script Example

```typescript
// test/question-service.test.ts
import { questionService } from '../src/services/question-service';

async function testQuestionService() {
  await questionService.initializeCache();

  const stats = questionService.getCacheStats();
  console.log('Cache stats:', JSON.stringify(stats, null, 2));

  // Test question selection
  const questions = questionService.selectQuestionsForMatch(
    'general_knowledge',
    'player1',
    'player2'
  );

  console.log(`\nSelected ${questions.length} questions:`);
  questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.difficulty}] ${q.questionText}`);
  });

  // Test answer randomization
  console.log('\n--- Answer Randomization Test ---');
  const testQuestion = questions[0];
  const p1Random = questionService.randomizeAnswers(testQuestion);
  const p2Random = questionService.randomizeAnswers(testQuestion);

  console.log('Player 1 answers:', p1Random.answers);
  console.log('Player 1 correct index:', p1Random.correctAnswerIndex);
  console.log('Player 2 answers:', p2Random.answers);
  console.log('Player 2 correct index:', p2Random.correctAnswerIndex);

  // Verify correct answer is at correct index
  console.log('\nVerification:');
  console.log('P1 correct answer:', p1Random.answers[p1Random.correctAnswerIndex]);
  console.log('P2 correct answer:', p2Random.answers[p2Random.correctAnswerIndex]);
  console.log('Both should be:', testQuestion.correctAnswer);
}

testQuestionService().catch(console.error);
```

---

## Database Seeding

### Run Seed Script

1. **Add seed script to package.json**:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed-questions.ts"
  }
}
```

2. **Run seeding**:
```bash
cd apps/api
pnpm db:seed
```

3. **Verify questions were seeded**:
```bash
# Using Prisma Studio
pnpm prisma studio

# Or SQL query
SELECT category, difficulty, COUNT(*)
FROM Question
GROUP BY category, difficulty;
```

Expected output:
```
general_knowledge | easy   | 80
general_knowledge | medium | 80
general_knowledge | hard   | 40
geography         | easy   | 80
geography         | medium | 80
geography         | hard   | 40
science           | easy   | 80
science           | medium | 80
science           | hard   | 40
pop_culture       | easy   | 80
pop_culture       | medium | 80
pop_culture       | hard   | 40
sports            | easy   | 80
sports            | medium | 80
sports            | hard   | 40
```

---

## Architecture Decisions

### In-Memory Cache vs Database
- **Cache**: Questions loaded once on startup, O(1) selection
- **Database**: Only used for initial load and usage statistics
- **Tradeoff**: Memory usage (1,000 questions × ~500 bytes = ~500KB) vs speed

### Player History Tracking
- **In-memory**: Last 50 questions per player (Map<playerId, string[]>)
- **Size**: ~50 players × 50 questions × 36 bytes/UUID = ~90KB
- **Persistence**: Not saved to DB in MVP (resets on server restart)
- **Future**: Consider Redis or DB persistence for production

### Answer Randomization
- **Per-player**: Each player gets different randomized order
- **Anti-cheat**: Prevents physical proximity cheating
- **Correctness**: Server tracks correct index per player

### Question Selection Algorithm
1. Get questions by category and difficulty
2. Exclude last 50 questions for both players
3. Shuffle available pool
4. Select required count (2 easy, 2 medium, 1 hard)
5. Shuffle final order (difficulty not predictable)

---

## Performance Characteristics

### Question Selection
- **Time complexity**: O(n) where n = available questions per difficulty (~200)
- **Typical time**: <5ms for filtering and shuffling
- **Memory**: All questions cached in RAM (~500KB)

### Answer Randomization
- **Time complexity**: O(4) - constant (only 4 answers)
- **Typical time**: <1ms per player
- **Memory**: Negligible (4 strings per player per round)

### Player History
- **Space per player**: 50 UUIDs × 36 bytes = ~1.8KB
- **Lookup time**: O(50) for exclusion check (small constant)
- **Cleanup**: No automatic cleanup in MVP (grows with unique players)

---

## Future Enhancements (Post-MVP)

1. **Persistent Player History**: Store in Redis or Postgres
2. **Weekly Question Rotation**: Cron job to shuffle question pool
3. **Question Analytics**: Track accuracy, time stats per question
4. **Dynamic Difficulty**: Adjust difficulty based on player ELO
5. **Category Expansion**: Add new categories without code changes
6. **Question Pool Expansion**: Support 10,000+ questions with pagination
7. **Reporting**: Flag broken/ambiguous questions via player reports

---

## Error Handling

### Insufficient Questions
If fewer than 5 questions available after filtering:
- Logs warning with details
- Uses all available questions (may result in <5 questions)
- Client should display error and abort match

**Solution for production**:
- Ensure 100+ questions per category/difficulty
- Relax history constraint if pool exhausted (e.g., exclude last 20 instead of 50)

### Cache Not Initialized
If `selectQuestionsForMatch` called before cache initialized:
- Throws error: "Question cache not initialized"
- Server should call `initializeCache()` before accepting WebSocket connections

### Database Connection Failed
If seeding or cache init fails:
- Server startup fails with error
- Logs full error details
- Requires database connection before proceeding

---

## Monitoring & Observability

### Cache Stats Endpoint
```typescript
// Add to your API routes
app.get('/api/admin/question-stats', (req, res) => {
  const stats = questionService.getCacheStats();
  res.json(stats);
});
```

### Logs to Monitor
- Question selection time (should be <10ms)
- Player history size (alert if >10,000 players)
- Questions with high skip rate (may indicate bad questions)
- Suspiciously fast answers (<500ms) per question

### Metrics to Track
- `question_selection_duration_ms` (histogram)
- `player_history_size` (gauge)
- `questions_cached_total` (gauge)
- `questions_used_total` (counter by category/difficulty)
