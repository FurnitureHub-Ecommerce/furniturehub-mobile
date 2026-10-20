import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  AddressItem,
} from '@/services/api';

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const data = await getAddressesApi(token || undefined);
      setAddresses(data);
    } catch (err) {
      console.warn('Lỗi lấy danh sách địa chỉ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('Nhà Riêng');
    setFullName('');
    setPhone('');
    setStreet('');
    setCity('TP. Hồ Chí Minh');
    setIsDefault(addresses.length === 0);
    setModalVisible(true);
  };

  const openEditModal = (item: AddressItem) => {
    setEditingId(item._id || item.id || null);
    setTitle(item.title || 'Nhà Riêng');
    setFullName(item.fullName || item.name || '');
    setPhone(item.phone || '');
    setStreet(item.street || item.address || '');
    setCity(item.city || 'TP. Hồ Chí Minh');
    setIsDefault(!!item.isDefault);
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    const payload: AddressItem = {
      title: title.trim() || 'Địa chỉ giao hàng',
      fullName: fullName.trim(),
      name: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      address: street.trim(),
      city: city.trim() || 'TP. Hồ Chí Minh',
      isDefault,
    };

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');

      if (editingId) {
        await updateAddressApi(editingId, payload, token || undefined);
        setAddresses((prev) =>
          prev.map((a) => ((a._id || a.id) === editingId ? { ...a, ...payload } : a))
        );
        Alert.alert('Thành Công', 'Đã cập nhật địa chỉ giao hàng.');
      } else {
        const newAddr = await createAddressApi(payload, token || undefined);
        const itemCreated = newAddr.data || newAddr.address || { ...payload, id: `addr-${Date.now()}` };
        setAddresses((prev) => [itemCreated, ...prev]);
        Alert.alert('Thành Công', 'Đã lưu địa chỉ giao hàng mới.');
      }

      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Không thể lưu địa chỉ vào lúc này.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    Alert.alert('Xóa Địa Chỉ', 'Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteAddressApi(id, token || undefined);
            setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể xóa địa chỉ.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id?: string) => {
    if (!id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await setDefaultAddressApi(id, token || undefined);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: (a._id || a.id) === id,
        }))
      );
    } catch (err: any) {
      console.warn('Lỗi đặt mặc định:', err);
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
        <Text style={styles.headerTitle}>Sổ Địa Chỉ Giao Hàng</Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={20} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải sổ địa chỉ...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={56} color="#C2B8A3" />
              <Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text>
              <Text style={styles.emptySub}>
                Lưu lại các địa chỉ giao hàng để đặt hàng và nhận bàn giao nhanh chóng.
              </Text>
              <TouchableOpacity
                onPress={openAddModal}
                style={styles.addBtn}
                activeOpacity={0.88}
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>THÊM ĐỊA CHỈ MỚI</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((item) => {
              const itemId = item._id || item.id;
              return (
                <View key={itemId} style={styles.addressCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleGroup}>
                      <Feather name="home" size={16} color="#8A6A48" style={{ marginRight: 6 }} />
                      <Text style={styles.addressTitle}>{item.title || 'Địa Chỉ Nhận Hàng'}</Text>
                    </View>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>MẶC ĐỊNH</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.nameText}>
                    {item.fullName || item.name} • {item.phone}
                  </Text>
                  <Text style={styles.streetText}>{item.street || item.address}</Text>
                  <Text style={styles.cityText}>{item.city}</Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={styles.actionBtn}
                      activeOpacity={0.75}
                    >
                      <Feather name="edit-2" size={13} color="#8A6A48" />
                      <Text style={styles.actionBtnText}>Chỉnh Sửa</Text>
                    </TouchableOpacity>

                    {!item.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(itemId)}
                        style={styles.actionBtn}
                        activeOpacity={0.75}
                      >
                        <Feather name="check-circle" size={13} color="#6E6860" />
                        <Text style={styles.actionBtnTextSecondary}>Đặt Mặc Định</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(itemId)}
                      style={[styles.actionBtn, { marginLeft: 'auto' }]}
                      activeOpacity={0.75}
                    >
                      <Feather name="trash-2" size={13} color="#D93838" />
                      <Text style={styles.deleteBtnText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal Thêm / Chỉnh Sửa Địa Chỉ với Input Icon Padding Chuẩn */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.iconButton}>
              <Feather name="x" size={20} color="#252525" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Tên gọi gợi nhớ */}
            <Text style={styles.modalLabel}>TÊN GỢI NHỚ (VD: Nhà Riêng, Biệt Thự Malibu)</Text>
            <View style={styles.modalInputWrapper}>
              <View style={styles.modalIconBox}>
                <Feather name="bookmark" size={17} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Nhà Riêng / Căn Hộ..."
                placeholderTextColor="#A0988E"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Họ tên người nhận */}
            <Text style={styles.modalLabel}>HỌ VÀ TÊN NGƯỜI NHẬN</Text>
            <View style={styles.modalInputWrapper}>
              <View style={styles.modalIconBox}>
                <Feather name="user" size={17} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#A0988E"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Số điện thoại */}
            <Text style={styles.modalLabel}>SỐ ĐIỆN THOẠI</Text>
            <View style={styles.modalInputWrapper}>
              <View style={styles.modalIconBox}>
                <Feather name="phone" size={17} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.modalTextInput}
                placeholder="0901 234 567"
                placeholderTextColor="#A0988E"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Số nhà, tên đường */}
            <Text style={styles.modalLabel}>ĐỊA CHỈ CHI TIẾT (SỐ NHÀ, ĐƯỜNG, PHƯỜNG/XÃ)</Text>
            <View style={styles.modalInputWrapper}>
              <View style={styles.modalIconBox}>
                <Feather name="map-pin" size={17} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.modalTextInput}
                placeholder="123 Đường Lê Lợi, Phường Bến Thành, Quận 1"
                placeholderTextColor="#A0988E"
                value={street}
                onChangeText={setStreet}
              />
            </View>

            {/* Tỉnh / Thành phố */}
            <Text style={styles.modalLabel}>TỈNH / THÀNH PHỐ</Text>
            <View style={styles.modalInputWrapper}>
              <View style={styles.modalIconBox}>
                <Feather name="compass" size={17} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.modalTextInput}
                placeholder="TP. Hồ Chí Minh"
                placeholderTextColor="#A0988E"
                value={city}
                onChangeText={setCity}
              />
            </View>

            {/* Checkbox Đặt làm mặc định */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Đặt làm địa chỉ giao hàng mặc định</Text>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#E2DBD0', true: '#8A6A48' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSaveAddress}
              disabled={saving}
              style={[styles.saveModalBtn, saving && { opacity: 0.7 }]}
              activeOpacity={0.88}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveModalBtnText}>LƯU ĐỊA CHỈ GIAO HÀNG</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E6860',
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
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A6A48',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  addressCard: {
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
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252525',
  },
  defaultBadge: {
    backgroundColor: '#8A6A48',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 3,
  },
  streetText: {
    fontSize: 13,
    color: '#6E6860',
    lineHeight: 18,
  },
  cityText: {
    fontSize: 13,
    color: '#6E6860',
    marginBottom: 12,
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
  actionBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6860',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D93838',
  },
  // Modal styles with fixed input icon padding
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  // Ô nhập liệu fix triệt để khoảng cách padding icon
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalIconBox: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Khoảng cách giữa icon và chữ nhập
  },
  modalTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#252525',
    paddingVertical: 0,
    height: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 14,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#252525',
  },
  saveModalBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
