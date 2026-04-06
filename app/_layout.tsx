import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { colors } from '../src/theme';
import { UserProvider } from '../src/context/UserContext';
import { LocationProvider } from '../src/context/LocationContext';
import { useLocationContext } from '../src/context/LocationContext';
import { ShowSearchProvider } from '../src/context/ShowSearchContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function ConnectedShowSearchProvider({ children }: { children: React.ReactNode }) {
  const { effectiveLocation } = useLocationContext();
  return (
    <ShowSearchProvider userLocation={effectiveLocation}>
      {children}
    </ShowSearchProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <UserProvider>
        <LocationProvider>
          <ConnectedShowSearchProvider>
            <StatusBar barStyle="light-content" />
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: colors.bgPrimary },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="dj/[id]"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                  animationDuration: 250,
                }}
              />
              <Stack.Screen
                name="show/[id]"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                  animationDuration: 250,
                }}
              />
              <Stack.Screen
                name="filter-modal"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                }}
              />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
          </ConnectedShowSearchProvider>
        </LocationProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
