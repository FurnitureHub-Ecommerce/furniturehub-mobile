import React, { useState, useEffect, useCallback } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/context/AppContext';
import {
  getAddressesApi,
  getUserProfileApi,
  AddressItem,
  formatCurrency,
} from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'Didot' : 'serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, subtotal, shipping, total } = useApp();

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Form state
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');

  // Load thông tin Profile & Địa chỉ thực từ Backend API
  const fetchCheckoutData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const [userProfile, addressList] = await Promise.all([
        getUserProfileApi(token || undefined).catch(() => null),
        getAddressesApi(token || undefined).catch(() => []),
      ]);

      const list = Array.isArray(addressList) ? addressList : [];
      setAddresses(list);

      const defaultAddr = list.find((a: any) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id || defaultAddr.id || null);
        setReceiverName(
          defaultAddr.receiverName || defaultAddr.fullName || defaultAddr.name || ''
        );
        setPhone(defaultAddr.phone || defaultAddr.phoneNumber || '');
        setAddressLine(
          defaultAddr.addressLine || defaultAddr.street || defaultAddr.address || ''
        );
        setWard(defaultAddr.ward || '');
        setCity(defaultAddr.city || defaultAddr.province || '');
      } else if (userProfile) {
        const user = userProfile.data || userProfile;
        if (user.fullName) setReceiverName(user.fullName);
        if (user.phone) setPhone(user.phone);
      }
    } catch (err) {
      console.warn('Lỗi tải thông tin giao hàng:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  const handleSelectAddress = (addr: AddressItem) => {
    const id = addr._id || addr.id || null;
    setSelectedAddressId(id);
    setReceiverName(addr.receiverName || addr.fullName || addr.name || '');
    setPhone(addr.phone || addr.phoneNumber || '');
    setAddressLine(addr.addressLine || addr.street || addr.address || '');
    setWard(addr.ward || '');
    setCity(addr.city || addr.province || '');
  };

  // const handleProceedToPayment = () => {
  //   if (!receiverName.trim() || !phone.trim() || !addressLine.trim()) {
  //     Alert.alert(
  //       'Thiếu thông tin',
  //       'Vui lòng nhập đầy đủ tên người nhận, số điện thoại và địa chỉ giao hàng.'
  //     );
  //     return;
  //   }

  //   if (cart.length === 0) {
  //     Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi thanh toán.');
  //     return;
  //   }

  //   router.push({
  //     pathname: '/(customer)/payment',
  //     params: {
  //       receiverName: receiverName.trim(),
  //       phone: phone.trim(),
  //       addressLine: addressLine.trim(),
  //       ward: ward.trim(),
  //       city: city.trim(),
  //       fullAddress: `${addressLine.trim()}${ward ? `, ${ward.trim()}` : ''}${city ? `, ${city.trim()}` : ''}`,
  //     },
  //   } as any);
  // };

  const handleProceedToPayment = () => {
    // 1. Kiểm tra đã có addressId từ địa chỉ đã lưu chưa
    if (!selectedAddressId) {
      Alert.alert(
        'Thiếu địa chỉ',
        'Vui lòng chọn 1 địa chỉ giao hàng trong danh sách hoặc tạo địa chỉ mới.'
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    // 2. Chuyển addressId sang trang Payment
    router.push({
      pathname: '/(customer)/payment',
      params: {
        addressId: selectedAddressId,
        receiverName: receiverName.trim(),
        phone: phone.trim(),
        fullAddress: `${addressLine.trim()}${ward ? `, ${ward.trim()}` : ''}${city ? `, ${city.trim()}` : ''}`,
      },
    } as any);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="small" color="#8A6A48" />
        <Text style={styles.loadingText}>Đang tải địa chỉ giao hàng...</Text>
      </SafeAreaView>
    );
  }

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
          Địa Chỉ Giao Hàng
        </Text>
        <TouchableOpacity onPress={fetchCheckoutData} style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={15} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Tracker */}
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>BƯỚC 1 / 2</Text>
          <Text style={styles.stepSub}>Vận chuyển & lắp đặt bởi đội ngũ White-Glove Concierge</Text>
        </View>

        {/* Sổ Địa Chỉ Đã Lưu */}
        {addresses.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>ĐỊA CHỈ ĐÃ LƯU</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addressScroll}>
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isSelected = selectedAddressId === addrId;
                const name = addr.receiverName || addr.fullName || addr.name || 'Người nhận';
                const detail = addr.addressLine || addr.street || addr.address || '';

                return (
                  <TouchableOpacity
                    key={addrId}
                    onPress={() => handleSelectAddress(addr)}
                    style={[styles.addressPill, isSelected && styles.addressPillSelected]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addrHeaderRow}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? '#8A6A48' : '#A0988E'}
                      />
                      <Text style={styles.addrName} numberOfLines={1}>{name}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultTag}>
                          <Text style={styles.defaultTagText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addrPhone}>{addr.phone || addr.phoneNumber}</Text>
                    <Text style={styles.addrLine} numberOfLines={2}>
                      {[detail, addr.ward, addr.city].filter(Boolean).join(', ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Form Điền Chi Tiết */}
        <View style={styles.cardForm}>
          <Text style={styles.sectionTitle}>THÔNG TIN NGƯỜI NHẬN</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>HỌ VÀ TÊN *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={15} color="#8A6A48" style={styles.inputIcon} />
              <TextInput
                style={styles.inputText}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#A0988E"
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SỐ ĐIỆN THOẠI *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={15} color="#8A6A48" style={styles.inputIcon} />
              <TextInput
                style={styles.inputText}
                placeholder="0901 234 567"
                placeholderTextColor="#A0988E"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ĐỊA CHỈ NHÀ / TÊN ĐƯỜNG *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={15} color="#8A6A48" style={styles.inputIcon} />
              <TextInput
                style={styles.inputText}
                placeholder="Số 138, Đường Lê Lợi"
                placeholderTextColor="#A0988E"
                value={addressLine}
                onChangeText={setAddressLine}
              />
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>PHƯỜNG / XÃ</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Phường Bến Nghé"
                  placeholderTextColor="#A0988E"
                  value={ward}
                  onChangeText={setWard}
                />
              </View>
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>TỈNH / THÀNH PHỐ</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Hồ Chí Minh"
                  placeholderTextColor="#A0988E"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Khối Giao Hàng White-Glove */}
        <View style={styles.deliveryBox}>
          <View style={styles.deliveryIconCircle}>
            <Feather name="truck" size={18} color="#8A6A48" />
          </View>
          <View style={styles.deliveryTextGroup}>
            <Text style={styles.deliveryTitle}>Vận Chuyển Cao Cấp White-Glove</Text>
            <Text style={styles.deliveryDesc}>Bao gồm vận chuyển chuyên dụng, hỗ trợ dỡ hộp & lắp đặt</Text>
          </View>
          <Text style={styles.deliveryFee}>{formatCurrency(shipping)}</Text>
        </View>

        {/* Tóm Tắt Đơn Hàng */}
        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>TỔNG QUAN ĐƠN HÀNG ({cart.length})</Text>
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

      {/* Button Thanh Toán */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          onPress={handleProceedToPayment}
          style={styles.payBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.payBtnText}> Chọn phương thức thanh toán</Text>
          <Feather name="arrow-right" size={15} color="#FFFFFF" />
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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12.5,
    color: '#7A7067',
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
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 0.2,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif',
  },
  addressScroll: {
    gap: 10,
    paddingRight: 8,
    width: '100%',
  },
  addressPill: {
     width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E2D8',
  },
  addressPillSelected: {
    borderColor: '#8A6A48',
    backgroundColor: '#FAF7F2',
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addrName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A2421',
    flex: 1,
  },
  defaultTag: {
    backgroundColor: '#EAE2D5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A6A48',
  },
  addrPhone: {
    fontSize: 11.5,
    color: '#7A7067',
    marginBottom: 2,
  },
  addrLine: {
    fontSize: 11,
    color: '#7A7067',
    lineHeight: 15,
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 12,
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
  deliveryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 16,
  },
  deliveryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deliveryTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  deliveryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2A2421',
  },
  deliveryDesc: {
    fontSize: 11,
    color: '#7A7067',
    marginTop: 2,
  },
  deliveryFee: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#8A6A48',
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
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
    gap: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    
    fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif',
  },
});