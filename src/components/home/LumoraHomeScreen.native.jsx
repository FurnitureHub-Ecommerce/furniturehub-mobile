import React, { useState, useCallback, useRef } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles, COLORS } from './LumoraHomeScreen.styles';

// ============================================================================
// REALISTIC MOCK DATASETS
// ============================================================================

const BRAND_LOGO_URI =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80'; // Stylized placeholder logo image

const HERO_BANNER = {
  id: 'hero-1',
  tag: 'BỘ SƯU TẬP MÙA THU 2026',
  title: 'Nghệ Thuật Sống Tối Giản',
  image:
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
  ctaText: 'Khám Phá Bộ Sưu Tập',
  categoryId: 'living',
};

const USP_ITEMS = [
  {
    id: 'usp-1',
    icon: 'truck',
    title: 'Giao Hàng Cao Cấp',
    subtitle: 'Hỗ trợ sắp xếp tận nơi',
  },
  {
    id: 'usp-2',
    icon: 'shield',
    title: 'Bảo Hành Chế Tác 10 Năm',
    subtitle: 'Bền bỉ vượt thời gian',
  },
  {
    id: 'usp-3',
    icon: 'award',
    title: 'Gỗ Sồi Tự Nhiên Bền Vững',
    subtitle: 'Gỗ đạt chứng nhận FSC',
  },
];

const CATEGORIES = [
  {
    id: 'cat-all',
    name: 'Tất Cả Sản Phẩm',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-living',
    name: 'Phòng Khách',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-dining',
    name: 'Phòng Ăn',
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-bedroom',
    name: 'Phòng Ngủ',
    image:
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-workspace',
    name: 'Phòng Làm Việc',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cat-lighting',
    name: 'Đèn & Chiếu Sáng',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80',
  },
];

const FILTER_TABS = [
  { id: 'featured', label: 'Nổi Bật Tuyển Chọn' },
  { id: 'new', label: 'Hàng Mới Về' },
  { id: 'bestsellers', label: 'Bán Chạy Nhất' },
];

const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Ghế Bành Vải Bouclé Mềm Aethel',
    category: 'Phòng Khách',
    categorySlug: 'living',
    price: 1280,
    originalPrice: 1450,
    rating: 4.9,
    reviewCount: 42,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
    category: 'Phòng Ăn',
    categorySlug: 'dining',
    price: 2450,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 28,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    title: 'Đèn Thả Trần Đồng Thau Solis',
    category: 'Đèn & Chiếu Sáng',
    categorySlug: 'lighting',
    price: 490,
    originalPrice: 580,
    rating: 4.8,
    reviewCount: 65,
    tag: 'TUYỂN CHỌN',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    title: 'Giường Ngủ Kiểu Nhật Gỗ Nara',
    category: 'Phòng Ngủ',
    categorySlug: 'bedroom',
    price: 2890,
    originalPrice: 3200,
    rating: 4.95,
    reviewCount: 19,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    title: 'Bàn Làm Việc Gỗ Óc Chó Verve',
    category: 'Phòng Làm Việc',
    categorySlug: 'workspace',
    price: 1850,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 31,
    tag: 'NỔI BẬT',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    title: 'Sofa Góc Nỉ Nhung Cao Cấp Oasis',
    category: 'Phòng Khách',
    categorySlug: 'living',
    price: 3600,
    originalPrice: 4100,
    rating: 4.98,
    reviewCount: 84,
    tag: 'BÁN CHẠY',
    filterType: 'bestsellers',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-7',
    title: 'Bàn Trà Đá Travertine Marquinia',
    category: 'Phòng Khách',
    categorySlug: 'living',
    price: 1150,
    originalPrice: null,
    rating: 4.85,
    reviewCount: 15,
    tag: 'MỚI',
    filterType: 'new',
    image:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-8',
    title: 'Thảm Dệt Tay Sợi Lông Cừu Lumina',
    category: 'Trang Trí',
    categorySlug: 'decor',
    price: 780,
    originalPrice: 890,
    rating: 4.9,
    reviewCount: 52,
    tag: 'NỔI BẬT',
    filterType: 'featured',
    image:
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80',
  },
];

const LOOKBOOK_ITEM = {
  id: 'lb-1',
  tag: 'BÀI VIẾT NỔI BẬT',
  title: 'Phong Cách Tối Giản Ấm Cúng: Cân Bằng Không Gian Trong Ngôi Nhà Hiện Đại',
  description:
    'Khám phá nghệ thuật kết hợp chất liệu tự nhiên, vải bouclé mềm mại và gỗ sồi nguyên khối từ các kiến trúc sư.',
  image:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  author: 'Elena Rostova',
  authorAvatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

const BRAND_PILLARS = [
  { id: 'p1', icon: 'leaf-outline', title: 'Gỗ Sồi Bền Vững' },
  { id: 'p2', icon: 'hammer-outline', title: 'Thợ Thủ Công Bậc Thầy' },
  { id: 'p3', icon: 'sparkles-outline', title: 'Thiết Kế Theo Yêu Cầu' },
  { id: 'p4', icon: 'shield-checkmark-outline', title: 'Bảo Hành 10 Năm' },
];

// ============================================================================
// ANIMATED WISHLIST BUTTON COMPONENT
// ============================================================================
const WishlistButton = React.memo(({ isWishlisted, onToggle }) => {
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
const ProductCard = React.memo(({ item, isWishlisted, onToggleWishlist, onAddToCart, onPress }) => {
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
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LumoraHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [activeFilter, setActiveFilter] = useState('featured');
  const [wishlistIds, setWishlistIds] = useState(new Set(['prod-1', 'prod-3']));
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState(null);

  // Animations
  const badgeScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(40)).current;

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
    (productName) => {
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

  // Handlers
  const handleToggleWishlist = useCallback((productId) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      setCartCount((c) => c + 1);
      triggerCartAnimation();
      showToast(product.title);
    },
    [triggerCartAnimation, showToast]
  );

  const handleProductPress = useCallback(
    (productId) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (categoryId) => {
      setSelectedCategory(categoryId);
      if (categoryId !== 'cat-all') {
        router.push(`/category/${categoryId}`);
      }
    },
    [router]
  );

  // Filter products cleanly
  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    if (selectedCategory !== 'cat-all') {
      const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
      if (catObj && prod.category.toLowerCase() !== catObj.name.toLowerCase()) {
        return false;
      }
    }
    if (activeFilter === 'featured') return true;
    return prod.filterType === activeFilter;
  });

  const [logoError, setLogoError] = useState(false);

  // Render Header
  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/')}
        style={styles.logoWrapper}
      >
        {!logoError ? (
          <Image
            source={{ uri: BRAND_LOGO_URI }}
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
          onPress={() => router.push('/search')}
          style={styles.headerIconButton}
        >
          <Feather name="search" size={18} color={COLORS.TEXT_DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/wishlist')}
          style={styles.headerIconButton}
        >
          <Feather name="heart" size={18} color={COLORS.TEXT_DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/cart')}
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
        onPress={() => router.push('/search')}
        style={styles.searchContainer}
      >
        <Feather name="search" size={18} color={COLORS.TEXT_MUTED} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm bàn ăn gỗ sồi, sofa nỉ, đèn trang trí...</Text>
        <View style={styles.filterIconButton}>
          <Feather name="sliders" size={16} color={COLORS.ACCENT_WOOD} />
        </View>
      </Pressable>

      {/* Hero Banner */}
      <TouchableOpacity
        activeOpacity={0.94}
        onPress={() => router.push(`/category/${HERO_BANNER.categoryId}`)}
        style={styles.heroContainer}
      >
        <Image source={{ uri: HERO_BANNER.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTag}>{HERO_BANNER.tag}</Text>
          <Text style={styles.heroTitle}>{HERO_BANNER.title}</Text>
          <View style={styles.heroCTA}>
            <Text style={styles.heroCTAText}>{HERO_BANNER.ctaText}</Text>
            <Feather name="arrow-right" size={14} color={COLORS.WHITE} />
          </View>
        </View>
      </TouchableOpacity>

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
            onPress={() => router.push('/shop')}
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
          snapToInterval={106} // width 92 + gap 14
          renderItem={({ item }) => {
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
        onPress={() => router.push('/editorial/lookbook-1')}
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
            <Ionicons name={p.icon} size={18} color={COLORS.ACCENT_WOOD} />
            <Text style={styles.pillarItemText}>{p.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render Product Card Wrapper
  const renderProductItem = useCallback(
    ({ item }) => (
      <ProductCard
        item={item}
        isWishlisted={wishlistIds.has(item.id)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onPress={handleProductPress}
      />
    ),
    [wishlistIds, handleToggleWishlist, handleAddToCart, handleProductPress]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.PRIMARY_BG} />
      
      {/* Header Bar */}
      {renderHeader()}

      {/* SINGLE PARENT FLATLIST (Virtualization optimized, NO nested VirtualizedLists) */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productsGridContainer}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        // Performance Tuning Props
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />

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
        <Text style={styles.toastCTA}>Xem giỏ hàng</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const sectionSubtitleStyle = {
  fontSize: 11,
  fontWeight: '700',
  color: COLORS.ACCENT_WOOD,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  marginBottom: 2,
};
