import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import type { Category } from '../../../../../packages/types/src';
import { CategoryCard } from './components/CategoryCard';
import { spacing } from '../../theme';

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
  );
};

const styles = StyleSheet.create({
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
