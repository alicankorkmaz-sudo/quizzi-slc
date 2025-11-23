import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography, createPressAnimation } from '../../../theme';
import { useHaptics } from '../../../hooks/useHaptics';

interface QueueStatusProps {
  category: Category;
  queuePosition?: number;
  elapsedTime: number;
  onCancel: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  general_knowledge: 'General Knowledge',
  geography: 'Geography',
  science: 'Science',
  pop_culture: 'Pop Culture',
  sports: 'Sports',
};

export const QueueStatus: React.FC<QueueStatusProps> = ({
  category,
  queuePosition,
  elapsedTime,
  onCancel,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cancelScale = useRef(new Animated.Value(1)).current;
  const cancelPress = createPressAnimation(cancelScale);
  const haptics = useHaptics();
  const [cancelFocused, setCancelFocused] = useState(false);

  const handleCancel = () => {
    haptics.light(); // Light impact for navigation action
    onCancel();
  };

  useEffect(() => {
    // Pulsing animation for searching indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEstimatedWait = (elapsed: number): string => {
    if (elapsed < 3) return '~3s';
    if (elapsed < 5) return '~5s';
    if (elapsed < 10) return '~10s';
    return 'any moment';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Animated searching indicator */}
        <Animated.View
          style={[
            styles.pulseContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.pulseCircle}>
            <MaterialCommunityIcons
              name="sword-cross"
              size={48}
              color={colors.primary}
            />
          </View>
        </Animated.View>

        {/* Status text */}
        <Text style={styles.title}>Searching for Opponent</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[category]}</Text>

        {/* Queue stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statLabel}>Finding match...</Text>
          </View>

          {queuePosition !== undefined && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={colors.textLight}
              />
              <Text style={styles.statValue}>Position {queuePosition}</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={colors.textLight}
            />
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={20}
              color={colors.textLight}
            />
            <Text style={styles.statValue}>Est. {getEstimatedWait(elapsedTime)}</Text>
          </View>
        </View>

        {/* Info text */}
        <Text style={styles.infoText}>
          Matching you with an opponent of similar skill level
        </Text>

        {/* Cancel button */}
        <Animated.View style={{ transform: [{ scale: cancelScale }] }}>
          <Pressable
            onPress={handleCancel}
            onPressIn={cancelPress.pressIn}
            onPressOut={cancelPress.pressOut}
            onFocus={() => setCancelFocused(true)}
            onBlur={() => setCancelFocused(false)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Cancel matchmaking"
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
              cancelFocused && styles.cancelButtonFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colors.error}
            />
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...elevation.level3,
    alignItems: 'center',
  },
  pulseContainer: {
    marginBottom: spacing.lg,
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary + '30',
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.h6,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statValue: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    ...elevation.level1,
  },
  cancelButtonPressed: {
    backgroundColor: colors.errorLight,
    opacity: 0.1,
  },
  cancelButtonFocused: {
    borderWidth: 3,
    borderColor: colors.error,
  },
  cancelText: {
    ...typography.buttonPrimary,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});
