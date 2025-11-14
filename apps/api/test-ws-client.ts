/**
 * Simple WebSocket test client for Quizzi
 * Run with: bun test-ws-client.ts
 */

const userId = `player_${Date.now()}`;
const ws = new WebSocket(`ws://localhost:3000/ws?userId=${userId}`);

ws.onopen = () => {
  console.log(`✅ Connected as ${userId}`);

  // Test 1: Ping/Pong
  console.log('\n📡 Test 1: Ping/Pong');
  ws.send(JSON.stringify({
    type: 'ping',
    timestamp: Date.now()
  }));

  // Test 2: Join matchmaking queue after 1 second
  setTimeout(() => {
    console.log('\n🎮 Test 2: Join Matchmaking Queue');
    ws.send(JSON.stringify({
      type: 'join_queue',
      category: 'general_knowledge',
      rankPoints: 1000
    }));
  }, 1000);
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`\n📨 Received:`, JSON.stringify(data, null, 2));

  // Handle match found
  if (data.type === 'match_found') {
    console.log(`\n🎯 Match found: ${data.matchId}`);
  }

  // Handle round start
  if (data.type === 'round_start') {
    console.log(`\n❓ Round ${data.roundIndex} started`);
    console.log(`Question: ${data.question.text}`);
    console.log(`Answers:`, data.answers);

    // Simulate answering after random delay
    const delay = Math.floor(Math.random() * 3000) + 500;
    console.log(`⏱️  Will answer in ${delay}ms`);

    setTimeout(() => {
      const answerIndex = Math.floor(Math.random() * 4);
      console.log(`\n✋ Submitting answer: ${answerIndex}`);

      ws.send(JSON.stringify({
        type: 'answer_submit',
        matchId: data.matchId,
        roundIndex: data.roundIndex,
        answerIndex,
        timestamp: Date.now()
      }));
    }, delay);
  }

  // Handle match end
  if (data.type === 'match_end') {
    console.log(`\n🏁 Match ended!`);
    console.log(`Winner: ${data.winner}`);
    console.log(`Final scores:`, data.finalScores);
    console.log(`Stats:`, data.stats);

    // Close connection after match
    setTimeout(() => {
      console.log('\n👋 Closing connection');
      ws.close();
      process.exit(0);
    }, 2000);
  }
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

ws.onclose = () => {
  console.log('\n👋 Disconnected');
  process.exit(0);
};

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n⚠️  Closing connection...');
  ws.close();
  process.exit(0);
});
