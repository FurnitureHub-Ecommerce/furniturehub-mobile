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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonLoader } from "../ui/SkeletonLoader";
import { BannerCarousel } from "./BannerCarousel";
import { COLORS, styles } from "./LumoraHomeScreen.styles";
import { getProductsApi, getCategoriesApi } from "@/services/api";
import { ScrollView } from "react-native";

const API_BASE_URL = "https://api-furniturehub-minhdevops.up.railway.app";

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
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {item.tag && (
            <View style={styles.badgeTag}>
              <Text style={styles.badgeTagText}>{item.tag}</Text>
            </View>
          )}
          <WishlistButton
            isWishlisted={isWishlisted}
            onToggle={() => onToggleWishlist(item.id)}
          />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.RATING_GOLD} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.productPrice}>
                ${item.price?.toLocaleString()}
              </Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ${item.originalPrice?.toLocaleString()}
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              style={styles.addBagButton}
            >
              <Feather name="plus" size={13} color={COLORS.WHITE} />
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

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("cat-all");
  const [activeFilter, setActiveFilter] = useState("featured");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const badgeScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(40)).current;

  // Ref và state cho hiệu ứng tự động trượt ngang danh mục
  const categoryFlatListRef = useRef<FlatList<Category>>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    if (!categoriesList || categoriesList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveCategoryIndex((prev) => {
        const nextIndex = (prev + 1) % categoriesList.length;
        categoryFlatListRef.current?.scrollToOffset({
          offset: nextIndex * 122,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [categoriesList?.length]);

  // Gọi API lấy dữ liệu sản phẩm và danh mục từ Backend
  const fetchHomeData = async () => {
    try {
      // Gọi trực tiếp các hàm service từ api.ts đã được nhóm định nghĩa chuẩn xác
      const [prodData, catData] = await Promise.all([
        getProductsApi(),
        getCategoriesApi(),
      ]);

      // Xử lý dữ liệu sản phẩm từ API
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
          category: item.categoryName || item.categoryId?.name || "Nội Thất",
          brand: item.brandId?.name || item.brand || "LUMORA",
          categorySlug: item.categoryId?._id || item.categoryId || "cat-all",
          rating: item.rating || 4.9,
          reviewCount: item.reviewCount || 12,
          tag: item.tag,
          colors: item.colors || [],
          filterType: "featured",
        };
      });

      setProducts(formattedProducts);

      // Xử lý dữ liệu danh mục từ API
      const rawCategories = Array.isArray(catData)
        ? catData
        : catData.categories || catData.data || [];

      const categoryImages: { [key: string]: string } = {
        "Home Decor & Lighting":
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600",
        "TV Units & Media":
          "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600",
        "Bookshelves & Shelving":
          "https://images.unsplash.com/photo-1594626115570-360216091216?q=80&w=600",
        "Coffee & Side Tables":
          "https://images.unsplash.com/photo-1533779283484-8ab494547477?q=80&w=600",
        "Wardrobes & Cabinets":
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600",
        "Office Desks & Chairs":
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600",
        "Dining Tables & Chairs":
          "https://images.unsplash.com/photo-1617806118233-18e1c0c6720d?q=80&w=600",
        "Beds & Mattresses":
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600",
        "Sofa & Armchair":
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
      };

      const formattedCategories = rawCategories.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        image:
          categoryImages[cat.name] ||
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600",
      }));

      setCategoriesList([
        {
          id: "cat-all",
          name: "Tất Cả",
          image:
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
        },
        ...formattedCategories,
      ]);
    } catch (error) {
      console.log("Lỗi tải dữ liệu từ API:", error);
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

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      triggerCartAnimation();
      showToast(product.title);
    },
    [addToCart, triggerCartAnimation, showToast],
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

  const filteredProducts = products.filter((prod) => {
    if (
      selectedCategory !== "cat-all" &&
      prod.categorySlug !== selectedCategory
    ) {
      return false;
    }
    if (activeFilter === "featured") return true;
    if (activeFilter === "new" && prod.tag === "Mới") return true;
    if (activeFilter === "bestseller" && prod.tag === "Bán chạy") return true;
    return true;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(customer)/home" as any)}
        style={styles.logoWrapper}
      >
        {!logoError ? (
          <Image
            source={require("@/assets/images/lumora-logo.png")}
            style={styles.logoImage}
            onError={() => setLogoError(true)}
          />
        ) : (
          <Text style={styles.logoFallbackText}>LUMORA</Text>
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(customer)/wishlist" as any)}
          style={styles.headerIconButton}
        >
          <Feather name="heart" size={18} color={COLORS.TEXT_DARK} />
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
              <Text style={styles.badgeText}>{cartCount}</Text>
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
                <Text style={styles.uspTitle} numberOfLines={1}>
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
            <Text style={sectionSubtitleStyle}>KHÁM PHÁ</Text>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              Không Gian Tuyển Chọn
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(customer)/shop" as any)}
            style={styles.sectionLink}
          >
            <Text style={styles.sectionLinkText}>Tất Cả</Text>
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
          getItemLayout={(_, index) => ({
            length: 122,
            offset: 122 * index,
            index,
          })}
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

      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() =>
          router.push(`/(customer)/editorial/${LOOKBOOK_ITEM.id}` as any)
        }
        style={styles.lookbookContainer}
      >
        <View style={styles.lookbookImageContainer}>
          <Image
            source={{ uri: LOOKBOOK_ITEM.image }}
            style={styles.lookbookImage}
          />
          <View style={styles.lookbookBadge}>
            <Text style={styles.lookbookBadgeText}>{LOOKBOOK_ITEM.tag}</Text>
          </View>
        </View>
        <View style={styles.lookbookContent}>
          <Text style={styles.lookbookTitle}>{LOOKBOOK_ITEM.title}</Text>
          <Text style={styles.lookbookDesc}>{LOOKBOOK_ITEM.description}</Text>
          <View style={styles.lookbookFooter}>
            <View style={styles.lookbookAuthor}>
              <Image
                source={{ uri: LOOKBOOK_ITEM.authorAvatar }}
                style={styles.lookbookAvatar}
              />
              <Text style={styles.lookbookAuthorName}>
                Tuyển chọn bởi {LOOKBOOK_ITEM.author}
              </Text>
            </View>
            <Feather
              name="arrow-up-right"
              size={16}
              color={COLORS.ACCENT_WOOD}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={sectionSubtitleStyle}>BỘ SƯU TẬP</Text>
          <Text style={styles.sectionTitle}>Sản Phẩm Nổi Bật</Text>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.id)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderListFooter = () => (
    <View style={styles.webFooterContainer}>
      {/* Cột 1: Thông tin thương hiệu */}
      <View style={styles.footerColMain}>
        <Text style={styles.footerLogo}>LUMORA</Text>
        <Text style={styles.footerStudio}>STUDIO</Text>
        <Text style={styles.footerDesc}>
          Nội thất cao cấp hiện đại được chế tác với tư duy kiến trúc, kết cấu gỗ mộc tự nhiên và chủ nghĩa tối giản tinh tế. Được thiết kế cho sự bền vững trường tồn.
        </Text>
        <View style={styles.socialIconsRow}>
          <View style={styles.socialIconBox}><Ionicons name="logo-instagram" size={16} color="#E2DBD0" /></View>
          <View style={styles.socialIconBox}><Ionicons name="logo-pinterest" size={16} color="#E2DBD0" /></View>
          <View style={styles.socialIconBox}><Ionicons name="logo-facebook" size={16} color="#E2DBD0" /></View>
        </View>
      </View>

      <View style={styles.footerDivider} />

      {/* Cột 2: Bộ Sưu Tập */}
      <View style={styles.footerCol}>
        <Text style={styles.footerHeading}>Bộ Sưu Tập</Text>
        <Text style={styles.footerItem}>Không Gian Wabi-Sabi</Text>
        <Text style={styles.footerItem}>Phòng Ăn Solace</Text>
        <Text style={styles.footerItem}>Thiền Viện Bắc Âu</Text>
        <Text style={styles.footerItem}>Studio Kiến Trúc</Text>
        <Text style={styles.footerItem}>Đèn & Đồ Trang Trí</Text>
      </View>

      {/* Cột 3: Chăm Sóc Khách Hàng */}
      <View style={styles.footerCol}>
        <Text style={styles.footerHeading}>Chăm Sóc Khách Hàng</Text>
        <Text style={styles.footerItem}>Dịch Vụ Concierge Cao Cấp</Text>
        <Text style={styles.footerItem}>Mẫu Vải Tùy Chỉnh</Text>
        <Text style={styles.footerItem}>Chi Tiết Bảo Hành 10 Năm</Text>
        <Text style={styles.footerItem}>Vận Chuyển & Bù Đắp Carbon</Text>
        <Text style={styles.footerItem}>Đăng Ký Chương Trình Đối Tác</Text>
      </View>

      {/* Cột 4: Cửa Hàng Trưng Bày */}
      <View style={styles.footerCol}>
        <Text style={styles.footerHeading}>Cửa Hàng Trưng Bày</Text>
        <Text style={styles.footerStoreTitle}>Kyoto Studio:</Text>
        <Text style={styles.footerStoreSub}>Quận Gion, Higashiyama, Kyoto 605-0074</Text>
        
        <Text style={[styles.footerStoreTitle, { marginTop: 10 }]}>New York Flagship:</Text>
        <Text style={styles.footerStoreSub}>452 Broome St, SoHo, NY 10013</Text>

        <Text style={[styles.footerStoreTitle, { marginTop: 10 }]}>Copenhagen:</Text>
        <Text style={styles.footerStoreSub}>Store Kongensgade 48, 1264 København</Text>
      </View>

      {/* Đáy footer: Bản quyền & chính sách */}
      <View style={styles.footerBottomBar}>
        <Text style={styles.footerCopy}>© 2026 LUMORA Studio Inc. Bảo lưu mọi quyền.</Text>
        <View style={styles.footerBottomLinks}>
          <Text style={styles.footerBottomLinkText}>Chính Sách Bảo Mật</Text>
          <Text style={styles.footerBottomLinkText}>Điều Khoản</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="inbox" size={40} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyStateTitle}>Chưa có sản phẩm nào</Text>
      <Text style={styles.emptyStateSub}>
        Vui lòng chọn bộ lọc khác để khám phá các sản phẩm nội thất.
      </Text>
    </View>
  );

  const renderProductItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard
        item={item}
        isWishlisted={wishlistIds.has(item.id)}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onPress={handleProductPress}
      />
    ),
    [wishlistIds, toggleWishlist, handleAddToCart, handleProductPress],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.PRIMARY_BG} />
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
          {/* Phần header phía trên của danh sách (Banner, USP, Danh mục, Lưới sản phẩm) */}
          {renderListHeader()}

          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.productsGridContainer}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false} // Tắt cuộn của FlatList để dùng chung ScrollView tổng
          />

          {/* Đưa Footer ra ngoài FlatList để nó có thể tràn full 100% chiều ngang màn hình */}
          {renderListFooter()}
        </ScrollView>
      )}

      {/* Toast Notification giữ nguyên */}
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
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(customer)/cart" as any)}
        >
          <Text style={styles.toastCTA}>Xem giỏ hàng</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const sectionSubtitleStyle = {
  fontSize: 11,
  fontWeight: "700" as const,
  color: COLORS.ACCENT_WOOD,
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
  marginBottom: 2,
};
