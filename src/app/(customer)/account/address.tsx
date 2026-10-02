import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AddressScreen() {
  const router = useRouter();

  const addresses = [
    {
      id: 'addr-1',
      title: 'Nhà Riêng (Địa Chỉ Chính)',
      name: 'Eleanor Vance',
      street: '742 Evergreen Terrace',
      city: 'Springfield, OR 97477',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Biệt Thự Nghi Dưỡng',
      name: 'Eleanor Vance',
      street: '108 Ocean Drive',
      city: 'Malibu, CA 90265',
      isDefault: false,
    },
  ];

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
        <Text style={styles.headerTitle}>Địa Chỉ Đã Lưu</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="plus" size={20} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.map((item) => (
          <View key={item.id} style={styles.addressCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.addressTitle}>{item.title}</Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>MẶC ĐỊNH</Text>
                </View>
              )}
            </View>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.streetText}>{item.street}</Text>
            <Text style={styles.cityText}>{item.city}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn}>
                <Feather name="edit-2" size={13} color="#8A6A48" />
                <Text style={styles.editBtnText}>Chỉnh Sửa Địa Chỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#252525',
  },
  defaultBadge: {
    backgroundColor: '#8A6A48',
    paddingVertical: 2,
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
    marginBottom: 2,
  },
  streetText: {
    fontSize: 13,
    color: '#6E6860',
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
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
});
