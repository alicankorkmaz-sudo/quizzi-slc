# Quizzi v2 User Stories

## Epic 1: Matchmaking & Game Setup

### User Story 1.1: Quick Match

**As a** player, **I want to** find an opponent quickly, **so that** I can start playing within seconds.

**Acceptance Criteria:**

- Matchmaking initiates within 500ms of tapping "Play"
- System finds opponent within 3 seconds (p95)
- Players are matched within ±200 rank points when possible
- If no match found within 5 seconds, expand search to ±400 rank points
- If no match found within 10 seconds, match with any available player
- Loading indicator shows elapsed time and "Searching for opponent..."
- Player can cancel matchmaking at any time
- System prevents matching with same opponent twice in a row

### User Story 1.2: Match Confirmation

**As a** player, **I want to** see my opponent's profile before the match starts, **so that** I know who I'm competing against.

**Acceptance Criteria:**

- Display opponent's username, avatar, and rank badge for 2 seconds
- Show opponent's win rate and current streak
- Both players must be connected before match begins
- If opponent disconnects during intro, return to matchmaking
- Smooth transition animation from opponent reveal to game start

## Epic 2: Core Battle Mechanics

### User Story 2.1: Real-time Question Display

**As a** player, **I want to** see questions appear simultaneously with my opponent, **so that** we have a fair competition.

**Acceptance Criteria:**

- Questions sync within 50ms between devices
- Same question appears for both players at exact same time
- Question text is clearly readable (minimum 16pt font)
- 4 answer options displayed in randomized order per player
- Visual countdown timer (10 seconds per question)
- Questions cannot be answered until fully displayed

### User Story 2.2: Answer Selection

**As a** player, **I want to** tap my answer quickly and see immediate feedback, **so that** I know if I was faster than my opponent.

**Acceptance Criteria:**

- Tap registers within 100ms with haptic feedback
- Correct answer turns green immediately upon selection
- Wrong answer turns red, correct answer highlighted in green
- If opponent answers first, their selection appears on my screen
- "TOO SLOW!" indicator if opponent was faster with correct answer
- "CORRECT!" indicator with time bonus if player was first
- Answers lock after first tap (no changing selection)

### User Story 2.3: Round Progression

**As a** player, **I want to** track my progress through the match, **so that** I know the current score and remaining rounds.

**Acceptance Criteria:**

- Score display shows current round (1/5, 2/5, etc.)
- Win indicators (stars/checkmarks) for completed rounds
- 2-second pause between rounds showing round winner
- "MATCH POINT" indicator when a player can win
- Best of 5 format (first to 3 rounds wins)
- Automatic progression to next round without user input

### User Story 2.4: Match Completion

**As a** player, **I want to** see match results and rank changes, **so that** I understand my performance impact.

**Acceptance Criteria:**

- Victory/Defeat screen with animation (2 seconds)
- Display final score (e.g., "3-2")
- Show rank points gained/lost with animation (+15 points)
- Display new rank and progress to next tier
- Average response time for both players
- "Play Again" and "Home" buttons
- Auto-return to home after 15 seconds of inactivity

## Epic 3: Question Management

### User Story 3.1: Category Selection

**As a** player, **I want to** choose my preferred category, **so that** I can play topics I enjoy.

**Acceptance Criteria:**

- Display 5 category cards: General Knowledge, Geography, Science, Pop Culture, Sports
- Show question count available per category
- Random category option for variety
- Selected category applies to entire match
- Both players must agree on category (vote system)
- If no agreement in 5 seconds, random selection

### User Story 3.2: Question Variety

**As a** player, **I want to** see different questions each match, **so that** gameplay stays fresh.

**Acceptance Criteria:**

- No question repeats within same match
- Questions randomized from pool of 200 per category
- Track last 50 questions shown to player (prevent recent repeats)
- Difficulty varies within match (2 easy, 2 medium, 1 hard)
- Question rotation refreshes every 24 hours

## Epic 4: Player Profile & Progression

### User Story 4.1: Profile Creation

**As a** new player, **I want to** create my profile quickly, **so that** I can start playing immediately.

**Acceptance Criteria:**

- Username validation (3-16 characters, alphanumeric + underscore)
- Unique username enforcement
- Choose from 12 default avatars
- Skip option to use guest account (Guest_XXXX)
- Profile creation completes in under 30 seconds
- One-time process (saved locally and server-side)

### User Story 4.2: Rank Display

**As a** player, **I want to** see my rank and progress, **so that** I can track my improvement.

**Acceptance Criteria:**

- Display current tier (Bronze, Silver, Gold, Platinum, Diamond)
- Show exact rank points (e.g., 1,250)
- Progress bar to next tier
- Points needed for next tier clearly shown
- Rank badge displayed on all screens
- Tier promotion/demotion animations

### User Story 4.3: Statistics Tracking

**As a** player, **I want to** view my performance statistics, **so that** I can see my strengths and weaknesses.

**Acceptance Criteria:**

- Total matches played
- Win rate percentage
- Current and best win streak
- Average response time
- Performance by category (win rate per topic)
- Last 10 match history with opponents and results
- Stats refresh in real-time after each match

## Epic 5: Monetization (Phase 2)

### User Story 5.1: Watch Ads for Rewards

**As a** free player, **I want to** watch ads for extra benefits, **so that** I can enhance my gameplay without paying.

**Acceptance Criteria:**

- "Watch Ad" button after match loss for rematch chance
- 30-second non-skippable video ad
- Reward granted immediately after ad completion
- Maximum 3 rewarded ads per day
- Ad availability indicator on button
- Graceful handling if no ads available

### User Story 5.2: Premium Subscription

**As a** paying player, **I want to** subscribe to premium, **so that** I can enjoy ad-free gameplay with bonuses.

**Acceptance Criteria:**

- $4.99/month subscription option
- No ads (rewarded or interstitial)
- 2x rank points for wins
- Exclusive avatar selection (10 premium avatars)
- "PREMIUM" badge on profile
- Restore purchase functionality
- Subscription management link to app store

## Epic 6: Technical Requirements

### User Story 6.1: Connection Stability

**As a** player, **I want to** maintain connection during matches, **so that** I can complete games without interruption.

**Acceptance Criteria:**

- Auto-reconnect within 3 seconds if connection drops
- 10-second grace period for disconnected player
- Opponent sees "Opponent Disconnected - Waiting..." message
- If no reconnect after 10 seconds, remaining player wins
- Connection quality indicator (green/yellow/red)
- Warning message if latency exceeds 200ms

### User Story 6.2: Performance Optimization

**As a** player, **I want to** experience smooth gameplay, **so that** I can react quickly to questions.

**Acceptance Criteria:**

- Maintain 60 FPS during all animations
- App size under 50MB initial download
- Questions cached locally after first load
- Battery optimization (reduce when in background)
- Support devices from iPhone 8/Android 8.0 and newer
- Smooth performance on 3G/4G networks

### User Story 6.3: Anti-Cheat Measures

**As a** player, **I want to** compete fairly, **so that** matches are determined by skill.

**Acceptance Criteria:**

- Server-side answer validation
- Timestamp verification for answer timing
- Unusual pattern detection (100% accuracy, instant answers)
- Report player functionality with review system
- Automatic flag for suspicious behavior patterns
- Weekly rotation of question order within categories