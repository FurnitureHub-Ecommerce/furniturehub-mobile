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
    if (activeTab === 'pending') {
      return order.status === 'pending' || order.status === 'Chờ Xử Lý';
    }
    if (activeTab === 'in_transit') {
      return order.status === 'in_transit' || order.status === 'Đang Giao Hàng' || order.status === 'Đang Vận Chuyển';
    }
    if (activeTab === 'delivered') {
      return order.status === 'delivered' || order.status === 'Đã Giao Hàng';
    }
    if (activeTab === 'cancelled') {
      return order.status === 'cancelled' || order.status === 'Đã Hủy';
    }
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'Đã Giao Hàng':
        return { bg: '#E2F0D9', text: '#2E7D32' };
      case 'in_transit':
      case 'Đang Giao Hàng':
      case 'Đang Vận Chuyển':
        return { bg: '#F5EBE1', text: '#8A6A48' };
      case 'pending':
      case 'Chờ Xử Lý':
        return { bg: '#FEF5E7', text: '#E67E22' };
      case 'cancelled':
      case 'Đã Hủy':
        return { bg: '#FCE8E6', text: '#D93838' };
      default:
        return { bg: '#E9E1D5', text: '#8A6A48' };
    }
  };

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
        <Text style={styles.headerTitle}>Lịch Sử Đơn Hàng</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={17} color="#8A6A48" />
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
                <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
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
          <Feather name="package" size={56} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySub}>
            {activeTab === 'all'
              ? 'Bạn chưa thực hiện đơn đặt hàng nào tại FurnitureHub.'
              : `Không có đơn hàng nào thuộc mục "${ORDER_TABS.find((t) => t.id === activeTab)?.label}".`}
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
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8A6A48']} />
          }
          renderItem={({ item }) => {
            const badge = getStatusBadgeStyle(item.status);
            const totalQty = item.items?.reduce((sum, it) => sum + it.qty, 0) || 1;

            return (
              <TouchableOpacity
                onPress={() => router.push(`/(customer)/orders/${item.id}` as any)}
                style={styles.orderCard}
                activeOpacity={0.88}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>#{item.orderNumber || item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {item.statusLabel || item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>Đặt ngày {item.date}</Text>

                {item.items && item.items.length > 0 && (
                  <Text style={styles.firstItemName} numberOfLines={1}>
                    {item.items[0].title}
                    {item.items.length > 1 && ` và ${item.items.length - 1} sản phẩm khác`}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.itemCountText}>{totalQty} sản phẩm</Text>
                  <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(customer)/orders/tracking/${item.id}` as any)}
                    style={styles.trackBtn}
                    activeOpacity={0.8}
                  >
                    <Feather name="map-pin" size={13} color="#8A6A48" />
                    <Text style={styles.trackBtnText}>Theo Dõi Vận Chuyển</Text>
                  </TouchableOpacity>

                  <Feather name="chevron-right" size={18} color="#8A6A48" />
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
    fontSize: 18,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  tabBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
    backgroundColor: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F7F4EE',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  tabChipActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6860',
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
    color: '#6E6860',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#252525',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#6E6860',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#8A6A48',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 22,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252525',
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
  },
  dateText: {
    fontSize: 12,
    color: '#6E6860',
    marginBottom: 8,
  },
  firstItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#252525',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    paddingTop: 10,
    marginBottom: 10,
  },
  itemCountText: {
    fontSize: 12,
    color: '#6E6860',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F4EE',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
});
