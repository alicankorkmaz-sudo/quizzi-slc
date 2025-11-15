import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnswerButtonProps {
  answer: string;
  index: number;
  onPress: (index: number) => void;
  isSelected: boolean;
  isCorrect: boolean | null;
  isDisabled: boolean;
  showResult: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function AnswerButton({
  answer,
  index,
  onPress,
  isSelected,
  isCorrect,
  isDisabled,
  showResult,
}: AnswerButtonProps) {
  const handlePress = async () => {
    if (isDisabled) return;

    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    onPress(index);
  };

  const getButtonStyle = () => {
    if (!showResult) {
      return isSelected ? styles.buttonSelected : styles.button;
    }

    // Show result
    if (isCorrect === true) {
      return styles.buttonCorrect;
    } else if (isCorrect === false && isSelected) {
      return styles.buttonIncorrect;
    }

    return styles.button;
  };

  const getTextStyle = () => {
    if (!showResult) {
      return isSelected ? styles.textSelected : styles.text;
    }

    if (isCorrect === true || (isCorrect === false && isSelected)) {
      return styles.textSelected;
    }

    return styles.text;
  };

  return (
    <TouchableOpacity
      style={[styles.container, getButtonStyle()]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
          {OPTION_LABELS[index]}
        </Text>
      </View>
      <Text style={[getTextStyle(), styles.answerText]} numberOfLines={2}>
        {answer}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
    borderWidth: 2,
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  buttonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonIncorrect: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  labelContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  labelSelected: {
    color: '#2196F3',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  textSelected: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  answerText: {
    flex: 1,
  },
});
