import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { createOrderApi, formatCurrency } from '@/services/api';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    fullName?: string;
    street?: string;
    city?: string;
    phone?: string;
  }>();

  const { cart, subtotal, shipping, total, clearCart } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'wallet' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('4532 8921 7842 1093');
  const [cardExpiry, setCardExpiry] = useState('09 / 28');
  const [cardCvv, setCardCvv] = useState('882');
  const [processing, setProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);

      const orderPayload = {
        items: cart.map((item) => ({
          id: item.product.id,
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price + (item.selectedOption?.priceAdjustment || 0),
          qty: item.quantity,
          image: item.product.image,
          color: item.selectedColor?.name,
          option: item.selectedOption?.name,
        })),
        subtotal,
        shipping,
        total,
        paymentMethod:
          selectedMethod === 'card'
            ? 'Thẻ Tín Dụng (Visa)'
            : selectedMethod === 'wallet'
            ? 'Ví Điện Tử Apple Pay'
            : 'Chuyển Khoản Ngân Hàng Concierge',
        shippingAddress: {
          fullName: params.fullName || 'Nam Anh',
          phone: params.phone || '0901 234 567',
          street: params.street || '742 Evergreen Terrace, Phường Bến Nghé, Quận 1',
          city: params.city || 'TP. Hồ Chí Minh',
        },
      };

      const result = await createOrderApi(orderPayload);
      clearCart();

      const createdId = result?.order?.id || 'LUM-89210';

      Alert.alert(
        'Đặt Hàng Thành Công',
        `Cảm ơn bạn! Đơn hàng #${createdId} đã được tiếp nhận và nhân viên chăm sóc Concierge đang xử lý.`,
        [
          {
            text: 'Xem Chi Tiết Đơn Hàng',
            onPress: () => router.replace(`/(customer)/orders/${createdId}` as any),
          },
          {
            text: 'Theo Dõi Vận Chuyển',
            onPress: () => router.replace(`/(customer)/orders/tracking/${createdId}` as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi đặt hàng', err.message || 'Không thể tạo đơn hàng vào lúc này.');
    } finally {
      setProcessing(false);
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
        <Text style={styles.headerTitle}>Phương Thức Thanh Toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTag}>BƯỚC 2 / 2: CHỌN HÌNH THỨC THANH TOÁN</Text>

        {/* 1. Credit / Debit Card */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('card')}
          style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconBox}>
              <Feather name="credit-card" size={20} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Thẻ Tín Dụng / Ghi Nợ Quốc Tế</Text>
              <Text style={styles.methodSub}>Hỗ trợ Visa, MasterCard, JCB, Amex</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedMethod === 'card' ? '#8A6A48' : '#C2B8A3'}
            />
          </View>

          {selectedMethod === 'card' && (
            <View style={styles.cardForm}>
              <Text style={styles.label}>SỐ THẺ THANH TOÁN</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconBox}>
                  <Feather name="credit-card" size={16} color="#8A6A48" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="4532 •••• •••• 8921"
                  placeholderTextColor="#A0988E"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
              </View>

              <View style={styles.rowGroup}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>HẠN DÙNG (MM/YY)</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.fieldIconBox}>
                      <Feather name="calendar" size={16} color="#8A6A48" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="09 / 28"
                      placeholderTextColor="#A0988E"
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                    />
                  </View>
                </View>
                <View style={{ width: 120 }}>
                  <Text style={styles.label}>MÃ BẢO MẬT CVV</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.fieldIconBox}>
                      <Feather name="lock" size={16} color="#8A6A48" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="882"
                      placeholderTextColor="#A0988E"
                      secureTextEntry
                      keyboardType="numeric"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. Apple Pay / Google Wallet */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('wallet')}
          style={[styles.methodCard, selectedMethod === 'wallet' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconBox}>
              <Feather name="smartphone" size={20} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Ví Điện Tử Một Chạm</Text>
              <Text style={styles.methodSub}>Apple Pay, Google Pay, MoMo Concierge</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'wallet' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedMethod === 'wallet' ? '#8A6A48' : '#C2B8A3'}
            />
          </View>
        </TouchableOpacity>

        {/* 3. Bank Transfer Concierge */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('bank')}
          style={[styles.methodCard, selectedMethod === 'bank' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconBox}>
              <Feather name="globe" size={20} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Chuyển Khoản Ngân Hàng Concierge</Text>
              <Text style={styles.methodSub}>Xác nhận thanh toán tự động qua mã QR</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'bank' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedMethod === 'bank' ? '#8A6A48' : '#C2B8A3'}
            />
          </View>
        </TouchableOpacity>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TỔNG KẾT HÓA ĐƠN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính tiền hàng</Text>
            <Text style={styles.summaryVal}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng cao cấp</Text>
            <Text style={styles.summaryVal}>{formatCurrency(shipping)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng số tiền thanh toán</Text>
            <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Complete Order Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={processing}
          style={[styles.primaryBtn, processing && { opacity: 0.7 }]}
          activeOpacity={0.88}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>
              XÁC NHẬN ĐẶT HÀNG ({formatCurrency(total)})
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
  },
  methodCardActive: {
    borderColor: '#8A6A48',
    borderWidth: 1.5,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252525',
  },
  methodSub: {
    fontSize: 11,
    color: '#6E6860',
    marginTop: 2,
  },
  cardForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  // Ô nhập liệu fix triệt để khoảng cách padding icon
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: '#F7F4EE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  fieldIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#252525',
    paddingVertical: 0,
    height: '100%',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6E6860',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252525',
  },
  totalVal: {
    fontSize: 16,
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
  primaryBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
