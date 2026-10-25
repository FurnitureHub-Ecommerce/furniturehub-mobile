import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export default function CustomerTabsLayout() {
  const { cartCount, wishlistIds } = useApp();
  const wishlistCount = wishlistIds ? wishlistIds.size : 0;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8A6A48',
        tabBarInactiveTintColor: '#A0988E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2DBD0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 58 + insets.bottom : 64,
          paddingBottom: 0,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#1A1817',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: Platform.OS === 'android' ? 2 : 0,
        },
      }}
    >
      {/* 1. Trang Chủ */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang Chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={22} 
              color={(color as string) || '#8A6A48'} 
            />
          ),
        }}
      />

      {/* 2. Danh Mục */}
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Danh Mục',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'grid' : 'grid-outline'} 
              size={21} 
              color={(color as string) || '#8A6A48'} 
            />
          ),
        }}
      />

      {/* 3. Yêu Thích */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Yêu Thích',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? 'heart' : 'heart-outline'} 
                size={22} 
                color={(color as string) || '#8A6A48'} 
              />
              {wishlistCount > 0 && (
                <View style={styles.wishlistBadge}>
                  <Text style={styles.badgeText}>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* 4. Giỏ Hàng */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ Hàng',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrapper}>
              <Feather 
                name="shopping-bag" 
                size={21} 
                color={(color as string) || '#8A6A48'} 
              />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* 5. Hồ Sơ */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Hồ Sơ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={21} 
              color={(color as string) || '#8A6A48'} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 28,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#8A6A48',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#3D2E1E',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
});