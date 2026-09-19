import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  FlatList,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { styles, COLORS } from './LumoraHomeScreen.styles';
import {
  BANNERS,
  USP_ITEMS,
  CATEGORIES,
  FILTER_TABS,
  MOCK_PRODUCTS,
  LOOKBOOK_ITEM,
  BRAND_PILLARS,
  BRAND_LOGO_URI,
  Product,
  Category,
} from '@/services/mockData';
import { useApp } from '@/context/AppContext';
import { BannerCarousel } from './BannerCarousel';
import { SkeletonLoader } from '../ui/SkeletonLoader';

// ============================================================================
// ANIMATED WISHLIST BUTTON COMPONENT
// ============================================================================
interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: () => void;
}

const WishlistButton = React.memo<WishlistButtonProps>(({ isWishlisted, onToggle }) => {
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
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={18}
          color={isWishlisted ? '#D93838' : COLORS.TEXT_DARK}
        />
      </Animated.View>
    </Pressable>
  );
});

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================
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
              <Text style={styles.productPrice}>${item.price.toLocaleString()}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ${item.originalPrice.toLocaleString()}
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
  }
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LumoraHomeScreen() {
  const router = useRouter();
  const { cartCount, addToCart, wishlistIds, toggleWishlist } = useApp();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [activeFilter, setActiveFilter] = useState('featured');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const badgeScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(40)).current;

  // Simulate Data Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Pull to Refresh Handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Trigger Cart Badge Micro-animation
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

  // Trigger Toast Notification
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
    [toastOpacity, toastTranslateY]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      triggerCartAnimation();
      showToast(product.title);
    },
    [addToCart, triggerCartAnimation, showToast]
  );

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/(customer)/product/${productId}` as any);
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      if (categoryId !== 'cat-all') {
        router.push(`/(customer)/category/${categoryId}` as any);
      }
    },
    [router]
  );

  // Filter products cleanly
  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    if (selectedCategory !== 'cat-all') {
      if (prod.categorySlug !== selectedCategory) {
        return false;
      }
    }
    if (activeFilter === 'featured') return true;
    return prod.filterType === activeFilter;
  });

  // Render Header Bar
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(customer)/home' as any)}
        style={styles.logoWrapper}
      >
        {!logoError ? (
          <Image
            source={require('@/assets/images/lumora-logo.png')}
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
          onPress={() => router.push('/(customer)/search' as any)}
          style={styles.headerIconButton}
        >
          <Feather name="search" size={18} color={COLORS.TEXT_DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/wishlist' as any)}
          style={styles.headerIconButton}
        >
          <Feather name="heart" size={18} color={COLORS.TEXT_DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/cart' as any)}
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

  // Modular ListHeaderComponent
  const renderListHeader = () => (
    <View>
      {/* Search Trigger Bar */}
      <Pressable
        onPress={() => router.push('/(customer)/search' as any)}
        style={styles.searchContainer}
      >
        <Feather name="search" size={18} color={COLORS.TEXT_MUTED} />
        <Text style={styles.searchPlaceholder}>
          Tìm kiếm bàn ăn gỗ sồi, sofa nỉ, đèn trang trí...
        </Text>
        <View style={styles.filterIconButton}>
          <Feather name="sliders" size={16} color={COLORS.ACCENT_WOOD} />
        </View>
      </Pressable>

      {/* Banner Carousel */}
      <BannerCarousel banners={BANNERS} />

      {/* USP Highlights Ticker */}
      <View style={styles.uspSection}>
        <View style={styles.uspContainer}>
          {USP_ITEMS.map((usp, idx) => (
            <React.Fragment key={usp.id}>
              <View style={styles.uspItem}>
                <View style={styles.uspIconContainer}>
                  <Feather name={usp.icon} size={15} color={COLORS.ACCENT_WOOD} />
                </View>
                <View style={styles.uspTextGroup}>
                  <Text style={styles.uspTitle}>{usp.title}</Text>
                  <Text style={styles.uspSubtitle}>{usp.subtitle}</Text>
                </View>
              </View>
              {idx < USP_ITEMS.length - 1 && <View style={styles.uspDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Categories Carousel */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={sectionSubtitleStyle}>KHÁM PHÁ</Text>
            <Text style={styles.sectionTitle}>Không Gian Tuyển Chọn</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/shop' as any)}
            style={styles.sectionLink}
          >
            <Text style={styles.sectionLinkText}>Tất Cả Danh Mục</Text>
            <Feather name="chevron-right" size={14} color={COLORS.ACCENT_WOOD} />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
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
                  <Image source={{ uri: item.image }} style={styles.categoryImage} />
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

      {/* Editorial Lookbook Showcase */}
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
            <Feather name="arrow-up-right" size={16} color={COLORS.ACCENT_WOOD} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Filter Tabs Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={sectionSubtitleStyle}>BỘ SƯU TẬP</Text>
          <Text style={styles.sectionTitle}>Sản Phẩm Nổi Bật</Text>
        </View>
      </View>

      {/* Filter Tabs Pills */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.id)}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
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

  // Modular ListFooterComponent
  const renderListFooter = () => (
    <View style={styles.pillarsContainer}>
      <Text style={styles.pillarHeaderTitle}>CAM KẾT TỪ LUMORA</Text>
      <Text style={styles.pillarHeaderSubtitle}>
        Chế tác thủ công tinh xảo & sử dụng nguyên liệu bền vững.
      </Text>

      <View style={styles.pillarGrid}>
        {BRAND_PILLARS.map((p) => (
          <View key={p.id} style={styles.pillarItem}>
            <Ionicons name={p.icon as any} size={18} color={COLORS.ACCENT_WOOD} />
            <Text style={styles.pillarItemText}>{p.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Empty State Component
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Feather name="inbox" size={40} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyStateTitle}>Chưa có sản phẩm nào</Text>
      <Text style={styles.emptyStateSub}>
        Vui lòng chọn bộ lọc khác để khám phá các sản phẩm nội thất.
      </Text>
    </View>
  );

  // Render Product Card Wrapper
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
    [wishlistIds, toggleWishlist, handleAddToCart, handleProductPress]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.PRIMARY_BG} />

      {/* Header Bar */}
      {renderHeader()}

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productsGridContainer}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.ACCENT_WOOD}
              colors={[COLORS.ACCENT_WOOD]}
            />
          }
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Toast Feedback Banner */}
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
          <Ionicons name="checkmark-circle" size={20} color={COLORS.RATING_GOLD} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/cart' as any)}>
          <Text style={styles.toastCTA}>Xem giỏ hàng</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const sectionSubtitleStyle = {
  fontSize: 11,
  fontWeight: '700' as const,
  color: COLORS.ACCENT_WOOD,
  letterSpacing: 1.5,
  textTransform: 'uppercase' as const,
  marginBottom: 2,
};
