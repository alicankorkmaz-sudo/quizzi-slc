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
import { colors, spacing, borderRadius, shadows } from '../../../theme';

interface MatchFoundModalProps {
  visible: boolean;
  opponentUsername: string;
  opponentRankTier: RankTier;
  opponentRankPoints: number;
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
  opponentRankTier,
  opponentRankPoints,
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
  const rankDiffText =
    rankDiff > 0 ? `+${rankDiff} points` : `${rankDiff} points`;

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
            {/* Avatar placeholder */}
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: tierConfig.color + '30' },
              ]}
            >
              <MaterialCommunityIcons
                name="account"
                size={48}
                color={tierConfig.color}
              />
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
                <Text style={styles.rankPoints}>{opponentRankPoints} pts</Text>
              </View>

              {/* Rank difference */}
              <Text
                style={[
                  styles.rankDiff,
                  { color: rankDiff > 0 ? colors.error : colors.success },
                ]}
              >
                {rankDiffText}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - spacing.xl * 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
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
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  rankPoints: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  rankDiff: {
    fontSize: 13,
    fontWeight: '600',
  },
  startingText: {
    fontSize: 16,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
