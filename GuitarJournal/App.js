import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import LogSessionScreen from './src/screens/LogSessionScreen';
import SongsScreen from './src/screens/SongsScreen';
import SongDetailScreen from './src/screens/SongDetailScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import LessonModeScreen from './src/screens/LessonModeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DurationsScreen from './src/screens/DurationsScreen';
import TechniquesScreen from './src/screens/TechniquesScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import { colors } from './src/theme';
import { useReminderScheduler } from './src/utils/reminders';

const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const SongsStack = createNativeStackNavigator();

const icons = { Home: '🏠', Log: '📝', Songs: '🎵', Goals: '🎯', Progress: '📈', Settings: '⚙️' };

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.bg },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="LessonMode" component={LessonModeScreen} options={{ title: 'Lesson Mode' }} />
    </HomeStack.Navigator>
  );
}

function SongsStackNavigator() {
  return (
    <SongsStack.Navigator screenOptions={stackScreenOptions}>
      <SongsStack.Screen name="SongsList" component={SongsScreen} options={{ headerShown: false }} />
      <SongsStack.Screen name="SongDetail" component={SongDetailScreen} options={{ title: 'Song Progress' }} />
    </SongsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={stackScreenOptions}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="Durations" component={DurationsScreen} options={{ title: 'Durations' }} />
      <SettingsStack.Screen name="Techniques" component={TechniquesScreen} options={{ title: 'Techniques' }} />
      <SettingsStack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Reminders' }} />
    </SettingsStack.Navigator>
  );
}

export default function App() {
  useReminderScheduler();

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
        <Tab.Screen name="Home" component={HomeStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Log" component={LogSessionScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Songs" component={SongsStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Progress" component={ProgressScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
