# Epic 9: Game Flow & Speed Competition

## User Story 9.1: Winner Speed Celebration
**As a** winning player,
**I want to** see my response time with tier-based celebration,
**so that** fast wins feel rewarding and my speed is recognized.

**Acceptance Criteria:**
- Display response time prominently on victory screen
- Show tier-based labels:
  - ⚡ LIGHTNING! for 0-1.5s
  - 🏃 QUICK! for 1.5-3s
  - ✓ CORRECT! for 3-6s
  - ⏰ CLUTCH! for 6-10s
- Response time format: "X.Xs" (one decimal)
- Victory animation matches speed tier
- Winner time included in `round_end` WebSocket event
- Speed tier logic in RoundTransition component

---

## User Story 9.2: Opponent Speed Display for Losers
**As a** losing player,
**I want to** see my opponent's winning response time,
**so that** I understand the bar I failed to beat and losing feels informative.

**Acceptance Criteria:**
- Show "TOO SLOW!" message to loser
- Display opponent's response time below loss message
- Format: "Opponent: X.Xs"
- Same `winnerTime` field used from victory display
- Update battle state to track `roundWinnerTime`
- Clear display between rounds

---

## User Story 9.3: Fast-Paced Round Transitions
**As a** player,
**I want to** experience minimal dead time between rounds,
**so that** the game maintains momentum and flow state.

**Acceptance Criteria:**
- Total transition time reduced from 4s to 2s
- Round result display: 1.2s (reduced from 2s)
- Pause before next round: 0.8s (reduced from 2s)
- Result display duration allows reading outcome
- Pause doesn't feel jarring or rushed
- Maintains readability of victory/defeat messages

---

## User Story 9.4: Timer Urgency Feedback
**As a** player,
**I want to** feel physical time pressure through haptic feedback,
**so that** the urgency of the countdown is visceral.

**Acceptance Criteria:**
- Haptic pulses at time milestones:
  - Light pulse at 5 seconds remaining
  - Medium pulse at 3 seconds remaining
  - Heavy pulse at 1 second remaining
- Timer pulsing animation when <3s
- Pulse animation loops smoothly
- Works on both iOS and Android
- Haptics respect device settings
- No performance impact on older devices

---

## User Story 9.5: Context-Aware Victory Messages
**As a** player,
**I want to** see special victory messages for clutch/dominant wins,
**so that** memorable moments feel celebrated.

**Acceptance Criteria:**
- Clutch victory: "⏰ CLUTCH! X.Xs" for >8s response time
- Streak victory: "🔥 ON FIRE! X.Xs" for 3 consecutive wins
- Match point: "🏆 MATCH POINT! X.Xs" for winning round
- Default speed tiers for other victories
- Priority order: Match Point > Streak > Clutch > Speed Tier
- Track consecutive wins in match state
- Pass context (isMatchPoint, streak) to RoundTransition

---

## User Story 9.6: Round Timeline Visualization
**As a** player,
**I want to** see a visual timeline of round outcomes,
**so that** I can understand match momentum and comeback potential at a glance.

**Acceptance Criteria:**
- Display round-by-round progress for both players
- Visual indicators:
  - ✓ for won rounds
  - ✗ for lost rounds
  - ○ for upcoming rounds (best of 5)
- Show current score prominently
- Update in real-time after each round
- Clear visual distinction between player/opponent
- Positioned above or below existing ScoreBoard

---

## User Story 9.7: Match Momentum Indicators
**As a** player,
**I want to** see special banners for dramatic scenarios,
**so that** memorable moments create shareable experiences.

**Acceptance Criteria:**
- Dominating: "🔥 DOMINATING!" for 3 consecutive wins
- Reverse sweep: "💥 REVERSE SWEEP!" for winning from 0-2 deficit
- Flawless victory: "🏆 FLAWLESS VICTORY!" for 3-0 win
- Display as full-screen overlay (2s duration)
- Show at moment of achievement
- Distinct from round victory messages
- Track match history to detect scenarios

---

## User Story 9.8: Pending Answer Validation (Optional)
**As a** player,
**I want to** see which answer I selected even if the round ended before submission,
**so that** "I clicked it!" frustration is reduced.

**Acceptance Criteria:**
- Track client-side answer selection
- Show selected answer if round ended before server received it
- Display: "You selected [option]" on TOO SLOW screen
- Only show if selection was made
- Don't show if no selection was made
- Clear pending selection at start of new round

---

# Epic Scope Summary

This epic includes:
- Speed-based victory tier system
- Opponent time visibility for losers
- Optimized round transition timing
- Haptic and visual urgency feedback
- Context-aware victory celebrations
- Round-by-round progress visualization
- Match momentum indicators for dramatic scenarios
- Optional pending answer validation

All improvements focus on making the core mechanic (first correct answer wins) feel visceral, fair, and rewarding to both winner and loser.
