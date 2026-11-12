import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type PropsWithChildren } from 'react';

import { colors, fontAssets } from '@/shared/theme';

void SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surfaceContainer,
    text: colors.onSurface,
    border: colors.divider,
    notification: colors.error,
  },
};

export function AppProviders({ children }: PropsWithChildren) {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      {children}
    </ThemeProvider>
  );
}
