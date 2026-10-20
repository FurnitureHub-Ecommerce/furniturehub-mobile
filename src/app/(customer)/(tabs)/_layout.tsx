import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function CustomerTabsLayout() {
  const { cartCount, wishlistIds } = useApp();
  const wishlistCount = wishlistIds ? wishlistIds.size : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8A6A48',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2DBD0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      {/* 1. Home Navigator */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang Chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 2. Category / Shop Navigator */}
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Danh Mục',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 3. Wishlist Navigator */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Yêu Thích',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />
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

      {/* 4. Cart Navigator */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ Hàng',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrapper}>
              <Feather name="shopping-bag" size={21} color={color} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* 5. Profile / Account Navigator */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Hồ Sơ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* Ẩn file index khỏi thanh tab bar */}
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#D93838',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#8A6A48',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});