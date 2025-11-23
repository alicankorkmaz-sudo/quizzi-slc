import React, { useState, useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet, View, Animated, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../../../hooks/useAudio';
import { SoundType } from '../../../types/audio';
import { ParticleBurst } from '../../../components/ParticleBurst';
import {
  colors,
  elevation,
  glowEffects,
  borderRadius,
  spacing,
  typography,
  createPressAnimation,
} from '../../../theme';

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
  const { playSound } = useAudio();
  const [showParticles, setShowParticles] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const buttonRef = useRef<View>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { pressIn, pressOut } = createPressAnimation(scaleAnim);

  // Trigger particle burst when answer is correct
  useEffect(() => {
    if (showResult && isCorrect === true && isSelected) {
      setShowParticles(true);
      // Auto-hide particles after animation
      const timeout = setTimeout(() => setShowParticles(false), 1000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [showResult, isCorrect, isSelected]);

  const handlePress = async () => {
    if (isDisabled) return;

    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play button tap sound
    playSound(SoundType.BUTTON_TAP);

    onPress(index);
  };

  const onLayout = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        setButtonLayout({
          x: pageX + width / 2, // Center X
          y: pageY + height / 2, // Center Y
          width,
          height,
        });
      });
    }
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.container];

    // Add elevation
    if (!showResult && !isSelected) {
      baseStyles.push(elevation.level1);
    } else if (isSelected && !showResult) {
      baseStyles.push(elevation.level2);
    }

    // Add glow effects for results
    if (showResult && isCorrect === true) {
      baseStyles.push(glowEffects.success);
    } else if (showResult && isCorrect === false && isSelected) {
      baseStyles.push(glowEffects.error);
    }

    // Background and border colors
    if (!showResult) {
      baseStyles.push(isSelected ? styles.buttonSelected : styles.button);
    } else if (isCorrect === true) {
      baseStyles.push(styles.buttonCorrect);
    } else if (isCorrect === false && isSelected) {
      baseStyles.push(styles.buttonIncorrect);
    } else {
      baseStyles.push(styles.button);
    }

    // Focus state for accessibility
    if (isFocused) {
      baseStyles.push(styles.focused);
    }

    return baseStyles;
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
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isDisabled}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Answer ${OPTION_LABELS[index]}: ${answer}`}
          accessibilityState={{ selected: isSelected, disabled: isDisabled }}
        >
          <View ref={buttonRef} style={getButtonStyle()} onLayout={onLayout}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
                {OPTION_LABELS[index]}
              </Text>
            </View>
            <Text style={[getTextStyle(), styles.answerText]} numberOfLines={2}>
              {answer}
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Particle burst on correct answer */}
      <ParticleBurst
        active={showParticles}
        x={buttonLayout.x}
        y={buttonLayout.y}
        particleCount={16}
        colors={['#4CAF50', '#8BC34A', '#CDDC39', '#FFD700']}
        size={6}
        spread={60}
        duration={600}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 3,
    marginBottom: spacing.sm + 1,
    minHeight: 54,
    borderWidth: 2,
  },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  buttonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  buttonIncorrect: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  labelContainer: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md - 4,
  },
  label: {
    ...typography.answerButton,
    color: colors.textLight,
  },
  labelSelected: {
    color: colors.textWhite,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.round,
    width: 30,
    height: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 30,
  },
  text: {
    ...typography.answerButton,
    color: colors.text,
  },
  textSelected: {
    ...typography.answerButtonLarge,
    color: colors.textWhite,
  },
  answerText: {
    flex: 1,
  },
});
