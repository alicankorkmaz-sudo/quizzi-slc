import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, fontSizes, fontWeights } from "../../theme";
import { validateUsername } from '../../services/auth-service';

interface UsernameUpdateScreenProps {
  currentUsername: string;
  onUpdate: (newUsername: string) => Promise<void>;
  onCancel: () => void;
}

export const UsernameUpdateScreen: React.FC<UsernameUpdateScreenProps> = ({
  currentUsername,
  onUpdate,
  onCancel,
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const handleSave = async () => {
    // Check if username changed
    if (username === currentUsername) {
      Alert.alert('No Changes', 'Please enter a different username', [{ text: 'OK' }]);
      return;
    }

    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Invalid username');
      return;
    }

    try {
      setIsLoading(true);
      setUsernameError(null);
      await onUpdate(username);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to update username';
      Alert.alert('Update Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (usernameError) {
      setUsernameError(null);
    }
  };

  const hasChanges = username !== currentUsername;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel} disabled={isLoading}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Username</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>👤</Text>
          </View>

          <Text style={styles.title}>Choose Your Username</Text>
          <Text style={styles.description}>
            Pick a unique username that represents you in quiz battles
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : undefined]}
              placeholder="Enter username"
              placeholderTextColor={colors.textLight}
              value={username}
              onChangeText={handleUsernameChange}
              maxLength={16}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!isLoading}
            />
            {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
            <Text style={styles.hint}>3-16 characters, letters, numbers, and underscores only</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <Text style={styles.saveButtonText}>Save Username</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Your username will be visible to all players during quiz battles
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  headerTitle: {
    fontSize: 18,              // Close to lg (17px)
    fontWeight: fontWeights.semiBold,
    color: colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 40,              // Large display size
  },
  title: {
    fontSize: 24,              // Not in scale
    fontWeight: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: 4,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginBottom: 4,
    marginLeft: 4,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textWhite,
  },
  infoText: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
