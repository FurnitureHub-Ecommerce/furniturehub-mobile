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
import { getProductsApi, getCategoriesApi } from '@/services/api';

const DEFAULT_FILTERS: FilterState = {
  brandId: 'brand-all',
  priceRange: 'all',
  sortOrder: 'newest',
  inStockOnly: false,
};

export default function ProductListScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  // Lấy dữ liệu sản phẩm từ API Backend có fallback
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const [prodList, catList] = await Promise.all([
          getProductsApi(),
          getCategoriesApi(),
        ]);
        if (prodList && prodList.length > 0) {
          setProducts(prodList);
        }
        if (catList && catList.length > 0) {
          setCategories(catList);
        }
      } catch (error) {
        console.warn("Không thể tải danh sách sản phẩm từ API, sử dụng dữ liệu dự phòng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
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
      if (selectedCategory !== 'cat-all') {
        const catSlug = prod.categorySlug || (prod as any).categoryId;
        if (catSlug && catSlug !== selectedCategory) {
          return false;
        }
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = prod.title?.toLowerCase().includes(query);
        const matchesCategory = prod.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory) return false;
      }
      if (filters.inStockOnly && (prod as any).inStock === false) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, filters]);

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
          <View style={styles.searchIconBox}>
            <Feather name="search" size={17} color="#8A6A48" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sofa, bàn ăn, đèn trang trí..."
            placeholderTextColor="#A0988E"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Feather name="x" size={15} color="#6E6860" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(customer)/filter' as any)}
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={18} color={activeFilterCount > 0 ? '#FFF' : '#252525'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(customer)/(tabs)/cart' as any)}
          style={styles.cartBtn}
          activeOpacity={0.8}
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
          data={categories}
          keyExtractor={(cat) => cat.id || cat._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContent}
          renderItem={({ item }) => {
            const itemId = item.id || item._id;
            const isActive = selectedCategory === itemId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(itemId)}
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
          <Text style={styles.loadingText}>Đang tải bộ sưu tập sản phẩm...</Text>
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
              <Text style={styles.emptySub}>Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  // Ô nhập liệu fix triệt để khoảng cách padding icon
  searchBarWrapper: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#252525',
    paddingVertical: 0,
    height: '100%',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#8A6A48' },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#D93838',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  categoryChipsBar: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2DBD0' },
  categoryChipsContent: { paddingHorizontal: 20, gap: 8 },
  catChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  catChipActive: { backgroundColor: '#8A6A48', borderColor: '#8A6A48' },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#6E6860' },
  catChipTextActive: { color: '#FFFFFF' },
  gridContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },
  columnWrapper: { justifyContent: 'space-between' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 13, color: '#6E6860' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#252525', marginTop: 14 },
  emptySub: { fontSize: 12, color: '#6E6860', marginTop: 4 },
});