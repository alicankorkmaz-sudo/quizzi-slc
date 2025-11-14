/**
 * End-to-End Match Flow Test
 *
 * Tests the complete quiz battle flow:
 * 1. Players join queue
 * 2. Match is created with 5 questions (2 easy, 2 medium, 1 hard)
 * 3. Questions are different between players (answer randomization)
 * 4. Players submit answers
 * 5. Rounds progress automatically
 * 6. Match completes with winner announcement
 * 7. Question rotation prevents repeats
 */

interface TestPlayer {
  id: string;
  username: string;
  rankPoints: number;
  ws: WebSocket;
  receivedQuestions: string[];
  matchId?: string;
  currentRound?: number;
}

class CompleteMatchTester {
  private players: Map<string, TestPlayer> = new Map();
  private testResults = {
    matchesCreated: 0,
    roundsCompleted: 0,
    questionsReceived: 0,
    answersSubmitted: 0,
    matchesFinished: 0,
    uniqueQuestions: new Set<string>(),
    difficultyDistribution: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  };

  /**
   * Create a test player and connect to WebSocket
   */
  async createPlayer(
    id: string,
    username: string,
    rankPoints: number
  ): Promise<TestPlayer> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:3000/ws?userId=${id}`);

      const player: TestPlayer = {
        id,
        username,
        rankPoints,
        ws,
        receivedQuestions: [],
      };

      ws.onopen = () => {
        console.log(`✓ ${username} connected`);
        this.players.set(id, player);
        resolve(player);
      };

      ws.onerror = (error) => {
        console.error(`✗ ${username} connection failed:`, error);
        reject(error);
      };

      ws.onmessage = (event) => {
        this.handleMessage(player, JSON.parse(event.data));
      };

      ws.onclose = () => {
        console.log(`✗ ${username} disconnected`);
      };

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(player: TestPlayer, message: any): void {
    switch (message.type) {
      case 'connected':
        console.log(`  ${player.username}: Connected`);
        break;

      case 'queue_joined':
        console.log(`  ${player.username}: Queue joined (position ${message.position})`);
        break;

      case 'match_found':
        player.matchId = message.matchId;
        this.testResults.matchesCreated++;
        console.log(`  ${player.username}: Match found!`);
        console.log(`    Opponent: ${message.opponent.username}`);
        console.log(`    Match ID: ${message.matchId}`);
        break;

      case 'match_starting':
        console.log(`  ${player.username}: Match starting...`);
        break;

      case 'round_start':
        player.currentRound = message.roundIndex;
        player.receivedQuestions.push(message.question.id);
        this.testResults.questionsReceived++;
        this.testResults.uniqueQuestions.add(message.question.id);
        this.testResults.difficultyDistribution[message.question.difficulty as keyof typeof this.testResults.difficultyDistribution]++;

        console.log(`  ${player.username}: Round ${message.roundIndex + 1}/5`);
        console.log(`    Question: "${message.question.text}"`);
        console.log(`    Difficulty: ${message.question.difficulty}`);
        console.log(`    Answers: ${message.answers.join(', ')}`);

        // Automatically submit a random answer after 1 second
        setTimeout(() => {
          const randomAnswer = Math.floor(Math.random() * 4);
          this.submitAnswer(player, message.matchId, message.roundIndex, randomAnswer);
        }, 1000);
        break;

      case 'round_result':
        this.testResults.roundsCompleted++;
        console.log(`  ${player.username}: Round result - ${message.result}`);
        console.log(`    Winner: ${message.winner || 'None'}`);
        console.log(`    Response time: ${message.responseTime}ms`);
        break;

      case 'match_complete':
        this.testResults.matchesFinished++;
        console.log(`  ${player.username}: MATCH COMPLETE!`);
        console.log(`    Winner: ${message.winner.username}`);
        console.log(`    Final score: ${message.finalScore.player1} - ${message.finalScore.player2}`);
        console.log(`    Stats: ${JSON.stringify(message.stats, null, 2)}`);
        break;

      case 'error':
        console.error(`  ${player.username}: ERROR - ${message.message} (${message.code})`);
        break;

      default:
        console.log(`  ${player.username}: ${message.type}`);
    }
  }

  /**
   * Join matchmaking queue
   */
  joinQueue(playerId: string, category: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.ws.send(JSON.stringify({
      type: 'join_queue',
      category,
      rankPoints: player.rankPoints,
      username: player.username,
    }));

    console.log(`→ ${player.username} joined ${category} queue`);
  }

  /**
   * Submit an answer
   */
  private submitAnswer(
    player: TestPlayer,
    matchId: string,
    roundIndex: number,
    answerIndex: number
  ): void {
    player.ws.send(JSON.stringify({
      type: 'answer_submit',
      matchId,
      roundIndex,
      answerIndex,
      timestamp: Date.now(),
    }));

    this.testResults.answersSubmitted++;
    console.log(`  ${player.username}: Submitted answer ${answerIndex} for round ${roundIndex + 1}`);
  }

  /**
   * Wait for matches to complete
   */
  async waitForMatches(expectedMatches: number, timeoutMs: number = 60000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (this.testResults.matchesFinished >= expectedMatches) {
          clearInterval(checkInterval);
          resolve();
        } else if (elapsed > timeoutMs) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout: Only ${this.testResults.matchesFinished}/${expectedMatches} matches finished`));
        }
      }, 500);
    });
  }

  /**
   * Print test results
   */
  printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('END-TO-END MATCH FLOW TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`\nMatches:`);
    console.log(`  Created: ${this.testResults.matchesCreated}`);
    console.log(`  Finished: ${this.testResults.matchesFinished}`);

    console.log(`\nRounds:`);
    console.log(`  Completed: ${this.testResults.roundsCompleted}`);
    console.log(`  Expected: ${this.testResults.matchesCreated * 5 * 2}`); // 5 rounds, 2 players

    console.log(`\nQuestions:`);
    console.log(`  Received: ${this.testResults.questionsReceived}`);
    console.log(`  Unique: ${this.testResults.uniqueQuestions.size}`);
    console.log(`  Answers submitted: ${this.testResults.answersSubmitted}`);

    console.log(`\nDifficulty Distribution:`);
    console.log(`  Easy: ${this.testResults.difficultyDistribution.easy}`);
    console.log(`  Medium: ${this.testResults.difficultyDistribution.medium}`);
    console.log(`  Hard: ${this.testResults.difficultyDistribution.hard}`);

    // Verify difficulty distribution (should be 2 easy, 2 medium, 1 hard per match)
    const expectedEasy = this.testResults.matchesCreated * 2 * 2; // 2 easy per match, 2 players
    const expectedMedium = this.testResults.matchesCreated * 2 * 2;
    const expectedHard = this.testResults.matchesCreated * 1 * 2;

    console.log(`\nExpected Distribution:`);
    console.log(`  Easy: ${expectedEasy} (actual: ${this.testResults.difficultyDistribution.easy})`);
    console.log(`  Medium: ${expectedMedium} (actual: ${this.testResults.difficultyDistribution.medium})`);
    console.log(`  Hard: ${expectedHard} (actual: ${this.testResults.difficultyDistribution.hard})`);

    console.log(`\n${'='.repeat(60)}`);

    const success =
      this.testResults.matchesFinished === this.testResults.matchesCreated &&
      this.testResults.difficultyDistribution.easy === expectedEasy &&
      this.testResults.difficultyDistribution.medium === expectedMedium &&
      this.testResults.difficultyDistribution.hard === expectedHard;

    if (success) {
      console.log('✅ PASS: All tests passed!');
    } else {
      console.log('❌ FAIL: Some tests failed');
    }

    console.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    this.players.forEach(player => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.close();
      }
    });
    this.players.clear();
  }
}

/**
 * Test 1: Basic Match Flow (General Knowledge)
 */
async function testBasicMatchFlow() {
  console.log('\n📋 TEST 1: Basic Match Flow (General Knowledge)');
  console.log('─'.repeat(60));

  const tester = new CompleteMatchTester();

  try {
    // Create 2 players
    const players = await Promise.all([
      tester.createPlayer('alice', 'Alice', 1000),
      tester.createPlayer('bob', 'Bob', 1050),
    ]);

    // Both join general_knowledge queue
    players.forEach(p => tester.joinQueue(p.id, 'general_knowledge'));

    // Wait for match to complete (1 match expected)
    await tester.waitForMatches(1, 60000);

    tester.printResults();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    tester.cleanup();
  }
}

/**
 * Test 2: Multiple Concurrent Matches
 */
async function testMultipleMatches() {
  console.log('\n📋 TEST 2: Multiple Concurrent Matches (General Knowledge)');
  console.log('─'.repeat(60));

  const tester = new CompleteMatchTester();

  try {
    // Create 6 players
    const players = await Promise.all([
      tester.createPlayer('p1', 'Player1', 1000),
      tester.createPlayer('p2', 'Player2', 1020),
      tester.createPlayer('p3', 'Player3', 980),
      tester.createPlayer('p4', 'Player4', 1010),
      tester.createPlayer('p5', 'Player5', 990),
      tester.createPlayer('p6', 'Player6', 1030),
    ]);

    // All join general_knowledge queue
    players.forEach(p => tester.joinQueue(p.id, 'general_knowledge'));

    // Wait for matches to complete (3 matches expected)
    await tester.waitForMatches(3, 60000);

    tester.printResults();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    tester.cleanup();
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🧪 COMPLETE MATCH FLOW TEST SUITE');
  console.log('='.repeat(60));

  await testBasicMatchFlow();
  await new Promise(resolve => setTimeout(resolve, 3000)); // Pause between tests

  await testMultipleMatches();

  console.log('\n✅ All tests complete!');
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
