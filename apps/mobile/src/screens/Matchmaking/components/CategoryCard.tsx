import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category } from '../../../../../../packages/types/src';
import { colors, spacing, borderRadius, shadows, typography } from "../../../theme";
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

  const handlePress = () => {
    haptics.light(); // Light impact for UI navigation
    onPress(category);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: config.color },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 145,
    margin: spacing.sm,
    padding: 12,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    ...typography.h6,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.hint,
    color: colors.textWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
});
