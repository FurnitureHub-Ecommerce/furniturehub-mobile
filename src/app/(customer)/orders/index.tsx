import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getOrdersApi, OrderItem, formatCurrency } from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

const ORDER_TABS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'pending', label: 'Chờ Xử Lý' },
  { id: 'in_transit', label: 'Đang Giao' },
  { id: 'delivered', label: 'Đã Giao' },
  { id: 'cancelled', label: 'Đã Hủy' },
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await getOrdersApi();
      setOrders(data);
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    const status = (order.status || '').toLowerCase();
    if (activeTab === 'pending') {
      return status === 'pending' || status === 'chờ xử lý';
    }
    if (activeTab === 'in_transit') {
      return status === 'in_transit' || status === 'đang giao hàng' || status === 'đang vận chuyển';
    }
    if (activeTab === 'delivered') {
      return status === 'delivered' || status === 'đã giao hàng';
    }
    if (activeTab === 'cancelled') {
      return status === 'cancelled' || status === 'rejected' || status === 'đã hủy';
    }
    return true;
  });

  // Việt hóa và định dạng badge trạng thái mượt mà
  const getStatusInfo = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
      case 'đã giao hàng':
        return { bg: '#E2F0D9', text: '#2E7D32', label: 'Đã Giao' };
      case 'in_transit':
      case 'đang giao hàng':
      case 'đang vận chuyển':
        return { bg: '#F5EBE1', text: '#8A6A48', label: 'Đang Giao' };
      case 'pending':
      case 'chờ xử lý':
        return { bg: '#FEF5E7', text: '#E67E22', label: 'Chờ Xử Lý' };
      case 'rejected':
      case 'cancelled':
      case 'đã hủy':
        return { bg: '#FCE8E6', text: '#D93838', label: 'Đã Hủy' };
      default:
        return { bg: '#E9E1D5', text: '#8A6A48', label: status || 'Khác' };
    }
  };

  // Cắt ngắn Mã đơn hàng chỉ hiển thị 8-10 ký tự cuối gọn đẹp
  const formatOrderId = (rawId: string, orderNumber?: string) => {
    if (orderNumber && orderNumber.length <= 12) return `#${orderNumber}`;
    if (rawId) {
      return `#${rawId.slice(-8).toUpperCase()}`;
    }
    return '#LUMORA';
  };

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
        <Text style={[styles.headerTitle, styles.headerTitleStyle]}>Lịch Sử Đơn Hàng</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabBar}>
        <FlatList
          horizontal
          data={ORDER_TABS}
          keyExtractor={(t) => t.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.id)}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={52} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySub}>
            {activeTab === 'all'
              ? 'Bạn chưa thực hiện đơn đặt hàng nào.'
              : `Không có đơn hàng thuộc mục "${
                  ORDER_TABS.find((t) => t.id === activeTab)?.label
                }".`}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/(tabs)/shop' as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>MUA SẮM NGAY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8A6A48"
              colors={['#8A6A48']}
            />
          }
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            const totalQty =
              item.items?.reduce((sum, it) => sum + it.qty, 0) || 1;

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(customer)/orders/${item.id}` as any)
                }
                style={styles.orderCard}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId} numberOfLines={1}>
                    {formatOrderId(item.id, item.orderNumber)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusInfo.text }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>Đặt ngày {item.date}</Text>

                {item.items && item.items.length > 0 && (
                  <Text style={styles.firstItemName} numberOfLines={1}>
                    {item.items[0].title}
                    {item.items.length > 1 &&
                      ` và ${item.items.length - 1} sản phẩm khác`}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.itemCountText}>{totalQty} sản phẩm</Text>
                  <Text style={styles.totalText}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(customer)/orders/tracking/${item.id}` as any
                      )
                    }
                    style={styles.trackBtn}
                    activeOpacity={0.8}
                  >
                    <Feather name="map-pin" size={13} color="#8A6A48" />
                    <Text style={styles.trackBtnText}>Theo Dõi Vận Chuyển</Text>
                  </TouchableOpacity>

                  <Feather name="chevron-right" size={16} color="#8A6A48" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
    fontSize: 18,
    fontWeight: '700',
    color: '#2b221d',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b221d',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  tabBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D8',
    backgroundColor: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F7F4EE',
    borderWidth: 1,
    borderColor: '#E8E2D8',
  },
  tabChipActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    marginTop: 16,
    marginBottom: 8,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12,
    color: '#7A7067',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  exploreBtn: {
    backgroundColor: '#8A6A48',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 12,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    flex: 1,
    includeFontPadding: false,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  dateText: {
    fontSize: 11,
    color: '#7A7067',
    marginBottom: 8,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  firstItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2A2421',
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
    paddingTop: 8,
    marginBottom: 8,
  },
  itemCountText: {
    fontSize: 11,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F6F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
});