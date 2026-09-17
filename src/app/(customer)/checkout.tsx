import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>ĐỊA CHỈ GIAO HÀNG</Text>
          <Text style={styles.stepSub}>Bạn muốn chúng tôi giao đơn hàng đến đâu?</Text>
        </View>

        {/* Address Form */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>HỌ VÀ TÊN</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            placeholderTextColor="#6E6860"
          />

          <Text style={styles.label}>ĐỊA CHỈ NHÀ / ĐƯỜNG</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Đường Lê Lợi, Phường Bến Thành"
            placeholderTextColor="#6E6860"
          />

          <View style={styles.rowGroup}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>THÀNH PHỐ</Text>
              <TextInput
                style={styles.input}
                placeholder="TP. Hồ Chí Minh"
                placeholderTextColor="#6E6860"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>MÃ BƯU CHÍNH</Text>
              <TextInput
                style={styles.input}
                placeholder="700000"
                placeholderTextColor="#6E6860"
              />
            </View>
          </View>

          <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.input}
            placeholder="0901 234 567"
            placeholderTextColor="#6E6860"
            keyboardType="phone-pad"
          />
        </View>

        {/* Delivery Option */}
        <View style={styles.deliveryCard}>
          <Feather name="truck" size={22} color="#8A6A48" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.deliveryTitle}>Dịch Vụ Giao Hàng Cao Cấp</Text>
            <Text style={styles.deliverySub}>Vận chuyển tận phòng & hỗ trợ mở hộp</Text>
          </View>
          <Text style={styles.deliveryPrice}>$150</Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/payment')}
          style={styles.primaryBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>TIẾN HÀNH THANH TOÁN</Text>
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
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 14,
    color: '#6E6860',
  },
  formGroup: {
    gap: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#252525',
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
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
