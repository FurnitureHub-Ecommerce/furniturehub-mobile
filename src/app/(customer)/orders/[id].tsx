import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getOrderDetailApi, cancelOrderApi, OrderItem, formatCurrency } from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'Didot' : 'serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetId = (params.id || params.orderId) as string;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!targetId) {
        setErrorMsg('Mã đơn hàng không hợp lệ');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await getOrderDetailApi(targetId);
        setOrder(data);
      } catch (err: any) {
        console.warn('Lỗi lấy API chi tiết đơn hàng:', err);
        setErrorMsg(err.message || 'Không thể lấy dữ liệu đơn hàng từ máy chủ');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [targetId]);

  const isPending =
    order?.status?.toLowerCase() === 'pending' ||
    order?.status?.toLowerCase() === 'chờ xử lý' ||
    order?.status?.toLowerCase() === 'processing';

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy Đơn Hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Giữ Lại Đơn', style: 'cancel' },
        {
          text: 'Xác Nhận Hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelOrderApi(order?.id || targetId || '');
              if (order) {
                setOrder({
                  ...order,
                  status: 'cancelled',
                  statusLabel: 'Đã Hủy',
                });
              }
              Alert.alert('Thành Công', 'Đơn hàng của bạn đã được hủy.');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể hủy đơn hàng vào lúc này.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = (status?: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
      case 'đã giao hàng':
        return { bg: '#E2F0D9', text: '#2E7D32', label: 'Đã Giao Hàng' };
      case 'in_transit':
      case 'đang giao hàng':
      case 'đang vận chuyển':
        return { bg: '#F5EBE1', text: '#8A6A48', label: 'Đang Vận Chuyển' };
      case 'pending':
      case 'chờ xử lý':
        return { bg: '#FEF5E7', text: '#E67E22', label: 'Chờ Xử Lý' };
      case 'rejected':
      case 'cancelled':
      case 'đã hủy':
        return { bg: '#FCE8E6', text: '#D93838', label: 'Đã Hủy' };
      default:
        return { bg: '#E9E1D5', text: '#8A6A48', label: status || 'Đang xử lý' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color="#8A6A48" />
        <Text style={styles.loadingText}>Đang lấy chi tiết đơn hàng từ Server...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !order) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <Feather name="alert-circle" size={48} color="#D93838" />
        <Text style={styles.emptyTitle}>{errorMsg || 'Không tải được đơn hàng'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>QUAY LẠI</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Chi Tiết Đơn #{order.id ? order.id.slice(-8).toUpperCase() : ''}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="truck" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusInfo.text },
              ]}
            />
            <Text
              style={[
                styles.statusTitle,
                { color: statusInfo.text },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.orderDate}>Ngày đặt đơn: {order.date}</Text>

          {order.status !== 'cancelled' && order.status !== 'rejected' && (
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
              style={styles.trackOrderBtn}
              activeOpacity={0.8}
            >
              <Feather name="map-pin" size={13} color="#8A6A48" />
              <Text style={styles.trackOrderBtnText}>Theo Dõi Lộ Trình Vận Chuyển</Text>
              <Feather name="chevron-right" size={14} color="#8A6A48" />
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={14} color="#8A6A48" />
              <Text style={styles.sectionHeaderTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
            </View>
            <Text style={styles.addressName}>
              {order.shippingAddress.fullName || 'Người nhận'} {order.shippingAddress.phone ? `• ${order.shippingAddress.phone}` : ''}
            </Text>
            <Text style={styles.addressStreet}>
              {order.shippingAddress.street} {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
            </Text>
          </View>
        )}

        {/* Items List */}
        <Text style={styles.sectionTag}>SẢN PHẨM ĐÃ ĐẶT ({order.items.length})</Text>
        {order.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemCard}>
            {/* Box Icon thay thế thẻ Image */}
            <View style={styles.packageIconBox}>
              <Feather name="package" size={24} color="#8A6A48" />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.color ? (
                <Text style={styles.itemVariant}>Phân loại: {item.color}</Text>
              ) : null}
              <View style={styles.priceRow}>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              </View>

              {order.status === 'delivered' && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/(customer)/review?orderId=${order.id}&productId=${item.productId || item.id}&productTitle=${encodeURIComponent(
                        item.title
                      )}` as any
                    )
                  }
                  style={styles.reviewItemBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={12} color="#C89D5C" />
                  <Text style={styles.reviewItemBtnText}>Đánh Giá Sản Phẩm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>CHI TIẾT THANH TOÁN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính tiền hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.shipping)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phương thức thanh toán</Text>
            <Text style={styles.paymentMethodVal}>{order.paymentMethod}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Nút hủy đơn hàng */}
        {isPending && (
          <TouchableOpacity
            onPress={handleCancelOrder}
            disabled={cancelling}
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            activeOpacity={0.85}
          >
            {cancelling ? (
              <ActivityIndicator color="#D93838" />
            ) : (
              <>
                <Feather name="x-circle" size={15} color="#D93838" />
                <Text style={styles.cancelBtnText}>HỦY ĐƠN HÀNG NÀY</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  backBtn: {
    backgroundColor: '#8A6A48',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
    includeFontPadding: false,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  orderDate: {
    fontSize: 11,
    color: '#7A7067',
    marginBottom: 8,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    gap: 8,
    marginTop: 4,
  },
  trackOrderBtnText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  addressName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  addressStreet: {
    fontSize: 11.5,
    color: '#7A7067',
    lineHeight: 17,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  sectionTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  packageIconBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
    lineHeight: 17,
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemVariant: {
    fontSize: 10.5,
    color: '#7A7067',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  reviewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E8E2D8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  reviewItemBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  paymentMethodVal: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F5C6C6',
    borderRadius: 22,
    gap: 6,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D93838',
    letterSpacing: 1,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
});