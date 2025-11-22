import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../../../hooks/useAudio';
import { SoundType } from '../../../types/audio';
import { ParticleBurst } from '../../../components/ParticleBurst';

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
  const buttonRef = useRef<TouchableOpacity>(null);

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
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.container, getButtonStyle()]}
        onPress={handlePress}
        onLayout={onLayout}
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
    borderRadius: 12,
    padding: 11,
    marginBottom: 9,
    minHeight: 54,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 15,
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
