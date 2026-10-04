import React, { useState, useEffect, useCallback } from 'react';
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
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/product/ProductCard';

const API_BASE_URL = "https://api-furniturehub-minhdevops.up.railway.app";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist } = useApp();

  const [categoryName, setCategoryName] = useState('Danh Mục Sản Phẩm');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products`),
          fetch(`${API_BASE_URL}/api/categories`),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          const rawCategories = Array.isArray(catData)
            ? catData
            : catData.categories || catData.data || [];
          
          const currentCat = rawCategories.find((c: any) => (c._id || c.id) === id);
          if (currentCat) {
            setCategoryName(currentCat.name);
          } else if (id === 'cat-all') {
            setCategoryName('Tất Cả Sản Phẩm');
          }
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const rawProducts = Array.isArray(prodData)
            ? prodData
            : prodData.data || prodData.products || [];

          const formattedProducts = rawProducts.map((item: any) => {
            const firstImage =
              item.images && Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600";

            return {
              id: item._id || item.id,
              title: item.name || item.title,
              price: item.minPrice || item.price || 0,
              originalPrice: item.originalPrice,
              image: firstImage,
              category: item.categoryName || "Nội Thất",
              brand: item.brandId?.name || item.brand || "LUMORA",
              categorySlug: item.categoryId?._id || item.categoryId || "cat-all",
              rating: item.rating || 4.9,
              reviewCount: item.reviewCount || 12,
              tag: item.tag,
              colors: item.colors || [],
            };
          });

          // Lọc sản phẩm theo danh mục đang chọn
          if (id && id !== 'cat-all') {
            const filtered = formattedProducts.filter((p: any) => p.categorySlug === id);
            setProducts(filtered);
          } else {
            setProducts(formattedProducts);
          }
        }
      } catch (error) {
        console.log("Lỗi tải dữ liệu danh mục:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}` as any);
    },
    [router]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => (
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
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search' as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: '#8A6A48', fontWeight: '600' }}>Đang tải sản phẩm...</Text>
        </View>
      ) : products.length === 0 ? (
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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