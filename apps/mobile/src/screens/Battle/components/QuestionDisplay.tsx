import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestionInfo } from '../../../types/battle';

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
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roundText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  questionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 26,
    textAlign: 'center',
  },
});
