# Matchmaking Screen Flow

Visual reference for the matchmaking user experience.

## Screen States

### 1. Category Selection (Idle State)

```
┌─────────────────────────────────────┐
│  ← Back                             │
├─────────────────────────────────────┤
│                                     │
│  Choose Your Battle                 │
│  Select a category to start         │
│  matchmaking                        │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │     🧠      │  │     🌍      │  │
│  │  General    │  │ Geography   │  │
│  │ Knowledge   │  │             │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │     🔬      │  │     ⭐      │  │
│  │  Science    │  │ Pop Culture │  │
│  │             │  │             │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────┐                    │
│  │     🏀      │                    │
│  │   Sports    │                    │
│  │             │                    │
│  └─────────────┘                    │
│                                     │
└─────────────────────────────────────┘
```

**Component:** `CategorySelection`
**State:** `matchmakingState === 'idle'`

### 2. Searching for Opponent (Queue State)

```
┌─────────────────────────────────────┐
│                                  🟢 │ ← Connection indicator
├─────────────────────────────────────┤
│                                     │
│                                     │
│            ╔═══════╗                │
│            ║  ⚔️  ║                │ ← Pulsing animation
│            ╚═══════╝                │
│                                     │
│   Searching for Opponent            │
│   General Knowledge                 │
│                                     │
│   ┌──────────────────────────┐     │
│   │ ⚙️  Finding match...     │     │
│   │ 👥  Position 3           │     │
│   │ ⏱️  8s                   │     │
│   │ ⏳  Est. ~10s            │     │
│   └──────────────────────────┘     │
│                                     │
│   Matching you with an opponent    │
│   of similar skill level           │
│                                     │
│   ┌──────────────────────────┐     │
│   │   ❌  Cancel             │     │
│   └──────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**Component:** `QueueStatus`
**State:** `matchmakingState === 'searching'`
**Updates:** Timer increments every second

### 3. Match Found (Modal Overlay)

```
┌─────────────────────────────────────┐
│  ███████████████████████████████    │ ← Semi-transparent overlay
│  ███████████████████████████████    │
│  ██┌─────────────────────────┐██    │
│  ██│         ✅              │██    │
│  ██│                         │██    │
│  ██│     Match Found!        │██    │
│  ██│                         │██    │
│  ██│  ────────  VS  ────────│██    │
│  ██│                         │██    │
│  ██│  ┌───────────────────┐  │██    │
│  ██│  │  👤   Player2     │  │██    │
│  ██│  │  🥉   Bronze      │  │██    │
│  ██│  │       1050 pts    │  │██    │
│  ██│  │  +50 points       │  │██    │
│  ██│  └───────────────────┘  │██    │
│  ██│                         │██    │
│  ██│  Battle starting...     │██    │
│  ██│                         │██    │
│  ██└─────────────────────────┘██    │
│  ███████████████████████████████    │
└─────────────────────────────────────┘
```

**Component:** `MatchFoundModal`
**State:** `matchmakingState === 'match_found'`
**Animation:** Scale + fade + slide entrance
**Auto-dismiss:** 3 seconds → navigate to Battle

### 4. Transition to Battle Screen

```
┌─────────────────────────────────────┐
│  ← Leave     GENERAL KNOWLEDGE      │
├─────────────────────────────────────┤
│                                     │
│   You                  Opponent     │
│   [👤] 0          0 [👤]            │
│                                     │
│   Battle Screen Placeholder         │
│   Coming Soon                       │
│                                     │
│   Match ID: abc123                  │
│   Opponent: Player2 (1050 pts)     │
│   Category: general_knowledge       │
│                                     │
│   This screen will be implemented   │
│   by another agent                  │
│                                     │
└─────────────────────────────────────┘
```

**Component:** `BattleScreen`
**Route:** `navigation.navigate('Battle', { matchId, ... })`

## State Transitions

```
     ┌──────────┐
     │   Idle   │
     └─────┬────┘
           │ User taps category
           │
           ▼
     ┌──────────┐
     │Searching │
     └─────┬────┘
           │ Server sends match_found
           │
           ▼
  ┌────────────────┐
  │ Match Found    │
  │ (Modal)        │
  └────────┬───────┘
           │ Auto-dismiss after 3s
           │
           ▼
     ┌──────────┐
     │  Battle  │
     └──────────┘
```

## User Actions & Events

### Category Selection → Queue
```
User Action: Tap "General Knowledge" card
    ↓
Client Event: send({ type: 'join_queue', category: 'general_knowledge', ... })
    ↓
Server Event: { type: 'queue_joined', position: 1, category: 'general_knowledge' }
    ↓
UI Update: Show QueueStatus component
```

### Cancel Queue
```
User Action: Tap "Cancel" button
    ↓
Client Event: send({ type: 'cancel_queue', category: 'general_knowledge' })
    ↓
Server Event: { type: 'queue_left' }
    ↓
UI Update: Return to CategorySelection
```

### Match Found
```
Server Event: { type: 'match_found', matchId: '...', opponent: {...}, ... }
    ↓
UI Update: Show MatchFoundModal with opponent info
    ↓
Wait: 3 seconds
    ↓
Navigation: navigate('Battle', { matchId, ... })
```

## Animation Timeline

### Queue Status Pulse Animation
```
0ms ────────────────> 1000ms ────────────────> 2000ms
scale: 1.0              scale: 1.2              scale: 1.0
                        (loop)
```

### Match Found Modal Entrance
```
0ms ──────> 300ms ──────> 400ms
scale: 0    scale: 1     complete
fade: 0     fade: 1
slide: 50   slide: 0
```

### Auto-dismiss Timer
```
0ms ─────────────────────────────────────> 3000ms
Modal visible                              Navigate to Battle
Show opponent info                         Hide modal
```

## Color Coding

### Categories
- **General Knowledge:** #FF6B9D (Pink)
- **Geography:** #4ECDC4 (Teal)
- **Science:** #95E1D3 (Mint)
- **Pop Culture:** #FFE66D (Yellow)
- **Sports:** #FF6B35 (Orange)

### Rank Tiers
- **Bronze:** #CD7F32
- **Silver:** #C0C0C0
- **Gold:** #FFD700
- **Platinum:** #E5E4E2
- **Diamond:** #B9F2FF

### UI States
- **Success:** #00B894 (Green)
- **Error:** #D63031 (Red)
- **Warning:** #FDCB6E (Yellow)
- **Primary:** #6C5CE7 (Purple)

## Responsive Behavior

### Category Grid Layout
```
Screen Width < 400px:
┌─────────────────┐
│  [Cat1] [Cat2]  │
│  [Cat3] [Cat4]  │
│  [Cat5]         │
└─────────────────┘

Screen Width > 400px:
┌─────────────────┐
│ [Cat1] [Cat2]   │
│ [Cat3] [Cat4]   │
│ [Cat5]          │
└─────────────────┘
```

### Match Found Modal
- Width: Screen width - 64px
- Max width: 400px
- Centered on screen
- Blur overlay behind

## Error States

### Connection Error
```
┌─────────────────────────────────────┐
│                                  🔴 │ ← Red indicator
│                                     │
│  ⚠️  Connection Error               │
│                                     │
│  Not connected to server.           │
│  Please try again.                  │
│                                     │
│  [Retry]                            │
└─────────────────────────────────────┘
```

### Already in Queue
```
Alert Modal:
┌────────────────────┐
│ Error              │
├────────────────────┤
│ You are already    │
│ in a match         │
│                    │
│      [OK]          │
└────────────────────┘
```

## Performance Targets

- **Initial Render:** <100ms
- **Category Tap Response:** <50ms
- **Animation Frame Rate:** 60 FPS
- **WebSocket Latency:** <100ms
- **State Update:** <16ms

## Accessibility

- **Touch Targets:** Minimum 44x44 points
- **Color Contrast:** WCAG AA compliant
- **Text Sizes:** Minimum 12pt
- **Screen Reader:** All buttons labeled
- **Haptic Feedback:** On category tap
