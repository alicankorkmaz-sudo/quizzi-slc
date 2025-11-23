import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Category } from '../../../../../../packages/types/src';
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  typography,
} from '../../../theme';
import { useHaptics } from '../../../hooks/useHaptics';
import { createPressAnimation } from '../../../theme/interactions';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  disabled?: boolean;
}

const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    gradientColors: [string, string];
    description: string;
  }
> = {
  general_knowledge: {
    label: 'General Knowledge',
    icon: 'brain',
    color: colors.generalKnowledge,
    gradientColors: ['#FF6690', '#FF3366'],
    description: 'Test your overall knowledge',
  },
  geography: {
    label: 'Geography',
    icon: 'earth',
    color: colors.geography,
    gradientColors: ['#2EE6D6', '#00C4B4'],
    description: 'Explore the world',
  },
  science: {
    label: 'Science',
    icon: 'flask',
    color: colors.science,
    gradientColors: ['#45EBC0', '#00D2A0'],
    description: 'Discover scientific facts',
  },
  pop_culture: {
    label: 'Pop Culture',
    icon: 'movie-star',
    color: colors.popCulture,
    gradientColors: ['#FFD940', '#FFC800'],
    description: 'Movies, music, and trends',
  },
  sports: {
    label: 'Sports',
    icon: 'basketball',
    color: colors.sports,
    gradientColors: ['#FF7733', '#FF5500'],
    description: 'Athletic knowledge',
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  disabled = false,
}) => {
  const config = CATEGORY_CONFIG[category];
  const haptics = useHaptics();
  const scale = useRef(new Animated.Value(1)).current;
  const { pressIn, pressOut } = createPressAnimation(scale);

  const handlePress = () => {
    haptics.light();
    onPress(category);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${config.label} category: ${config.description}`}
      accessibilityState={{ disabled }}
      style={[
        styles.container,
        { transform: [{ scale }] },
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={config.icon}
              size={48}
              color={colors.textWhite}
              style={styles.iconShadow}
            />
          </View>
          <Text style={styles.label}>{config.label}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>

        {/* Subtle radial-like shine effect using absolute positioning */}
        <View style={styles.shine} />
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: spacing.sm,
    ...elevation.level2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface, // Needed for Android elevation
  },
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  label: {
    ...typography.h6,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
  shine: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
});
