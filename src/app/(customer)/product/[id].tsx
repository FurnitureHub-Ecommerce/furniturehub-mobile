import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import {
  getProductDetailApi,
  getProductVariantsApi,
  getVariantDetailApi,
  getReviewsApi,
  ReviewItem,
  formatCurrency,
} from "@/services/api";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 380;

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist, cartCount } = useApp();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryFlatListRef = useRef<FlatList>(null);
  const [quantity, setQuantity] = useState(1);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Lấy dữ liệu sản phẩm & variants từ Backend
  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      if (!id || id === "undefined") {
        setIsLoading(false);
        setErrorMessage("Mã sản phẩm không hợp lệ.");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [prodRes, variantsRes] = await Promise.all([
          getProductDetailApi(id),
          getProductVariantsApi(id).catch(() => []),
        ]);

        const rawProd = prodRes?.product || prodRes?.data?.product || prodRes?.data || prodRes;
        if (!rawProd || (!rawProd._id && !rawProd.id)) {
          if (isMounted) setErrorMessage("Không tìm thấy thông tin sản phẩm trên hệ thống.");
          return;
        }

        let variantList: any[] = Array.isArray(variantsRes)
          ? variantsRes
          : variantsRes?.data || variantsRes?.variants || [];

        if (variantList.length > 0 && typeof variantList[0] === "string") {
          const detailPromises = variantList.map((vId) =>
            getVariantDetailApi(vId).catch(() => null)
          );
          const fullVariants = await Promise.all(detailPromises);
          variantList = fullVariants.filter(Boolean).map((v) => v?.data || v);
        }

        const activeVariants = variantList.filter((v: any) => v && v.isActive !== false);

        const realImages =
          Array.isArray(rawProd.images) && rawProd.images.length > 0
            ? rawProd.images
            : rawProd.imageUrl || rawProd.image
            ? [rawProd.imageUrl || rawProd.image]
            : [];

        const parsedProd = {
          ...rawProd,
          id: rawProd._id || rawProd.id,
          title: rawProd.name || rawProd.title || "Sản phẩm nội thất",
          description: rawProd.description || "",
          images: realImages,
          category: rawProd.categoryId?.name || rawProd.categoryName || "",
          brand: rawProd.brandId?.name || rawProd.brandName || "LUMORA",
          availableStock: rawProd.availableStock ?? 0,
        };

        if (isMounted) {
          setProduct(parsedProd);
          setVariants(activeVariants);
          if (activeVariants.length > 0) {
            setSelectedVariant(activeVariants[0]);
          }
        }

        try {
          const revs = await getReviewsApi(id);
          if (isMounted) {
            setReviews(Array.isArray(revs) ? revs : []);
          }
        } catch {
          // Bỏ qua nếu chưa có review
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "Lỗi khi tải dữ liệu từ server.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Kiểm tra sản phẩm hoặc biến thể đang chọn có hết hàng không
  const isOutOfStock = useMemo(() => {
    if (selectedVariant) {
      if (selectedVariant.stockCount !== undefined && Number(selectedVariant.stockCount) <= 0) return true;
      if (selectedVariant.quantity !== undefined && Number(selectedVariant.quantity) <= 0) return true;
      if (selectedVariant.availableStock !== undefined && Number(selectedVariant.availableStock) <= 0) return true;
      if (selectedVariant.isActive === false) return true;
    }
    if (product?.availableStock !== undefined && Number(product.availableStock) <= 0) {
      return true;
    }
    return false;
  }, [selectedVariant, product]);

  // Số lượng kho còn lại khả dụng
  const availableStockCount = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stockCount ?? selectedVariant.quantity ?? selectedVariant.availableStock ?? product?.availableStock ?? 0;
    }
    return product?.availableStock ?? 0;
  }, [selectedVariant, product]);

  const currentPrice = useMemo(() => {
    if (selectedVariant && selectedVariant.price !== undefined) {
      return Number(selectedVariant.price);
    }
    return Number(product?.price || 0);
  }, [selectedVariant, product]);

  const currentMaterial = useMemo(() => {
    return selectedVariant?.material || product?.material || null;
  }, [selectedVariant, product]);

  const currentSize = useMemo(() => {
    return selectedVariant?.size || product?.dimensions || null;
  }, [selectedVariant, product]);

  const currentColor = useMemo(() => {
    return selectedVariant?.color || null;
  }, [selectedVariant]);

  const isWishlisted = useMemo(() => {
    return product?.id ? wishlistIds.has(product.id) : false;
  }, [product?.id, wishlistIds]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [toastOpacity]);

  const handleIncreaseQty = useCallback(() => {
    if (quantity < availableStockCount) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast("Đã đạt số lượng tồn kho tối đa");
    }
  }, [quantity, availableStockCount, showToast]);

  const handleDecreaseQty = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) {
      Alert.alert("Thông báo", "Sản phẩm này hiện đã hết hàng.");
      return;
    }

    const success = await addToCart(
      product,
      quantity,
      selectedVariant
        ? { id: selectedVariant._id || selectedVariant.id, name: selectedVariant.sku || selectedVariant.color }
        : null,
      null
    );
    if (success) {
      showToast(`Đã thêm (${quantity}) "${product.title}" vào giỏ hàng`);
    } else {
      Alert.alert("Thông báo", "Không thể thêm vào giỏ hàng.");
    }
  }, [addToCart, product, quantity, selectedVariant, isOutOfStock, showToast]);

  const handleBuyNow = useCallback(() => {
    if (isOutOfStock) {
      Alert.alert("Thông báo", "Sản phẩm này hiện đã hết hàng.");
      return;
    }

    addToCart(
      product,
      quantity,
      selectedVariant
        ? { id: selectedVariant._id || selectedVariant.id, name: selectedVariant.sku || selectedVariant.color }
        : null,
      null
    );
    router.push("/(customer)/checkout" as any);
  }, [addToCart, product, quantity, selectedVariant, isOutOfStock, router]);

  const onGalleryScroll = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.container, styles.centerContainer]}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải chi tiết sản phẩm...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (errorMessage || !product) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <SafeAreaView style={[styles.container, styles.centerContainer]}>
          <Feather name="alert-circle" size={48} color="#D93838" />
          <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
          <Text style={styles.errorSub}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Quay Lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Floating Top Nav Bar */}
      <SafeAreaView style={styles.floatingHeaderArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerIconBtn}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#252525" />
          </TouchableOpacity>

          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              onPress={() => toggleWishlist(product.id)}
              style={styles.headerIconBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={20}
                color={isWishlisted ? "#D93838" : "#252525"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(customer)/(tabs)/cart" as any)}
              style={styles.headerIconBtn}
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
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery Trình Chiếu Ảnh */}
        <View style={styles.galleryWrapper}>
          {product.images?.length > 0 ? (
            <FlatList
              ref={galleryFlatListRef}
              data={product.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onGalleryScroll}
              scrollEventThrottle={16}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.slideBox}>
                  <Image source={{ uri: item }} style={styles.slideImage} />
                </View>
              )}
            />
          ) : (
            <View style={[styles.slideBox, styles.emptyImageBox]}>
              <Feather name="image" size={48} color="#C2B8A3" />
            </View>
          )}

          {/* Badge đếm ảnh & Dots Indicator */}
          {product.images?.length > 1 && (
            <>
              <View style={styles.counterBadge}>
                <Text style={styles.counterBadgeText}>
                  {activeImageIndex + 1} / {product.images.length}
                </Text>
              </View>
              <View style={styles.dotsRow}>
                {product.images.map((_: any, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.dotItem,
                      activeImageIndex === idx && styles.dotItemActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Nội dung chi tiết */}
        <View style={styles.contentSheet}>
          <View style={styles.tagLineRow}>
            {product.brand ? (
              <View style={styles.brandPill}>
                <Ionicons name="sparkles" size={11} color="#8A6A48" />
                <Text style={styles.brandPillText}>{product.brand}</Text>
              </View>
            ) : null}

            {product.category ? (
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            ) : null}
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Giá niêm yết</Text>
              <Text style={styles.productPrice}>{formatCurrency(currentPrice)}</Text>
            </View>
            {selectedVariant?.sku && (
              <View style={styles.skuBox}>
                <Text style={styles.skuLabel}>MÃ SẢN PHẨM</Text>
                <Text style={styles.skuCode}>{selectedVariant.sku}</Text>
              </View>
            )}
          </View>

          <View style={styles.thinDivider} />

          {/* Chọn Biến Thể / Phiên Bản */}
          {variants.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>TÙY CHỌN PHIÊN BẢN</Text>
              </View>

              <View style={styles.variantsGrid}>
                {variants.map((v: any, index: number) => {
                  const vId = v._id || v.id || `variant-${index}`;
                  const isSelected = (selectedVariant?._id || selectedVariant?.id) === vId;
                  const label = [v.color, v.size].filter(Boolean).join(" - ") || v.sku || `Bản ${index + 1}`;

                  return (
                    <TouchableOpacity
                      key={vId}
                      onPress={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      style={[styles.variantCard, isSelected && styles.variantCardActive]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.variantCardTop}>
                        <View
                          style={[
                            styles.radioDot,
                            isSelected && styles.radioDotActive,
                          ]}
                        />
                        <Text
                          style={[
                            styles.variantCardLabel,
                            isSelected && styles.variantCardLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                      </View>
                      {v.price && (
                        <Text
                          style={[
                            styles.variantCardPrice,
                            isSelected && styles.variantCardPriceActive,
                          ]}
                        >
                          {formatCurrency(v.price)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Bộ Chọn Số Lượng & Trạng Thái Kho */}
          <View style={styles.sectionBlock}>
            <View style={styles.quantityCard}>
              <View>
                <Text style={styles.quantityCardLabel}>Trạng thái kho</Text>
                <View style={styles.stockStatusInline}>
                  <View style={[styles.stockDot, isOutOfStock && styles.stockDotRed]} />
                  <Text style={[styles.stockStatusText, isOutOfStock && styles.stockStatusTextRed]}>
                    {isOutOfStock ? "Đã hết hàng" : `Còn ${availableStockCount} sản phẩm.`}
                  </Text>
                </View>
              </View>

              {/* Nếu hết hàng thì ẩn hoặc khóa nút tăng giảm số lượng */}
              {!isOutOfStock ? (
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    onPress={handleDecreaseQty}
                    disabled={quantity <= 1}
                    style={[styles.counterBtn, quantity <= 1 && styles.counterBtnDisabled]}
                  >
                    <Feather
                      name="minus"
                      size={15}
                      color={quantity <= 1 ? "#B8B0A5" : "#252525"}
                    />
                  </TouchableOpacity>

                  <Text style={styles.counterValue}>{quantity}</Text>

                  <TouchableOpacity
                    onPress={handleIncreaseQty}
                    disabled={quantity >= availableStockCount}
                    style={[
                      styles.counterBtn,
                      quantity >= availableStockCount && styles.counterBtnDisabled,
                    ]}
                  >
                    <Feather
                      name="plus"
                      size={15}
                      color={quantity >= availableStockCount ? "#B8B0A5" : "#252525"}
                    />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>

          {/* Bảng Thông Số Kỹ Thuật (Specs Grid) */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>THÔNG SỐ SẢN PHẨM</Text>
            <View style={styles.specsGridCard}>
              {currentMaterial ? (
                <View style={styles.specGridItem}>
                  <Feather name="layers" size={16} color="#8A6A48" />
                  <View style={styles.specItemTexts}>
                    <Text style={styles.specKey}>Chất liệu</Text>
                    <Text style={styles.specVal}>{currentMaterial}</Text>
                  </View>
                </View>
              ) : null}

              {currentColor ? (
                <View style={styles.specGridItem}>
                  <Feather name="droplet" size={16} color="#8A6A48" />
                  <View style={styles.specItemTexts}>
                    <Text style={styles.specKey}>Màu sắc</Text>
                    <Text style={styles.specVal}>{currentColor}</Text>
                  </View>
                </View>
              ) : null}

              {currentSize ? (
                <View style={styles.specGridItem}>
                  <Feather name="maximize-2" size={16} color="#8A6A48" />
                  <View style={styles.specItemTexts}>
                    <Text style={styles.specKey}>Kích thước / Size</Text>
                    <Text style={styles.specVal}>{currentSize}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.specGridItem}>
                <Feather name="shield" size={16} color="#8A6A48" />
                <View style={styles.specItemTexts}>
                  <Text style={styles.specKey}>Bảo hành chính hãng</Text>
                  <Text style={styles.specVal}>12 Tháng Tiêu Chuẩn</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Mô Tả Chi Tiết */}
          {product.description ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>MÔ TẢ CHI TIẾT</Text>
              <View style={styles.descCard}>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            </View>
          ) : null}

          {/* Nhận Xét & Đánh Giá */}
          {reviews.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>ĐÁNH GIÁ KHÁCH HÀNG</Text>
                <Text style={styles.selectedVariantNote}>({reviews.length} nhận xét)</Text>
              </View>

              {reviews.map((rev, rIdx) => (
                <View key={rev.id || rIdx} style={styles.reviewCard}>
                  <View style={styles.reviewTopRow}>
                    <View style={styles.reviewAvatarPlaceholder}>
                      <Text style={styles.reviewAvatarChar}>
                        {(rev.userName || "U")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewAuthor}>{rev.userName || "Khách Hàng"}</Text>
                      <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= rev.rating ? "star" : "star-outline"}
                            size={12}
                            color="#C89D5C"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast Alert */}
      {toastMessage && (
        <Animated.View style={[styles.floatingToast, { opacity: toastOpacity }]} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={18} color="#C89D5C" />
          <Text style={styles.floatingToastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Floating Bottom Bar - Bị vô hiệu hóa khi hết hàng */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            style={[
              styles.btnSecondary,
              isOutOfStock && styles.btnDisabledSecondary,
            ]}
            activeOpacity={0.85}
          >
            <Feather
              name={isOutOfStock ? "slash" : "shopping-bag"}
              size={17}
              color={isOutOfStock ? "#A1998E" : "#252525"}
            />
            <Text
              style={[
                styles.btnSecondaryText,
                isOutOfStock && styles.btnDisabledText,
              ]}
            >
              {isOutOfStock ? "Đã hết hàng" : "Thêm vào giỏ"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBuyNow}
            disabled={isOutOfStock}
            style={[
              styles.btnPrimary,
              isOutOfStock && styles.btnDisabledPrimary,
            ]}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.btnPrimaryText,
                isOutOfStock && styles.btnDisabledTextPrimary,
              ]}
            >
              {isOutOfStock ? "HẾT HÀNG" : "Mua ngay"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: "#8A6A48",
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#252525",
    marginTop: 12,
  },
  errorSub: {
    fontSize: 13,
    color: "#6E6860",
    marginTop: 6,
    textAlign: "center",
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#8A6A48",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },

  /* Floating Header */
  floatingHeaderArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
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

  /* Gallery */
  scrollContent: {
    paddingBottom: 110,
  },
  galleryWrapper: {
    width: width,
    height: IMAGE_HEIGHT,
    backgroundColor: "#EBE5DB",
    position: "relative",
  },
  slideBox: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  emptyImageBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  counterBadge: {
    position: "absolute",
    bottom: 24,
    right: 18,
    backgroundColor: "rgba(37, 37, 37, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  counterBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dotsRow: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  dotItemActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },

  /* Content Sheet */
  contentSheet: {
    marginTop: -16,
    backgroundColor: "#F7F4EE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  tagLineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFE8DC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A6A48",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#8A6A48",
    fontWeight: "500",
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#252525",
    lineHeight: 30,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    color: "#8C8377",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: "800",
    color: "#8A6A48",
    letterSpacing: -0.5,
  },
  skuBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "flex-end",
  },
  skuLabel: {
    fontSize: 9,
    color: "#8C8377",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  skuCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#252525",
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#E2DBD0",
    marginVertical: 14,
  },

  /* Sections */
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A6A48",
    fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif',
    marginTop: 5,
  },
  selectedVariantNote: {
    fontSize: 12,
    color: "#6E6860",
    fontWeight: "500",
  },

  /* Variants Cards */
  variantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2DBD0",
    borderRadius: 14,
    padding: 12,
  },
  variantCardActive: {
    borderColor: "#8A6A48",
    backgroundColor: "#FAF7F2",
  },
  variantCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#B8B0A5",
  },
  radioDotActive: {
    borderColor: "#8A6A48",
    backgroundColor: "#8A6A48",
  },
  variantCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A453F",
    flex: 1,
  },
  variantCardLabelActive: {
    color: "#252525",
    fontWeight: "700",
  },
  variantCardPrice: {
    fontSize: 12,
    color: "#8C8377",
    fontWeight: "500",
    paddingLeft: 20,
  },
  variantCardPriceActive: {
    color: "#8A6A48",
    fontWeight: "700",
  },

  /* Quantity Card */
  quantityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quantityCardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#252525",
    marginBottom: 3,
  },
  stockStatusInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#27AE60",
  },
  stockDotRed: {
    backgroundColor: "#D93838",
  },
  stockStatusText: {
    fontSize: 11,
    color: "#6E6860",
    fontWeight: "500",
  },
  stockStatusTextRed: {
    color: "#D93838",
    fontWeight: "700",
  },
  counterControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F4EE",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  counterBtnDisabled: {
    backgroundColor: "transparent",
    opacity: 0.4,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#252525",
    paddingHorizontal: 12,
  },

  /* Specs Grid Card */
  specsGridCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    marginTop: 10,
  },
  specGridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingRight: 8,
  },
  specItemTexts: {
    flex: 1,
  },
  specKey: {
    fontSize: 11,
    color: "#8C8377",
    marginBottom: 2,
  },
  specVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#252525",
  },

  /* Description Card */
  descCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: "#4A453F",
    lineHeight: 22,
  },

  /* Reviews */
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DBD0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarChar: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A6A48",
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 2,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 12,
    color: "#6E6860",
    lineHeight: 18,
  },

  /* Floating Toast */
  floatingToast: {
    position: "absolute",
    top: 75,
    left: 20,
    right: 20,
    backgroundColor: "#252525",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 8,
    zIndex: 200,
  },
  floatingToastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  /* Sticky Bottom Bar */
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F7F4EE",
    borderTopWidth: 1,
    borderTopColor: "#E2DBD0",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  bottomBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2DBD0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#252525",
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8A6A48",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8A6A48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  /* Trạng thái bị vô hiệu hóa khi hết hàng */
  btnDisabledSecondary: {
    backgroundColor: "#EFECE6",
    borderColor: "#E2DBD0",
    opacity: 0.7,
  },
  btnDisabledPrimary: {
    backgroundColor: "#C2B8A3",
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.7,
  },
  btnDisabledText: {
    color: "#8C8377",
  },
  btnDisabledTextPrimary: {
    color: "#FAF8F5",
    letterSpacing: 1,
  },
});