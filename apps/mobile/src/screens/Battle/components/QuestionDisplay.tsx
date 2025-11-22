import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestionInfo } from '../../../types/battle';
import { typography } from "../../../theme";

interface QuestionDisplayProps {
  question: QuestionInfo | null;
  roundNumber: number;
}

export function QuestionDisplay({ question, roundNumber }: QuestionDisplayProps) {
  if (!question) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Round {roundNumber}/5</Text>
        {question.difficulty && (
          <View style={[styles.difficultyBadge, styles[`difficulty_${question.difficulty}` as 'difficulty_easy' | 'difficulty_medium' | 'difficulty_hard']]}>
            <Text style={styles.difficultyText}>{question.difficulty.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roundText: {
    ...typography.roundCounter,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficulty_easy: {
    backgroundColor: '#4CAF50',
  },
  difficulty_medium: {
    backgroundColor: '#FF9800',
  },
  difficulty_hard: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    ...typography.badge,
    color: '#fff',
  },
  questionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
    justifyContent: 'center',
  },
  questionText: {
    ...typography.questionText,
    color: '#1a1a1a',
    textAlign: 'center',
  },
});
