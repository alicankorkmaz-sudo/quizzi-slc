import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { WelcomeScreen } from './src/screens/Welcome';
import { useUser } from './src/hooks/useUser';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getStoredAuth } from './src/services/auth-service';
import type { ProfileData } from './src/services/profile-service';

function AppContent() {
  const { userId, username, token, isLoading, isAuthenticated, registerUsername, refresh } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleProfileUpdate = async (_profile: ProfileData) => {
    // Refresh user data from storage (profile-service updates it)
    await refresh();
  };

  // Check if this is first launch (no stored auth)
  useEffect(() => {
    async function checkFirstLaunch() {
      const stored = await getStoredAuth();
      setShowWelcome(!stored);
      setCheckingAuth(false);
    }
    checkFirstLaunch();
  }, []);

  // Show loading while checking auth or authenticating
  if (checkingAuth || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  // Show welcome screen on first launch
  if (showWelcome && !isAuthenticated) {
    return (
      <>
        <WelcomeScreen
          onAuthComplete={() => {
            setShowWelcome(false);
          }}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  // Must have userId and token to proceed
  if (!userId || !username || !token) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <WebSocketProvider userId={userId} token={token}>
      <RootNavigator
        currentUsername={username}
        token={token}
        onUsernameUpdate={registerUsername}
        onProfileUpdate={handleProfileUpdate}
      />
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
