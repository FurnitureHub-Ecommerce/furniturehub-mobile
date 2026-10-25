import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/context/AppContext";
import {
  formatCurrency,
  getProductsApi,
  API_BASE_URL,
} from "@/services/api";

const getFullImageUrl = (rawImg: any) => {
  if (
    !rawImg ||
    typeof rawImg !== "string" ||
    rawImg.trim().length === 0 ||
    rawImg === "string"
  ) {
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600";
  }
  if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
    return rawImg;
  }
  return `${API_BASE_URL}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;
};

export default function WishlistTabScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart } = useApp();

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // State lưu danh sách ID các sản phẩm đang được tick chọn
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Tải sản phẩm thật từ Server khớp với wishlistIds
  const loadWishlistProducts = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const productsRes = await getProductsApi().catch(() => []);
        const allProducts = Array.isArray(productsRes)
          ? productsRes
          : productsRes?.data || productsRes?.products || [];

        // Quét các sản phẩm thực tế từ Server có ID trùng với wishlistIds
        const filtered = allProducts
          .filter((item: any) => {
            const id = String(item._id || item.id);
            return wishlistIds.has(id);
          })
          .map((item: any) => {
            let rawImage = null;
            if (Array.isArray(item.images) && item.images.length > 0) {
              rawImage = item.images[0];
            } else {
              rawImage = item.image || item.imageUrl;
            }

            return {
              ...item,
              id: String(item._id || item.id),
              title: item.name || item.title || "Sản phẩm nội thất",
              price: Number(
                item.price ?? item.minPrice ?? item.maxPrice ?? 0
              ),
              image: getFullImageUrl(rawImage),
              brand: item.brandId?.name || item.brand || "LUMORA",
            };
          });

        setWishlistProducts(filtered);
        // Lọc bỏ các ID chọn không còn nằm trong wishlist mới
        setSelectedIds((prev) =>
          prev.filter((id) => filtered.some((p : any) => p.id === id))
        );
      } catch (error) {
        console.warn("Lỗi tải sản phẩm yêu thích:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [wishlistIds],
  );

  useEffect(() => {
    loadWishlistProducts();
  }, [loadWishlistProducts]);

  // Bật / Tắt tick chọn 1 sản phẩm
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Chọn tất cả hoặc Bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedIds.length === wishlistProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(wishlistProducts.map((p) => p.id));
    }
  };

  // Xóa hàng loạt các sản phẩm đã chọn
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi danh sách yêu thích?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            // Duyệt qua từng ID đã chọn để bỏ thả tim trong Context
            for (const id of selectedIds) {
              await toggleWishlist(id);
            }
            setSelectedIds([]);
          },
        },
      ]
    );
  };

  // Hàm xử lý chuyển sản phẩm sang Giỏ Hàng & Bật Alert khi hết hàng
  const handleAddToCartAndNavigate = async (item: any) => {
    const targetProduct = item.originalProduct || item;
    const productId = item.id || targetProduct._id || targetProduct.id;

    try {
      setAddingId(productId);

      const result = await addToCart(targetProduct);

      setTimeout(() => {
        setAddingId(null);

        if (result.success) {
          router.push("/(customer)/cart" as any);
        } else {
          Alert.alert(
            "Sản phẩm tạm hết hàng",
            result.message || "Hiện tại món hàng này không còn tồn kho trong hệ thống.",
            [{ text: "Đã hiểu", style: "default" }]
          );
        }
      }, 200);
    } catch (error: any) {
      setAddingId(null);
      Alert.alert(
        "Thông báo",
        "Không thể chuyển sản phẩm vào giỏ hàng lúc này."
      );
    }
  };

  const isAllSelected =
    wishlistProducts.length > 0 &&
    selectedIds.length === wishlistProducts.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <Text style={styles.headerTitle}>
          Sản phẩm yêu thích ({wishlistProducts.length})
        </Text>

        {/* Nút Chọn Tất Cả / Bỏ Chọn */}
        {wishlistProducts.length > 0 ? (
          <TouchableOpacity
            onPress={handleSelectAll}
            style={styles.selectAllBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.selectAllText}>
              {isAllSelected ? "Bỏ chọn" : "Tất cả"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#8A6A48" />
          <Text style={{ marginTop: 12, color: "#6E6860", fontSize: 13 }}>
            Đang tải danh sách yêu thích...
          </Text>
        </View>
      ) : wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySub}>
            Lưu lại các tác phẩm nội thất bạn yêu thích bằng cách nhấn vào biểu
            tượng trái tim.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(customer)/shop" as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>KHÁM PHÁ BỘ SƯU TẬP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={wishlistProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadWishlistProducts(true)}
                tintColor="#8A6A48"
              />
            }
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <View
                  style={[
                    styles.itemCard,
                    isSelected && styles.itemCardSelected,
                  ]}
                >
                  {/* Ô Checkbox Chọn / Bỏ Chọn */}
                  <TouchableOpacity
                    onPress={() => toggleSelectItem(item.id)}
                    style={styles.checkboxContainer}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        isSelected ? "checkbox-sharp" : "square-outline"
                      }
                      size={22}
                      color={isSelected ? "#8A6A48" : "#A0988E"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/(customer)/product/${item.id}` as any)
                    }
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      alignItems: "center",
                    }}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.brandName}>{item.brand}</Text>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.price)}
                      </Text>

                      {/* Nút Chuyển Vào Giỏ */}
                      <TouchableOpacity
                        onPress={() => handleAddToCartAndNavigate(item)}
                        style={styles.addCartBtn}
                        activeOpacity={0.85}
                        disabled={addingId === item.id}
                      >
                        {addingId === item.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Feather
                              name="shopping-bag"
                              size={13}
                              color="#FFFFFF"
                            />
                            <Text style={styles.addCartText}>Chuyển Vào Giỏ</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Nút Trái tim xóa lẻ 1 món */}
                  <TouchableOpacity
                    onPress={() => toggleWishlist(item.id)}
                    style={styles.removeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="heart" size={22} color="#D93838" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          {/* Thanh công cụ xóa hàng loạt ở phía dưới (Hiển thị khi tick chọn ít nhất 1 món) */}
          {selectedIds.length > 0 && (
            <View style={styles.bottomActionBar}>
              <Text style={styles.actionText}>
                Đã chọn <Text style={styles.actionCount}>{selectedIds.length}</Text> sản phẩm
              </Text>

              <TouchableOpacity
                onPress={handleDeleteSelected}
                style={styles.deleteBatchBtn}
                activeOpacity={0.85}
              >
                <Feather name="trash-2" size={15} color="#FFFFFF" />
                <Text style={styles.deleteBatchText}>Xóa Mục Đã Chọn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
    backgroundColor: "#F7F4EE",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#252525",
    fontFamily: Platform.OS === "ios" ? "serif" : "serif",
    textAlign: "center",
  },
  selectAllBtn: {
    width: 60,
    alignItems: "flex-end",
  },
  selectAllText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#8A6A48",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: "#6E6860",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: "#8A6A48",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 3,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    marginBottom: 14,
    elevation: 1,
  },
  itemCardSelected: {
    borderColor: "#8A6A48",
    backgroundColor: "#FAF7F2",
  },
  checkboxContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F7F4EE",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },
  brandName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A6A48",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#8A6A48",
    marginBottom: 8,
  },
  addCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2421",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignSelf: "flex-start",
    gap: 5,
    shadowColor: "#2A2421",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addCartText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  removeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  /* Thanh Công Cụ Xóa Hàng Loạt Bên Dưới */
  bottomActionBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#2A2421",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    color: "#E2DBD0",
    fontSize: 13,
    fontWeight: "500",
  },
  actionCount: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  deleteBatchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D93838",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 6,
  },
  deleteBatchText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});