// First, and it has to be first: this is what loads the Tailwind pipeline and
// the theme tokens every class name below resolves through.
import '../global.css';
import '@/config/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';
import { PanelUIProvider, useThemeMode } from 'panelui-native';

import ProviderReactQuery from '@/lib/provider-react-query';

/**
 * React Navigation paints its own theme background over every screen and
 * defaults to an opaque light grey, which sits on top of the themed background
 * underneath — so without this the page never follows the theme.
 *
 * Building the navigation theme from the live tokens fixes it for every theme
 * at once: `useCSSVariable` subscribes to theme changes, so this re-runs on
 * each switch, including the named themes that the OS knows nothing about.
 */
export { ErrorBoundary } from '@/components/error-boundary-view';

function ThemedNavigation() {
  const { mode } = useThemeMode();
  const [background, card, text, border, primary] = useCSSVariable([
    '--color-background',
    '--color-card',
    '--color-foreground',
    '--color-border',
    '--color-primary',
  ]) as (string | undefined)[];

  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    dark: mode === 'dark',
    colors: {
      ...base.colors,
      ...(background ? { background } : null),
      ...(card ? { card } : null),
      ...(text ? { text } : null),
      ...(border ? { border } : null),
      ...(primary ? { primary, notification: primary } : null),
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      {/* Not style="auto": that reads the OS appearance, which is left
          unspecified for the named themes. */}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProviderReactQuery>
        {/* Owns the portal host that dialogs, sheets, menus and toasts render
            into. Overlays mount into it, so it has to be above every screen. */}
        <PanelUIProvider>
          <ThemedNavigation />
        </PanelUIProvider>
      </ProviderReactQuery>
    </SafeAreaProvider>
  );
}
