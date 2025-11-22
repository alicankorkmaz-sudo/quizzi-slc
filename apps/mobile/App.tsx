import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { WelcomeScreen } from './src/screens/Welcome';
import { useUser } from './src/hooks/useUser';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getStoredAuth } from './src/services/auth-service';
import type { ProfileData } from './src/services/profile-service';
import { audioService } from './src/services/audioService';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Barlow_700Bold,
  Barlow_800ExtraBold,
} from '@expo-google-fonts/barlow';
import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
} from '@expo-google-fonts/barlow-condensed';

function AppContent() {
  const { userId, username, token, isLoading, isAuthenticated, registerUsername, refresh, setAuth } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Barlow_700Bold,
    Barlow_800ExtraBold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
  });

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

  // Show loading while checking auth, authenticating, or loading fonts
  if (checkingAuth || isLoading || !fontsLoaded) {
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
          onAuthComplete={(authData) => {
            setAuth(authData);
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
  // Initialize audio service on app mount
  useEffect(() => {
    audioService.initialize().catch((error) => {
      console.error('[App] Audio initialization failed:', error);
    });

    // Cleanup on unmount
    return () => {
      audioService.cleanup().catch(() => {});
    };
  }, []);

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
