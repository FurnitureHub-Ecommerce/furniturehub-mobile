import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/context/AppContext';
import { getAddressesApi, formatCurrency } from '@/services/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, subtotal, shipping, total } = useApp();

  const [fullName, setFullName] = useState('Nam Anh');
  const [street, setStreet] = useState('742 Evergreen Terrace, Phường Bến Nghé, Quận 1');
  const [city, setCity] = useState('TP. Hồ Chí Minh');
  const [postalCode, setPostalCode] = useState('700000');
  const [phone, setPhone] = useState('0901 234 567');

  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const addresses = await getAddressesApi(token || undefined);
        const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
        if (defaultAddr) {
          if (defaultAddr.fullName || defaultAddr.name) setFullName(defaultAddr.fullName || defaultAddr.name);
          if (defaultAddr.street || defaultAddr.address) setStreet(defaultAddr.street || defaultAddr.address);
          if (defaultAddr.city) setCity(defaultAddr.city);
          if (defaultAddr.phone) setPhone(defaultAddr.phone);
        }
      } catch (err) {
        console.warn('Không thể tải địa chỉ mặc định:', err);
      }
    };

    loadDefaultAddress();
  }, []);

  const handleProceedToPayment = () => {
    if (!fullName.trim() || !street.trim() || !phone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    router.push({
      pathname: '/(customer)/payment',
      params: {
        fullName,
        street,
        city,
        phone,
      },
    } as any);
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
        <Text style={styles.headerTitle}>Địa Chỉ Giao Hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>BƯỚC 1 / 2: THÔNG TIN GIAO HÀNG</Text>
          <Text style={styles.stepSub}>Đơn hàng nội thất sẽ được vận chuyển bởi chuyên xe Concierge</Text>
        </View>

        {/* Address Form with Fixed Icon Padding */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>HỌ VÀ TÊN NGƯỜI NHẬN</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconBox}>
              <Feather name="user" size={17} color="#8A6A48" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#A0988E"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={styles.label}>ĐỊA CHỈ NHÀ / CĂN HỘ / TÊN ĐƯỜNG</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconBox}>
              <Feather name="map-pin" size={17} color="#8A6A48" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="123 Đường Lê Lợi, Phường Bến Thành, Quận 1"
              placeholderTextColor="#A0988E"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TỈNH / THÀNH PHỐ</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Feather name="compass" size={17} color="#8A6A48" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="TP. Hồ Chí Minh"
                  placeholderTextColor="#A0988E"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>MÃ BƯU CHÍNH</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="700000"
                  placeholderTextColor="#A0988E"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>SỐ ĐIỆN THOẠI LIÊN HỆ GIAO HÀNG</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconBox}>
              <Feather name="phone" size={17} color="#8A6A48" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="0901 234 567"
              placeholderTextColor="#A0988E"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* Delivery Option */}
        <View style={styles.deliveryCard}>
          <Feather name="truck" size={22} color="#8A6A48" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.deliveryTitle}>Dịch Vụ Giao Hàng Concierge Cao Cấp</Text>
            <Text style={styles.deliverySub}>Vận chuyển phòng chuyên dụng, lắp đặt & dọn bao bì</Text>
          </View>
          <Text style={styles.deliveryPrice}>{formatCurrency(shipping)}</Text>
        </View>

        {/* Order Summary Snapshot */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Số lượng sản phẩm ({cart.length})</Text>
            <Text style={styles.snapshotVal}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Phí giao hàng cao cấp</Text>
            <Text style={styles.snapshotVal}>{formatCurrency(shipping)}</Text>
          </View>
          <View style={[styles.snapshotRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2DBD0' }]}>
            <Text style={styles.snapshotTotalLabel}>Tổng tạm tính</Text>
            <Text style={styles.snapshotTotalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleProceedToPayment}
          style={styles.primaryBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>CHỌN PHƯƠNG THỨC THANH TOÁN</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
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
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 13,
    color: '#6E6860',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  // Ô nhập liệu fix triệt để khoảng cách padding icon
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  iconBox: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#252525',
    paddingVertical: 0,
    height: '100%',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 16,
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#252525',
  },
  deliverySub: {
    fontSize: 12,
    color: '#6E6860',
    marginTop: 2,
  },
  deliveryPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
  },
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  snapshotLabel: {
    fontSize: 12,
    color: '#6E6860',
  },
  snapshotVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
  },
  snapshotTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252525',
  },
  snapshotTotalVal: {
    fontSize: 15,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
