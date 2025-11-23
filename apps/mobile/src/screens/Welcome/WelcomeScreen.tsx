import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  pressStates,
  focusStates,
  borderGlow,
  typography,
  createPressAnimation,
} from '../../theme';
import { anonymousLogin, registerUsername, validateUsername } from '../../services/auth-service';

import type { AuthData } from '../../services/auth-service';

interface WelcomeScreenProps {
  onAuthComplete: (authData: AuthData) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthComplete }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [primaryFocused, setPrimaryFocused] = useState(false);
  const [secondaryFocused, setSecondaryFocused] = useState(false);

  // Press animations
  const primaryScale = useRef(new Animated.Value(1)).current;
  const secondaryScale = useRef(new Animated.Value(1)).current;
  const primaryPress = createPressAnimation(primaryScale);
  const secondaryPress = createPressAnimation(secondaryScale);

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
            style={[
              styles.input,
              usernameError ? styles.inputError : null,
              inputFocused && !usernameError ? borderGlow.primary : null,
            ]}
            placeholder="e.g., QuizMaster_2024"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={handleUsernameChange}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            maxLength={16}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
          <Text style={styles.hint}>3-16 characters, letters, numbers, and underscores only</Text>

          <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
            <Pressable
              onPress={handleChooseUsername}
              onPressIn={primaryPress.pressIn}
              onPressOut={primaryPress.pressOut}
              onFocus={() => setPrimaryFocused(true)}
              onBlur={() => setPrimaryFocused(false)}
              disabled={!username || isLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Start playing with username"
              accessibilityState={{ disabled: !username || isLoading }}
              style={({ pressed }) => [
                styles.button,
                pressed && !isLoading && username
                  ? pressStates.primary.pressed
                  : pressStates.primary.rest,
                primaryFocused && focusStates.primary,
                (!username || isLoading) && styles.buttonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Start Playing</Text>
              )}
            </Pressable>
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Button */}
        <Animated.View style={{ transform: [{ scale: secondaryScale }] }}>
          <Pressable
            onPress={handlePlayAsGuest}
            onPressIn={secondaryPress.pressIn}
            onPressOut={secondaryPress.pressOut}
            onFocus={() => setSecondaryFocused(true)}
            onBlur={() => setSecondaryFocused(false)}
            disabled={isLoading}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Play as guest without username"
            accessibilityState={{ disabled: isLoading }}
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && !isLoading && elevation.level1,
              pressed && !isLoading && styles.secondaryButtonPressed,
              secondaryFocused && focusStates.primary,
              isLoading && styles.buttonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.secondaryButtonText}>Play as Guest</Text>
            )}
          </Pressable>
        </Animated.View>

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
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primaryVibrant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...elevation.level3,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.labelLarge,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
    ...elevation.level1,
  },
  inputError: {
    ...borderGlow.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.primaryLight,
    opacity: 0.1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.buttonPrimary,
    color: colors.textWhite,
  },
  secondaryButtonText: {
    ...typography.buttonPrimary,
    color: colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.labelLarge,
    color: colors.textLight,
    marginHorizontal: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
