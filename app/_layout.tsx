import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {Stack} from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import {useEffect} from "react";
import {Platform} from "react-native";
import {AuthProvider} from "../contexts/AuthContext";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
      if (Platform.OS === 'web') {
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
              viewport.setAttribute(
                  'content',
                  'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
              )
          }
      }
  }, [])

  return (
      <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <AuthProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
                          <Stack.Screen name="address/[id]" options={{ presentation: 'modal' }}/>
                          <Stack.Screen name="address/create" options={{ presentation: 'modal' }}/>
                      </Stack>
                  </AuthProvider>
              </ThemeProvider>
          </SafeAreaView>
      </SafeAreaProvider>
  );
}
