# Matchmaking Queue Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Quizzi WebSocket Server                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   ▼                  ▼                  ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │  Connection      │ │  Matchmaking     │ │  Match           │
        │  Manager         │ │  Queue           │ │  Manager         │
        └──────────────────┘ └──────────────────┘ └──────────────────┘
                │                     │                     │
                │                     │                     │
        ┌───────┴────────┐   ┌────────┴────────┐   ┌───────┴────────┐
        │  WS Connections│   │  Category Queues│   │  Active Matches│
        │  Heartbeat     │   │  Pairing Logic  │   │  Round State   │
        │  Reconnect     │   │  ELO Matching   │   │  Scoring       │
        └────────────────┘   └─────────────────┘   └────────────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   ▼                  ▼                  ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │  Question        │ │  ELO             │ │  Database        │
        │  Service         │ │  Service         │ │  (Future)        │
        └──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Data Flow: Join Queue → Match Start

```
┌─────────┐                                                          ┌─────────┐
│ Client A│                                                          │ Client B│
└────┬────┘                                                          └────┬────┘
     │                                                                    │
     │ 1. join_queue                                                     │
     ├───────────────────────────────────────────────┐                   │
     │                                                ▼                   │
     │                                    ┌───────────────────────┐      │
     │                                    │  WebSocket Handler    │      │
     │                                    └───────────┬───────────┘      │
     │                                                ▼                   │
     │                                    ┌───────────────────────┐      │
     │                                    │  Matchmaking Queue    │      │
     │                                    │  - addToQueue()       │      │
     │                                    │  - findMatch()        │      │
     │ 2. queue_joined                    └───────────┬───────────┘      │
     │◄───────────────────────────────────────────────┘                  │
     │                                                                    │
     │                                                      3. join_queue │
     │                                    ┌───────────────────────────┐  │
     │                                    │  Matchmaking Queue        │◄─┤
     │                                    │  - Player B added         │  │
     │                                    │  - findMatch() called     │  │
     │                                    │  - Match found! (±200)    │  │
     │                                    └───────────┬───────────────┘  │
     │                                                │                  │
     │                                                ▼                  │
     │                                    ┌───────────────────────┐      │
     │                                    │  match_found event    │      │
     │                                    └───────────┬───────────┘      │
     │                                                │                  │
     │                                                ▼                  │
     │                                    ┌───────────────────────┐      │
     │                                    │  Match Manager        │      │
     │                                    │  - createMatch()      │      │
     │                                    │  - prepareRounds()    │      │
     │                                    │  - startCountdown()   │      │
     │                                    └───────────┬───────────┘      │
     │                                                │                  │
     │ 4. match_found                                 │ 4. match_found   │
     │◄───────────────────────────────────────────────┴─────────────────>│
     │                                                                    │
     │ 5. match_starting (3)                          5. match_starting  │
     │◄───────────────────────────────────────────────────────────────────>
     │ 6. match_starting (2)                          6. match_starting  │
     │◄───────────────────────────────────────────────────────────────────>
     │ 7. match_starting (1)                          7. match_starting  │
     │◄───────────────────────────────────────────────────────────────────>
     │                                                                    │
     │ 8. match_started                               8. match_started   │
     │◄───────────────────────────────────────────────────────────────────>
     │                                                                    │
     │ 9. round_start                                 9. round_start     │
     │   (question + randomized answers)                (same question,  │
     │                                                   different order) │
     │◄───────────────────────────────────────────────────────────────────>
```

## Matchmaking Queue Data Structures

### Queue Organization

```
MatchmakingQueue
├── queues: Map<string, CategoryQueue>
│   ├── "general_knowledge" → CategoryQueue
│   │   ├── entries: Map<string, QueueEntry>
│   │   │   ├── "player1" → QueueEntry
│   │   │   ├── "player2" → QueueEntry
│   │   │   └── ...
│   │   └── sortedByRank: QueueEntry[]
│   │       └── [sorted by rankPoints for O(log n) search]
│   ├── "geography" → CategoryQueue
│   ├── "science" → CategoryQueue
│   ├── "pop_culture" → CategoryQueue
│   └── "sports" → CategoryQueue
└── lastOpponents: Map<string, string>
    ├── "player1" → "player2"
    └── "player2" → "player1"
```

### QueueEntry Structure

```typescript
QueueEntry {
  playerId: string           // Unique player identifier
  username: string           // Display name
  rankPoints: number         // ELO rating
  category: string           // Queue category
  socket: WebSocket          // Active WebSocket connection
  joinedAt: number           // Timestamp (for metrics)
  lastOpponentId?: string    // Prevent consecutive rematches
  expandedRangeTimer?: Timer // 5s timer for ±400 range
  anyPlayerTimer?: Timer     // 10s timer for any match
}
```

## Matchmaking Algorithm

### Pairing Logic (Binary Search)

```
Player joins queue with rankPoints = 1000

┌─────────────────────────────────────────────────────┐
│ STEP 1: Insert into sorted array (O(log n))        │
└─────────────────────────────────────────────────────┘

Before: [800, 900, 1100, 1200, 1500]
                      ▲
                   Insert 1000
After:  [800, 900, 1000, 1100, 1200, 1500]

┌─────────────────────────────────────────────────────┐
│ STEP 2: Find match within ±200 range               │
└─────────────────────────────────────────────────────┘

Target range: [800, 1200]

Binary search lower bound (800):
  - Start: [800, 900, 1000, 1100, 1200, 1500]
  - Index: 0 (first element ≥ 800)

Binary search upper bound (1200):
  - Start: [800, 900, 1000, 1100, 1200, 1500]
  - Index: 4 (last element ≤ 1200)

Candidates: [800, 900, 1000, 1100, 1200]

Filter:
  - Skip self (1000)
  - Skip last opponent (if any)
  - First valid candidate: 1100

Result: Match found! (rank difference: 100)

┌─────────────────────────────────────────────────────┐
│ STEP 3: If no match, set timers                    │
└─────────────────────────────────────────────────────┘

If no match within ±200:
  → Set 5s timer (expand to ±400)
  → Set 10s timer (match anyone)
```

### Expanding Range Timeline

```
Time:  0s          5s          10s
       │           │           │
       ▼           ▼           ▼

Range: ±200       ±400        ∞ (any player)

Example:
Player A: 1000 points

t=0s:   Match within [800, 1200]
        ❌ No match found

t=5s:   Match within [600, 1400]
        ✅ Player B (1350 points) matched!

t=10s:  Match within [0, ∞]
        (fallback if still no match)
```

## ELO Rating System

### Rank Tiers

```
Diamond  │ ≥ 2400 ────────────────────────────────────────────→ ∞
         │
Platinum │ 2000 ──────────────────────────────────────────→ 2399
         │
Gold     │ 1600 ──────────────────────────────────→ 1999
         │
Silver   │ 1200 ──────────────────────→ 1599
         │
Bronze   │ 0 ──────────────→ 1199
```

### ELO Calculation

```
Expected Score (E) = 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))

New Rating = Old Rating + K × (Actual Score - Expected Score)

Where:
  - K = 32 (volatility factor)
  - Actual Score = 1 (win), 0.5 (draw), 0 (loss)
```

### Example Calculations

**Equal Players (1000 vs 1000):**
```
Player A (1000) beats Player B (1000)

Expected: E_A = 1 / (1 + 10^0) = 0.5 (50% chance)
Actual:   S_A = 1 (win)

Change: 32 × (1 - 0.5) = +16
New Rating: 1000 + 16 = 1016

Player B: 1000 + 32 × (0 - 0.5) = 984
```

**Underdog Wins (1000 vs 1400):**
```
Player A (1000) beats Player B (1400)

Expected: E_A = 1 / (1 + 10^((1400-1000)/400))
            = 1 / (1 + 10^1)
            = 1 / 11
            = 0.09 (9% chance)

Actual:   S_A = 1 (win)

Change: 32 × (1 - 0.09) = +29
New Rating: 1000 + 29 = 1029

Player B: 1400 + 32 × (0 - 0.91) = 1371
```

**Favorite Wins (1400 vs 1000):**
```
Player A (1400) beats Player B (1000)

Expected: E_A = 1 / (1 + 10^((1000-1400)/400))
            = 1 / (1 + 10^-1)
            = 0.91 (91% chance)

Actual:   S_A = 1 (win)

Change: 32 × (1 - 0.91) = +3
New Rating: 1400 + 3 = 1403

Player B: 1000 + 32 × (0 - 0.09) = 997
```

## Performance Characteristics

### Time Complexity

| Operation          | Complexity     | Notes                                    |
|--------------------|----------------|------------------------------------------|
| Add to queue       | O(log n)       | Binary search insertion                  |
| Find match         | O(log n + m)   | Binary search + linear scan of candidates|
| Remove from queue  | O(n)           | Linear search in sorted array            |
| Get queue stats    | O(c)           | c = number of categories                 |
| Cleanup stale      | O(n)           | Linear scan, runs every 10s              |

### Space Complexity

| Component         | Memory per Entry | 1000 Players |
|-------------------|------------------|--------------|
| QueueEntry        | ~200 bytes       | ~200 KB      |
| Sorted array      | 8 bytes (ref)    | 8 KB         |
| Last opponents    | 32 bytes         | 32 KB        |
| **Total**         |                  | **~250 KB**  |

### Latency Targets

| Operation           | Target    | Actual (1000 players) |
|---------------------|-----------|----------------------|
| Add to queue        | <5ms      | <2ms                 |
| Find match          | <10ms     | <5ms                 |
| Remove from queue   | <5ms      | <3ms                 |
| Queue stats         | <5ms      | <1ms                 |

## Concurrency & Thread Safety

### Node.js Single-Threaded Model

```
All queue operations are synchronous and run in the main event loop.
No locks required due to JavaScript's single-threaded execution.

Event Loop:
┌───────────────────────────┐
│  Player A joins queue     │
├───────────────────────────┤
│  Player B joins queue     │
├───────────────────────────┤
│  Match found event        │
├───────────────────────────┤
│  Create match             │
├───────────────────────────┤
│  Timer callback (5s)      │
└───────────────────────────┘
```

### Timer Management

```
Player joins queue:
  1. Add to queue
  2. Try immediate match
  3. If no match:
     - setTimeout(() => expandedRangeMatch(), 5000)
     - setTimeout(() => anyPlayerMatch(), 10000)

Player removed or matched:
  - clearTimeout(expandedRangeTimer)
  - clearTimeout(anyPlayerTimer)
```

## Monitoring & Metrics

### Key Metrics

```typescript
interface MatchmakingMetrics {
  // Queue metrics
  queueSize: number;              // Current players in queue
  avgQueueTime: number;           // Average wait time
  p95QueueTime: number;           // 95th percentile wait

  // Match quality
  avgRankDifference: number;      // How close matches are
  matchesWithinInitialRange: number; // % matched at ±200
  matchesWithinExpandedRange: number; // % matched at ±400
  matchesAtAnyRange: number;      // % matched at 10s+

  // Performance
  matchFindingLatency: number;    // Time to find match
  queueOperationLatency: number;  // Add/remove time
}
```

### Logging Example

```
[MATCHMAKING] Player player1 joined queue: general_knowledge (1000 points)
[MATCHMAKING] Player player2 joined queue: general_knowledge (1050 points)
[MATCHMAKING] Match found! player1 vs player2 in general_knowledge (queue: 342ms)
[METRIC] {"event":"match_created","queueTime":342,"category":"general_knowledge","rankDifference":50}
```

## Failure Scenarios & Recovery

### Player Disconnect During Queue

```
Player disconnects:
  → ConnectionManager.removeConnection()
  → Remove from all category queues
  → Clear timers
  → No match created
```

### WebSocket Error During Match Creation

```
Match found:
  → Create match via MatchManager
  → If error:
     - Log error
     - Send error event to both players
     - Players can rejoin queue
```

### Stale Queue Entries

```
Cleanup runs every 10s:
  → Check joinedAt timestamp
  → Check WebSocket state
  → If stale (>30s and socket closed):
     - Remove from queue
     - Clear timers
```

## Future Enhancements

### Phase 2: Redis-based Queue (Multi-server Support)

```
Current (Single Server):
  - In-memory Map<>
  - Single event loop
  - No persistence

Future (Redis):
  - Redis Sorted Sets (ZADD, ZRANGE)
  - Cross-server Pub/Sub
  - Persistence across restarts
```

### Phase 3: Advanced Matchmaking

```
- MMR (Matchmaking Rating) separate from visible rank
- Hidden variables: win streak, recent performance
- Category skill ratings (per-category MMR)
- Time-of-day player pools
- Regional matchmaking
```

## File Structure

```
apps/api/src/
├── services/
│   ├── matchmaking-queue.ts          # Core queue logic
│   ├── matchmaking-instance.ts       # Singleton + match integration
│   ├── elo-service.ts                # Rank calculations
│   ├── MATCHMAKING_INTEGRATION.md    # Integration guide
│   ├── ARCHITECTURE.md               # This file
│   └── __tests__/
│       ├── matchmaking-queue.test.ts
│       └── elo-service.test.ts
├── websocket/
│   ├── handlers.ts                   # WebSocket event handlers
│   ├── handlers-updated.ts           # Example integration
│   ├── match-manager.ts              # Match state management
│   └── connection-manager.ts         # WebSocket connections
```
