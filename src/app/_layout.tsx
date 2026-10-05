import '@/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { useHealthStore, useHydrated } from '@/data/store';
import { useColors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = useColors();
  const hydrated = useHydrated();
  const hasProfile = useHealthStore((s) => !!s.profile);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  // Keep the splash screen up until saved data has loaded.
  if (!hydrated) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
  };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackTitle: t('common.back'), headerTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}>
        {/* People without a profile only see onboarding. */}
        <Stack.Protected guard={!hasProfile}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasProfile}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t('app.name') }} />
          <Stack.Screen name="check-in" options={{ presentation: 'modal', title: t('checkIn.title') }} />
          <Stack.Screen name="crises/new" options={{ presentation: 'modal', title: t('crisis.newTitle') }} />
          <Stack.Screen name="medications/new" options={{ presentation: 'modal', title: t('meds.newTitle') }} />
          <Stack.Screen name="conditions/new" options={{ presentation: 'modal', title: t('conditions.newTitle') }} />
          <Stack.Screen name="plan/edit" options={{ presentation: 'modal', title: t('plan.editTitle') }} />
          <Stack.Screen name="profile-edit" options={{ presentation: 'modal', title: t('profile.editProfile') }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
