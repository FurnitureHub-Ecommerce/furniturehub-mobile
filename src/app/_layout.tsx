import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if already hidden or prevented */
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(customer)" />
      </Stack>
    </AppProvider>
  );
}
