import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="products" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="brands" />
      <Stack.Screen name="variants" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="statistics" />
    </Stack>
  );
}