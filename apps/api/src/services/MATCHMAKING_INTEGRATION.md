# Matchmaking Queue Integration Guide

## Overview

The matchmaking queue system provides skill-based player pairing with expanding search ranges over time.

**Key Features:**
- Category-specific queues (general_knowledge, geography, science, pop_culture, sports)
- ELO-based matching with expanding ranges (±200 → ±400 → any)
- O(log n) matching performance using binary search
- Same-opponent prevention
- Automatic cleanup of stale entries

## Architecture

```
Client                WebSocket Handler        Matchmaking Queue        Match Manager
  │                          │                         │                      │
  ├─ join_queue ────────────>│                         │                      │
  │                          ├─ addToQueue ──────────>│                      │
  │<──── queue_joined ───────┤                         │                      │
  │                          │                         │                      │
  │                          │                         ├─ findMatch() ───────>│
  │                          │                         │  (immediate/5s/10s)  │
  │                          │<──── match_found ───────┤                      │
  │                          │                         │                      │
  │                          │                         │<─ createMatch() ─────┤
  │<──── match_found ────────┴─────────────────────────┴──────────────────────┤
```

## Integration Steps

### Step 1: Add Matchmaking Instance to Main Server

**File:** `apps/api/src/index.ts`

```typescript
import { matchmakingQueue } from './services/matchmaking-instance';

// After initializing connection manager
connectionManager.initialize();

// Initialize matchmaking queue
console.log('Matchmaking queue initialized');
```

### Step 2: Update Connection Manager

**File:** `apps/api/src/websocket/connection-manager.ts`

Add method to expose socket for matchmaking queue:

```typescript
/**
 * Get WebSocket for a user
 */
getSocket(userId: string): ServerWebSocket<WebSocketData> | undefined {
  const conn = this.connections.get(userId);
  return conn?.ws;
}
```

### Step 3: Update Handlers

Replace the current handlers.ts implementation with the new matchmaking-integrated version.

**Option A: Replace entire file**
```bash
mv apps/api/src/websocket/handlers-updated.ts apps/api/src/websocket/handlers.ts
```

**Option B: Manual update**

Update `handleJoinQueue`:
```typescript
import { matchmakingQueue } from '../services/matchmaking-instance';

async function handleJoinQueue(
  userId: string,
  category: string,
  rankPoints: number,
  username?: string
): Promise<void> {
  // Check if player is already in a match
  const existingMatch = matchManager.getPlayerMatch(userId);
  if (existingMatch) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.ALREADY_IN_MATCH,
      message: 'You are already in a match',
    });
    return;
  }

  // Get player socket
  const socket = connectionManager.getSocket(userId);
  if (!socket) {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NO_CONNECTION,
      message: 'WebSocket connection not found',
    });
    return;
  }

  console.log(`Player ${userId} joining queue: ${category} (${rankPoints} points)`);

  // Get last opponent
  const lastOpponentId = matchmakingQueue.getLastOpponent(userId);

  // Add to matchmaking queue
  matchmakingQueue.addToQueue({
    playerId: userId,
    username: username || 'Player',
    rankPoints,
    category,
    socket,
    lastOpponentId,
  });

  // Notify player
  connectionManager.send(userId, {
    type: 'queue_joined',
    position: matchmakingQueue.getQueuePosition(userId, category),
    category: category as any,
  });
}
```

Update `handleCancelQueue`:
```typescript
function handleCancelQueue(userId: string, category: string): void {
  console.log(`Player ${userId} cancelled queue`);

  const removed = matchmakingQueue.removeFromQueue(userId, category);

  if (removed) {
    connectionManager.send(userId, {
      type: 'queue_left',
    });
  } else {
    connectionManager.send(userId, {
      type: 'error',
      code: ErrorCodes.NOT_IN_QUEUE,
      message: 'You are not in the queue',
    });
  }
}
```

### Step 4: Update Types (if needed)

**File:** `apps/api/src/websocket/types.ts`

Ensure `ClientEvent` includes username for queue joining:

```typescript
export type ClientEvent =
  | { type: 'ping'; timestamp: number }
  | {
      type: 'join_queue';
      category: string;
      rankPoints: number;
      username?: string; // Add this field
    }
  | { type: 'cancel_queue'; category: string }
  | // ... other events
```

### Step 5: Add ELO Updates to Match End

**File:** `apps/api/src/websocket/match-manager.ts`

Update the `endMatch()` method to calculate ELO changes:

```typescript
import { EloService } from '../services/elo-service';

export class MatchManager {
  private eloService = new EloService();

  // ... existing code ...

  private endMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    match.state = 'ended';

    const winner =
      match.scores[match.player1Id] > match.scores[match.player2Id]
        ? match.player1Id
        : match.player2Id;

    const loser =
      winner === match.player1Id ? match.player2Id : match.player1Id;

    console.log(`Match ended: ${matchId}. Winner: ${winner}`);

    // Calculate ELO changes
    const rankUpdates = this.eloService.calculateRankUpdates({
      winnerId: winner,
      loserId: loser,
      winnerRankPoints: this.getPlayerRankPoints(winner), // TODO: Fetch from DB
      loserRankPoints: this.getPlayerRankPoints(loser),   // TODO: Fetch from DB
    });

    // Calculate stats
    const stats1 = this.calculateMatchStats(match, match.player1Id);
    const stats2 = this.calculateMatchStats(match, match.player2Id);

    // Send match end to player 1
    connectionManager.send(match.player1Id, {
      type: 'match_end',
      matchId,
      winner,
      finalScores: {
        player1: match.scores[match.player1Id],
        player2: match.scores[match.player2Id],
      },
      rankPointsChange:
        match.player1Id === winner
          ? rankUpdates.winner.rankChange
          : rankUpdates.loser.rankChange,
      stats: stats1,
    });

    // Send match end to player 2
    connectionManager.send(match.player2Id, {
      type: 'match_end',
      matchId,
      winner,
      finalScores: {
        player1: match.scores[match.player1Id],
        player2: match.scores[match.player2Id],
      },
      rankPointsChange:
        match.player2Id === winner
          ? rankUpdates.winner.rankChange
          : rankUpdates.loser.rankChange,
      stats: stats2,
    });

    // TODO: Persist rank updates to database
    console.log('Rank updates:', rankUpdates);

    // Cleanup
    this.playerMatches.delete(match.player1Id);
    this.playerMatches.delete(match.player2Id);

    setTimeout(() => {
      this.matches.delete(matchId);
      console.log(`Match ${matchId} removed from memory`);
    }, 300000);
  }

  // Temporary method until database integration
  private getPlayerRankPoints(playerId: string): number {
    // TODO: Fetch from database
    return 1000; // Default starting rank
  }
}
```

### Step 6: Handle Disconnects

Update disconnect handling to remove from queue:

**File:** `apps/api/src/websocket/connection-manager.ts`

```typescript
import { matchmakingQueue } from '../services/matchmaking-instance';

removeConnection(userId: string, matchId?: string): void {
  this.connections.delete(userId);

  // Remove from matchmaking queue (try all categories)
  ['general_knowledge', 'geography', 'science', 'pop_culture', 'sports'].forEach(
    (category) => {
      matchmakingQueue.removeFromQueue(userId, category);
    }
  );

  if (matchId) {
    this.handleDisconnect(userId, matchId);
  }

  console.log(`Connection removed: ${userId}`);
}
```

## Testing

### Manual Testing

1. **Start server:**
   ```bash
   cd apps/api
   bun run dev
   ```

2. **Connect two WebSocket clients** (using wscat or similar):
   ```bash
   wscat -c ws://localhost:3001
   ```

3. **Send join_queue events:**
   ```json
   {
     "type": "join_queue",
     "category": "general_knowledge",
     "rankPoints": 1000,
     "username": "Player1"
   }
   ```

4. **Verify responses:**
   - `queue_joined` event received
   - After second player joins, both receive `match_found`
   - Match starts with countdown

### Test Cases

**Test 1: Immediate match within ±200 points**
- Player A: 1000 points
- Player B: 1100 points
- Expected: Match found immediately

**Test 2: Expanded range at 5 seconds**
- Player A: 1000 points
- Wait 5 seconds
- Player B: 1350 points
- Expected: Match found after 5s (within ±400 range)

**Test 3: Any player at 10 seconds**
- Player A: 1000 points
- Wait 10 seconds
- Player B: 2500 points
- Expected: Match found after 10s

**Test 4: Same opponent prevention**
- Player A and B finish match
- Both rejoin queue
- Player C joins
- Expected: A matches with C (or B matches with C), not A-B rematch

**Test 5: Queue cancellation**
- Player A joins queue
- Player A sends `cancel_queue`
- Expected: Removed from queue, timers cleared

## Performance Characteristics

### Time Complexity
- **Add to queue:** O(log n) - binary search insertion
- **Find match:** O(log n + m) where m = candidates in rank range
- **Remove from queue:** O(n) - linear search in sorted array

### Memory Usage
- **Per player in queue:** ~200 bytes (QueueEntry object + timers)
- **1000 players queued:** ~200 KB
- **Cleanup:** Stale entries removed every 10 seconds

### Latency Targets
- **Match finding:** <10ms for <1000 players per category
- **Queue operations:** <5ms for add/remove
- **Cleanup:** <50ms per cleanup cycle

## Monitoring

### Queue Statistics

Get real-time queue stats:
```typescript
const stats = matchmakingQueue.getQueueStats();
console.log(stats);
// {
//   general_knowledge: { queueSize: 15, avgRankPoints: 1234 },
//   geography: { queueSize: 8, avgRankPoints: 1567 },
//   ...
// }
```

### Metrics to Track

1. **Queue time distribution** (p50, p95, p99)
2. **Match quality** (rank difference between matched players)
3. **Queue abandon rate** (players leaving before match)
4. **Same-opponent prevention effectiveness**

## Future Enhancements

### Phase 2: Redis-based Queue
- Move queue state to Redis for multi-server support
- Use Redis Sorted Sets for rank-based matching
- Pub/Sub for cross-server match notifications

### Phase 3: Advanced Matchmaking
- Category preference weighting
- Win streak considerations
- Time-of-day player pools
- Regional matchmaking

## Troubleshooting

### Players not matching
- Check rank points are realistic (1000 ± 2000 range)
- Verify category names match exactly
- Check server logs for timer execution
- Ensure WebSocket connections are active

### Memory leaks
- Verify cleanup interval is running (check logs every 10s)
- Check disconnected players have timers cleared
- Monitor queue sizes with `getQueueStats()`

### Race conditions
- Match creation uses EventEmitter (single-threaded Node.js)
- Player removal clears timers before removing from queue
- MatchManager has lock-based answer processing
