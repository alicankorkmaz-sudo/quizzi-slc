import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category } from '../../../../../../packages/types/src';
import {
  colors,
  spacing,
  borderRadius,
  elevation,
  focusStates,
  typography,
} from '../../../theme';
import { useHaptics } from '../../../hooks/useHaptics';

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
    description: string;
  }
> = {
  general_knowledge: {
    label: 'General Knowledge',
    icon: 'brain',
    color: colors.generalKnowledge,
    description: 'Test your overall knowledge',
  },
  geography: {
    label: 'Geography',
    icon: 'earth',
    color: colors.geography,
    description: 'Explore the world',
  },
  science: {
    label: 'Science',
    icon: 'flask',
    color: colors.science,
    description: 'Discover scientific facts',
  },
  pop_culture: {
    label: 'Pop Culture',
    icon: 'movie-star',
    color: colors.popCulture,
    description: 'Movies, music, and trends',
  },
  sports: {
    label: 'Sports',
    icon: 'basketball',
    color: colors.sports,
    description: 'Athletic knowledge',
  },
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  disabled = false,
}) => {
  const config = CATEGORY_CONFIG[category];
  const haptics = useHaptics();
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    haptics.light(); // Light impact for UI navigation
    onPress(category);
  };

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${config.label} category: ${config.description}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: config.color },
        !disabled && (pressed ? elevation.level1 : elevation.level2),
        !disabled && pressed && styles.pressed,
        isFocused && focusStates.subtle,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={config.icon}
          size={44}
          color={colors.textWhite}
        />
      </View>
      <Text style={styles.label}>{config.label}</Text>
      <Text style={styles.description}>{config.description}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 145,
    margin: spacing.sm,
    padding: spacing.md - 4,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.h6,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
});
