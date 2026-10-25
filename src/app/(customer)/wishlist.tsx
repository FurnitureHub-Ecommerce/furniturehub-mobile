import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/context/AppContext';
import {
  getWishlistApi,
  getProductsApi,
  formatCurrency,
  API_BASE_URL,
} from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'Didot' : 'serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

const getFullImageUrl = (rawImg: any) => {
  if (!rawImg || typeof rawImg !== 'string' || rawImg.trim().length === 0 || rawImg === 'string') {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600';
  }
  if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
    return rawImg;
  }
  return `${API_BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
};

export default function WishlistScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart } = useApp();

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchWishlistData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await AsyncStorage.getItem('token');

      // 1. Tải song song All Products & Wishlist từ Server
      const [wishlistRes, productsRes] = await Promise.all([
        getWishlistApi(token || undefined).catch((err) => {
          console.warn('[WISHLIST API ERROR]:', err);
          return null;
        }),
        getProductsApi().catch(() => []),
      ]);

      const allProducts = Array.isArray(productsRes)
        ? productsRes
        : productsRes?.data || productsRes?.products || [];

      // Bóc tách dữ liệu linh hoạt từ mọi kiểu response của NestJS
      let rawWishlist: any[] = [];
      if (Array.isArray(wishlistRes)) {
        rawWishlist = wishlistRes;
      } else if (wishlistRes && typeof wishlistRes === 'object') {
        rawWishlist =
          wishlistRes.data ||
          wishlistRes.wishlist ||
          wishlistRes.items ||
          wishlistRes.products ||
          [];
      }

      console.log('===> RAW WISHLIST FROM SERVER:', rawWishlist);
      console.log('===> LOCAL WISHLIST IDS IN CONTEXT:', Array.from(wishlistIds || []));

      // 2. Thu thập toàn bộ ID cần hiển thị
      const targetIds = new Set<string>();

      // Thêm ID từ Server Response
      rawWishlist.forEach((item: any) => {
        if (typeof item === 'string') {
          targetIds.add(String(item));
        } else if (item && typeof item === 'object') {
          const pObj = item.productId || item.product || item;
          const pId = typeof pObj === 'string' ? pObj : pObj?._id || pObj?.id;
          if (pId) targetIds.add(String(pId));
        }
      });

      // BẮT BỤC: Thêm cả ID có trong wishlistIds local (kể cả server chưa kịp sync)
      if (wishlistIds && wishlistIds.size > 0) {
        wishlistIds.forEach((id) => targetIds.add(String(id)));
      }

      // 3. Khôi phục danh sách sản phẩm thật
      const resultMap = new Map<string, any>();

      // Tầng 1: Lấy các sản phẩm đã được Backend Populate sẵn
      rawWishlist.forEach((item: any) => {
        const pObj = item.productId || item.product;
        if (pObj && typeof pObj === 'object' && (pObj.name || pObj.title || pObj._id)) {
          const pId = String(pObj._id || pObj.id);
          if (pId) resultMap.set(pId, pObj);
        }
      });

      // Tầng 2: Quét toàn bộ allProducts để nhặt ra các món có ID nằm trong targetIds
      allProducts.forEach((p: any) => {
        const pId = String(p._id || p.id);
        if (targetIds.has(pId) && !resultMap.has(pId)) {
          resultMap.set(pId, p);
        }
      });

      // 4. Định dạng hiển thị
      const formatted = Array.from(resultMap.values()).map((productObj) => {
        const id = String(productObj._id || productObj.id);
        const title = productObj.name || productObj.title || 'Sản phẩm nội thất';
        const price = Number(productObj.minPrice ?? productObj.price ?? 0);

        let rawImage = null;
        if (Array.isArray(productObj.images) && productObj.images.length > 0) {
          rawImage = productObj.images[0];
        } else {
          rawImage = productObj.image || productObj.imageUrl;
        }

        return {
          originalProduct: productObj,
          id,
          title,
          price,
          image: getFullImageUrl(rawImage),
        };
      });

      setWishlistProducts(formatted);
    } catch (error) {
      console.warn('Lỗi hiển thị Wishlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [wishlistIds]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
    setWishlistProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color="#2A2421" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontFamily: FONTS.SERIF }]}>
          Sản Phẩm Yêu Thích ({wishlistProducts.length})
        </Text>

        <TouchableOpacity
          onPress={() => fetchWishlistData(true)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={15} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
        </View>
      ) : wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={56} color="#C2B8A3" />
          <Text style={[styles.emptyTitle, { fontFamily: FONTS.SERIF }]}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySub}>
            Nhấn vào biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại danh sách này.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/shop' as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>KHÁM PHÁ BỘ SƯU TẬP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWishlistData(true)}
              tintColor="#8A6A48"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <TouchableOpacity
                onPress={() => router.push(`/(customer)/product/${item.id}` as any)}
                style={styles.cardContent}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price)}
                  </Text>

                  <TouchableOpacity
                    onPress={async () => {
                      await addToCart(item.originalProduct);
                      router.push('/(customer)/cart' as any);
                    }}
                    style={styles.addBagBtn}
                    activeOpacity={0.8}
                  >
                    <Feather name="shopping-bag" size={12} color="#FFFFFF" />
                    <Text style={styles.addBagText}>Chuyển Vào Giỏ</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemove(item.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart" size={20} color="#D93838" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F4EE' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { marginTop: 10, fontSize: 12.5, color: '#7A7067' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D8',
    backgroundColor: '#F7F4EE',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE2D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2A2421' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#2A2421', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 12.5, color: '#7A7067', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  exploreBtn: { backgroundColor: '#8A6A48', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 22 },
  exploreBtnText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700', letterSpacing: 1 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 12,
  },
  cardContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#FAF7F2' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 13.5, fontWeight: '700', color: '#2A2421', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#8A6A48', marginBottom: 8 },
  addBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A6A48',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  addBagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  removeBtn: { padding: 6, marginLeft: 8 },
});