import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RankTier } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, elevation, typography } from '../../../theme';
import { getAvatarEmoji } from '../../../utils/avatars';

interface MatchFoundModalProps {
  visible: boolean;
  opponentUsername: string;
  opponentAvatar?: string;
  opponentRankTier: RankTier;
  opponentRankPoints: number;
  opponentWinRate?: number;
  opponentCurrentStreak?: number;
  myRankPoints: number;
  onAnimationComplete?: () => void;
}

const RANK_TIER_CONFIG: Record<
  RankTier,
  { label: string; color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  bronze: {
    label: 'Bronze',
    color: colors.bronze,
    icon: 'medal',
  },
  silver: {
    label: 'Silver',
    color: colors.silver,
    icon: 'medal',
  },
  gold: {
    label: 'Gold',
    color: colors.gold,
    icon: 'medal',
  },
  platinum: {
    label: 'Platinum',
    color: colors.platinum,
    icon: 'crown',
  },
  diamond: {
    label: 'Diamond',
    color: colors.diamond,
    icon: 'diamond-stone',
  },
};

const { width } = Dimensions.get('window');

export const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  visible,
  opponentUsername,
  opponentAvatar,
  opponentRankTier,
  opponentRankPoints,
  opponentWinRate,
  opponentCurrentStreak,
  myRankPoints,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Reset animations
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    return undefined;
  }, [visible, scaleAnim, fadeAnim, slideAnim, onAnimationComplete]);

  const rankDiff = opponentRankPoints - myRankPoints;
  const isOpponentHigher = rankDiff > 0;
  const rankDiffText = isOpponentHigher
    ? `${Math.abs(rankDiff)} pts higher`
    : rankDiff < 0
      ? `${Math.abs(rankDiff)} pts lower`
      : 'Equal rank';

  const tierConfig = RANK_TIER_CONFIG[opponentRankTier];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={colors.success}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Match Found!</Text>

          {/* VS divider */}
          <View style={styles.vsContainer}>
            <View style={styles.divider} />
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.divider} />
          </View>

          {/* Opponent card */}
          <Animated.View
            style={[
              styles.opponentCard,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Avatar */}
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: tierConfig.color + '30' },
              ]}
            >
              {opponentAvatar ? (
                <Text style={styles.avatarEmoji}>{getAvatarEmoji(opponentAvatar)}</Text>
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={48}
                  color={tierConfig.color}
                />
              )}
            </View>

            {/* Opponent info */}
            <View style={styles.opponentInfo}>
              <Text style={styles.opponentName}>{opponentUsername}</Text>

              {/* Rank tier badge */}
              <View style={styles.rankBadge}>
                <MaterialCommunityIcons
                  name={tierConfig.icon}
                  size={16}
                  color={tierConfig.color}
                />
                <Text style={[styles.rankText, { color: tierConfig.color }]}>
                  {tierConfig.label}
                </Text>
                <Text style={styles.elo}>{opponentRankPoints} pts</Text>
              </View>

              {/* Win rate and streak stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Win Rate</Text>
                  <Text style={styles.statValue}>
                    {Math.round((opponentWinRate ?? 0) * 100)}%
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Streak</Text>
                  <Text style={[
                    styles.statValue,
                    (opponentCurrentStreak ?? 0) > 0 && styles.streakPositive
                  ]}>
                    {(opponentCurrentStreak ?? 0) > 0 ? `🔥 ${opponentCurrentStreak}` : '0'}
                  </Text>
                </View>
              </View>

              {/* Rank difference */}
              {rankDiff !== 0 && (
                <Text
                  style={[
                    styles.rankDiff,
                    { color: isOpponentHigher ? colors.warning : colors.textLight },
                  ]}
                >
                  {rankDiffText}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Starting message */}
          <Text style={styles.startingText}>Battle starting...</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - spacing.xl * 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...elevation.level4,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  vsText: {
    ...typography.h5,
    color: colors.primary,
    marginHorizontal: spacing.md,
  },
  opponentCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rankText: {
    ...typography.bodySemiBold,
    marginLeft: spacing.xs,
  },
  elo: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  rankDiff: {
    ...typography.captionMedium,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  streakPositive: {
    color: colors.warning,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  startingText: {
    ...typography.body,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
