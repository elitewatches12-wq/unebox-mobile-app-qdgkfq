
import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Alert } from 'react-native';
import { useNetworkState } from 'expo-network';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading, loaded } = useAuth();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const networkState = useNetworkState();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!loading && loaded) {
      const inAuthGroup = segments[0] === '(auth)';
      const inTabsGroup = segments[0] === '(tabs)';

      console.log('[RootLayout] Navigation check:', {
        user: !!user,
        inAuthGroup,
        inTabsGroup,
        segments,
      });

      if (!user && !inAuthGroup) {
        console.log('[RootLayout] Redirecting to login');
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        console.log('[RootLayout] Redirecting to home');
        router.replace('/(tabs)/(home)');
      }
    }
  }, [user, segments, loading, loaded]);

  useEffect(() => {
    if (networkState.isConnected === false) {
      Alert.alert(
        'Pas de connexion Internet',
        'Veuillez vérifier votre connexion Internet pour utiliser toutes les fonctionnalités de l\'application.'
      );
    }
  }, [networkState.isConnected]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <>
      <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <LocalizationProvider>
            <NotificationProvider>
              <WidgetProvider>
                <RootLayoutNav />
              </WidgetProvider>
            </NotificationProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
