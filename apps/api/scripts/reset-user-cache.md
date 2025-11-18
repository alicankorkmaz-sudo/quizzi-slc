# Reset User Cache Instructions

## Problem
Users who logged in before the emoji avatar migration have cached auth data in AsyncStorage with old avatar values (`default_1`, `default_2`, etc.).

## Solution
Users need to either:

### Option 1: Logout and Login Again
1. In the app, logout
2. Login again - this will fetch fresh data from the server with the new emoji avatars

### Option 2: Clear App Data (iOS)
1. Delete the app
2. Reinstall
3. Login - will fetch fresh data

### Option 3: Clear App Data (Android)
1. Go to Settings > Apps > Quizzi
2. Clear Data / Clear Storage
3. Login - will fetch fresh data

## For Development/Testing
To force all users to get fresh data on next app launch, you can increment the app version in `app.json` and add version checking logic to clear old cached data.

## Database Migration Complete
All existing users in the database have been migrated to emoji avatars:
- Users with `default_*` or `premium_*` avatars have been updated to `emoji_dog`
- Run the randomization script to give each user a unique random emoji:
  ```
  npx tsx scripts/migrate-avatars.ts
  ```
