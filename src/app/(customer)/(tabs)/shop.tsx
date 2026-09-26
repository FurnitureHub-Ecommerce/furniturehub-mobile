import React, { useState, useMemo, useCallback } from 'react';
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
import { MOCK_PRODUCTS, CATEGORIES, Product } from '@/services/mockData';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterModal, FilterState } from '@/components/product/FilterModal';

const DEFAULT_FILTERS: FilterState = {
  brandId: 'brand-all',
  priceRange: 'all',
  sortOrder: 'newest',
  inStockOnly: false,
};

export default function ProductListScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useApp();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  // Active Filter Count Calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brandId !== 'brand-all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.sortOrder !== 'newest') count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  // Filter & Sort Logic Optimization with useMemo
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      // Category Filter
      if (selectedCategory !== 'cat-all' && prod.categorySlug !== selectedCategory) {
        return false;
      }

      // Keyword Search Filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = prod.title.toLowerCase().includes(query);
        const matchesCategory = prod.category.toLowerCase().includes(query);
        const matchesBrand = prod.brand.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesBrand) {
          return false;
        }
      }

      // Brand Filter
      if (filters.brandId !== 'brand-all' && prod.brandId !== filters.brandId) {
        return false;
      }

      // Price Range Filter
      if (filters.priceRange === 'under500' && prod.price >= 500) return false;
      if (filters.priceRange === '500-1500' && (prod.price < 500 || prod.price > 1500))
        return false;
      if (
        filters.priceRange === '1500-3000' &&
        (prod.price < 1500 || prod.price > 3000)
      )
        return false;
      if (filters.priceRange === 'above3000' && prod.price <= 3000) return false;

      // In Stock Filter
      if (filters.inStockOnly) {
        const hasStock = prod.variantStocks?.some((s) => s.inStock && s.stockCount > 0);
        if (hasStock === false) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort Order
      if (filters.sortOrder === 'price_asc') return a.price - b.price;
      if (filters.sortOrder === 'price_desc') return b.price - a.price;
      if (filters.sortOrder === 'rating') return b.rating - a.rating;
      return 0; // default newest / original order
    });
  }, [selectedCategory, searchQuery, filters]);

  // Handlers wrapped in useCallback for performance
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

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F4EE" />

      {/* Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color="#6E6860" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sofa, bàn ăn, đèn trang trí..."
            placeholderTextColor="#999187"
            value={searchQuery}
            onChangeText={handleSearchChange}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#6E6860" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Trigger Button */}
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={[
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnActive,
          ]}
          activeOpacity={0.8}
        >
          <Feather
            name="sliders"
            size={18}
            color={activeFilterCount > 0 ? '#FFFFFF' : '#252525'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart Icon */}
        <TouchableOpacity
          onPress={() => router.push('/(customer)/cart' as any)}
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

      {/* Category Horizontal Chips (Task 4) */}
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
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.catChipText, isActive && styles.catChipTextActive]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product List Summary & Result Count */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {filteredProducts.length} sản phẩm nội thất
        </Text>
        {(activeFilterCount > 0 || selectedCategory !== 'cat-all' || searchQuery.length > 0) && (
          <TouchableOpacity onPress={handleResetAllFilters}>
            <Text style={styles.resetFilterLink}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Product Grid FlatList */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tìm kiếm sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#C2B8A3" />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm nào</Text>
              <Text style={styles.emptySub}>
                Rất tiếc, không có sản phẩm nào phù hợp với bộ lọc và từ khóa tìm kiếm của bạn.
              </Text>
              <TouchableOpacity
                onPress={handleResetAllFilters}
                style={styles.emptyResetBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyResetText}>Xóa tất cả bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Detailed Filter Modal (Task 4) */}
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
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
    backgroundColor: '#F7F4EE',
  },
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#252525',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#8A6A48',
  },
  filterBadge: {
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
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  categoryChipsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
    backgroundColor: '#F7F4EE',
  },
  categoryChipsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  catChipActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6860',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 12,
    color: '#6E6860',
    fontWeight: '500',
  },
  resetFilterLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6A48',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6E6860',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252525',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6E6860',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyResetBtn: {
    backgroundColor: '#8A6A48',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
