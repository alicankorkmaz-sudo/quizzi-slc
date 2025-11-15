import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Category } from '../../../../packages/types/src';
import { MatchmakingScreen } from '../screens/Matchmaking/MatchmakingScreen';
import { BattleScreen } from '../screens/Battle/BattleScreen';

export type RootStackParamList = {
  Matchmaking: undefined;
  Battle: {
    matchId: string;
    opponentUsername: string;
    opponentRankPoints: number;
    category: Category;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
