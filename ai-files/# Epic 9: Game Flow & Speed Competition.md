# Epic 9: Game Flow & Speed Competition

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
  - ○ for upcoming rounds
- Show current score prominently
- Update in real-time after each round
- Clear visual distinction between player/opponent
- Positioned above or below existing ScoreBoard
- Adapts to different game modes (Best of 5, tug-of-war, etc.)

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
