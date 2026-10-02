import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function OrdersIndexScreen() {
  const router = useRouter();

  const orders = [
    {
      id: 'LUM-89210',
      date: '14/09/2026',
      status: 'Đang Giao Hàng',
      statusKey: 'in_transit',
      itemCount: 2,
      total: 3730,
    },
    {
      id: 'LUM-77312',
      date: '02/08/2026',
      status: 'Đã Giao Hàng',
      statusKey: 'delivered',
      itemCount: 1,
      total: 1280,
    },
  ];

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
        <Text style={styles.headerTitle}>Đơn Hàng Của Tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/orders/${item.id}` as any)}
            style={styles.orderCard}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  (item.statusKey === 'delivered' || item.status === 'Đã Giao Hàng') && styles.statusDelivered,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.dateText}>Đặt ngày {item.date}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.itemCountText}>
                {item.itemCount} sản phẩm
              </Text>
              <Text style={styles.totalText}>
                ${item.total.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#252525',
  },
  statusBadge: {
    backgroundColor: '#E9E1D5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusDelivered: {
    backgroundColor: '#E2F0D9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    color: '#6E6860',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    paddingTop: 10,
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
});
