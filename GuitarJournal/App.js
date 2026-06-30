import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import LogSessionScreen from './src/screens/LogSessionScreen';
import SongsScreen from './src/screens/SongsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const icons = { Home: '🏠', Log: '📝', Songs: '🎵', Goals: '🎯' };

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icons[route.name]}</Text>
          ),
          tabBarLabel: ({ focused, children }) => (
            <Text style={{ fontSize: 10, color: focused ? colors.accentLight : colors.textMuted, fontWeight: focused ? '600' : '400', marginBottom: 4 }}>
              {children}
            </Text>
          ),
          tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border, borderTopWidth: 1 },
          tabBarActiveTintColor: colors.accentLight,
          tabBarInactiveTintColor: colors.textMuted,
          headerStyle: { backgroundColor: colors.bg, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Log" component={LogSessionScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Songs" component={SongsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
