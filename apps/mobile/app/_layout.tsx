import { useEffect, useState } from 'react';
import { AppState, I18nManager, type AppStateStatus } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
// Import only the 3 weights we use (the package barrel would bundle all 9, ~1 MB extra).
import { Vazirmatn_400Regular } from '@expo-google-fonts/vazirmatn/400Regular';
import { Vazirmatn_600SemiBold } from '@expo-google-fonts/vazirmatn/600SemiBold';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider, useAppState } from '../src/state/AppStateContext';
import { flushPendingSync } from '../src/station/runtimeApi';
import { hydrateAccessToken } from '../src/auth/AuthSession';
import { ensureClientInstallationId } from '../src/auth/ClientInstallation';

// Keep the native splash up until fonts + app state are ready: no spinner flash,
// and the brand is the first thing seen (E6).
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

// RTL is forced natively by plugins/withForceRtl.js so the VERY FIRST launch is
// already RTL (E5). This JS call is only a safety net for dev clients.
I18nManager.allowRTL(true);
if (!I18nManager.isRTL) I18nManager.forceRTL(true);

function Shell() {
  const { ready, entry } = useAppState();
  const [authReady, setAuthReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ Vazirmatn_400Regular, Vazirmatn_600SemiBold });
  const done = ready && authReady && (fontsLoaded || !!fontError);

  useEffect(() => {
    void Promise.all([hydrateAccessToken(), ensureClientInstallationId()]).finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (done) void SplashScreen.hideAsync().catch(() => undefined);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    void flushPendingSync();
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') void flushPendingSync();
    });
    return () => subscription.remove();
  }, [done]);

  if (!done) return null;
  if (entry.kind === 'NEW' || entry.kind === 'RECOVER') return <Redirect href="/onboarding" />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="station/[stationId]" />
      <Stack.Screen name="station/[stationId]/start" />
      <Stack.Screen name="station/[stationId]/play" />
      <Stack.Screen name="unit/[unitId]" />
      <Stack.Screen name="unit/[unitId]/jump" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="parent" />
      <Stack.Screen name="missions" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Shell />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
