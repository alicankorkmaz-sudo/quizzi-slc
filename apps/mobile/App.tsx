import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { useUser } from './src/hooks/useUser';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function AppContent() {
  const { userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <WebSocketProvider userId={userId}>
      <RootNavigator />
      <StatusBar style="auto" />
    </WebSocketProvider>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
