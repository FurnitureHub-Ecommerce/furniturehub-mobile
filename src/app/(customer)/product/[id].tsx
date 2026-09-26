import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import {
  MOCK_PRODUCTS,
  ProductVariantColor,
  ProductVariantOption,
} from '@/services/mockData';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist, cartCount } = useApp();

  // Find product or fallback to default
  const product = useMemo(() => {
    return MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
  }, [id]);

  const isWishlisted = wishlistIds.has(product.id);

  // Gallery Images List
  const galleryImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [product.image];
  }, [product]);

  // Gallery Active Index State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryFlatListRef = useRef<FlatList>(null);

  // Selected Variant States
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor | undefined>(
    product.colors?.[0]
  );
  const [selectedOption, setSelectedOption] = useState<ProductVariantOption | undefined>(
    product.options?.[0]
  );
  const [quantity, setQuantity] = useState(1);

  // Toast feedback animation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Stock Calculation per selected combination (Task 4 & 5)
  const currentVariantStock = useMemo(() => {
    if (!product.variantStocks || product.variantStocks.length === 0) {
      return { inStock: true, stockCount: 10 };
    }
    const match = product.variantStocks.find((s) => {
      const colorMatch = s.colorId === selectedColor?.id;
      const optionMatch = !selectedOption || s.optionId === selectedOption?.id;
      return colorMatch && optionMatch;
    });

    if (match) return match;
    return { inStock: false, stockCount: 0 };
  }, [product.variantStocks, selectedColor, selectedOption]);

  // Check if a specific color is in stock
  const isColorInStock = useCallback(
    (colorId: string) => {
      if (!product.variantStocks) return true;
      return product.variantStocks.some(
        (s) => s.colorId === colorId && s.inStock && s.stockCount > 0
      );
    },
    [product.variantStocks]
  );

  // Check if a specific option is in stock for currently selected color
  const isOptionInStock = useCallback(
    (optionId: string) => {
      if (!product.variantStocks) return true;
      return product.variantStocks.some((s) => {
        const colorMatch = !selectedColor || s.colorId === selectedColor.id;
        return colorMatch && s.optionId === optionId && s.inStock && s.stockCount > 0;
      });
    },
    [product.variantStocks, selectedColor]
  );

  // Dynamic Price Calculation based on option adjustment
  const dynamicPrice = useMemo(() => {
    const adjustment = selectedOption?.priceAdjustment || 0;
    return product.price + adjustment;
  }, [product.price, selectedOption]);

  // Handle Color Selection (Task 5: Auto scroll gallery carousel image)
  const handleSelectColor = useCallback(
    (color: ProductVariantColor) => {
      setSelectedColor(color);
      setQuantity(1);

      // Find index of color image in gallery images list
      const colorImgIndex = galleryImages.findIndex(
        (img) => img === color.image || img.includes(color.hex)
      );

      if (colorImgIndex !== -1 && galleryFlatListRef.current) {
        galleryFlatListRef.current.scrollToIndex({
          index: colorImgIndex,
          animated: true,
        });
        setActiveImageIndex(colorImgIndex);
      }
    },
    [galleryImages]
  );

  // Handle Option Selection
  const handleSelectOption = useCallback((option: ProductVariantOption) => {
    setSelectedOption(option);
    setQuantity(1);
  }, []);

  // Quantity Change Handlers
  const handleIncreaseQty = useCallback(() => {
    if (quantity < currentVariantStock.stockCount) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast(`Chỉ còn ${currentVariantStock.stockCount} sản phẩm trong kho`);
    }
  }, [quantity, currentVariantStock]);

  const handleDecreaseQty = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Add to Cart Handler
  const handleAddToCart = useCallback(() => {
    if (!currentVariantStock.inStock) {
      Alert.alert('Hết Hàng', 'Sản phẩm thuộc biến thể này hiện đang tạm hết hàng.');
      return;
    }
    addToCart(product, quantity, selectedColor, selectedOption);
    showToast(`Đã thêm (${quantity}) "${product.title}" vào giỏ hàng`);
  }, [
    currentVariantStock,
    addToCart,
    product,
    quantity,
    selectedColor,
    selectedOption,
  ]);

  // Buy Now Handler
  const handleBuyNow = useCallback(() => {
    if (!currentVariantStock.inStock) {
      Alert.alert('Hết Hàng', 'Sản phẩm thuộc biến thể này hiện đang tạm hết hàng.');
      return;
    }
    addToCart(product, quantity, selectedColor, selectedOption);
    router.push('/(customer)/checkout' as any);
  }, [
    currentVariantStock,
    addToCart,
    product,
    quantity,
    selectedColor,
    selectedOption,
    router,
  ]);

  // Handle Gallery Scroll Pagination Index
  const onGalleryScroll = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F4EE" />

      {/* Header Bar Overlay */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.brand}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => toggleWishlist(product.id)}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#D93838' : '#252525'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(customer)/cart' as any)}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PRODUCT GALLERY CAROUSEL SLIDER (Task 5) */}
        <View style={styles.galleryContainer}>
          <FlatList
            ref={galleryFlatListRef}
            data={galleryImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.gallerySlide}>
                <Image source={{ uri: item }} style={styles.galleryImage} />
              </View>
            )}
          />

          {/* Page Counter Badge ("1/4") */}
          <View style={styles.galleryCounterBadge}>
            <Text style={styles.galleryCounterText}>
              {activeImageIndex + 1} / {galleryImages.length}
            </Text>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationDotsRow}>
            {galleryImages.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  activeImageIndex === idx && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* MAIN PRODUCT DETAILS */}
        <View style={styles.detailsSection}>
          {/* Brand & Category */}
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#8A6A48" />
              <Text style={styles.verifiedText}>Chính Hãng</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.titleText}>{product.title}</Text>

          {/* Rating & Review */}
          <View style={styles.ratingRow}>
            <View style={styles.starGroup}>
              <Ionicons name="star" size={15} color="#C89D5C" />
              <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>({product.reviewCount} Đánh giá)</Text>
            <View style={styles.dividerDot} />
            <Text style={styles.categoryName}>{product.category}</Text>
          </View>

          {/* Dynamic Price Display */}
          <View style={styles.priceRow}>
            <Text style={styles.dynamicPrice}>${dynamicPrice.toLocaleString()}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ${product.originalPrice.toLocaleString()}
              </Text>
            )}
            {product.tag && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{product.tag}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <Text style={styles.descriptionText}>{product.description}</Text>
          )}

          {/* COLOR SWATCHES SELECTOR (Task 4 & 5) */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.variantSection}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantLabel}>Màu Sắc:</Text>
                <Text style={styles.variantValue}>{selectedColor?.name}</Text>
              </View>

              <View style={styles.colorSwatchesRow}>
                {product.colors.map((c) => {
                  const isSelected = selectedColor?.id === c.id;
                  const inStock = isColorInStock(c.id);

                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => handleSelectColor(c)}
                      disabled={!inStock}
                      style={[
                        styles.colorSwatchContainer,
                        isSelected && styles.colorSwatchActive,
                        !inStock && styles.colorSwatchDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.colorSwatchCircle, { backgroundColor: c.hex }]}>
                        {isSelected && (
                          <Feather
                            name="check"
                            size={14}
                            color={c.hex === '#F5F2EB' || c.hex === '#E0C59E' || c.hex === '#E3CBB5' ? '#252525' : '#FFFFFF'}
                          />
                        )}
                      </View>
                      {!inStock && <View style={styles.disabledLine} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* SIZE / MATERIAL PILL SELECTOR (Task 4 & 5) */}
          {product.options && product.options.length > 0 && (
            <View style={styles.variantSection}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantLabel}>Kích Thước / Option:</Text>
                <Text style={styles.variantValue}>{selectedOption?.label}</Text>
              </View>

              <View style={styles.optionPillGroup}>
                {product.options.map((opt) => {
                  const isSelected = selectedOption?.id === opt.id;
                  const inStock = isOptionInStock(opt.id);

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => handleSelectOption(opt)}
                      disabled={!inStock}
                      style={[
                        styles.optionPill,
                        isSelected && styles.optionPillActive,
                        !inStock && styles.optionPillDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          isSelected && styles.optionPillTextActive,
                          !inStock && styles.optionPillTextDisabled,
                        ]}
                      >
                        {opt.label}
                        {opt.priceAdjustment > 0
                          ? ` (+$${opt.priceAdjustment})`
                          : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STOCK STATUS INDICATOR & QUANTITY SELECTOR */}
          <View style={styles.stockQtyRow}>
            {/* Stock Status Tag */}
            <View style={styles.stockStatusBox}>
              <Text style={styles.stockLabel}>Trạng thái kho:</Text>
              {currentVariantStock.inStock ? (
                <View style={styles.inStockBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
                  <Text style={styles.inStockText}>
                    Còn hàng ({currentVariantStock.stockCount} sp)
                  </Text>
                </View>
              ) : (
                <View style={styles.outOfStockBadge}>
                  <Ionicons name="close-circle" size={14} color="#D93838" />
                  <Text style={styles.outOfStockText}>Tạm hết hàng</Text>
                </View>
              )}
            </View>

            {/* Quantity Controls */}
            {currentVariantStock.inStock && (
              <View style={styles.qtyControlBox}>
                <TouchableOpacity
                  onPress={handleDecreaseQty}
                  disabled={quantity <= 1}
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="minus"
                    size={14}
                    color={quantity <= 1 ? '#C2B8A3' : '#252525'}
                  />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={handleIncreaseQty}
                  disabled={quantity >= currentVariantStock.stockCount}
                  style={[
                    styles.qtyBtn,
                    quantity >= currentVariantStock.stockCount &&
                      styles.qtyBtnDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="plus"
                    size={14}
                    color={
                      quantity >= currentVariantStock.stockCount
                        ? '#C2B8A3'
                        : '#252525'
                    }
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PRODUCT SPECS CARD */}
          <View style={styles.specsCard}>
            <Text style={styles.specsCardTitle}>THÔNG SỐ KỸ THUẬT</Text>
            {product.dimensions && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Kích thước tổng thể:</Text>
                <Text style={styles.specValue}>{product.dimensions}</Text>
              </View>
            )}
            {product.material && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Chất liệu cấu tạo:</Text>
                <Text style={styles.specValue}>{product.material}</Text>
              </View>
            )}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Bảo hành chính hãng:</Text>
              <Text style={styles.specValue}>10 Năm Khung Khung Gỗ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* TOAST FEEDBACK FLOATING BANNER */}
      {toastMessage && (
        <Animated.View
          style={[styles.toastContainer, { opacity: toastOpacity }]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={18} color="#C89D5C" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* FIXED BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        {/* Wishlist Icon Button */}
        <TouchableOpacity
          onPress={() => toggleWishlist(product.id)}
          style={styles.bottomWishlistBtn}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={isWishlisted ? '#D93838' : '#252525'}
          />
        </TouchableOpacity>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={!currentVariantStock.inStock}
          style={[
            styles.addCartBtn,
            !currentVariantStock.inStock && styles.btnDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Feather name="shopping-bag" size={16} color="#FFFFFF" />
          <Text style={styles.addCartText}>THÊM VÀO GIỎ</Text>
        </TouchableOpacity>

        {/* Buy Now Button */}
        <TouchableOpacity
          onPress={handleBuyNow}
          disabled={!currentVariantStock.inStock}
          style={[
            styles.buyNowBtn,
            !currentVariantStock.inStock && styles.btnDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.buyNowText}>MUA NGAY</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7F4EE',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
    zIndex: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
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
  scrollContent: {
    paddingBottom: 110,
  },
  galleryContainer: {
    width: width,
    height: 320,
    backgroundColor: '#E9E1D5',
    position: 'relative',
  },
  gallerySlide: {
    width: width,
    height: 320,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryCounterBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  paginationDotsRow: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  detailsSection: {
    padding: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E9E1D5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#8A6A48',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  starGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#252525',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6E6860',
    marginLeft: 4,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C2B8A3',
    marginHorizontal: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#8A6A48',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 14,
  },
  dynamicPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8A6A48',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999187',
    textDecorationLine: 'line-through',
  },
  tagBadge: {
    backgroundColor: '#8A6A48',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6E6860',
    lineHeight: 22,
    marginBottom: 20,
  },
  variantSection: {
    marginBottom: 20,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#252525',
  },
  variantValue: {
    fontSize: 13,
    color: '#8A6A48',
    fontWeight: '600',
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatchContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  colorSwatchActive: {
    borderColor: '#8A6A48',
  },
  colorSwatchDisabled: {
    opacity: 0.35,
  },
  colorSwatchCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  disabledLine: {
    position: 'absolute',
    width: 36,
    height: 2,
    backgroundColor: '#D93838',
    transform: [{ rotate: '-45deg' }],
  },
  optionPillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  optionPillActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  optionPillDisabled: {
    backgroundColor: '#F0ECE4',
    borderColor: '#E2DBD0',
    opacity: 0.5,
  },
  optionPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#252525',
  },
  optionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionPillTextDisabled: {
    color: '#999187',
    textDecorationLine: 'line-through',
  },
  stockQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 20,
  },
  stockStatusBox: {
    gap: 4,
  },
  stockLabel: {
    fontSize: 11,
    color: '#6E6860',
    fontWeight: '500',
  },
  inStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inStockText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#27AE60',
  },
  outOfStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outOfStockText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D93838',
  },
  qtyControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252525',
    paddingHorizontal: 12,
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 10,
  },
  specsCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  specLabel: {
    fontSize: 12,
    color: '#6E6860',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#252525',
    flex: 1,
    textAlign: 'right',
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: '#252525',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F4EE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomWishlistBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#8A6A48',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buyNowBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnDisabled: {
    backgroundColor: '#C2B8A3',
    opacity: 0.6,
  },
});
