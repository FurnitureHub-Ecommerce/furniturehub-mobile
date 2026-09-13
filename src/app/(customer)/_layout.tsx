import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="search" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="payment" />

      <Stack.Screen name="product/[id]" />

      <Stack.Screen name="orders/index" />
      <Stack.Screen name="orders/[id]" />

      <Stack.Screen name="account/index" />
      <Stack.Screen name="account/address" />
    </Stack>
  );
}