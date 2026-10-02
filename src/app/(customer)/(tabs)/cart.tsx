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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, subtotal, shipping, total } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ Hàng Của Tôi</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={60} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySub}>
            Hãy khám phá các sản phẩm nội thất cao cấp và thêm vào giỏ hàng ngay.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/shop' as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>KHÁM PHÁ CỬA HÀNG</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.itemCount}>
              Đã chọn {cart.length} sản phẩm cao cấp
            </Text>

            {cart.map((item) => (
              <View key={item.product.id} style={styles.cartCard}>
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.product.title}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${item.product.price.toLocaleString()}
                  </Text>

                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      style={styles.qtyBtn}
                    >
                      <Feather name="minus" size={14} color="#252525" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      style={styles.qtyBtn}
                    >
                      <Feather name="plus" size={14} color="#252525" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => removeFromCart(item.product.id)}
                  style={styles.removeBtn}
                >
                  <Feather name="trash-2" size={16} color="#6E6860" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>TỔNG QUAN ĐƠN HÀNG</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí vận chuyển cao cấp</Text>
                <Text style={styles.summaryValue}>${shipping}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/checkout' as any)}
              style={styles.checkoutBtn}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutText}>TIẾN HÀNH THANH TOÁN</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
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
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
  },
  removeBtn: {
    padding: 8,
  },
  summaryContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    paddingTop: 12,
    marginTop: 6,
    marginBottom: 0,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F4EE',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
  },
  checkoutBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
