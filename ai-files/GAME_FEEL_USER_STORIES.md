# Epic 9: Game Feel & Polish

## 🔍 Diagnosis
Current feedback indicates the app feels too "utilitarian". This is likely due to:
1.  **Static UI**: Elements snap into place rather than moving.
2.  **Silence**: Lack of audio feedback (SFX) and background music (BGM).
3.  **Flatness**: Standard UI components without depth, gradients, or particle effects.
4.  **Lack of "Crunch"**: Missing exaggerated feedback for key moments (correct answers, victories).

## 🎯 Objective
Transform Quizzi from a "functional app" into a "visceral game experience" by applying "Game Juice" principles. The goal is to make every interaction feel responsive, rewarding, and alive.

## User Story 9.1: Audio Feedback System
**As a** player,
**I want to** hear immediate sound effects for my actions,
**so that** the game feels responsive and tactile.

**Acceptance Criteria:**
- Low-latency playback for all interactive elements
- Distinct sounds for: Button Tap, Correct Answer, Wrong Answer
- Timer tick sound for last 3 seconds
- "Score counting" sound effect when points increase

---

## User Story 9.2: Dynamic Background Music
**As a** player,
**I want to** hear background music that matches the game's pace,
**so that** matches feel competitive and exciting.

**Acceptance Criteria:**
- Looping background track during gameplay
- Music tempo/pitch increases during critical moments (last 10s)
- Smooth fade-out on match completion
- Does not interfere with external audio (optional, but good practice)

---

## User Story 9.3: Haptic Feedback Integration
**As a** player,
**I want to** feel physical feedback for game events,
**so that** the experience feels immersive and grounded.

**Acceptance Criteria:**
- Light impact on standard UI navigation/selection
- Medium impact on answer submission
- Heavy/Rigid impact on wrong answers
- Success notification pattern on correct answers
- Warning pattern on low timer (<3s)

---

## User Story 9.4: Visual Impact & Screen Shake
**As a** player,
**I want to** the screen to physically react to negative events,
**so that** mistakes and impacts feel powerful.

**Acceptance Criteria:**
- Screen shakes horizontally on Wrong Answer
- Screen shakes slightly when Opponent scores
- Visual "red flash" or overlay on error state
- Smooth decay of shake effect (no jarring stops)

---

## User Story 9.5: Particle Effects & Celebrations
**As a** player,
**I want to** see visual explosions when I succeed,
**so that** winning and scoring feels rewarding.

**Acceptance Criteria:**
- Confetti rain animation on Match Victory
- Small particle burst (sparks/shapes) on Correct Answer button
- High-performance rendering (60fps) without lag
- Particles respect theme colors

---

## User Story 9.6: Micro-interactions & Dynamic Typography
**As a** player,
**I want to** see UI elements move and breathe,
**so that** the interface feels alive rather than static.

**Acceptance Criteria:**
- Interactive buttons scale down (0.95x) on press
- Score numbers scale up (1.5x) and pulse color when updating
- Timer pulses red and scales up when < 3 seconds
- Smooth transitions between rounds (slide/fade) instead of hard cuts
