import { useApp } from "@/context/AppContext";
import {
  BANNERS,
  BRAND_PILLARS,
  Category,
  FILTER_TABS,
  LOOKBOOK_ITEM,
  Product,
  USP_ITEMS,
} from "@/services/mockData";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonLoader } from "../ui/SkeletonLoader";
import { BannerCarousel } from "./BannerCarousel";
import { COLORS, styles } from "./LumoraHomeScreen.styles";
import { getProductsApi, getCategoriesApi } from "@/services/api";

const FONTS = {
  SERIF: Platform.OS === "ios" ? "Didot" : "serif",
  SANS: Platform.OS === "ios" ? "System" : "sans-serif",
};

interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: () => void;
}

const WishlistButton = React.memo<WishlistButtonProps>(
  ({ isWishlisted, onToggle }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      onToggle();
    };

    return (
      <Pressable
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.wishlistButton}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={18}
            color={isWishlisted ? "#D93838" : COLORS.TEXT_DARK}
          />
        </Animated.View>
      </Pressable>
    );
  },
);

interface ProductCardProps {
  item: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (prod: Product) => void;
  onPress: (id: string) => void;
}

const ProductCard = React.memo<ProductCardProps>(
  ({ item, isWishlisted, onToggleWishlist, onAddToCart, onPress }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item.id)}
        style={styles.productCard}
      >
        <View style={styles.productImageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {item.tag ? (
            <View style={styles.badgeTag}>
              <Text style={styles.badgeTagText}>{item.tag.toUpperCase()}</Text>
            </View>
          ) : null}
          <WishlistButton
            isWishlisted={isWishlisted}
            onToggle={() => onToggleWishlist(item.id)}
          />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category}
          </Text>

          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={COLORS.RATING_GOLD} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.productPrice} numberOfLines={1}>
                {item.price
                  ? `${item.price.toLocaleString("vi-VN")} đ`
                  : "Liên hệ"}
              </Text>
              {item.originalPrice ? (
                <Text style={styles.originalPrice} numberOfLines={1}>
                  {`${item.originalPrice.toLocaleString("vi-VN")} đ`}
                </Text>
              ) : null}
            </View>

            {/* Nút + Giỏ: Thêm trực tiếp sản phẩm vào Giỏ Hàng */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              style={styles.addBagButton}
            >
              <Feather name="plus" size={12} color={COLORS.WHITE} />
              <Text style={styles.addBagText}>Giỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function LumoraHomeScreen() {
  const router = useRouter();
  const { cartCount, addToCart, wishlistIds, toggleWishlist } = useApp();
  const totalWishlistCount = wishlistIds?.size || 0;
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("cat-all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const badgeScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(40)).current;

  const categoryFlatListRef = useRef<FlatList<Category>>(null);

  

const fetchHomeData = async () => {
    try {
      setIsLoading(true);

      const [prodData, catData] = await Promise.all([
        getProductsApi(),
        getCategoriesApi(),
      ]);

      const rawProducts = Array.isArray(prodData)
        ? prodData
        : prodData.data || prodData.products || [];

      const formattedProducts = rawProducts.map((item: any) => {
        const realId = String(item._id || item.id);
        const rawCat = item.categoryId;
        
        // Trích xuất ID danh mục chuẩn xác
        const resolvedCatSlug = typeof rawCat === 'object' && rawCat !== null
          ? String(rawCat._id || rawCat.id || "").trim()
          : String(rawCat || "").trim();

        const rawCatName = typeof rawCat === 'object' && rawCat !== null
          ? String(rawCat.name || "").toLowerCase().trim()
          : String(item.categoryName || item.category || "").toLowerCase().trim();

        const firstImage =
          item.images && Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : item.image ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600";
        
        return {
          ...item,
          _id: realId,
          id: realId,
          title: item.name || item.title || "Sản phẩm nội thất",
          price: item.minPrice ?? item.price ?? 0,
         originalPrice: (item.originalPrice || item.maxPrice  || 0) + 1000000,
          image: firstImage,
          category: item.categoryName || item.categoryId?.name || item.category || "Nội Thất",
          brand: item.brandId?.name || item.brand || "LUMORA",
          categorySlug: resolvedCatSlug || "cat-all",
          categoryName: rawCatName,
          rating: item.averageRating ?? item.rating ?? 4.9,
          reviewCount: item.reviewCount ?? item.totalReviews ?? 0,
          tag: item.tag || (item.isNew ? "Mới" : undefined),
          colors: item.colors || [],
          variantStocks: item.variantStocks || item.variants || [],
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });

      // Sắp xếp sản phẩm từ cũ đến mới (cũ nhất lên trước)
      formattedProducts.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });

      setProducts(formattedProducts);

      const rawCategories = Array.isArray(catData)
        ? catData
        : catData.categories || catData.data || [];

      const formattedCategories = rawCategories.map((cat: any) => {
        const catId = String(cat._id || cat.id || "").trim();
        const catName = cat.name || "";
        let catImage = cat.image || cat.imageUrl || cat.thumbnail || cat.icon;
        if (Array.isArray(cat.images) && cat.images.length > 0) {
          catImage = cat.images[0];
        }

        if (!catImage) {
          const matchedProduct = formattedProducts.find(
            (p: any) => p.categorySlug === catId || p.category === catName,
          );
          if (matchedProduct) {
            catImage = matchedProduct.image;
          }
        }
        return {
          id: catId,
          name: catName,
          image: catImage,
        };
      });

      setCategoriesList([...formattedCategories]);
    } catch (error) {
      console.log("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeData();
  }, []);

  const triggerCartAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.4,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeScale]);

  const showToast = useCallback(
    (productName: string) => {
      setToastMessage(`Đã thêm "${productName}" vào giỏ hàng`);
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(toastTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: 40,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2500);
    },
    [toastOpacity, toastTranslateY],
  );

  // Gọi trực tiếp hàm addToCart để thêm vào Giỏ Hàng
  // Xử lý thông minh cho nút + Giỏ ở trang chủ
  const handleAddToCart = useCallback(
    async (product: Product) => {
      const success = await addToCart(product);
      if (success) {
        triggerCartAnimation();
        showToast(product.title);
      } else {
        // Nếu không tự động lấy được variant, điều hướng người dùng vào chi tiết chọn màu/kích thước
        router.push(`/(customer)/product/${product.id}` as any);
      }
    },
    [addToCart, triggerCartAnimation, showToast, router],
  );

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}` as any);
    },
    [router],
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      if (categoryId !== "cat-all") {
        router.push(`/(customer)/category/${categoryId}` as any);
      }
    },
    [router],
  );

const filteredProducts = products.filter((prod: any) => {
    if (selectedCategory === "cat-all") return true;

    const targetId = String(selectedCategory).toLowerCase().trim();
    const prodCatSlug = String(prod.categorySlug || "").toLowerCase().trim();
    const prodCatName = String(prod.categoryName || prod.category || "").toLowerCase().trim();

    const matchedCat = categoriesList.find((c) => String(c.id).toLowerCase().trim() === targetId);
    const matchedCatName = matchedCat ? String(matchedCat.name).toLowerCase().trim() : "";

    return (
      prodCatSlug === targetId ||
      prodCatName === targetId ||
      (matchedCatName && prodCatName === matchedCatName)
    );
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(customer)/home" as any)}
        style={{
          height: 44,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {!logoError ? (
          <Image
            source={require("@/assets/images/lumora-logo.png")}
            style={{
              width: 165,
              height: 170,
              resizeMode: "cover",
            }}
            onError={() => setLogoError(true)}
          />
        ) : (
          <Text style={[styles.logoFallbackText, { fontFamily: FONTS.SERIF }]}>
            LUMORA
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(customer)/search" as any)}
          style={styles.headerIconButton}
        >
          <Feather name="search" size={18} color={COLORS.TEXT_DARK} />
        </TouchableOpacity>
       {/* Nút Yêu Thích với Badge nhảy số đỏ */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(customer)/wishlist" as any)}
          style={styles.headerIconButton}
        >
          <Feather name="heart" size={18} color={COLORS.TEXT_DARK} />
          {totalWishlistCount > 0 && (
            <Animated.View style={styles.badge}>
              <Text style={[styles.badgeText, { fontFamily: FONTS.SANS }]}>
                {totalWishlistCount > 99 ? "99+" : totalWishlistCount}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(customer)/cart" as any)}
          style={styles.headerIconButton}
        >
          <Feather name="shopping-bag" size={18} color={COLORS.TEXT_DARK} />
          {cartCount > 0 && (
            <Animated.View
              style={[styles.badge, { transform: [{ scale: badgeScale }] }]}
            >
              <Text style={[styles.badgeText, { fontFamily: FONTS.SANS }]}>
                {cartCount}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View>
      <BannerCarousel banners={BANNERS} />

      <View style={styles.uspSection}>
        <View style={styles.uspContainer}>
          {USP_ITEMS.map((usp, idx) => (
            <React.Fragment key={usp.id}>
              <View style={styles.uspItem}>
                <View style={styles.uspIconContainer}>
                  <Feather
                    name={usp.icon}
                    size={14}
                    color={COLORS.ACCENT_WOOD}
                  />
                </View>
                <Text
                  style={[styles.uspTitle, { fontFamily: FONTS.SANS }]}
                  numberOfLines={1}
                >
                  {usp.title}
                </Text>
              </View>
              {idx < USP_ITEMS.length - 1 && <View style={styles.uspDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[sectionSubtitleStyle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
              KHÁM PHÁ
            </Text>
            <Text
              style={[styles.sectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}
              numberOfLines={1}
            >
              Không Gian Tuyển Chọn
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(customer)/shop" as any)}
            style={styles.sectionLink}
          >
            <Text style={[styles.sectionLinkText, { fontFamily: FONTS.SANS }]}>
              Tất Cả
            </Text>
            <Feather
              name="chevron-right"
              size={14}
              color={COLORS.ACCENT_WOOD}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={categoryFlatListRef}
          horizontal
          data={categoriesList}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
          snapToInterval={122}
          decelerationRate="fast"
          renderItem={({ item }: ListRenderItemInfo<Category>) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(item.id)}
                style={styles.categoryCard}
              >
                <View
                  style={[
                    styles.categoryImageWrapper,
                    isActive && styles.categoryImageWrapperActive,
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.categoryImage}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    { fontFamily: FONTS.SANS },
                    isActive && styles.categoryNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[sectionSubtitleStyle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'  }]}>
            BỘ SƯU TẬP
          </Text>
          <Text style={[styles.sectionTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }]}>
            Sản Phẩm Nổi Bật
          </Text>
        </View>
      </View>
    </View>
  );

const renderProductItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => {
      // Ép kiểu lấy đúng _id MongoDB của Backend
      const productId = String((item as any)._id || item.id);

      return (
        <ProductCard
          item={item}
          isWishlisted={wishlistIds.has(productId)}
          onToggleWishlist={() => toggleWishlist(productId)}
          onAddToCart={handleAddToCart}
          onPress={handleProductPress}
        />
      );
    },
    [wishlistIds, toggleWishlist, handleAddToCart, handleProductPress],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.ACCENT_WOOD}
              colors={[COLORS.ACCENT_WOOD]}
            />
          }
        >
          {renderListHeader()}

          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.productsGridContainer}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {/* Thông báo Toast khi bấm + Giỏ */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.toastLeft}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={COLORS.RATING_GOLD}
          />
          <Text style={[styles.toastText, { fontFamily: FONTS.SANS }]}>
            {toastMessage}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(customer)/cart" as any)}
        >
          <Text style={[styles.toastCTA, { fontFamily: FONTS.SANS }]}>
            Xem giỏ hàng
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const sectionSubtitleStyle = {
  fontSize: 11,
  fontWeight: "700" as const,
  color: COLORS.ACCENT_WOOD,
  textTransform: "uppercase" as const,
  marginBottom: 2,
};
