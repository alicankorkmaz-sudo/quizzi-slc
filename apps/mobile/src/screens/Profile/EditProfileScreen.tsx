import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  updateProfile,
  validateUsername,
  type Avatar,
  type ProfileData,
} from '../../services/profile-service';
import { AvatarPicker } from '../../components/AvatarPicker';
import type { AvatarId } from '../../utils/avatars';
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  borderGlow,
  typography,
  createPressAnimation,
} from '../../theme';

interface EditProfileScreenProps {
  currentProfile: ProfileData;
  token: string;
  onSave: (updatedProfile: ProfileData) => void;
  onCancel: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  currentProfile,
  token,
  onSave,
  onCancel,
}) => {
  const [username, setUsername] = useState(currentProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    currentProfile.avatar as Avatar
  );
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [inputFocused, setInputFocused] = useState(false);
  const [cancelFocused, setCancelFocused] = useState(false);
  const [saveFocused, setSaveFocused] = useState(false);

  // Press animations
  const cancelScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const cancelPress = createPressAnimation(cancelScale);
  const savePress = createPressAnimation(saveScale);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setUsernameError(undefined);
  };

  const handleSave = async () => {
    // Validate username if changed
    if (username !== currentProfile.username) {
      const validation = validateUsername(username);
      if (!validation.isValid) {
        setUsernameError(validation.error);
        return;
      }
    }

    // Check if anything changed
    const usernameChanged = username !== currentProfile.username;
    const avatarChanged = selectedAvatar !== currentProfile.avatar;

    if (!usernameChanged && !avatarChanged) {
      Alert.alert('No Changes', 'You haven\'t made any changes to your profile.');
      return;
    }

    setIsLoading(true);

    try {
      const updates: { username?: string; avatar?: Avatar } = {};

      if (usernameChanged) {
        updates.username = username;
      }

      if (avatarChanged) {
        updates.avatar = selectedAvatar;
      }

      const updatedProfile = await updateProfile(token, updates);

      Alert.alert('Success', 'Your profile has been updated!', [
        {
          text: 'OK',
          onPress: () => onSave(updatedProfile),
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: cancelScale }] }}>
          <Pressable
            onPress={onCancel}
            onPressIn={cancelPress.pressIn}
            onPressOut={cancelPress.pressOut}
            onFocus={() => setCancelFocused(true)}
            onBlur={() => setCancelFocused(false)}
            disabled={isLoading}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Cancel editing profile"
            style={({ pressed }) => [
              styles.headerButton,
              pressed && !isLoading && styles.headerButtonPressed,
              cancelFocused && styles.headerButtonFocused,
            ]}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
        </Animated.View>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Animated.View style={{ transform: [{ scale: saveScale }] }}>
          <Pressable
            onPress={handleSave}
            onPressIn={savePress.pressIn}
            onPressOut={savePress.pressOut}
            onFocus={() => setSaveFocused(true)}
            onBlur={() => setSaveFocused(false)}
            disabled={isLoading}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
            style={({ pressed }) => [
              styles.headerButton,
              pressed && !isLoading && styles.headerButtonPressed,
              saveFocused && styles.headerButtonFocused,
            ]}
          >
            <Text style={[styles.saveButton, isLoading && styles.disabledButton]}>
              Save
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Username Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Username</Text>
          <TextInput
            style={[
              styles.input,
              usernameError ? borderGlow.error : null,
              inputFocused && !usernameError ? borderGlow.primary : null,
            ]}
            value={username}
            onChangeText={handleUsernameChange}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Enter username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={16}
            editable={!isLoading}
          />
          {usernameError && (
            <Text style={styles.errorText}>{usernameError}</Text>
          )}
          <Text style={styles.helperText}>
            3-16 characters, letters, numbers, and underscores only
          </Text>
        </View>

        {/* Avatar Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Avatar</Text>
          <AvatarPicker
            selectedAvatar={selectedAvatar}
            onSelect={(avatarId: AvatarId) => {
              if (!isLoading) {
                setSelectedAvatar(avatarId);
              }
            }}
          />
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...elevation.level1,
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 60,
    borderRadius: borderRadius.sm,
  },
  headerButtonPressed: {
    backgroundColor: colors.primaryLight + '20',
  },
  headerButtonFocused: {
    backgroundColor: colors.primaryLight + '30',
  },
  headerTitle: {
    ...typography.h6,
    color: colors.text,
  },
  cancelButton: {
    ...typography.body,
    color: colors.textMuted,
  },
  saveButton: {
    ...typography.bodySemiBold,
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg + 8,
  },
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.md - 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 4,
    ...typography.body,
    color: colors.text,
    ...elevation.level1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
