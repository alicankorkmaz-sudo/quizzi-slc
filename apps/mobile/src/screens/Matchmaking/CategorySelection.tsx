import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import type { Category } from '../../../../../packages/types/src';
import { CategoryCard } from './components/CategoryCard';
import { colors, spacing } from '../../theme';

interface CategorySelectionProps {
  onCategorySelect: (category: Category) => void;
}

const CATEGORIES: Category[] = [
  'general_knowledge',
  'geography',
  'science',
  'pop_culture',
  'sports',
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  onCategorySelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Battle</Text>
        <Text style={styles.subtitle}>Select a category to start matchmaking</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesGrid}>
          {CATEGORIES.slice(0, 2).map((category) => (
            <View key={category} style={styles.categoryItem}>
              <CategoryCard category={category} onPress={onCategorySelect} />
            </View>
          ))}
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.slice(2, 4).map((category) => (
            <View key={category} style={styles.categoryItem}>
              <CategoryCard category={category} onPress={onCategorySelect} />
            </View>
          ))}
        </View>

        <View style={styles.categoriesGrid}>
          <View style={styles.categoryItem}>
            <CategoryCard category={CATEGORIES[4]} onPress={onCategorySelect} />
          </View>
          <View style={styles.categoryItem} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  categoryItem: {
    flex: 1,
  },
});
