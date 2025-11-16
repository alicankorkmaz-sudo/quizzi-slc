import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  updateProfile,
  validateUsername,
  AVAILABLE_AVATARS,
  type Avatar,
  type ProfileData,
} from '../../services/profile-service';

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
        <TouchableOpacity
          onPress={onCancel}
          disabled={isLoading}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.saveButton, isLoading && styles.disabledButton]}>
            Save
          </Text>
        </TouchableOpacity>
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
            style={[styles.input, usernameError ? styles.inputError : null]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter username"
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
          <View style={styles.avatarGrid}>
            {AVAILABLE_AVATARS.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar && styles.avatarOptionSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar)}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: getAvatarColor(avatar) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {getAvatarInitial(avatar)}
                  </Text>
                </View>
                <Text style={styles.avatarLabel}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper function to get avatar color based on avatar name
function getAvatarColor(avatar: string): string {
  const colors = [
    '#6C63FF', // Purple
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#FF8C42', // Orange
    '#7209B7', // Dark Purple
    '#06FFA5', // Mint
    '#FF006E', // Pink
  ];

  const index = parseInt(avatar.split('_')[1] || '1', 10) - 1;
  return colors[index] || colors[0];
}

// Helper function to get avatar initial
function getAvatarInitial(avatar: string): string {
  const number = avatar.split('_')[1] || '1';
  return `#${number}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    alignItems: 'center',
    width: 80,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#F0EFFF',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
