import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/context/AppContext';
import {
  getAddressesApi,
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

  // Load danh sách địa chỉ đã lưu từ Backend API
  const fetchCheckoutData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const addressList = await getAddressesApi(token || undefined).catch(() => []);
      const list = Array.isArray(addressList) ? addressList : [];
      setAddresses(list);

      setSelectedAddressId((prevId) => {
        if (prevId && list.some((a: any) => (a._id || a.id) === prevId)) {
          return prevId;
        }
        const defaultAddr = list.find((a: any) => a.isDefault) || list[0];
        return defaultAddr ? (defaultAddr._id || defaultAddr.id || null) : null;
      });
    } catch (err) {
      console.warn('Lỗi tải thông tin giao hàng:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động tải lại khi quay lại từ màn hình quản lý địa chỉ
  useFocusEffect(
    useCallback(() => {
      fetchCheckoutData();
    }, [fetchCheckoutData])
  );

  const handleSelectAddress = (addr: AddressItem) => {
    const id = addr._id || addr.id || null;
    setSelectedAddressId(id);
  };

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      Alert.alert(
        'Thiếu địa chỉ',
        'Vui lòng chọn 1 địa chỉ giao hàng trong danh sách hoặc bấm "Thêm địa chỉ mới".'
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    const selectedAddr = addresses.find(
      (a: any) => (a._id || a.id) === selectedAddressId
    );

    const name =
      selectedAddr?.receiverName ||
      selectedAddr?.fullName ||
      selectedAddr?.name ||
      'Người nhận';
    const phoneNum =
      selectedAddr?.phone || selectedAddr?.phoneNumber || '';
    const detail =
      selectedAddr?.addressLine ||
      selectedAddr?.street ||
      selectedAddr?.address ||
      '';
    const full = [detail, selectedAddr?.ward, selectedAddr?.city]
      .filter(Boolean)
      .join(', ');

    router.push({
      pathname: '/(customer)/payment',
      params: {
        addressId: selectedAddressId,
        receiverName: name,
        phone: phoneNum,
        fullAddress: full,
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

        {/* Sổ Địa Chỉ Giao Hàng */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
            <TouchableOpacity
              onPress={() => router.push('/(customer)/account/address' as any)}
              style={styles.manageAddressBtn}
              activeOpacity={0.7}
            >
              <Feather name="plus-circle" size={13} color="#8A6A48" />
              <Text style={styles.manageAddressText}>Thêm / Quản lý</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyAddressCard}>
              <Feather name="map-pin" size={28} color="#C2B8A3" />
              <Text style={styles.emptyAddressTitle}>Chưa có địa chỉ giao hàng</Text>
              <Text style={styles.emptyAddressSub}>
                Vui lòng tạo địa chỉ nhận hàng để tiếp tục đặt đơn
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(customer)/account/address' as any)}
                style={styles.addAddressNowBtn}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addAddressNowText}>Thêm Địa Chỉ Mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isSelected = selectedAddressId === addrId;
                const name = addr.receiverName || addr.fullName || addr.name || 'Người nhận';
                const detail = addr.addressLine || addr.street || addr.address || '';
                const full = [detail, addr.ward, addr.city].filter(Boolean).join(', ');

                return (
                  <TouchableOpacity
                    key={addrId}
                    onPress={() => handleSelectAddress(addr)}
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addrHeaderRow}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={isSelected ? '#8A6A48' : '#A0988E'}
                      />
                      <Text style={styles.addrName} numberOfLines={1}>{name}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultTag}>
                          <Text style={styles.defaultTagText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.addrInfoRow}>
                      <Feather name="phone" size={12} color="#7A7067" />
                      <Text style={styles.addrPhone}>
                        {addr.phone || addr.phoneNumber || 'Chưa cập nhật SĐT'}
                      </Text>
                    </View>
                    <View style={styles.addrInfoRow}>
                      <Feather name="map-pin" size={12} color="#7A7067" />
                      <Text style={styles.addrLine} numberOfLines={2}>
                        {full || 'Chưa có địa chỉ chi tiết'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  manageAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
  addressList: {
    gap: 10,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8E2D8',
    elevation: 1,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  addressCardSelected: {
    borderColor: '#8A6A48',
    backgroundColor: '#FAF7F2',
  },
  addrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addrName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2A2421',
    flex: 1,
  },
  defaultTag: {
    backgroundColor: '#EAE2D5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A6A48',
  },
  addrInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  addrPhone: {
    fontSize: 12,
    color: '#5C544E',
    fontWeight: '500',
  },
  addrLine: {
    flex: 1,
    fontSize: 12,
    color: '#7A7067',
    lineHeight: 16,
  },
  emptyAddressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2421',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyAddressSub: {
    fontSize: 12,
    color: '#7A7067',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  addAddressNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8A6A48',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  addAddressNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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