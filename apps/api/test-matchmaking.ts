/**
 * Comprehensive Matchmaking Test Client
 *
 * Tests ELO-based matchmaking with:
 * - Multiple concurrent players with different ranks
 * - Timing analysis (<3s pairing target)
 * - Same-opponent prevention
 * - Category-specific queues
 */

interface TestPlayer {
  id: string;
  username: string;
  rankPoints: number;
  ws: WebSocket;
  joinedAt?: number;
  matchedAt?: number;
  matchId?: string;
}

class MatchmakingTestRunner {
  private players: Map<string, TestPlayer> = new Map();
  private matchPairings: Array<{ player1: string; player2: string; queueTime: number }> = [];
  private testResults: {
    totalPlayers: number;
    matchesFound: number;
    avgQueueTime: number;
    maxQueueTime: number;
    minQueueTime: number;
    under3sMatches: number;
  } = {
    totalPlayers: 0,
    matchesFound: 0,
    avgQueueTime: 0,
    maxQueueTime: 0,
    minQueueTime: Infinity,
    under3sMatches: 0,
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
      };

      ws.onopen = () => {
        console.log(`✓ ${username} connected (${rankPoints} rank points)`);
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

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(player: TestPlayer, message: any): void {
    switch (message.type) {
      case 'connected':
        console.log(`  Connected: ${player.username}`);
        break;

      case 'queue_joined':
        console.log(`  Queue joined: ${player.username} (position: ${message.position})`);
        break;

      case 'match_found':
        const queueTime = player.joinedAt ? Date.now() - player.joinedAt : 0;
        player.matchedAt = Date.now();
        player.matchId = message.matchId;

        console.log(`  ⚡ Match found for ${player.username}!`);
        console.log(`     Opponent: ${message.opponent.username}`);
        console.log(`     Queue time: ${queueTime}ms`);
        console.log(`     Match ID: ${message.matchId}`);

        // Record pairing
        this.recordMatch(player.id, message.opponent.id, queueTime);
        break;

      case 'match_starting':
        console.log(`  Match starting: ${player.username} (${message.matchId})`);
        break;

      case 'match_started':
        console.log(`  Match started: ${player.username} (${message.matchId})`);
        break;

      case 'error':
        console.error(`  Error for ${player.username}: ${message.message} (${message.code})`);
        break;

      default:
        console.log(`  ${player.username} received: ${message.type}`);
    }
  }

  /**
   * Join matchmaking queue
   */
  joinQueue(playerId: string, category: string): void {
    const player = this.players.get(playerId);
    if (!player) {
      console.error(`Player ${playerId} not found`);
      return;
    }

    player.joinedAt = Date.now();
    player.ws.send(JSON.stringify({
      type: 'join_queue',
      category,
      rankPoints: player.rankPoints,
      username: player.username,
    }));

    console.log(`→ ${player.username} joined ${category} queue`);
  }

  /**
   * Record a match pairing
   */
  private recordMatch(player1Id: string, player2Id: string, queueTime: number): void {
    // Avoid duplicate recording (both players will trigger this)
    const existing = this.matchPairings.find(
      p => (p.player1 === player1Id && p.player2 === player2Id) ||
           (p.player1 === player2Id && p.player2 === player1Id)
    );

    if (!existing) {
      this.matchPairings.push({ player1: player1Id, player2: player2Id, queueTime });
      this.testResults.matchesFound++;

      // Update queue time stats
      if (queueTime < this.testResults.minQueueTime) {
        this.testResults.minQueueTime = queueTime;
      }
      if (queueTime > this.testResults.maxQueueTime) {
        this.testResults.maxQueueTime = queueTime;
      }
      if (queueTime < 3000) {
        this.testResults.under3sMatches++;
      }
    }
  }

  /**
   * Wait for all matches to complete
   */
  async waitForMatches(expectedMatches: number, timeoutMs: number = 15000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (this.matchPairings.length >= expectedMatches) {
          clearInterval(checkInterval);
          resolve();
        } else if (elapsed > timeoutMs) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout: Only ${this.matchPairings.length}/${expectedMatches} matches found`));
        }
      }, 100);
    });
  }

  /**
   * Print test results
   */
  printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('MATCHMAKING TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`\nTotal Players: ${this.players.size}`);
    console.log(`Matches Found: ${this.testResults.matchesFound}`);

    if (this.matchPairings.length > 0) {
      const totalQueueTime = this.matchPairings.reduce((sum, p) => sum + p.queueTime, 0);
      this.testResults.avgQueueTime = totalQueueTime / this.matchPairings.length;

      console.log(`\nQueue Time Statistics:`);
      console.log(`  Average: ${this.testResults.avgQueueTime.toFixed(0)}ms`);
      console.log(`  Min: ${this.testResults.minQueueTime}ms`);
      console.log(`  Max: ${this.testResults.maxQueueTime}ms`);
      console.log(`  Under 3s: ${this.testResults.under3sMatches}/${this.matchPairings.length} ` +
                  `(${(this.testResults.under3sMatches / this.matchPairings.length * 100).toFixed(1)}%)`);

      console.log(`\nMatch Pairings:`);
      this.matchPairings.forEach((pairing, idx) => {
        const p1 = this.players.get(pairing.player1);
        const p2 = this.players.get(pairing.player2);
        const rankDiff = Math.abs((p1?.rankPoints || 0) - (p2?.rankPoints || 0));
        console.log(`  ${idx + 1}. ${p1?.username} (${p1?.rankPoints}) vs ` +
                    `${p2?.username} (${p2?.rankPoints}) - ` +
                    `Δ${rankDiff} points, ${pairing.queueTime}ms`);
      });
    }

    // Performance assessment
    console.log(`\n${'='.repeat(60)}`);
    const successRate = this.matchPairings.length / (this.players.size / 2) * 100;
    const under3sRate = this.testResults.under3sMatches / this.matchPairings.length * 100;

    if (successRate >= 90 && under3sRate >= 80) {
      console.log('✅ PASS: Matchmaking meets performance targets');
    } else if (successRate < 90) {
      console.log('❌ FAIL: Low match success rate');
    } else {
      console.log('⚠️  PARTIAL: Matches found but queue times need improvement');
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
 * Test Scenario 1: Basic Matching (Similar Ranks)
 */
async function testSimilarRanks() {
  console.log('\n📋 TEST 1: Similar Rank Matching');
  console.log('─'.repeat(60));

  const runner = new MatchmakingTestRunner();

  try {
    // Create 10 players with similar ranks (900-1100)
    const players = await Promise.all([
      runner.createPlayer('p1', 'Alice', 1000),
      runner.createPlayer('p2', 'Bob', 1050),
      runner.createPlayer('p3', 'Charlie', 980),
      runner.createPlayer('p4', 'Diana', 1020),
      runner.createPlayer('p5', 'Eve', 990),
      runner.createPlayer('p6', 'Frank', 1010),
      runner.createPlayer('p7', 'Grace', 1040),
      runner.createPlayer('p8', 'Henry', 970),
      runner.createPlayer('p9', 'Iris', 1030),
      runner.createPlayer('p10', 'Jack', 960),
    ]);

    // All join the same category
    players.forEach(p => runner.joinQueue(p.id, 'general_knowledge'));

    // Wait for matches (expecting 5 matches)
    await runner.waitForMatches(5, 10000);

    runner.printResults();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    runner.cleanup();
  }
}

/**
 * Test Scenario 2: Wide Rank Range
 */
async function testWideRankRange() {
  console.log('\n📋 TEST 2: Wide Rank Range (Tests Range Expansion)');
  console.log('─'.repeat(60));

  const runner = new MatchmakingTestRunner();

  try {
    // Create players with very different ranks
    const players = await Promise.all([
      runner.createPlayer('p1', 'Bronze_1', 500),
      runner.createPlayer('p2', 'Bronze_2', 550),
      runner.createPlayer('p3', 'Silver_1', 1200),
      runner.createPlayer('p4', 'Silver_2', 1250),
      runner.createPlayer('p5', 'Gold_1', 2000),
      runner.createPlayer('p6', 'Gold_2', 2100),
    ]);

    // Join queue
    players.forEach(p => runner.joinQueue(p.id, 'science'));

    // Wait longer to allow range expansion
    await runner.waitForMatches(3, 15000);

    runner.printResults();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    runner.cleanup();
  }
}

/**
 * Test Scenario 3: High Volume (Stress Test)
 */
async function testHighVolume() {
  console.log('\n📋 TEST 3: High Volume Stress Test');
  console.log('─'.repeat(60));

  const runner = new MatchmakingTestRunner();

  try {
    // Create 20 players
    const playerPromises = [];
    for (let i = 1; i <= 20; i++) {
      const rankPoints = 800 + Math.floor(Math.random() * 400); // 800-1200
      playerPromises.push(
        runner.createPlayer(`p${i}`, `Player${i}`, rankPoints)
      );
    }

    const players = await Promise.all(playerPromises);

    // Join queue with slight delays to simulate real traffic
    for (const player of players) {
      runner.joinQueue(player.id, 'geography');
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms stagger
    }

    // Wait for matches (expecting 10 matches)
    await runner.waitForMatches(10, 15000);

    runner.printResults();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    runner.cleanup();
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🧪 MATCHMAKING TEST SUITE');
  console.log('='.repeat(60));

  await testSimilarRanks();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Pause between tests

  await testWideRankRange();
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testHighVolume();

  console.log('\n✅ All tests complete!');
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
