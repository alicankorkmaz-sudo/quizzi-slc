# Epic 0: Identity & Profile

## User Story 0.1: Guest Account Creation
**As a** new player,
**I want to** start playing instantly without creating a full account,
**so that** I can jump directly into the game.

**Acceptance Criteria:**
- App automatically requests a guest profile on first launch
- Backend generates:
  - unique user ID
  - unique random username (Quizzi_XXXX)
  - default avatar from predefined set
  - starting ELO = 1000
- Response includes `{ userId, token, username, avatar, elo }`
- Token stored securely (Secure Storage)
- No onboarding friction

---

## User Story 0.2: Authentication & Authorization
**As a** player,
**I want to** remain logged in securely,
**so that** I don’t lose my progress or identity.

**Acceptance Criteria:**
- Token is verified on all API and WebSocket connections
- Invalid tokens reject cleanly
- Token persists across app restarts
- No password-based auth in SLC version

---

## User Story 0.3: Profile Editing
**As a** player,
**I want to** customize my username and avatar,
**so that** I can personalize my in-game identity.

**Acceptance Criteria:**
- Username validation (3–16 chars, alphanumeric + underscore)
- Username must be unique
- Avatar selectable from predefined list
- `PATCH /profile` updates values and returns updated profile
- Changes reflected immediately in UI and Secure Storage

---

## User Story 0.4: Persistent Player Ranking
**As a** player,
**I want to** see my rank (ELO) and personal ladder progress,
**so that** I can understand my skill level.

**Acceptance Criteria:**
- Display current ELO on home/profile screens
- Show progress toward next rank tier
- Ranks based on ELO thresholds
- Values update immediately after matches

---

# Epic 1: Matchmaking & Game Setup

## User Story 1.1: Quick Match
**As a** player,
**I want to** find an opponent quickly,
**so that** I can start playing within seconds.

**Acceptance Criteria:**
- Matchmaking initiates within 500ms of tapping “Play”
- System finds opponent within 3 seconds (p95)
- Matching prefers ±200 ELO range
- Search expands gradually over time
- Player can cancel matchmaking
- Prevent matching same opponent consecutively

---

## User Story 1.2: Match Confirmation
**As a** player,
**I want to** see my opponent’s profile before the match starts,
**so that** I know who I’m competing against.

**Acceptance Criteria:**
- Show opponent username, avatar, ELO-based rank badge
- Show win rate and streak
- Ensure both players connected before start
- Smooth transition into game

---

# Epic 2: Core Battle Mechanics

## User Story 2.1: Real-time Question Display
**As a** player,
**I want to** see questions appear simultaneously,
**so that** competition is fair.

**Acceptance Criteria:**
- Sync within 50ms between devices
- Same question, same timing
- Readable text, randomized options
- 10-second timer
- Answers disabled until fully displayed

---

## User Story 2.2: Answer Selection
**As a** player,
**I want to** tap my answer quickly and see immediate feedback,
**so that** I know whether I was faster than my opponent.

**Acceptance Criteria:**
- Tap registers within 100ms
- Correct answer turns green
- Wrong answer turns red
- Opponent’s correct answer reflected on screen
- Indicators for FAST WIN or TOO SLOW
- Answer locked after tap

---

## User Story 2.3: Round Progression
**As a** player,
**I want to** track match progress,
**so that** I know where I stand.

**Acceptance Criteria:**
- Round count (1/5 …)
- Indicators for won rounds
- 2-second pause between rounds
- Match Point indicator
- Auto progression

---

## User Story 2.4: Match Completion
**As a** player,
**I want to** see final results and rank changes,
**so that** I understand my performance impact.

**Acceptance Criteria:**
- Victory/defeat animation
- Final score
- Rank/ELO change
- New tier indication
- Response time stats
- Play Again / Home buttons

---

# Epic 3: Question Management

## User Story 3.1: Category Selection
**As a** player,
**I want to** choose my preferred category,
**so that** I can play topics I enjoy.

**Acceptance Criteria:**
- 5 category cards
- Show available question counts
- Random option
- Category vote system
- Random fallback if no agreement

---

## User Story 3.2: Question Variety
**As a** player,
**I want to** avoid repeats,
**so that** the game stays fresh.

**Acceptance Criteria:**
- No repeats within a match
- Random selection from category pool
- Prevent recent repeats (last 50)
- Balanced difficulty distribution
- Daily rotation

---

# Epic 4: Player Profile & Progression

## User Story 4.1: Profile Creation
**As a** new player,
**I want to** have a profile instantly,
**so that** I can start playing immediately.

**Acceptance Criteria:**
- Guest profile creation via auth system
- Username/avatar editable later
- No blocking onboarding

---

## User Story 4.2: Rank Display
**As a** player,
**I want to** see my rank and progress,
**so that** I can track improvement.

**Acceptance Criteria:**
- Show tier and ELO
- Progress bar to next tier
- Points required for next tier
- Tier animations

---

## User Story 4.3: Statistics Tracking
**As a** player,
**I want to** see my performance,
**so that** I understand my strengths.

**Acceptance Criteria:**
- Win rate
- Streaks
- Avg response time
- Category performance
- Last 10 matches
- Auto-refresh after matches

---

# Epic 5: Monetization (Phase 2)

## User Story 5.1: Watch Ads for Rewards
(Future phase — unchanged)

## User Story 5.2: Premium Subscription
(Future phase — unchanged)

---

# Epic 6: Technical Requirements

## User Story 6.1: Connection Stability
**As a** player,
**I want to** maintain connection,
**so that** I can finish matches without issues.

**Acceptance Criteria:**
- Auto-reconnect
- 10-second grace period
- Disconnect messages
- Connection quality indicator

---

## User Story 6.2: Performance Optimization
**As a** player,
**I want to** play smoothly,
**so that** I can react quickly.

**Acceptance Criteria:**
- Smooth animation
- App size under limits
- Cached questions
- Battery optimization

---

## User Story 6.3: Anti-Cheat Measures
**As a** player,
**I want to** compete fairly,
**so that** skill decides the winner.

**Acceptance Criteria:**
- Server-side validation
- Timestamp verification
- Pattern detection
- Report functionality
- MatchResult stores ELO context
- Weekly rotation of question order

---

# Epic 7: Match Completion & ELO System

## User Story 7.1: Server-Side Match Finalization
**As a** player,
**I want to** receive accurate match results,
**so that** the ranking system feels fair.

**Acceptance Criteria:**
- Server determines winner
- Computes ELO changes
- Updates user ELO atomically
- Persists MatchResult
- Returns updated ranking info

---

## User Story 7.2: ELO Calculation
**As a** competitive player,
**I want to** gain or lose ELO based on results,
**so that** progress feels earned.

**Acceptance Criteria:**
- Basic expected-score ELO
- Fixed K-factor
- Modular design for future streaks/multipliers
- Fully server-authoritative

---

## User Story 7.3: Match History Storage
**As a** player,
**I want to** have my past matches tracked,
**so that** I can see my progress.

**Acceptance Criteria:**
- Store participants
- Store winner and scores
- Store ELO before/after
- Timestamp
- Lightweight schema

---

# Epic 8: Leaderboard

## User Story 8.1: Global Leaderboard
**As a** player,
**I want to** see top players,
**so that** I understand my standing.

**Acceptance Criteria:**
- Top ELO players
- Show username, avatar, ELO
- Simple SLC list (top 50)

---

# SLC Scope Summary
The SLC release includes:
- Guest authentication
- Persistent user identity
- Editable username + avatar
- ELO-based ranking
- Server-authoritative match finishing
- MatchResult storage with ELO context
- Global leaderboard
- Full matchmaking → battle → results loop
