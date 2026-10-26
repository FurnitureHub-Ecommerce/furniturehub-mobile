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
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { createOrderApi, formatCurrency } from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

type PaymentMethodType = 'cod' | 'qr' | 'card' | 'wallet';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    addressId?: string;
    receiverName?: string;
    phone?: string;
    addressLine?: string;
    ward?: string;
    city?: string;
    fullAddress?: string;
  }>();

  const { cart, subtotal, shipping, total, clearCart } = useApp();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [processing, setProcessing] = useState(false);

  const getPaymentMethodLabel = () => {
    switch (selectedMethod) {
      case 'cod':
        return 'Thanh toán tiền mặt khi nhận hàng (COD)';
      case 'qr':
        return 'Chuyển khoản Ngân hàng (Mã QR VietQR)';
      case 'card':
        return 'Thẻ Tín Dụng / Ghi Nợ Quốc Tế';
      case 'wallet':
        return 'Ví Điện Tử Apple Pay / MoMo';
      default:
        return 'Thanh toán khi nhận hàng';
    }
  };

 const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi đặt hàng.');
      return;
    }

    // Lấy addressId từ params
    const addressId = params.addressId;

    if (!addressId) {
      Alert.alert('Lỗi địa chỉ', 'Không tìm thấy ID địa chỉ giao hàng hợp lệ. Vui lòng quay lại chọn địa chỉ.');
      return;
    }

    try {
      setProcessing(true);

      // KHỚP 100% SWAGGER: Request Body CHỈ gửi duy nhất addressId
      const orderPayload = {
        addressId: String(addressId),
      };

      const result = await createOrderApi(orderPayload);
      clearCart();

      // Bóc tách _id của đơn hàng được tạo thành công
      const realOrderId =
        result?.order?._id ||
        result?.order?.id ||
        result?._id ||
        result?.id ||
        result?.data?._id ||
        result?.data?.id;

      if (realOrderId) {
        Alert.alert(
          'Đặt Hàng Thành Công',
          `Cảm ơn bạn! Đơn hàng #${realOrderId} đã được ghi nhận thành công trên hệ thống.`,
          [
            {
              text: 'Xem Đơn Hàng',
              onPress: () => router.replace('/(customer)/orders' as any),
            },
            {
              text: 'Theo Dõi Giao Hàng',
              onPress: () =>
                router.replace(`/(customer)/orders/tracking/${realOrderId}` as any),
            },
          ]
        );
      } else {
        Alert.alert(
          'Đặt Hàng Thành Công',
          'Cảm ơn bạn! Đơn hàng của bạn đã được ghi nhận thành công.',
          [
            {
              text: 'Xem Đơn Hàng',
              onPress: () => router.replace('/(customer)/orders' as any),
            },
          ]
        );
      }
    } catch (err: any) {
      console.warn('Lỗi tạo đơn hàng:', err);
      Alert.alert('Lỗi đặt hàng', err.message || 'Không thể tạo đơn hàng vào lúc này.');
    } finally {
      setProcessing(false);
    }
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
        <Text style={styles.headerTitle}>
          Phương Thức Thanh Toán
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>BƯỚC 2 / 2</Text>
          <Text style={styles.stepSub}>Vui lòng chọn hình thức thanh toán phù hợp nhất với bạn</Text>
        </View>

        {/* 1. Trả Tiền Mặt Khi Nhận Hàng (COD) */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('cod')}
          style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconCircle}>
              <Feather name="dollar-sign" size={18} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Thanh toán tiền mặt khi nhận hàng (COD)</Text>
              <Text style={styles.methodSub}>Kiểm tra sản phẩm tận nhà & thanh toán trực tiếp</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'cod' ? '#8A6A48' : '#A0988E'}
            />
          </View>

          {selectedMethod === 'cod' && (
            <View style={styles.methodDetailBox}>
              <Text style={styles.detailNoticeText}>
                • Đội ngũ giao hàng White-Glove sẽ đồng kiểm sản phẩm cùng bạn trước khi nhận tiền.{'\n'}
                • Hỗ trợ tiền mặt hoặc quẹt thẻ máy POS tận nơi.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. Chuyển Khoản Ngân Hàng Qua Mã QR (VietQR) */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('qr')}
          style={[styles.methodCard, selectedMethod === 'qr' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="qr-code-outline" size={18} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Chuyển khoản Ngân hàng (Mã QR VietQR)</Text>
              <Text style={styles.methodSub}>Quét mã QR thanh toán nhanh qua ứng dụng ngân hàng</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'qr' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'qr' ? '#8A6A48' : '#A0988E'}
            />
          </View>

          {selectedMethod === 'qr' && (
            <View style={styles.qrContainer}>
              <Text style={styles.qrInstruction}>Mở app Ngân hàng và quét mã QR bên dưới:</Text>
              
              <View style={styles.qrCodeBox}>
                <Image
                  source={{
                    uri: `https://api.vietqr.io/image/970436-102870419201-qr_only.jpg?amount=${total}&addInfo=LUMORA%20THANH%20TOAN&accountName=LUMORA%20STUDIO`,
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.bankInfoCard}>
                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankLabel}>Ngân hàng:</Text>
                  <Text style={styles.bankVal}>Vietcombank (VCB)</Text>
                </View>
                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankLabel}>Số tài khoản:</Text>
                  <Text style={styles.bankValBold}>1028 7041 9201</Text>
                </View>
                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
                  <Text style={styles.bankVal}>LUMORA STUDIO VIETNAM</Text>
                </View>
                <View style={styles.bankInfoRow}>
                  <Text style={styles.bankLabel}>Số tiền:</Text>
                  <Text style={styles.bankValAmount}>{formatCurrency(total)}</Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* 3. Thẻ Tín Dụng / Ghi Nợ Quốc Tế */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('card')}
          style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconCircle}>
              <Feather name="credit-card" size={18} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Thẻ Tín Dụng / Ghi Nợ Quốc Tế</Text>
              <Text style={styles.methodSub}>Visa, MasterCard, JCB, American Express</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'card' ? '#8A6A48' : '#A0988E'}
            />
          </View>

          {selectedMethod === 'card' && (
            <View style={styles.cardForm}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SỐ THẺ THANH TOÁN *</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="credit-card" size={15} color="#8A6A48" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputText}
                    placeholder="4532 •••• •••• 8921"
                    placeholderTextColor="#A0988E"
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                  />
                </View>
              </View>

              <View style={styles.rowGrid}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>HẠN DÙNG (MM/YY) *</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="calendar" size={15} color="#8A6A48" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="08/28"
                      placeholderTextColor="#A0988E"
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                    />
                  </View>
                </View>

                <View style={[styles.fieldGroup, { width: 110 }]}>
                  <Text style={styles.fieldLabel}>MÃ CVV *</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={15} color="#8A6A48" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="888"
                      placeholderTextColor="#A0988E"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={4}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* 4. Ví Điện Tử Một Chạm */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('wallet')}
          style={[styles.methodCard, selectedMethod === 'wallet' && styles.methodCardActive]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={styles.iconCircle}>
              <Feather name="smartphone" size={18} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Ví Điện Tử Một Chạm</Text>
              <Text style={styles.methodSub}>Apple Pay, Google Pay, MoMo, ZaloPay</Text>
            </View>
            <Ionicons
              name={selectedMethod === 'wallet' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'wallet' ? '#8A6A48' : '#A0988E'}
            />
          </View>
        </TouchableOpacity>

        {/* Tổng Hóa Đơn */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>TỔNG KẾT HÓA ĐƠN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính tiền hàng</Text>
            <Text style={styles.summaryVal}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng White-Glove</Text>
            <Text style={styles.summaryVal}>{formatCurrency(shipping)}</Text>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={processing}
          style={[styles.payBtn, processing && { opacity: 0.7 }]}
          activeOpacity={0.88}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payBtnText}>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepBox: {
    marginBottom: 16,
  },
  stepBadge: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#8A6A48',
    marginBottom: 2,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 12,
    color: '#7A7067',
    textAlign: 'center',
    marginTop: 3,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: '#8A6A48',
    backgroundColor: '#FAF7F2',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A2421',
  },
  methodSub: {
    fontSize: 11,
    color: '#7A7067',
    marginTop: 2,
  },
  methodDetailBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
  },
  detailNoticeText: {
    fontSize: 11.5,
    color: '#6E6860',
    lineHeight: 18,
  },
  qrContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
    alignItems: 'center',
  },
  qrInstruction: {
    fontSize: 11.5,
    color: '#7A7067',
    marginBottom: 10,
  },
  qrCodeBox: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  bankInfoCard: {
    width: '100%',
    backgroundColor: '#F7F4EE',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 11.5,
    color: '#7A7067',
  },
  bankVal: {
    fontSize: 12,
    color: '#2A2421',
    fontWeight: '600',
  },
  bankValBold: {
    fontSize: 12.5,
    color: '#2A2421',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bankValAmount: {
    fontSize: 13.5,
    color: '#8A6A48',
    fontWeight: '700',
  },
  cardForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
  },
  fieldGroup: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 13,
    color: '#2A2421',
    height: '100%',
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginTop: 4,
  },
  summaryTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8A6A48',
    
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7A7067',
  },
  summaryVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F2ECE4',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2A2421',
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F4EE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
  },
  payBtn: {
    height: 48,
    backgroundColor: '#8A6A48',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});