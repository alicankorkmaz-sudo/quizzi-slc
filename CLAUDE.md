# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quizzi** is a mobile-first, real-time 1v1 quiz duel app where players race to answer trivia questions correctly. The core mechanic: first correct answer wins the round. Speed and accuracy are equally critical. The game creates competitive tension through real-time racing where every millisecond counts.
**Target Platform:** Cross-platform mobile (iOS/Android) using React Native
**Core Mechanic:** Real-time WebSocket-based question races with instant round resolution

## Development Philosophy

This is a solo-developer project optimizing for **SLC (Simple, Lovable, Complete)** scope. 

# MVP vs. SLC

## MVP (Minimum Viable Product)
A **Minimum Viable Product** is the smallest functional version of a product that can be released to validate assumptions.

**Key characteristics:**
- Focuses on **functionality**, not delight  
- Often bare-bones; may feel rough  
- Goal is **learning** and reducing risk  
- Users may not love it, just use it enough to provide feedback  

## SLC (Simple, Lovable, Complete)
A **Simple, Lovable, Complete** product is the smallest version of a product that users can actually **enjoy**, even if it solves a narrow problem.

**Key characteristics:**
- Focuses on **quality**, not just minimal functionality  
- Simple: does one thing well  
- Lovable: users feel positive using it  
- Complete: solves a core use case end-to-end  
- Goal is **adoption**, not just learning  

## Core Difference
- **MVP = Validate assumptions as cheaply as possible.**  
- **SLC = Deliver a small product people genuinely like and trust.**

So, all technical decisions prioritize optimizing for SLC scope:

1. **Speed to market**
2. **Core mechanics first** - Real-time sync, matchmaking, and battle UI are critical path
3. **Minimal viable scope** - Defer non core features until PMF validation

## Development Phases

### Phase 1 - Core SLC
1. Battle UI with haptic feedback
2. WebSocket infrastructure for real-time sync
3. Question database and rotation system
4. Matchmaking and ELO ranking algorithm
5. 5 polished categories for soft launch


### Phase 2 - Polish & Launch
1. TBD
2. TBD
3. TBD
4. TBD
5. TBD

### Phase 3 - Growth
1. TBD
2. TBD
3. TBD
4. TBD
5. TBD

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

### Content Generation Standards

**For quiz questions:**
- Follow category definitions strictly
- Apply difficulty weights as specified
- Implement non-repetition rules
- Ensure fairness and anti-cheat measures
- Meet clarity and readability standards
- Respect mobile UI format constraints

### Planning & Next Steps

**When generating plans:**
- Provide stepwise execution paths tailored to solo developers
- Identify the critical path
- Highlight the smallest viable build
- Optimize for SLC (Simple, Lovable, Complete) scope unless asked otherwise

**Agent recommendations:**
- `/ai-files/CLAUDE_CODE_PLUGINS.md` is a unified repository ingest that provides everything needed for intelligent automation and multi-agent orchestration.
- We have already installed a handful of plugins from `/ai-files/CLAUDE_CODE_PLUGINS.md`. 
- If architectural work, backend/frontend scaffolding, schema design, testing, optimization, or tasks where specialized agents would materially speed up progress are needed
- Proactively recommend the exact agent, plugin, and slash command to run
- Async multi-agent firing is possible
- Beware of high claude code token consume of agent usage

## Reference Documents

- **PRD:** `/ai-files/PRD.md` - Complete product requirements document
- **SLC Scoped User Stories:** `/ai-files/SLC_USER_STORIES.md` - Detailed acceptance criteria for all core phase stories
- **Agents Repository:** `/ai-files/CLAUDE_CODE_PLUGINS.md` - Claude Code plugins reference (97k lines)

## Monorepo Architecture

**Package Manager Configuration:**
- **Root workspace**: pnpm + Turbo for build orchestration
- **Mobile app**: Isolated Yarn workspace (apps/mobile excluded from pnpm-workspace.yaml)

**Project Structure:**

```
/
├── pnpm-workspace.yaml       # Workspace config (api + packages only)
├── turbo.json                # Build pipeline orchestration
├── package.json              # Root scripts (dev, build, type-check, lint)
│
├── apps/
│   ├── api/                  # Backend API (pnpm managed)
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point
│   │   │   ├── websocket/    # Real-time sync server
│   │   │   ├── routes/       # REST endpoints
│   │   │   ├── services/     # Business logic (matchmaking, questions, rankings)
│   │   │   ├── middleware/   # Auth, error handling
│   │   │   ├── lib/          # Utilities
│   │   │   └── shared/       # Shared types/constants
│   │   └── prisma/
│   │       ├── schema.prisma # Database schema
│   │       └── dev.db        # SQLite database
│   │
│   └── mobile/               # React Native + Expo (Yarn isolated)
│       ├── yarn.lock         # Independent from root pnpm
│       └── src/
│           ├── screens/      # Battle, Matchmaking, Profile, etc.
│           ├── components/   # Reusable UI components
│           ├── contexts/     # React Context providers
│           ├── hooks/        # Custom hooks
│           ├── navigation/   # React Navigation setup
│           ├── services/     # API/WebSocket clients
│           ├── theme/        # Design tokens, colors, typography
│           ├── types/        # TypeScript definitions
│           └── utils/        # Helper functions
│
└── packages/                 # Shared monorepo packages (pnpm managed)
    ├── config/               # Shared tsconfig presets
    ├── types/                # Shared TypeScript types
    └── utils/                # Shared utility functions
```

**Why Yarn for Mobile:**
- Expo has better compatibility with Yarn
- Isolates React Native dependency resolution from backend
- Prevents version conflicts between mobile/backend dependencies

## Theme System

**Location:** `/apps/mobile/src/theme/`

The theme system provides centralized design tokens:
- **Colors** (`colors.ts`) - Primary, secondary, success, error, etc.
- **Spacing** (`spacing.ts`) - Consistent margin/padding scale
- **Typography** (`typography.ts`) - Font sizes, weights, semantic text styles

---

- When I type 'syncw', commit all changes with a descriptive message and push to remote.
- Never create markdown (.md) files without asking my permission.