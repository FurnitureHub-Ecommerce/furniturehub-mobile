import { Stack } from "expo-router";

export default function StorageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="import" />
      <Stack.Screen name="export" />
      <Stack.Screen name="adjustment" />
      <Stack.Screen name="history" />
    </Stack>
  );
}