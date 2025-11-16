# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quizzi** is a mobile-first, real-time 1v1 quiz duel app where players compete head-to-head in fast-paced knowledge battles. Players race to answer questions correctly first, earning ranks and rewards through their speed and accuracy.

**Target Platform:** Cross-platform mobile (iOS/Android) using React Native or Flutter
**Core Mechanic:** Real-time WebSocket-based 1v1 quiz battles
**Match Format:** Best of 5 rounds, first correct tap wins each round
**Launch Categories:** General Knowledge, Geography, Science, Pop Culture, Sports (1,000 total questions)

## Development Philosophy

This is a solo-developer project optimizing for **SLC (Simple, Lovable, Complete)** scope. All technical decisions prioritize:

1. **Speed to market** - Launch Phase 1 in 6 weeks
2. **Core mechanics first** - Real-time sync, matchmaking, and battle UI are critical path
3. **Minimal viable scope** - Defer social features and complex monetization until PMF validation
4. **Performance constraints** - 60 FPS animations, <100ms latency, <3s matchmaking

## Architecture Requirements

### Real-Time Synchronization
- **WebSocket infrastructure** for sub-50ms question sync between players
- **Server authority** for answer validation and anti-cheat
- **Auto-reconnect** with 10-second grace period for dropped connections
- **Timestamp verification** for answer timing to prevent cheating

### Matchmaking System
- **Skill-based matching:** ±200 rank points initially, expanding to ±400 at 5s, any player at 10s
- **ELO-based ranking** with visual tiers (Bronze → Diamond)
- **3-second target** for p95 matchmaking time
- **Prevent same opponent twice** in consecutive matches

### Battle Mechanics
- **Question sync:** Same question appears simultaneously (±50ms tolerance)
- **Answer randomization:** 4 options in randomized order per player
- **10-second countdown** per question
- **First tap wins:** Correct answer locks immediately with haptic feedback
- **Round progression:** Automatic 2-second pause between rounds

### Anti-Cheat Measures
- **Server-side validation** of all answers and timestamps
- **Question rotation:** No repeats within match, track last 50 questions per player
- **Pattern detection:** Flag 100% accuracy or instant answer patterns
- **Weekly question pool rotation** within categories

### Performance Requirements
- **60 FPS** maintained during all animations
- **<50MB** initial app download size
- **Questions cached** locally after first load
- **Support:** iPhone 8/Android 8.0 minimum
- **Network:** Smooth performance on 3G/4G

## Data Models

### Player Profile
```
- username (3-16 chars, alphanumeric + underscore, unique)
- avatar (12 default options, 10 premium)
- rank_points (integer)
- rank_tier (Bronze/Silver/Gold/Platinum/Diamond)
- win_rate (percentage)
- current_streak (integer)
- matches_played (integer)
- avg_response_time (milliseconds)
- category_stats (win rate per category)
- match_history (last 10 matches)
- premium_status (boolean)
```

### Match State
```
- match_id
- player1_id, player2_id
- category
- current_round (1-5)
- scores (player1: 0-3, player2: 0-3)
- questions[] (5 questions)
- start_time
- connection_status (both players)
```

### Question Schema
```
- question_id
- category
- difficulty (easy/medium/hard)
- question_text (max 160 chars for mobile readability)
- answers[] (4 options)
- correct_answer_index
- last_used_timestamp
```

## Critical Technical Constraints

### Timing & Latency
- **Tap registration:** <100ms with haptic feedback
- **WebSocket sync:** <100ms latency tolerance
- **Question display:** Within 50ms between devices
- **Matchmaking:** 3s p95, 5s p99

### Question Management
- **Initial pool:** 200 questions per category (1,000 total)
- **Difficulty distribution:** 2 easy, 2 medium, 1 hard per match
- **No repeats:** Within same match or last 50 questions shown to player
- **Weekly rotation:** Refresh question order every 24 hours

### Monetization (Phase 2)
- **Rewarded ads:** 30s non-skippable, max 3/day, for rematch after loss
- **Premium subscription:** $4.99/mo - no ads, 2x rank points, exclusive avatars
- **Cosmetics:** Avatar frames, victory animations, tap effects

## Success Metrics

### Week 1
- 1,000 downloads
- 40% D1 retention

### Month 1
- 10,000 MAU
- 25% D7 retention
- 3+ average sessions/day
- >80% match completion rate
- <5s matchmaking p95

### Month 3
- 15% conversion to premium or any purchase

## Development Phases

### Phase 1 - Core SLC (Weeks 1-6)
1. Battle UI with haptic feedback
2. WebSocket infrastructure for real-time sync
3. Question database and rotation system
4. Matchmaking and ELO ranking algorithm
5. 3 polished categories for soft launch

### Phase 2 - Polish & Launch (Weeks 7-10)
1. Remaining 2 categories
2. Basic monetization (rewarded ads only)
3. Onboarding tutorial
4. Beta test with 100 users
5. App store launch

### Phase 3 - Growth (Weeks 11-16)
1. Friend challenges and rematch options
2. Full monetization (premium + cosmetics)
3. Tournament/event system
4. Social features (spectate, share)
5. 5 additional categories

## Communication & Response Style

### Core Principles

This is a solo developer project with heavy AI assistance for architecture, planning, UI/UX, prototyping, engineering decisions, and content generation.

**Response format:**
- Direct, unsentimental, high-signal answers
- Brutal clarity with explicit next steps
- Concrete recommendations over generalities
- Concise, structured, context-aware responses
- No motivational or conversational padding

**When tradeoffs exist:**
- State them plainly
- Recommend the superior choice for a solo developer
- Provide the practical default when requests are ambiguous

**When requests are ambiguous:**
- Disambiguate by giving the practical default a solo developer should choose

### Technical Output Standards

**System designs must include:**
- Backend schemas and data models
- API contracts and event flows
- State machines with timing constraints
- Race condition handling
- Server authority rules
- Cheat-prevention notes

**Engineering tasks must include:**
- Folder structure recommendations
- Minimal reproducible examples where helpful
- Critical path identification
- Smallest viable build approach

**Gameplay logic must include:**
- Timing constraints
- Race conditions
- Server authority rules
- Anti-cheat considerations

### Content Generation Standards

**For quiz questions:**
- Follow category definitions strictly
- Apply difficulty weights as specified
- Implement non-repetition rules
- Ensure fairness and anti-cheat measures
- Meet clarity and readability standards
- Respect mobile UI format constraints (max 160 chars)

### Planning & Next Steps

**When generating plans:**
- Provide stepwise execution paths tailored to solo developers
- Identify the critical path
- Highlight the smallest viable build
- Optimize for SLC (Simple, Lovable, Complete) scope unless asked otherwise

**Agent recommendations:**
- If architectural work, backend/frontend scaffolding, schema design, testing, optimization, or tasks where specialized agents would materially speed up progress are needed
- Proactively recommend the exact agent, plugin, and slash command to run
- Only recommend when the need is clear
- Stay silent in non-technical or conversational contexts

### Strict Boundaries

**DO NOT:**
- Propose expanding scope unless requested
- Contradict PRD or User Stories without justification
- Add padding, motivational language, or unnecessary context
- Make recommendations that ignore solo developer constraints
- Align all deliverables with PRD and User Stories

## Reference Documents

- **PRD:** `/feed/PRD.md` - Complete product requirements
- **User Stories:** `/feed/USER STORIES.md` - Detailed acceptance criteria for all features
- **Project Instructions:** `/feed/PROJECT_INSTRUCTIONS.md` - AI collaboration guidelines
- **Agents Repository:** `/feed/AGENTS_REPO.md` - Claude Code plugins reference (97k lines)

## Monorepo Architecture

**Package Manager Configuration:**
- **Root workspace**: pnpm + Turbo for build orchestration
- **Mobile app**: Isolated Yarn workspace (apps/mobile has independent yarn.lock)

**Project Structure:**

```
/
├── pnpm-workspace.yaml       # Root workspace config (excludes mobile)
├── pnpm-lock.yaml            # Root dependencies
├── turbo.json                # Build pipeline config
├── package.json              # Root scripts (dev, build, type-check)
│
├── apps/
│   ├── api/                  # Backend API (pnpm workspace)
│   │   ├── src/
│   │   │   ├── websocket/    # Real-time sync server
│   │   │   ├── routes/       # REST endpoints
│   │   │   ├── services/
│   │   │   │   ├── matchmaking.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── rankings.ts
│   │   │   └── lib/
│   │   └── prisma/           # Database schema & migrations
│   │       └── schema.prisma
│   │
│   └── mobile/               # React Native + Expo (Yarn isolated)
│       ├── yarn.lock         # Independent from root pnpm
│       ├── .yarnrc.yml       # Yarn config
│       ├── src/
│       │   ├── screens/
│       │   │   ├── Battle/   # Core 1v1 gameplay UI
│       │   │   ├── Matchmaking/
│       │   │   └── Profile/
│       │   ├── components/
│       │   └── services/
│       │       ├── websocket.ts  # WebSocket client
│       │       └── matchmaking.ts
│       └── app.json          # Expo config
│
└── packages/                 # Shared libraries (pnpm workspace)
    └── (future shared code)
```

**Development Commands:**

```bash
# Root (pnpm):
pnpm dev              # Start all workspaces (Turbo)
pnpm build            # Build all workspaces
pnpm type-check       # Type-check API + packages

# Mobile (Yarn, from apps/mobile):
cd apps/mobile
yarn dev              # Start Expo dev server
yarn ios              # Run iOS simulator
yarn android          # Run Android emulator
yarn type-check       # Type-check mobile only
```

**Why Yarn for Mobile:**
- Expo's tooling has better compatibility with Yarn
- Isolates React Native dependency resolution from backend
- Prevents version conflicts between mobile/backend React versions

## Anti-Patterns to Avoid

1. **Scope creep** - Stick to SLC, defer social features to Phase 3
2. **Over-engineering** - Solo developer constraints mean pragmatic choices over perfect architecture
3. **Ignoring latency** - Real-time sync is non-negotiable; <100ms tolerance
4. **Question repetition** - Must track last 50 questions per player
5. **Client-side validation** - All answer validation must be server-authoritative for anti-cheat
## Recent Work

### 2025-11-16: Fixed Post-Match Rematch Issue

**Problem:** After completing a match, players returning to lobby couldn't find a match when queuing again.

**Root Cause:** The matchmaking queue's `lastOpponents` Map was preventing consecutive rematches. After a match ended, both players were marked as each other's last opponent, causing the matchmaking logic to skip them even though they were the only players in queue.

**Solution:**
- Added `clearLastOpponent()` method to `matchmaking-instance.ts`
- Called it in `match-manager.ts` when match ends to clear last opponent tracking for both players
- Added extensive debug logging to `matchmaking-queue.ts` for troubleshooting

**Files Modified:**
- `apps/api/src/services/matchmaking-queue.ts` - Added debug logging for findMatch()
- `apps/api/src/services/matchmaking-instance.ts` - Added clearLastOpponent() method
- `apps/api/src/websocket/match-manager.ts` - Clear last opponents on match end

**Impact:** Players can now immediately rematch after completing a game. For production with more players, consider adding a delay before clearing last opponents to encourage variety.

---

- When I type 'syncw', update the docs with current work, save it and push.
- Always try to leverage claude code agents that we installed from plugin marketplace. When I created this repo, I fed you the ingested version of a huge github repo (the txt file under /feed folder). That txt file has useful agents but it is so huge that can deplete  our claude code tokens very fast. We have already installed a handful of plugins from that txt file. So whenever you can, use those agents, even start multiples of them if appropriate to save time. Beware that agents also consume tokens fast.  Only reference the big txt file if you really desperately need to look for an agent.