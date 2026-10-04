import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES, Product } from '@/services/mockData';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterModal, FilterState } from '@/components/product/FilterModal';

const DEFAULT_FILTERS: FilterState = {
  brandId: 'brand-all',
  priceRange: 'all',
  sortOrder: 'newest',
  inStockOnly: false,
};

const API_BASE_URL = "https://api-furniturehub-minhdevops.up.railway.app";

export default function ProductListScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  // Lấy dữ liệu sản phẩm từ API Backend thực tế
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products`); // Thay đổi endpoint theo API thực tế của nhóm trên Swagger
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.log("Không thể tải danh sách sản phẩm từ API, sử dụng dữ liệu dự phòng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brandId !== 'brand-all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.sortOrder !== 'newest') count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategory !== 'cat-all' && prod.categorySlug !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = prod.title?.toLowerCase().includes(query);
        const matchesCategory = prod.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}` as any);
    },
    [router]
  );

  const handleSearchChange = useCallback((text: string) => {
    setIsSearching(true);
    setSearchQuery(text);
    const timer = setTimeout(() => setIsSearching(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setSelectedCategory('cat-all');
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
  }, []);

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
      <StatusBar barStyle="dark-content" backgroundColor="#F7F4EE" />

      {/* Header & Search */}
      <View style={styles.header}>
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color="#6E6860" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sofa, bàn ăn, đèn trang trí..."
            placeholderTextColor="#999187"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        >
          <Feather name="sliders" size={18} color={activeFilterCount > 0 ? '#FFF' : '#252525'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(customer)/cart' as any)}
          style={styles.cartBtn}
        >
          <Feather name="shopping-bag" size={18} color="#252525" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <View style={styles.categoryChipsBar}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(cat) => cat.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContent}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={[styles.catChip, isActive && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách sản phẩm */}
      {loading || isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải dữ liệu sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#C2B8A3" />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        matchingCount={filteredProducts.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F4EE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#E2DBD0' },
  searchBarWrapper: { flex: 1, height: 42, backgroundColor: '#FFFFFF', borderRadius: 21, borderWidth: 1, borderColor: '#E2DBD0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#252525' },
  filterBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E9E1D5', justifyContent: 'center', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#8A6A48' },
  cartBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E9E1D5', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#D93838', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  categoryChipsBar: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2DBD0' },
  categoryChipsContent: { paddingHorizontal: 20, gap: 8 },
  catChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2DBD0' },
  catChipActive: { backgroundColor: '#8A6A48', borderColor: '#8A6A48' },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#6E6860' },
  catChipTextActive: { color: '#FFFFFF' },
  gridContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },
  columnWrapper: { justifyContent: 'space-between' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 13, color: '#6E6860' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#252525', marginTop: 14 }
});