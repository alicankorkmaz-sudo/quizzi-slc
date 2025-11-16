# Authentication Quick Start

## TL;DR

Minimal auth system with anonymous users and optional username registration. No passwords, no email verification.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/anonymous` | POST | Create anonymous user → get token |
| `/api/auth/register` | POST | Claim account with custom username |
| `/api/auth/validate` | GET | Check if token is valid |
| `/api/auth/logout` | POST | Invalidate token |

## Quick Test

```bash
# 1. Create user
curl -X POST http://localhost:3000/api/auth/anonymous

# 2. Copy the authToken from response

# 3. Test WebSocket (replace TOKEN)
websocat "ws://localhost:3000/ws?token=TOKEN"

# 4. Register username (replace USER_ID)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "username": "my_username"}'
```

## Mobile Integration Pattern

```typescript
// On app launch
const token = await AsyncStorage.getItem('authToken');

if (token) {
  // Validate existing session
  const res = await fetch('/api/auth/validate', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    // Use existing session
  } else {
    // Create new anonymous user
  }
} else {
  // Create new anonymous user
}

// WebSocket connection
ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
```

## Files

```
src/services/auth-service.ts      # Core logic
src/routes/auth.ts                # REST endpoints
src/index.ts                      # WebSocket auth
prisma/schema.prisma              # User model (isAnonymous, authToken)
test-auth.sh                      # E2E tests
AUTH_GUIDE.md                     # Full documentation
```

## Database Schema

```prisma
model User {
  isAnonymous  Boolean  @default(true)
  authToken    String?  @unique
  // ... other fields
}
```

**Migration:** `bun run db:push`

## Token Format

`userId.timestamp.randomHash`

Example: `clxyz123.abc123.def456`

## Username Rules

- 3-16 characters
- Alphanumeric + underscores only
- Unique across all users
- Anonymous users get: `Player1234` (random)
- Can only register once per account

## Error Codes

- `400` - Invalid input
- `401` - Invalid/expired token
- `404` - User not found
- `409` - Username taken
- `500` - Server error

## Run Tests

```bash
# Start server
bun run dev

# In another terminal
./test-auth.sh
```

## Security Notes

**Current (SLC):**
- Simple tokens, no expiration
- Database validation
- No rate limiting

**Recommended (Phase 2):**
- JWT with signing
- Token expiration
- Rate limiting
- Refresh tokens
