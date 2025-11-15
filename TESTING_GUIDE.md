# Quizzi Complete Flow Testing Guide

## Overview

This guide walks you through testing the complete Quizzi mobile app with the backend WebSocket server.

---

## Prerequisites

✅ Backend server is running on port 3000
✅ Mobile app updated to connect to `ws://localhost:3000/ws`
✅ 240 questions cached across 5 categories

---

## Step 1: Start the Backend Server

The backend server is **already running** at:
- HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000/ws`

**To check server status:**
```bash
tail -f /tmp/quizzi-server.log
```

**To restart if needed:**
```bash
lsof -ti:3000 | xargs kill -9
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/api
~/.bun/bin/bun --hot src/index.ts
```

---

## Step 2: Start the Mobile App

### Option A: Using Expo Go (Recommended for Quick Testing)

```bash
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm start
```

Then:
1. Scan QR code with Expo Go app on your phone
2. **OR** press `i` for iOS Simulator
3. **OR** press `a` for Android Emulator

### Option B: iOS Simulator

```bash
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm ios
```

### Option C: Android Emulator

```bash
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm android
```

---

## Step 3: Test Complete Flow (Single Player)

### 3.1 Profile Screen (Initial View)

**What You Should See:**
- Profile screen with mock user data
- Username: "TestPlayer"
- Rank: Bronze (1000 points)
- Stats: Win rate, streak, matches played, avg response time
- Category performance breakdown
- Match history (mock data)

### 3.2 Navigate to Matchmaking

Currently the app shows Profile screen by default. To test matchmaking, you'll need to:

**Temporary Test:** Modify `/apps/mobile/App.tsx` to show MatchmakingScreen instead:

```tsx
// Change this line:
export default function App() {
  return <ProfileScreen />;
}

// To this:
import { MatchmakingScreen } from './src/screens/Matchmaking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
        <Stack.Screen name="Battle" component={BattleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3.3 Test Matchmaking Queue

**Actions:**
1. Select a category (e.g., "General Knowledge")
2. App sends `join_queue` event to server

**What You Should See:**
- "Searching for opponent..." message
- Elapsed time counter (0s, 1s, 2s...)
- Queue position display
- Cancel button

**Backend Logs:**
```
Player <userId> joining queue: general_knowledge (1000 points)
```

**What Happens:**
- Since you're the only player, no immediate match
- After 5 seconds: search range expands to ±400 points
- After 10 seconds: will match with any available player

### 3.4 Cancel Queue

**Actions:**
1. Click "Cancel Search" button
2. App sends `cancel_queue` event

**What You Should See:**
- Return to category selection
- Queue timer resets

**Backend Logs:**
```
Player removed from queue
```

---

## Step 4: Test Complete Flow (Two Players)

To properly test matchmaking and battles, you need TWO simultaneous clients.

### Method 1: Two Physical Devices

1. **Device 1:** Join Expo Go and scan QR code
2. **Device 2:** Join Expo Go and scan same QR code
3. Both devices connect to same backend server

### Method 2: iOS Simulator + Android Emulator

```bash
# Terminal 1: Start iOS
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm ios

# Terminal 2: Start Android
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm android
```

### Method 3: Two iOS Simulators

```bash
# Terminal 1
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm ios

# Terminal 2 (after first simulator is running)
# Open second simulator manually from Xcode → Window → Devices and Simulators
# Then run Expo on second device
```

### Two-Player Test Flow

**Player 1:**
1. Select "General Knowledge"
2. See "Searching..." state
3. Wait...

**Player 2:**
1. Select "General Knowledge" (same category!)
2. **MATCH FOUND!** (should happen within <1 second)

**What Both Players Should See:**
1. Match Found modal with opponent info
2. Opponent username and rank points
3. Rank difference display
4. Auto-dismiss after 3 seconds → Navigate to Battle Screen

**Backend Logs:**
```
Player p1 joining queue: general_knowledge (1000 points)
Player p2 joining queue: general_knowledge (1000 points)
Match found! Player2 vs Player1 in general_knowledge (queue: 0ms)
Match created: <matchId>
```

---

## Step 5: Test Battle Screen

**What You Should See:**

### Match Starting Countdown
- "Match starting in 3..."
- "Match starting in 2..."
- "Match starting in 1..."
- "Match Started!"

### Round 1/5
- Question text displayed
- 4 answer buttons (A, B, C, D)
- 10-second countdown timer
- Scoreboard showing 0-0

### Answer Selection
1. Tap an answer button
2. **Haptic feedback** (phone vibrates)
3. Button visual state changes (selected)
4. Answer sent to server

### Round Result
- Correct answer highlighted in green
- Wrong answer (if selected) highlighted in red
- Score updates (e.g., "1-0")
- 2-second pause before next round

### Round Progression
- Automatic progression through 5 rounds
- Best of 5 format (first to 3 wins)
- Real-time score sync between players

### Match End
- Winner announcement
- Final scores display
- Rank points change (+16 or -16 for equal players)
- Option to return to matchmaking

**Backend Logs:**
```
Match starting countdown: 3
Match starting countdown: 2
Match starting countdown: 1
Round 1 started
Player p1 answered: index 2, time: 3456ms
Player p2 answered: index 1, time: 4123ms
Round 1 ended: Winner p1
Round 2 started
...
Match ended: Winner p1 (3-2)
```

---

## Step 6: Test Edge Cases

### 6.1 WebSocket Disconnect During Match

**Test:**
1. Start a match between two players
2. Turn off WiFi on one device mid-match
3. Wait 10 seconds
4. Turn WiFi back on

**Expected Behavior:**
- Match pauses when player disconnects
- 10-second grace period for reconnection
- Match resumes if player reconnects within 10s
- Match ends with opponent win if grace period expires

**Backend Logs:**
```
Player p1 disconnected from match <matchId>. Grace period: 10000ms
Pausing match <matchId> due to p1 disconnect
[10 seconds later, if reconnected]
Player p1 reconnected to match <matchId>
Resuming match <matchId> - p1 reconnected
```

### 6.2 Answer Timeout (No Answer Selected)

**Test:**
1. Start a round
2. Don't tap any answer
3. Wait for 10-second timer to expire

**Expected Behavior:**
- Round ends automatically
- No points awarded for timeout
- Next round starts after 2-second pause

### 6.3 Category Isolation

**Test:**
1. Player 1 joins "General Knowledge" queue
2. Player 2 joins "Geography" queue

**Expected Behavior:**
- Players do NOT match (different categories)
- Both remain in queue searching

### 6.4 ELO Rank Updates

**Test:**
1. Complete a full 5-round match
2. Check final rank points change

**Expected for Equal Players (1000 vs 1000):**
- Winner: +16 points → 1016
- Loser: -16 points → 984

**Backend Logs:**
```
ELO update: Winner 1000 → 1016 (+16)
ELO update: Loser 1000 → 984 (-16)
```

---

## Step 7: Monitor Server Logs

**Watch Real-Time Logs:**
```bash
tail -f /tmp/quizzi-server.log
```

**Key Events to Watch:**
- WebSocket connections: `WebSocket opened: <userId>`
- Queue joining: `Player <userId> joining queue`
- Match finding: `Match found! <p1> vs <p2>`
- Match creation: `Match created: <matchId>`
- Round events: `Round X started/ended`
- Answer submissions: `Player answered`
- Match completion: `Match ended`
- Disconnections/Reconnections

---

## Troubleshooting

### Mobile App Won't Connect

**Symptoms:**
- "Disconnected" status in app
- No WebSocket events in server logs

**Solutions:**
1. Check server is running: `lsof -ti:3000`
2. Verify WebSocket URL: `ws://localhost:3000/ws`
3. If using physical device, use computer's IP address:
   ```tsx
   url: 'ws://192.168.x.x:3000/ws'  // Replace with your IP
   ```
4. Check firewall settings

### Match Not Starting

**Symptoms:**
- Match found, but battle screen doesn't load
- Stuck on "Match starting..."

**Solutions:**
1. Check server logs for errors
2. Verify `match_starting` events are sent
3. Check navigation is configured in App.tsx

### Questions Not Displaying

**Symptoms:**
- Battle screen loads but no question text
- Answer buttons empty

**Solutions:**
1. Check question cache in server logs: "Total questions cached: 240"
2. Verify round_start event contains question data
3. Check mobile app logs for parsing errors

### TypeScript Errors

```bash
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm type-check
```

Should show **zero errors**. If errors appear, check:
- Import paths
- Type definitions in `@quizzi/types`
- useWebSocket hook usage

---

## Success Criteria

✅ **Matchmaking:**
- Two players can join same category queue
- Match found within <1 second for ±200 rank range
- Match found modal displays correctly
- Navigation to Battle screen works

✅ **Battle:**
- 3-2-1 countdown displays
- 5 rounds play out correctly
- Questions display with 4 randomized answers
- 10-second timer counts down accurately
- Haptic feedback triggers on answer tap
- Scores sync in real-time between players
- Winner determined correctly (first to 3)

✅ **Real-Time Sync:**
- Both players see same question (±50ms)
- First correct answer wins round
- Scores update simultaneously
- Round transitions synchronized

✅ **ELO System:**
- Rank points update after match
- Winner gains points, loser loses points
- Changes match ELO formula expectations

✅ **Reconnection:**
- Match pauses on disconnect
- 10-second grace period honored
- Match resumes on reconnect within window
- Match ends if grace period expires

---

## Next Steps After Successful Testing

1. **Fix any bugs discovered**
2. **Implement authentication** (replace MOCK_USER)
3. **Add navigation menu** (Profile ↔ Matchmaking ↔ Battle)
4. **Connect to database** for persistent stats
5. **Add sound effects and animations**
6. **Deploy to TestFlight/Play Store Beta**

---

## Quick Start Commands

```bash
# Terminal 1: Backend Server (already running)
tail -f /tmp/quizzi-server.log

# Terminal 2: Mobile App
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
pnpm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

---

## Current Server Status

✅ Running on port 3000
✅ WebSocket endpoint: `/ws`
✅ 240 questions cached
✅ Matchmaking queue ready
✅ ELO service initialized

**Server Log Location:** `/tmp/quizzi-server.log`

---

## Testing Checklist

- [ ] Backend server running
- [ ] Mobile app connects to WebSocket
- [ ] Category selection works
- [ ] Queue joining works
- [ ] Two players can matchmake
- [ ] Match found modal displays
- [ ] Battle screen loads
- [ ] Questions display correctly
- [ ] Answers are randomized per player
- [ ] Timer counts down
- [ ] Haptic feedback works
- [ ] Answer selection works
- [ ] Correct/incorrect feedback shows
- [ ] Scores sync between players
- [ ] Rounds progress automatically
- [ ] Match ends after 5 rounds
- [ ] Winner is determined correctly
- [ ] Rank points update
- [ ] Reconnection works
- [ ] Edge cases handled gracefully

---

**Good luck with testing! The complete flow is ready to validate.**
