import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MOCK_PRODUCTS, CATEGORIES, Product } from '@/services/mockData';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/product/ProductCard';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist } = useApp();

  const categoryObj = CATEGORIES.find((c) => c.id === id) || {
    id: id || 'cat-all',
    name: 'Danh Mục Sản Phẩm',
    image: '',
  };

  const products = MOCK_PRODUCTS.filter((p) => {
    if (id === 'cat-all' || !id) return true;
    return p.categorySlug === id;
  });

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}`);
    },
    [router]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        item={item}
        isWishlisted={wishlistIds.has(item.id)}
        onToggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
        onPress={handleProductPress}
      />
    ),
    [wishlistIds, toggleWishlist, addToCart, handleProductPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryObj.name}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search')}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="box" size={48} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
          <Text style={styles.emptySub}>
            Các sản phẩm trong danh mục này đang được cập nhật. Vui lòng quay lại sau.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          renderItem={renderProductItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6E6860',
    textAlign: 'center',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
