import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductsApi, getCategoryDetailApi } from "@/services/api";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist } = useApp();

  const [categoryName, setCategoryName] = useState("Danh Mục");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryAndProducts = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Gọi song song: Lấy thông tin category từ /api/categories/{id} và danh sách product từ /api/products
        const [catData, prodList] = await Promise.all([
          id !== "cat-all"
            ? getCategoryDetailApi(id).catch(() => null)
            : Promise.resolve(null),
          getProductsApi().catch(() => []),
        ]);

        const currentCat = catData?.category || catData?.data || catData;
        const rawProducts = Array.isArray(prodList)
          ? prodList
          : (prodList as any)?.data || (prodList as any)?.products || [];

        let title = "Tất Cả Sản Phẩm";
        if (currentCat && currentCat.name) {
          title = currentCat.name;
        }

        // Lọc sản phẩm theo Category ID
        let filtered = rawProducts;
        if (id !== "cat-all") {
          filtered = rawProducts.filter((item: any) => {
            const itemCatId = String(
              item.categoryId?._id ||
                item.categoryId?.id ||
                item.categoryId ||
                "",
            );
            const itemCatName = (
              item.categoryId?.name ||
              item.category ||
              ""
            ).toLowerCase();
            return (
              itemCatId === String(id) ||
              (currentCat && itemCatName === currentCat.name?.toLowerCase())
            );
          });
        }

        if (isMounted) {
          setCategoryName(title);
          setProducts(filtered);
        }
      } catch (error) {
        console.warn("Lỗi tải danh mục sản phẩm:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategoryAndProducts();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}` as any);
    },
    [router],
  );

  const renderProductItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (!item) return null;
      const productId = String(item._id || item.id || `item-${index}`);

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
    [wishlistIds, toggleWishlist, addToCart, handleProductPress],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {categoryName}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(customer)/search" as any)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Feather name="search" size={18} color="#252525" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#8A6A48" />
            <Text style={styles.loadingText}>
              Đang tải sản phẩm danh mục...
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="box" size={48} color="#C2B8A3" />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptySub}>
              Các sản phẩm trong danh mục này đang được cập nhật.
            </Text>
          </View>
        ) : (
          <FlatList
            data={Array.isArray(products) ? products : []}
            keyExtractor={(item, index) => {
              const validKey = item?._id || item?.id;
              return validKey ? String(validKey) : `product-cell-${index}`;
            }}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContainer}
            renderItem={renderProductItem}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#252525",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  loadingText: {
    color: "#8A6A48",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252525",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "#6E6860",
    textAlign: "center",
    lineHeight: 18,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
