// Quick WebSocket test
const WebSocket = require('ws');

const token = 'cmi4ymw7r0000pvtj6mdmzk1s.mi4ymw89.ov4oqtydiig';
const wsUrl = `wss://quizzi-slc-production.up.railway.app/ws?token=${encodeURIComponent(token)}`;

console.log('Connecting to:', wsUrl);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
});

ws.on('message', (data) => {
  console.log('📨 Received:', data.toString());
  setTimeout(() => ws.close(), 1000);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout - closing');
  ws.close();
  process.exit(1);
}, 5000);
