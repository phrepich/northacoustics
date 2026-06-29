import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FieldDataProvider } from "../providers/field-data-provider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FieldDataProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#F5F8F9",
            },
            headerTintColor: "#10212B",
            contentStyle: {
              backgroundColor: "#F5F8F9",
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Acceso" }} />
          <Stack.Screen name="dashboard" options={{ title: "Operación en terreno" }} />
          <Stack.Screen name="clients/index" options={{ title: "Clientes y proyectos" }} />
          <Stack.Screen name="projects/new" options={{ title: "Nuevo proyecto" }} />
          <Stack.Screen name="projects/[id]" options={{ title: "Resumen del proyecto" }} />
          <Stack.Screen name="points/new" options={{ title: "Nuevo punto de medición" }} />
          <Stack.Screen name="measurements/new" options={{ title: "Nueva medición acústica" }} />
          <Stack.Screen name="sync" options={{ title: "Sincronización" }} />
        </Stack>
      </FieldDataProvider>
    </SafeAreaProvider>
  );
}
