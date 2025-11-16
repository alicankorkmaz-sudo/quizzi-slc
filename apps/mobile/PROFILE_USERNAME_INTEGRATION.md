# Profile Screen Username Edit Integration

## Quick Guide: Adding "Edit Username" Button to Profile

This guide shows how to integrate the UsernameUpdate screen with the existing ProfileScreen.

## Implementation

### Step 1: Update ProfileScreen.tsx

Add the following imports at the top:

```typescript
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors } from '../../theme/colors';
```

### Step 2: Add Navigation Hook

Inside the `ProfileScreen` component, add:

```typescript
export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  categoryStats,
  matchHistory,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Rest of component...
```

### Step 3: Add Edit Button to Header

Replace the header section (around line 34-48) with:

```typescript
{/* Header */}
<View style={styles.header}>
  <View style={styles.avatarContainer}>
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {user.username.substring(0, 2).toUpperCase()}
      </Text>
    </View>
    {user.premiumStatus && (
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumBadgeText}>PRO</Text>
      </View>
    )}
  </View>

  <View style={styles.usernameContainer}>
    <Text style={styles.username}>{user.username}</Text>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate('UsernameUpdate', {
        currentUsername: user.username
      })}
    >
      <Text style={styles.editButtonText}>✏️ Edit</Text>
    </TouchableOpacity>
  </View>
</View>
```

### Step 4: Add Styles

Add these styles to the StyleSheet at the bottom:

```typescript
usernameContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
username: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333333',
},
editButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: colors.primary,
  borderRadius: 8,
},
editButtonText: {
  color: colors.textWhite,
  fontSize: 13,
  fontWeight: '600',
},
```

## Alternative: Simple Icon Button

For a more minimal design, use just an icon:

```typescript
<View style={styles.usernameContainer}>
  <Text style={styles.username}>{user.username}</Text>
  <TouchableOpacity
    style={styles.editIconButton}
    onPress={() => navigation.navigate('UsernameUpdate', {
      currentUsername: user.username
    })}
  >
    <Text style={styles.editIcon}>✏️</Text>
  </TouchableOpacity>
</View>

// Styles:
editIconButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.primaryLight,
  alignItems: 'center',
  justifyContent: 'center',
},
editIcon: {
  fontSize: 16,
},
```

## Complete Example

Here's the full modified header section:

```typescript
{/* Header */}
<View style={styles.header}>
  <View style={styles.avatarContainer}>
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {user.username.substring(0, 2).toUpperCase()}
      </Text>
    </View>
    {user.premiumStatus && (
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumBadgeText}>PRO</Text>
      </View>
    )}
  </View>

  <View style={styles.usernameContainer}>
    <Text style={styles.username}>{user.username}</Text>
    <TouchableOpacity
      style={styles.editIconButton}
      onPress={() => navigation.navigate('UsernameUpdate', {
        currentUsername: user.username
      })}
    >
      <Text style={styles.editIcon}>✏️</Text>
    </TouchableOpacity>
  </View>
</View>
```

And the complete styles object additions:

```typescript
const styles = StyleSheet.create({
  // ... existing styles ...

  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
});
```

## Testing the Integration

1. **Navigate to Profile screen**
2. **Tap the edit button** next to username
3. **UsernameUpdate modal should slide up**
4. **Change username and save**
5. **Should return to Profile with updated username**

## Notes

- The UsernameUpdate screen is already configured as a modal in RootNavigator
- The navigation is handled automatically
- Username updates will persist in AsyncStorage
- The useUser hook will update automatically after registration
