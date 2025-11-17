import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { OpponentInfo } from '../../../types/battle';
import { MatchPointIndicator } from './MatchPointIndicator';

interface ScoreBoardProps {
  playerUsername: string;
  playerScore: number;
  opponent: OpponentInfo | null;
  opponentScore: number;
  opponentConnected: boolean;
}

export function ScoreBoard({
  playerUsername,
  playerScore,
  opponent,
  opponentScore,
  opponentConnected,
}: ScoreBoardProps) {
  return (
    <View style={styles.container}>
      {/* Player 1 (You) */}
      <View style={styles.playerContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.usernameText}>{playerUsername}</Text>
          <Text style={styles.youLabel}>You</Text>
          <View style={styles.indicatorContainer}>
            <MatchPointIndicator score={playerScore} isPlayer={true} />
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{playerScore}</Text>
        </View>
      </View>

      {/* VS Divider */}
      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      {/* Player 2 (Opponent) */}
      <View style={styles.playerContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
          {!opponentConnected && <View style={styles.disconnectedIndicator} />}
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.usernameText}>{opponent?.username || 'Opponent'}</Text>
          {!opponentConnected && (
            <Text style={styles.disconnectedText}>Disconnected</Text>
          )}
          <View style={styles.indicatorContainer}>
            <MatchPointIndicator score={opponentScore} isPlayer={false} />
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{opponentScore}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
  },
  disconnectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  indicatorContainer: {
    marginTop: 4,
  },
  youLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  disconnectedText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  scoreContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2196F3',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 2,
  },
});
