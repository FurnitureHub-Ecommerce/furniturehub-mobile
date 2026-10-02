import React, { useState } from 'react';
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
import { Feather, Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('card');

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTag}>CHỌN PHƯƠNG THỨC THANH TOÁN</Text>

        {/* Card Option */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('card')}
          style={[
            styles.methodCard,
            selectedMethod === 'card' && styles.methodCardActive,
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <Feather name="credit-card" size={20} color="#8A6A48" />
            <Text style={styles.methodTitle}>Thẻ Tín Dụng / Ghi Nợ</Text>
            <Ionicons
              name={
                selectedMethod === 'card'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color={selectedMethod === 'card' ? '#8A6A48' : '#6E6860'}
              style={{ marginLeft: 'auto' }}
            />
          </View>

          {selectedMethod === 'card' && (
            <View style={styles.cardForm}>
              <Text style={styles.label}>SỐ THẺ</Text>
              <TextInput
                style={styles.input}
                placeholder="4532 •••• •••• 8921"
                placeholderTextColor="#6E6860"
                keyboardType="numeric"
              />

              <View style={styles.rowGroup}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>HẠN DÙNG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="09 / 28"
                    placeholderTextColor="#6E6860"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>MÃ CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="882"
                    placeholderTextColor="#6E6860"
                    secureTextEntry
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Apple / Google Pay */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('wallet')}
          style={[
            styles.methodCard,
            selectedMethod === 'wallet' && styles.methodCardActive,
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <Feather name="smartphone" size={20} color="#8A6A48" />
            <Text style={styles.methodTitle}>Ví Điện Tử (Apple Pay / Google Pay)</Text>
            <Ionicons
              name={
                selectedMethod === 'wallet'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color={selectedMethod === 'wallet' ? '#8A6A48' : '#6E6860'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </TouchableOpacity>

        {/* Bank Transfer */}
        <TouchableOpacity
          onPress={() => setSelectedMethod('bank')}
          style={[
            styles.methodCard,
            selectedMethod === 'bank' && styles.methodCardActive,
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <Feather name="globe" size={20} color="#8A6A48" />
            <Text style={styles.methodTitle}>Chuyển Khoản Ngân Hàng Concierge</Text>
            <Ionicons
              name={
                selectedMethod === 'bank'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color={selectedMethod === 'bank' ? '#8A6A48' : '#6E6860'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Complete Order Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/orders')}
          style={styles.primaryBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>ĐẶT HÀNG CAO CẤP ($1,920)</Text>
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
  sectionTag: {
    fontSize: 12,
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
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
  },
  cardForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
  },
  input: {
    height: 46,
    backgroundColor: '#F7F4EE',
    borderRadius: 8,
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
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
