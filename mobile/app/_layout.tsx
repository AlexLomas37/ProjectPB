import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/features/auth/context';
import { GameProvider } from '@/src/features/game/context';

export const unstable_settings = {
  anchor: '(app)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  console.log(`[RootLayoutNav] Render. isLoading=${isLoading}, isAuthenticated=${isAuthenticated}, segments=${segments}`);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // User is signed in but on login/register page -> go to App
      router.replace('/(app)/(tabs)/training');
    } else if (!isAuthenticated && !inAuthGroup) {
      // User is NOT signed in but trying to access App -> go to Login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !segments.length) {
      // User is signed in and at Root -> go to App
      router.replace('/(app)/(tabs)/training');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <RootLayoutNav />
      </GameProvider>
    </AuthProvider>
  );
}
