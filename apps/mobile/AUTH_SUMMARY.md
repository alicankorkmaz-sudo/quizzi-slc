# Authentication System - Quick Reference

## Files Created

### Services
- `/apps/mobile/src/services/auth-service.ts` - Complete auth API integration

### Screens
- `/apps/mobile/src/screens/Welcome/WelcomeScreen.tsx` - Initial auth screen
- `/apps/mobile/src/screens/Welcome/index.ts`
- `/apps/mobile/src/screens/UsernameUpdate/UsernameUpdateScreen.tsx` - Username edit modal
- `/apps/mobile/src/screens/UsernameUpdate/index.ts`

### Modified Files
- `/apps/mobile/src/hooks/useUser.ts` - Authentication logic
- `/apps/mobile/src/navigation/RootNavigator.tsx` - Added UsernameUpdate screen
- `/apps/mobile/App.tsx` - Authentication flow
- `/apps/mobile/src/services/user.ts` - Deprecated (kept for compatibility)
- `/apps/mobile/src/screens/Profile/mockData.ts` - Added isAnonymous field

## Key Features

### Authentication Flow
1. **First launch** → Shows WelcomeScreen
2. **Two options:**
   - "Play as Guest" → Anonymous login → Auto-generated username
   - "Choose Username" → Custom username → Registered account
3. **Returning users** → Auto-login from AsyncStorage

### Storage
- Key: `@quizzi/auth`
- Data: `{ userId, username, token, isAnonymous }`

### Validation
- 3-16 characters
- Alphanumeric + underscore only
- Regex: `/^[a-zA-Z0-9_]+$/`

## Backend Requirements

### POST /auth/anonymous
```json
Response: {
  "userId": "usr_12345",
  "username": "Guest_abc123",
  "token": "jwt_token_here"
}
```

### POST /auth/register
```json
Request: {
  "userId": "usr_12345",
  "newUsername": "QuizMaster_2024"
}
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Response: {
  "userId": "usr_12345",
  "username": "QuizMaster_2024",
  "token": "new_jwt_token_here"
}
```

## How to Test

### Quick Mock Test (No Backend)
Edit `/apps/mobile/src/services/auth-service.ts`:
```typescript
const USE_MOCK = true; // Line 8

// Mock responses will work without backend
```

### With Mock Server
See `AUTH_IMPLEMENTATION.md` for Express mock server setup.

### Test Cases
1. First launch → Choose username
2. First launch → Play as guest
3. Close/reopen app → Should auto-login
4. Profile → Edit username (after adding button)

## Next Steps

1. **Add Edit Button to Profile:**
   - See `PROFILE_USERNAME_INTEGRATION.md` for exact code
   - Add navigation to UsernameUpdate screen
   - Show isAnonymous status (e.g., "Guest" badge)

2. **Backend Implementation:**
   - Create `/auth/anonymous` endpoint
   - Create `/auth/register` endpoint
   - Generate JWT tokens
   - Validate username uniqueness

3. **WebSocket Integration:**
   - Pass `token` in WebSocket connection
   - Backend validates token on connect

## Testing Commands

```bash
# Clear app data
cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
yarn dev
# In dev menu: Delete all data

# Type check
yarn type-check

# Clear AsyncStorage manually (in dev)
AsyncStorage.removeItem('@quizzi/auth')
```

## API Base URL

Currently: `http://localhost:3000`

For real device testing, update in `/apps/mobile/src/services/auth-service.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3000'; // e.g., 'http://192.168.1.100:3000'
```

## Documentation

- **Full guide:** `AUTH_IMPLEMENTATION.md`
- **Profile integration:** `PROFILE_USERNAME_INTEGRATION.md`
- **This summary:** `AUTH_SUMMARY.md`
