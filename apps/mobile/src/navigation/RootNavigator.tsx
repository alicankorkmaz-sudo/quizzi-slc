import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Category } from '../../../../packages/types/src';
import { MatchmakingScreen } from '../screens/Matchmaking/MatchmakingScreen';
import { BattleScreen } from '../screens/Battle/BattleScreen';
import { UsernameUpdateScreen } from '../screens/UsernameUpdate';
import { EditProfileScreen } from '../screens/Profile';
import { StatisticsScreen } from '../screens/Statistics/StatisticsScreen';
import type { ProfileData } from '../services/profile-service';

export type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: Category;
  };
  UsernameUpdate: {
    currentUsername: string;
  };
  EditProfile: {
    currentProfile: ProfileData;
  };
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  currentUsername: string;
  token: string;
  onUsernameUpdate: (newUsername: string) => Promise<void>;
  onProfileUpdate: (profile: ProfileData) => void;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  currentUsername,
  token,
  onUsernameUpdate,
  onProfileUpdate,
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Matchmaking"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
        <Stack.Screen
          name="Battle"
          component={BattleScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false, // Prevent swipe back during battle
          }}
        />
        <Stack.Screen
          name="UsernameUpdate"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        >
          {({ navigation }) => (
            <UsernameUpdateScreen
              currentUsername={currentUsername}
              onUpdate={async (newUsername) => {
                await onUsernameUpdate(newUsername);
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="EditProfile"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        >
          {({ navigation, route }) => (
            <EditProfileScreen
              currentProfile={route.params.currentProfile}
              token={token}
              onSave={(updatedProfile) => {
                onProfileUpdate(updatedProfile);
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            animation: 'slide_from_right',
            headerShown: true,
            headerTitle: 'Statistics',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
