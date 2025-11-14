# Quizzi - Real-Time 1v1 Quiz Duel App

Mobile-first, real-time 1v1 quiz battles with WebSocket-based synchronization.

## Tech Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Mobile:** Expo (React Native)
- **Backend:** Bun + Hono
- **Database:** Prisma
- **Language:** TypeScript
- **Validation:** Zod

## Structure

```
quizzi-slc/
├── apps/
│   ├── mobile/     # Expo React Native app
│   └── api/        # Bun + Hono backend
└── packages/
    ├── types/      # Shared TypeScript types + Zod schemas
    ├── utils/      # Shared helper functions
    └── config/     # Shared ESLint/TypeScript configs
```

## Setup

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build
```

## Development

### Mobile App
```bash
cd apps/mobile
pnpm dev          # Start Expo dev server
pnpm ios          # Run on iOS simulator
pnpm android      # Run on Android emulator
```

### API Server
```bash
cd apps/api
pnpm dev          # Start Bun dev server
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
```

## Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Bun >= 1.0.0 (for API development)
