import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterModal, FilterState } from "@/components/product/FilterModal";
import { getProductsApi, getCategoriesApi } from "@/services/api";

// Bảng từ điển dịch danh mục tiếng Anh sang tiếng Việt chuẩn
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "coffee & side tables": "Bàn Trà & Bàn Góc",
  "coffee and side tables": "Bàn Trà & Bàn Góc",
  "wardrobes & cabinets": "Tủ Quần Áo & Tủ Kệ",
  "wardrobes and cabinets": "Tủ Quần Áo & Tủ Kệ",
  "beds & mattresses": "Giường & Nệm",
  "beds and mattresses": "Giường & Nệm",
  "sofa & armchair": "Sofa & Ghế Bành",
  "sofa and armchair": "Sofa & Ghế Bành",
  "bookshelves & shelving": "Kệ Sách & Tủ Kệ",
  "bookshelves and shelving": "Kệ Sách & Tủ Kệ",
  "dining tables & chairs": "Bàn Ghế Ăn",
  "dining tables and chairs": "Bàn Ghế Ăn",
  "office desks & chairs": "Bàn Ghế Làm Việc",
  "office desks and chairs": "Bàn Ghế Làm Việc",
  "home decor & lighting": "Trang Trí & Đèn",
  "home decor and lighting": "Trang Trí & Đèn",
  "tv units & media": "Kệ Tivi & Giải Trí",
  "tv units and media": "Kệ Tivi & Giải Trí",
  "living room": "Phòng Khách",
  "bedroom": "Phòng Ngủ",
  "dining room": "Phòng Ăn",
  "home office": "Phòng Làm Việc",
};

const translateCategory = (name?: string): string => {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return CATEGORY_TRANSLATIONS[key] || name;
};

const DEFAULT_FILTERS: FilterState = {
  categoryId: "cat-all",
  priceRange: "all",
  sortOrder: "newest",
  inStockOnly: false,
};

export default function ProductListScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useApp();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("cat-all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  // Tải sản phẩm và danh mục thật từ Backend
  useEffect(() => {
    let isMounted = true;
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const [prodList, catList] = await Promise.all([
          getProductsApi(),
          getCategoriesApi(),
        ]);

        const rawProds = Array.isArray(prodList)
          ? prodList
          : (prodList as any)?.data || (prodList as any)?.products || [];
        const rawCats = Array.isArray(catList)
          ? catList
          : (catList as any)?.data || (catList as any)?.categories || [];

        if (isMounted) {
          setProducts(rawProds);
          setCategories(rawCats);
        }
      } catch (error) {
        console.warn("Không thể tải dữ liệu từ Backend:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCatalogData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh mục hiển thị: Luôn gắn thêm "Tất Cả" ở đầu danh sách
  const displayCategories = useMemo(() => {
    return [{ _id: "cat-all", name: "Tất Cả" }, ...categories];
  }, [categories]);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange !== "all") count++;
    if (filters.sortOrder !== "newest") count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  // Bộ lọc sản phẩm tổng hợp: Danh mục + Giá VNĐ + Tồn kho + Sắp xếp + Tìm kiếm
  const filteredProducts = useMemo(() => {
    let result = products.filter((prod) => {
      // 1. Lọc theo Danh mục
      if (selectedCategory !== "cat-all") {
        const prodCatId = String(
          prod.categoryId?._id ||
          prod.categoryId?.id ||
          prod.categoryId ||
          ""
        );
        if (prodCatId !== String(selectedCategory)) {
          return false;
        }
      }

      // 2. Lọc theo Tồn kho
      if (filters.inStockOnly) {
        const isOutOfStock =
          (prod.availableStock !== undefined && Number(prod.availableStock) <= 0) ||
          prod.inStock === false ||
          prod.isActive === false;
        if (isOutOfStock) return false;
      }

      // 3. Lọc theo Khoảng giá thực tế (VNĐ)
      const price = Number(prod.price || prod.minPrice || 0);
      if (filters.priceRange === "under-2m" && price >= 2000000) return false;
      if (filters.priceRange === "2m-5m" && (price < 2000000 || price > 5000000)) return false;
      if (filters.priceRange === "5m-10m" && (price < 5000000 || price > 10000000)) return false;
      if (filters.priceRange === "above-10m" && price <= 10000000) return false;

      // 4. Lọc theo Từ khóa tìm kiếm
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = (prod.name || prod.title || "").toLowerCase().includes(query);
        const matchCategory = (prod.categoryId?.name || prod.category || "").toLowerCase().includes(query);
        if (!matchTitle && !matchCategory) return false;
      }

      return true;
    });

    // 5. Sắp xếp thứ tự sản phẩm
    if (filters.sortOrder === "price-asc") {
      result.sort((a, b) => Number(a.price || a.minPrice || 0) - Number(b.price || b.minPrice || 0));
    } else if (filters.sortOrder === "price-desc") {
      result.sort((a, b) => Number(b.price || b.minPrice || 0) - Number(a.price || a.minPrice || 0));
    } else if (filters.sortOrder === "rating") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return result;
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
    const timer = setTimeout(() => setIsSearching(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const renderProductItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (!item) return null;
      const productId = String(item._id || item.id || `prod-${index}`);

      return (
        <ProductCard
          item={item}
          isWishlisted={wishlistIds ? wishlistIds.has(productId) : false}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onPress={() => handleProductPress(productId)}
        />
      );
    },
    [wishlistIds, toggleWishlist, addToCart, handleProductPress]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Header & Thanh Tìm Kiếm */}
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
              <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                <Feather name="x" size={15} color="#6E6860" />
              </TouchableOpacity>
            )}
          </View>

          {/* Bấm nút này sẽ mở Modal bộ lọc ngay tại màn hình */}
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            activeOpacity={0.8}
          >
            <Feather
              name="sliders"
              size={18}
              color={activeFilterCount > 0 ? "#FFFFFF" : "#252525"}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(customer)/(tabs)/cart" as any)}
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

        {/* Thanh cuộn ngang Danh mục (Đã có "Tất Cả" và dịch tiếng Việt) */}
        <View style={styles.categoryChipsBar}>
          <FlatList
            horizontal
            data={displayCategories}
            keyExtractor={(cat, index) => String(cat._id || cat.id || `category-${index}`)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsContent}
            renderItem={({ item, index }) => {
              const itemId = String(item._id || item.id || `cat-${index}`);
              const isActive = String(selectedCategory) === itemId;
              const displayName = item._id === "cat-all" ? "Tất Cả" : translateCategory(item.name);

              return (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(itemId)}
                  style={[styles.catChip, isActive && styles.catChipActive]}
                >
                  <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Danh Sách Sản Phẩm */}
        {loading || isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A6A48" />
            <Text style={styles.loadingText}>Đang tải bộ sưu tập sản phẩm...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => String(item._id || item.id || `product-grid-${index}`)}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="search" size={48} color="#C2B8A3" />
                <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptySub}>Thử thay đổi từ khóa hoặc thiết lập lại bộ lọc.</Text>
                {activeFilterCount > 0 && (
                  <TouchableOpacity
                    onPress={() => setFilters(DEFAULT_FILTERS)}
                    style={styles.resetFilterInlineBtn}
                  >
                    <Text style={styles.resetFilterInlineText}>Đặt lại bộ lọc</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* Modal Bộ Lọc Trực Tiếp */}
        <FilterModal
          visible={filterModalVisible}
          filters={filters}
          categories={categories}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={(newFilters) => setFilters(newFilters)}
          onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          matchingCount={filteredProducts.length}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  searchBarWrapper: {
    flex: 1,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIconBox: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#252525",
    paddingVertical: 0,
    height: "100%",
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBtnActive: {
    backgroundColor: "#8A6A48",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#D93838",
    borderRadius: 7,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#D93838",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  categoryChipsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  categoryChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
  },
  catChipActive: {
    backgroundColor: "#8A6A48",
    borderColor: "#8A6A48",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6E6860",
  },
  catChipTextActive: {
    color: "#FFFFFF",
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6E6860",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252525",
    marginTop: 14,
  },
  emptySub: {
    fontSize: 12,
    color: "#6E6860",
    marginTop: 4,
  },
  resetFilterInlineBtn: {
    marginTop: 14,
    backgroundColor: "#E9E1D5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetFilterInlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A6A48",
  },
});