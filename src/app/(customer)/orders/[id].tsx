import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getOrderDetailApi, cancelOrderApi, OrderItem, formatCurrency } from '@/services/api';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderDetailApi(id || 'LUM-89210');
        setOrder(data);
      } catch (err) {
        console.warn('Lỗi lấy chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Kiểm tra đơn hàng có thể hủy (đang ở trạng thái chờ xử lý)
  const isPending =
    order?.status === 'pending' ||
    order?.status === 'Chờ Xử Lý' ||
    order?.status === 'processing';

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy Đơn Hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không? Tiền đã thanh toán sẽ được hoàn về phương thức ban đầu trong vòng 24 giờ.',
      [
        { text: 'Giữ Lại Đơn', style: 'cancel' },
        {
          text: 'Xác Nhận Hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelOrderApi(order?.id || id || '');
              if (order) {
                setOrder({
                  ...order,
                  status: 'cancelled',
                  statusLabel: 'Đã Hủy',
                });
              }
              Alert.alert('Thành Công', 'Đơn hàng của bạn đã được hủy thành công.');
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
      case 'Đã Giao Hàng':
        return '#2E7D32';
      case 'in_transit':
      case 'Đang Vận Chuyển':
        return '#8A6A48';
      case 'pending':
      case 'Chờ Xử Lý':
        return '#E67E22';
      case 'cancelled':
      case 'Đã Hủy':
        return '#D93838';
      default:
        return '#8A6A48';
    }
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#8A6A48" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Đơn #{order.orderNumber || order.id}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="truck" size={18} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            />
            <Text
              style={[
                styles.statusTitle,
                { color: getStatusColor(order.status) },
              ]}
            >
              {order.statusLabel || order.status}
            </Text>
          </View>
          <Text style={styles.orderDate}>Ngày đặt đơn: {order.date}</Text>

          {/* Quick Tracking Button */}
          {order.status !== 'cancelled' && (
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
              style={styles.trackOrderBtn}
              activeOpacity={0.8}
            >
              <Feather name="map-pin" size={14} color="#8A6A48" />
              <Text style={styles.trackOrderBtnText}>Theo Dõi Lộ Trình Vận Chuyển</Text>
              <Feather name="chevron-right" size={14} color="#8A6A48" />
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Address */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={16} color="#8A6A48" />
            <Text style={styles.sectionHeaderTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
          </View>
          <Text style={styles.addressName}>
            {order.shippingAddress?.fullName || 'Nam Anh'} • {order.shippingAddress?.phone || '0901 234 567'}
          </Text>
          <Text style={styles.addressStreet}>
            {order.shippingAddress?.street || '742 Evergreen Terrace, Phường Bến Nghé, Quận 1'}, {order.shippingAddress?.city || 'TP. Hồ Chí Minh'}
          </Text>
        </View>

        {/* Items List */}
        <Text style={styles.sectionTag}>DANH SÁCH SẢN PHẨM ({order.items.length})</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.color && (
                <Text style={styles.itemVariant}>Màu sắc: {item.color}</Text>
              )}
              {item.option && (
                <Text style={styles.itemVariant}>Phân loại: {item.option}</Text>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              </View>

              {/* Nút đánh giá nếu đơn hàng đã giao thành công */}
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
                  <Ionicons name="star" size={13} color="#C89D5C" />
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
            <Text style={styles.summaryValue}>
              {formatCurrency(order.subtotal || order.total - 150)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng cao cấp</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.shipping || 150)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phương thức thanh toán</Text>
            <Text style={styles.paymentMethodVal}>{order.paymentMethod || 'Thẻ Tín Dụng'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* NÚT HỦY ĐƠN HÀNG NẾU ĐƠN CHỜ XỬ LÝ (PENDING) */}
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
                <Feather name="x-circle" size={16} color="#D93838" />
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6E6860',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    color: '#6E6860',
    marginBottom: 10,
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 8,
    marginTop: 4,
  },
  trackOrderBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 2,
  },
  addressStreet: {
    fontSize: 12,
    color: '#6E6860',
    lineHeight: 18,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 3,
  },
  itemVariant: {
    fontSize: 11,
    color: '#6E6860',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6860',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
  reviewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  reviewItemBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6A48',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginTop: 6,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6E6860',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
  },
  paymentMethodVal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#252525',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252525',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#8A6A48',
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F5C6C6',
    borderRadius: 24,
    gap: 8,
    marginBottom: 24,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D93838',
    letterSpacing: 1,
  },
});
