/**
 * Avatar Picker Component (Story 10.1)
 *
 * Displays a grid of emoji avatars for selection
 * - 4 columns grid layout
 * - Selected avatar highlighted with brand color border
 * - Organized by category
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAvatarsByCategory, type AvatarId } from '../utils/avatars';

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatarId: AvatarId) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelect,
}) => {
  const categories = getAvatarsByCategory();

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <View key={category.category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category.category}</Text>
          <View style={styles.avatarGrid}>
            {category.avatars.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarButton,
                    isSelected && styles.avatarButtonSelected,
                  ]}
                  onPress={() => onSelect(avatar.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarButtonSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#FFFFFF',
  },
  avatarEmoji: {
    fontSize: 36,
  },
});
