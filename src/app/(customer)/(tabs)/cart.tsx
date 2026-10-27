import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { formatCurrency, API_BASE_URL } from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'Didot' : 'serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

// Hàm chuẩn hóa đường dẫn ảnh từ Backend API
const getFullImageUrl = (rawImg: any) => {
  if (!rawImg || typeof rawImg !== 'string' || rawImg.trim().length === 0 || rawImg === 'string') {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600';
  }
  if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
    return rawImg;
  }
  return `${API_BASE_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
};

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, refreshCart } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State lưu danh sách ID sản phẩm được tích chọn mua
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCart();
    setIsRefreshing(false);
  };

  // Quét toàn bộ dữ liệu giỏ hàng từ Backend
  const formattedCartItems = useMemo(() => {
    return cart.map((item: any, index: number) => {
      const itemId = item._id || item.id || item.productId || `cart-item-${index}`;

      const variantObj = item.productVariant || item.productVariantId || item.variant || item.variantId;
      const productObj =
        (typeof variantObj === 'object' ? variantObj?.product || variantObj?.productId : null) ||
        (typeof item.product === 'object' ? item.product : null) ||
        (typeof item.productId === 'object' ? item.productId : null) ||
        item;

      const title =
        productObj?.name ||
        productObj?.title ||
        variantObj?.name ||
        variantObj?.title ||
        item.name ||
        item.title ||
        item.productName ||
        'Sản phẩm nội thất';

      const description =
        productObj?.description ||
        variantObj?.description ||
        item.description ||
        '';

      const price = Number(
        item.price ??
          item.unitPrice ??
          variantObj?.price ??
          productObj?.minPrice ??
          productObj?.price ??
          0
      );

      let rawImage = null;
      if (Array.isArray(productObj?.images) && productObj.images.length > 0) {
        rawImage = productObj.images[0];
      } else if (Array.isArray(variantObj?.images) && variantObj.images.length > 0) {
        rawImage = variantObj.images[0];
      } else {
        rawImage =
          productObj?.image ||
          variantObj?.image ||
          item.image ||
          item.imageUrl;
      }

      const image = getFullImageUrl(rawImage);

      const colorName =
        variantObj?.color?.name ||
        variantObj?.colorName ||
        item.selectedColor?.name ||
        item.color ||
        '';

      const optionName =
        variantObj?.option?.label ||
        variantObj?.optionName ||
        item.selectedOption?.label ||
        item.option ||
        '';

      return {
        originalItem: item,
        itemId,
        title,
        description,
        price,
        image,
        colorName,
        optionName,
        quantity: Number(item.quantity ?? item.qty ?? 1),
      };
    });
  }, [cart]);

  // Mặc định tích chọn TẤT CẢ sản phẩm khi giỏ hàng tải xong lần đầu
  useEffect(() => {
    if (formattedCartItems.length > 0) {
      const allIds = new Set(formattedCartItems.map((item) => item.itemId));
      setSelectedItemIds(allIds);
    } else {
      setSelectedItemIds(new Set());
    }
  }, [cart.length]);

  // Xử lý Bật/Tắt tích chọn từng sản phẩm
  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Kiếm tra đã chọn tất cả chưa
  const isAllSelected = useMemo(() => {
    return (
      formattedCartItems.length > 0 &&
      selectedItemIds.size === formattedCartItems.length
    );
  }, [formattedCartItems.length, selectedItemIds.size]);

  // Nút Chọn tất cả / Bỏ chọn tất cả
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      const allIds = new Set(formattedCartItems.map((item) => item.itemId));
      setSelectedItemIds(allIds);
    }
  };

  // Tính tổng tiền CHỈ cho các sản phẩm đã được tích chọn
  const { selectedSubtotal, shipping, selectedTotal, selectedCount } = useMemo(() => {
    const selectedItems = formattedCartItems.filter((item) => selectedItemIds.has(item.itemId));
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const ship =  0;
    return {
      selectedSubtotal: subtotal,
      shipping: ship,
      selectedTotal: subtotal + ship,
      selectedCount: selectedItems.length,
    };
  }, [formattedCartItems, selectedItemIds]);

  const handleRemove = (itemId: string, title: string) => {
    Alert.alert('Xác nhận xóa', `Bạn có muốn xóa "${title}" khỏi giỏ hàng?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };

  // Chuyển hướng thanh toán
  const handleCheckout = () => {
    if (selectedCount === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 sản phẩm để tiến hành thanh toán.');
      return;
    }
    router.push('/(customer)/checkout' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Giỏ Hàng Của Tôi</Text>

        <TouchableOpacity onPress={handleRefresh} style={styles.headerBtn} activeOpacity={0.7}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#8A6A48" />
          ) : (
            <Feather name="refresh-cw" size={18} color="#252525" />
          )}
        </TouchableOpacity>
      </View>

      {formattedCartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={64} color="#C8C2B8" />
          <Text style={[styles.emptyTitle, { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'}]}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySub}>Hãy khám phá bộ sưu tập nội thất độc bản của Lumora.</Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/shop' as any)}
            style={styles.shopNowBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowText}>KHÁM PHÁ NGAY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Thanh điều khiển Chọn Tất Cả */}
            <View style={styles.selectAllRow}>
              <TouchableOpacity
                onPress={handleToggleSelectAll}
                style={styles.checkboxTouch}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isAllSelected ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isAllSelected ? '#8A6A48' : '#8A8077'}
                />
                <Text style={styles.selectAllText}>
                  {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'} ({formattedCartItems.length})
                </Text>
              </TouchableOpacity>

              <Text style={styles.selectedCountText}>Đã chọn {selectedCount}</Text>
            </View>

            {/* Danh sách Sản Phẩm */}
            {formattedCartItems.map((item) => {
              const isSelected = selectedItemIds.has(item.itemId);

              return (
                <View key={item.itemId} style={[styles.cartCard, isSelected && styles.cartCardSelected]}>
                  {/* Checkbox tích chọn sản phẩm */}
                  <TouchableOpacity
                    onPress={() => toggleSelectItem(item.itemId)}
                    style={styles.itemCheckbox}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? '#8A6A48' : '#8A8077'}
                    />
                  </TouchableOpacity>

                  <Image source={{ uri: item.image }} style={styles.productImage} />

                  <View style={styles.productInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemove(item.itemId, item.title)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather name="trash-2" size={16} color="#D93838" />
                      </TouchableOpacity>
                    </View>

                    {item.colorName || item.optionName ? (
                      <Text style={styles.variantSpec}>
                        {[item.colorName, item.optionName].filter(Boolean).join(' / ')}
                      </Text>
                    ) : null}

                    {item.description ? (
                      <Text style={styles.productDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}

                    <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>

                    {/* Tăng / giảm số lượng */}
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.itemId, item.quantity - 1)}
                        style={styles.qtyBtn}
                      >
                        <Feather name="minus" size={12} color="#252525" />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item.itemId, item.quantity + 1)}
                        style={styles.qtyBtn}
                      >
                        <Feather name="plus" size={12} color="#252525" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Tổng quan đơn hàng */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>TỔNG QUAN ĐƠN HÀNG ({selectedCount} SẢN PHẨM)</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính tiền hàng</Text>
                <Text style={styles.summaryValue}>{formatCurrency(selectedSubtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí giao hàng White-Glove</Text>
                <Text style={[styles.summaryValue, shipping === 0 && { color: '#8A6A48', fontWeight: '700' }]}>
                  {shipping === 0 ? 'Miễn phí vận chuyển' : formatCurrency(shipping)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalValue}>{formatCurrency(selectedTotal)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Thanh toán */}
          <View style={styles.checkoutBar}>
            <TouchableOpacity
              onPress={handleCheckout}
              style={[styles.checkoutBtn, selectedCount === 0 && styles.checkoutBtnDisabled]}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutText}>
                TIẾN HÀNH THANH TOÁN ({selectedCount})
              </Text>
              <Feather name="arrow-right" size={16} color="#efa802" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F4EE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2b221d' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEAE2',
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#252525',
  },
  selectedCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6A48',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    alignItems: 'center',
  },
  cartCardSelected: {
    borderColor: '#8A6A48',
    backgroundColor: '#FAF8F5',
  },
  itemCheckbox: {
    paddingRight: 10,
    justifyContent: 'center',
  },
  productImage: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#E9E1D5' },
  productInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productTitle: { fontSize: 13.5, fontWeight: '700', color: '#252525', flex: 1, marginRight: 8 },
  variantSpec: { fontSize: 11, fontWeight: '600', color: '#8A6A48', marginTop: 2 },
  productDesc: { fontSize: 11, color: '#7A7067', marginTop: 2, lineHeight: 15 },
  productPrice: { fontSize: 13.5, fontWeight: '700', color: '#8A6A48', marginVertical: 4 },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    borderRadius: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 13, fontWeight: '700', color: '#252525', marginHorizontal: 12 },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EFEAE2',
  },
  summaryTitle: { fontSize: 11, fontWeight: '700', color: '#8A6A48', letterSpacing: 1, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#6E6860' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#070707' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E2DBD0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#252525' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#763e02' },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F4EE',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
  },
  checkoutBtn: {
    height: 48,
    backgroundColor: '#351c03',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#d1bf99',
    opacity: 0.7,
  },
  checkoutText: { color: '#efa802', fontSize: 13, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, color: '#252525', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#7A7067', textAlign: 'center', marginBottom: 24 },
  shopNowBtn: { backgroundColor: '#252525', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  shopNowText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});