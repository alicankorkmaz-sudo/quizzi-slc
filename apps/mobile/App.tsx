import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '@quizzi/types';
import { isDefined } from '@quizzi/utils';

export default function App() {
  const user: User = {
    id: '1',
    username: 'test_player',
    avatar: 'default_1',
    rankPoints: 1000,
    rankTier: 'bronze',
    winRate: 0,
    currentStreak: 0,
    matchesPlayed: 0,
    avgResponseTime: 0,
    premiumStatus: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const isUserValid = isDefined(user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzi</Text>
      <Text style={styles.subtitle}>Real-Time 1v1 Quiz Battles</Text>
      <Text style={styles.info}>
        Monorepo connected: {isUserValid ? '✓' : '✗'}
      </Text>
      <Text style={styles.username}>Player: {user.username}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  info: {
    fontSize: 14,
    color: '#00a86b',
    marginBottom: 16,
  },
  username: {
    fontSize: 16,
    color: '#333',
  },
});
