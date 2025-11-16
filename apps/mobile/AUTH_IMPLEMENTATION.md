# Authentication Implementation Guide

## Overview

This document describes the complete authentication system implemented for Quizzi mobile app.

## Architecture

### Files Created/Modified

**New Files:**
- `/apps/mobile/src/services/auth-service.ts` - Backend API integration for auth
- `/apps/mobile/src/screens/Welcome/WelcomeScreen.tsx` - Initial welcome/auth screen
- `/apps/mobile/src/screens/Welcome/index.ts` - Export barrel
- `/apps/mobile/src/screens/UsernameUpdate/UsernameUpdateScreen.tsx` - Username change screen
- `/apps/mobile/src/screens/UsernameUpdate/index.ts` - Export barrel

**Modified Files:**
- `/apps/mobile/src/hooks/useUser.ts` - Updated to use auth-service
- `/apps/mobile/src/navigation/RootNavigator.tsx` - Added UsernameUpdate screen
- `/apps/mobile/App.tsx` - Added authentication flow logic
- `/apps/mobile/src/services/user.ts` - Deprecated in favor of auth-service

## Authentication Flow

### First Launch Flow

1. **App starts** → `App.tsx` checks for stored auth via `getStoredAuth()`
2. **No stored auth found** → Shows `WelcomeScreen`
3. **User chooses option:**
   - **"Play as Guest"** → Calls `anonymousLogin()` → Backend returns `{ userId, username, token, isAnonymous: true }`
   - **"Choose Username"** → Validates input → Calls `anonymousLogin()` → Immediately calls `registerUsername()` → Backend returns `{ userId, username, token, isAnonymous: false }`
4. **Auth data stored** in AsyncStorage under `@quizzi/auth` key
5. **Navigate to Matchmaking** screen

### Returning User Flow

1. **App starts** → `useUser()` hook loads stored auth from AsyncStorage
2. **Valid auth found** → Skip WelcomeScreen, go directly to Matchmaking
3. **User authenticated** with userId, username, and token

### Username Update Flow (from Profile)

1. **User navigates** to Profile screen
2. **User taps "Edit Username"** button (to be added to ProfileScreen)
3. **Navigate to UsernameUpdate** screen with current username
4. **User enters new username** → Validates format
5. **User taps "Save"** → Calls `registerUsername()` via `useUser` hook
6. **Backend updates username** → Returns new auth token
7. **AsyncStorage updated** → Navigate back to Profile
8. **Profile displays updated username**

## API Integration

### Backend Endpoints Required

**POST /auth/anonymous**
```typescript
// Request: No body required
// Response:
{
  userId: string;      // e.g., "usr_12345"
  username: string;    // e.g., "Guest_abc123"
  token: string;       // JWT or session token
}
```

**POST /auth/register**
```typescript
// Headers:
Authorization: "Bearer <token>"

// Request:
{
  userId: string;
  newUsername: string;
}

// Response:
{
  userId: string;
  username: string;    // Updated username
  token: string;       // New token (may be same or refreshed)
}

// Error responses:
{
  message: string;     // e.g., "Username already taken"
}
```

## Data Models

### AuthData Interface
```typescript
interface AuthData {
  userId: string;      // Unique user identifier
  username: string;    // Display name
  token: string;       // Auth token for API calls
  isAnonymous: boolean; // true = guest, false = registered
}
```

### Storage Format (AsyncStorage)
```json
{
  "userId": "usr_12345",
  "username": "QuizMaster_2024",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAnonymous": false
}
```

## Username Validation Rules

- **Minimum length:** 3 characters
- **Maximum length:** 16 characters
- **Allowed characters:** Letters (a-z, A-Z), numbers (0-9), underscore (_)
- **Regex pattern:** `/^[a-zA-Z0-9_]+$/`

Examples:
- ✅ `QuizMaster_2024`
- ✅ `player_123`
- ✅ `JohnDoe`
- ❌ `ab` (too short)
- ❌ `this_is_way_too_long_username` (too long)
- ❌ `user@name` (invalid character @)
- ❌ `user name` (spaces not allowed)

## Testing Instructions

### 1. Test First Launch (No Backend Required Yet)

Since the backend isn't ready, you'll need to mock the API calls temporarily.

**Option A: Mock the auth-service (Recommended for testing UI)**

Edit `/apps/mobile/src/services/auth-service.ts` and add mock mode:

```typescript
// At the top of the file, add:
const USE_MOCK = true; // Set to false when backend is ready

// In anonymousLogin(), replace fetch with:
if (USE_MOCK) {
  const mockData: AuthData = {
    userId: `usr_${Date.now()}`,
    username: `Guest_${Math.random().toString(36).substring(2, 8)}`,
    token: `mock_token_${Date.now()}`,
    isAnonymous: true,
  };
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockData));
  return mockData;
}

// In registerUsername(), replace fetch with:
if (USE_MOCK) {
  const mockData: AuthData = {
    userId,
    username: newUsername,
    token: `mock_token_${Date.now()}`,
    isAnonymous: false,
  };
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockData));
  return mockData;
}
```

**Option B: Run a mock API server**

Create a simple Express server for testing:

```bash
# In a new terminal, create a test server
cd /tmp
mkdir quizzi-mock-api && cd quizzi-mock-api
npm init -y
npm install express cors body-parser
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = {};

app.post('/auth/anonymous', (req, res) => {
  const userId = `usr_${Date.now()}`;
  const username = `Guest_${Math.random().toString(36).substring(2, 8)}`;
  const token = `token_${Date.now()}`;

  users[userId] = { userId, username, token };

  res.json({ userId, username, token });
});

app.post('/auth/register', (req, res) => {
  const { userId, newUsername } = req.body;

  if (!users[userId]) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if username is taken
  const taken = Object.values(users).some(u => u.username === newUsername && u.userId !== userId);
  if (taken) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  users[userId].username = newUsername;
  res.json(users[userId]);
});

app.listen(3000, () => {
  console.log('Mock API running on http://localhost:3000');
});
```

Run it: `node server.js`

### 2. Test Steps

#### Test Case 1: First Launch - Play as Guest

1. **Clear app data:**
   ```bash
   cd /Users/alican.korkmaz/Code/quizzi-slc/apps/mobile
   yarn dev
   # In dev menu: "Delete all data" or manually clear AsyncStorage
   ```

2. **Restart app** - Should show WelcomeScreen

3. **Tap "Play as Guest"**
   - Should show loading spinner
   - Should call anonymous login
   - Should store auth data
   - Should navigate to Matchmaking screen

4. **Verify:**
   - Check logs for `[AuthService] Anonymous login successful`
   - Username should be something like `Guest_abc123`
   - `isAnonymous` should be `true`

#### Test Case 2: First Launch - Choose Username

1. **Clear app data** (same as above)

2. **Enter username** in input field (e.g., `QuizMaster_2024`)

3. **Tap "Start Playing"**
   - Should validate username
   - Should call anonymous login
   - Should immediately call register with chosen username
   - Should navigate to Matchmaking

4. **Verify:**
   - Username should be `QuizMaster_2024`
   - `isAnonymous` should be `false`
   - Check logs for both login and registration calls

#### Test Case 3: Username Validation

1. **On WelcomeScreen**, test invalid usernames:
   - `ab` (too short) → Should show error
   - `this_is_way_too_long` (>16 chars) → Should show error
   - `user@name` (invalid chars) → Should show error
   - `user name` (spaces) → Should show error

2. **Valid username** should enable "Start Playing" button

#### Test Case 4: Returning User

1. **Close and restart app**
   - Should NOT show WelcomeScreen
   - Should go directly to Matchmaking
   - Should use stored auth data

2. **Verify in logs:**
   - `[useUser] Using stored auth: <username>`

#### Test Case 5: Update Username (Future - needs Profile button)

Once you add a button to ProfileScreen:

1. **Navigate to Profile** screen
2. **Tap "Edit Username"** button
3. **Enter new username** (e.g., `NewName_2024`)
4. **Tap "Save"**
   - Should validate
   - Should call register API
   - Should update stored auth
   - Should navigate back to Profile
   - Should display new username

5. **Verify:**
   - Profile shows updated username
   - AsyncStorage contains new username
   - `isAnonymous` is now `false`

### 3. Integration with Profile Screen

To enable username editing from Profile, add this to `/apps/mobile/src/screens/Profile/ProfileScreen.tsx`:

```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

// In ProfileScreen component:
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

// Add a button in the header section (after username):
<TouchableOpacity
  style={styles.editButton}
  onPress={() => navigation.navigate('UsernameUpdate', { currentUsername: user.username })}
>
  <Text style={styles.editButtonText}>Edit Username</Text>
</TouchableOpacity>

// Add styles:
editButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: colors.primary,
  borderRadius: 8,
  marginTop: 8,
},
editButtonText: {
  color: colors.textWhite,
  fontSize: 14,
  fontWeight: '600',
},
```

### 4. Clear Storage (for testing)

To manually clear auth data during development:

```typescript
import { logout } from './src/services/auth-service';

// In a component or test:
await logout();
// Then restart app
```

Or use React Native Debugger console:
```javascript
AsyncStorage.removeItem('@quizzi/auth');
```

## Error Handling

### Network Errors
- All API calls wrapped in try/catch
- Shows user-friendly Alert on connection errors
- Falls back to anonymous login on catastrophic errors

### Validation Errors
- Client-side validation before API calls
- Real-time error display in input fields
- Clear error messages from backend displayed to user

### Token Expiration (Future)
- Backend should return 401 on expired token
- App should catch 401 and re-authenticate
- Consider adding refresh token logic

## Next Steps

1. **Backend Implementation:**
   - Implement POST /auth/anonymous endpoint
   - Implement POST /auth/register endpoint
   - Add username uniqueness validation
   - Generate JWT tokens

2. **Profile Integration:**
   - Add "Edit Username" button to ProfileScreen
   - Wire up navigation to UsernameUpdate screen
   - Display `isAnonymous` status (e.g., "Guest" badge)

3. **WebSocket Integration:**
   - Pass `token` to WebSocket connection for auth
   - Backend should validate token on WebSocket handshake

4. **Additional Features:**
   - Add logout functionality
   - Add "Delete Account" option
   - Add avatar selection (Phase 2)
   - Add social login (Phase 3)

## Security Considerations

- Tokens stored in AsyncStorage (encrypted on device)
- Always use HTTPS in production (update API_BASE_URL)
- Implement token expiration and refresh logic
- Rate limit registration endpoint to prevent abuse
- Validate username uniqueness server-side
- Consider adding CAPTCHA for registration (if abuse occurs)

## Troubleshooting

**Issue: "Connection Error" on login**
- Backend not running on localhost:3000
- Check network configuration (iOS simulator vs real device)
- For real device testing, use local IP instead of localhost

**Issue: Welcome screen shows every launch**
- AsyncStorage not persisting
- Check for AsyncStorage errors in logs
- Verify storage permissions

**Issue: Username update doesn't work**
- Check token is being sent in Authorization header
- Verify backend validates token
- Check for 401/403 errors in network logs

**Issue: App stuck on loading screen**
- Check for unhandled promise rejections
- Verify useUser hook is completing
- Check AsyncStorage is accessible
