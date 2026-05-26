import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FieldDataProvider, useFieldData } from '../providers/field-data-provider';
import { palette } from '../theme/palette';

// Protected routes layout
function RootLayoutContent() {
  const { session, isReady } = useFieldData();

  useEffect(() => {
    if (!isReady) return;

    // Redirect based on auth state
    if (!session) {
      // User not authenticated
      router.replace('/login');
    }
  }, [session, isReady]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: palette.background },
        animationEnabled: true,
      }}
    >
      {/* Public screens (no auth required) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Acceso', headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Crear cuenta', headerShown: false }} />

      {/* Protected screens (auth required) */}
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="clients/new" options={{ title: 'Nuevo cliente' }} />
      <Stack.Screen name="projects/new" options={{ title: 'Nuevo proyecto' }} />
      <Stack.Screen name="points/new" options={{ title: 'Nuevo punto de medición' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FieldDataProvider>
          <RootLayoutContent />
        </FieldDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
