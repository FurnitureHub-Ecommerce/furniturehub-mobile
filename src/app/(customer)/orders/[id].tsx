import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const orderData = {
    id: id || 'LUM-89210',
    date: '14 tháng 09, 2026',
    status: 'Đang vận chuyển bởi đội ngũ giao hàng cao cấp',
    total: 3730,
    items: [
      {
        id: 'p1',
        title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
        price: 2450,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80',
      },
      {
        id: 'p2',
        title: 'Ghế Bành Vải Bouclé Mềm Aethel',
        price: 1280,
        qty: 1,
        image:
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop&q=80',
      },
    ],
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
        <Text style={styles.headerTitle}>Đơn hàng #{orderData.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons name="time" size={20} color="#8A6A48" />
            <Text style={styles.statusTitle}>{orderData.status}</Text>
          </View>
          <Text style={styles.orderDate}>Đặt hàng ngày {orderData.date}</Text>
        </View>

        {/* Items List */}
        <Text style={styles.sectionTag}>SẢN PHẨM ĐÃ ĐẶT</Text>
        {orderData.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemQty}>Số lượng: {item.qty}</Text>
              <Text style={styles.itemPrice}>
                ${item.price.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>CHI TIẾT THANH TOÁN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              ${(orderData.total - 150).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng cao cấp</Text>
            <Text style={styles.summaryValue}>$150</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng đã thanh toán</Text>
            <Text style={styles.totalValue}>
              ${orderData.total.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 17,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
  },
  orderDate: {
    fontSize: 13,
    color: '#6E6860',
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
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    color: '#6E6860',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#8A6A48',
  },
});
