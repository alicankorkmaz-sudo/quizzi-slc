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
import { anonymousLogin, registerUsername, validateUsername } from '../../services/auth-service';

import type { AuthData } from '../../services/auth-service';

interface WelcomeScreenProps {
  onAuthComplete: (authData: AuthData) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthComplete }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const handlePlayAsGuest = async () => {
    try {
      setIsLoading(true);
      const authData = await anonymousLogin();
      onAuthComplete(authData);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseUsername = async () => {
    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Invalid username');
      return;
    }

    try {
      setIsLoading(true);
      setUsernameError(null);

      // First, perform anonymous login to get userId and token
      const anonymousAuth = await anonymousLogin();

      // Then immediately register the chosen username
      const registeredAuth = await registerUsername(
        anonymousAuth.userId,
        username,
        anonymousAuth.token
      );

      onAuthComplete(registeredAuth);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to register username';

      Alert.alert('Registration Error', errorMessage, [{ text: 'OK' }]);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo/Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.title}>Quizzi</Text>
          <Text style={styles.subtitle}>Fast-paced 1v1 Quiz Battles</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Choose Your Username (Optional)</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : undefined]}
            placeholder="e.g., QuizMaster_2024"
            placeholderTextColor={colors.textLight}
            value={username}
            onChangeText={handleUsernameChange}
            maxLength={16}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
          <Text style={styles.hint}>3-16 characters, letters, numbers, and underscores only</Text>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (!username || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleChooseUsername}
            disabled={!username || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Start Playing</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
          onPress={handlePlayAsGuest}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>Play as Guest</Text>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          You can always customize your username later from your profile
        </Text>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: fontSizes['4xl'],
  },
  title: {
    fontSize: 36,              // Between 3xl and 4xl
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
  },
  inputSection: {
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
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textWhite,
  },
  secondaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    marginHorizontal: 16,
    fontWeight: fontWeights.medium,
  },
  infoText: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
