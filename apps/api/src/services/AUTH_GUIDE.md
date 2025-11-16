# Quizzi Authentication System

## Overview

Minimal authentication system for Quizzi supporting anonymous users and optional username registration. Built for mobile-first, real-time 1v1 quiz battles.

## Architecture

**Tech Stack:**
- Bun + TypeScript
- Prisma + SQLite
- Simple token-based auth (CUID-based tokens, stateless)
- No passwords for anonymous users
- No email verification

**Key Components:**
- `/apps/api/src/services/auth-service.ts` - Core authentication logic
- `/apps/api/src/routes/auth.ts` - REST endpoints
- Updated Prisma schema with `isAnonymous` and `authToken` fields
- WebSocket integration with token validation

## Data Model

```prisma
model User {
  id              String   @id @default(cuid())
  username        String   @unique
  isAnonymous     Boolean  @default(true)
  authToken       String?  @unique
  // ... other fields
}
```

**New Fields:**
- `isAnonymous` (Boolean) - Indicates if user has claimed their account with custom username
- `authToken` (String, nullable, unique) - Session token for authentication

## Authentication Flow

### 1. Anonymous User Creation

**Endpoint:** `POST /api/auth/anonymous`

**Request:** No body required

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "clxyz123...",
    "username": "Player1234",
    "authToken": "clxyz123.abc123.def456",
    "isAnonymous": true
  }
}
```

**Username Generation:**
- Format: `Player{4-digit-random}` (e.g., `Player1234`)
- Ensures uniqueness with fallback to timestamp-based if collisions occur
- Max 10 attempts before using timestamp fallback

**Token Format:**
- `userId.timestamp.randomHash`
- Example: `clxyz123.abc123.def456`
- Stateless, no server-side session storage required

### 2. Username Registration (Claiming Anonymous Account)

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "userId": "clxyz123...",
  "username": "cool_player"
}
```

**Validation:**
- 3-16 characters
- Alphanumeric + underscores only
- Unique across all users
- Regex: `/^[a-zA-Z0-9_]{3,16}$/`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "clxyz123...",
    "username": "cool_player",
    "authToken": "clxyz123.abc123.def456",
    "isAnonymous": false
  }
}
```

**Error Cases:**
- `400` - Invalid username format
- `409` - Username already taken
- `404` - User not found
- `400` - User already has registered username

### 3. Token Validation

**Endpoint:** `GET /api/auth/validate`

**Headers:**
```
Authorization: Bearer clxyz123.abc123.def456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "clxyz123...",
    "username": "cool_player",
    "isAnonymous": false
  }
}
```

**Error Cases:**
- `401` - Missing or invalid Authorization header
- `401` - Invalid or expired token

### 4. Logout (Token Invalidation)

**Endpoint:** `POST /api/auth/logout`

**Request:**
```json
{
  "userId": "clxyz123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## WebSocket Authentication

WebSocket connections require token-based authentication.

**Connection URL:**
```
ws://localhost:3000/ws?token=clxyz123.abc123.def456
```

**Flow:**
1. Client extracts token from query params
2. Server validates token via `authService.validateToken()`
3. If valid, WebSocket upgrade proceeds with `userId` and `username` in connection data
4. If invalid, returns `401 Invalid or expired token`

**Connection Data:**
```typescript
{
  userId: string,
  username: string,
  connectedAt: number
}
```

## Mobile Integration Pattern

**On App Launch:**
1. Check local storage for existing `authToken`
2. If exists, call `GET /api/auth/validate` to verify token
3. If valid, use existing session
4. If invalid or missing, call `POST /api/auth/anonymous` to create new user
5. Store `userId`, `username`, and `authToken` in local storage

**Optional Username Registration:**
1. User navigates to profile/settings screen
2. Enters custom username
3. Call `POST /api/auth/register` with `userId` and `username`
4. Update local storage with new `username` and `isAnonymous: false`

**WebSocket Connection:**
1. Extract `authToken` from local storage
2. Connect to `ws://localhost:3000/ws?token={authToken}`
3. If connection fails with 401, token is invalid
4. Fall back to anonymous user creation flow

## Security Considerations

**Current Implementation (SLC Scope):**
- Simple CUID-based tokens (no JWT signature)
- Tokens stored in database for validation
- No token expiration (session persists until logout)
- No rate limiting on auth endpoints

**Production Recommendations (Phase 2+):**
- Implement proper JWT with signing (use `jose` library)
- Add token expiration (e.g., 30 days)
- Add refresh token mechanism
- Implement rate limiting on auth endpoints
- Add IP-based anomaly detection
- Consider device fingerprinting for mobile

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Resource created (anonymous user)
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid token)
- `404` - Not found (user not found)
- `409` - Conflict (username taken)
- `500` - Internal server error

## Testing

**Manual Testing with curl:**

```bash
# 1. Create anonymous user
curl -X POST http://localhost:3000/api/auth/anonymous

# Response:
# {
#   "success": true,
#   "data": {
#     "userId": "clxyz123...",
#     "username": "Player1234",
#     "authToken": "clxyz123.abc123.def456",
#     "isAnonymous": true
#   }
# }

# 2. Register username
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxyz123...",
    "username": "cool_player"
  }'

# 3. Validate token
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer clxyz123.abc123.def456"

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxyz123..."
  }'
```

**WebSocket Testing:**
```bash
# Using websocat (install: brew install websocat)
websocat "ws://localhost:3000/ws?token=clxyz123.abc123.def456"
```

## Migration Commands

```bash
# Apply schema changes
cd apps/api
bun run db:push

# Generate Prisma client
bun run db:generate

# View database in Prisma Studio
bun run db:studio
```

## File Structure

```
apps/api/
├── src/
│   ├── services/
│   │   ├── auth-service.ts        # Core auth logic
│   │   └── AUTH_GUIDE.md          # This file
│   ├── routes/
│   │   └── auth.ts                # Auth REST endpoints
│   └── index.ts                   # WebSocket auth integration
└── prisma/
    └── schema.prisma              # Updated with isAnonymous, authToken

packages/types/
└── src/
    └── index.ts                   # Auth request/response types
```

## Integration Checklist

- [x] Prisma schema updated with `isAnonymous` and `authToken`
- [x] Database migration applied (`bun run db:push`)
- [x] `auth-service.ts` created with core logic
- [x] Auth routes created and mounted at `/api/auth`
- [x] WebSocket handler updated to validate tokens
- [x] Types package updated with auth types
- [ ] Mobile app integration (React Native client)
- [ ] Local storage persistence on mobile
- [ ] Username registration UI
- [ ] Token refresh mechanism (Phase 2)
- [ ] Rate limiting (Phase 2)

## Next Steps

**For Mobile Development:**
1. Create auth context/provider in React Native app
2. Implement local storage with AsyncStorage
3. Build username registration screen
4. Add token validation on app launch
5. Update WebSocket client to use token from storage

**For Backend Enhancement (Phase 2):**
1. Switch to proper JWT tokens with signing
2. Add token expiration and refresh mechanism
3. Implement rate limiting on auth endpoints
4. Add device fingerprinting
5. Add audit logging for auth events
