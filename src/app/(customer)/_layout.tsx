import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Bottom Tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Stack Navigator cho các màn hình con theo bảng yêu cầu thiết kế */}
      <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="search" options={{ presentation: 'card' }} />
      <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
      <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
      <Stack.Screen name="payment" options={{ presentation: 'card' }} />
      <Stack.Screen name="address" options={{ presentation: 'card' }} />
      <Stack.Screen name="account/address" options={{ presentation: 'card' }} />
      <Stack.Screen name="account/edit" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders/tracking" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders/tracking/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="review" options={{ presentation: 'modal' }} />
      <Stack.Screen name="category/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="editorial/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="wishlist" options={{ presentation: 'card' }} />
    </Stack>
  );
}