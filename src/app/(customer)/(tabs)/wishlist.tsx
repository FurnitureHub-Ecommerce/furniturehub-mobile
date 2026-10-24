import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { formatCurrency } from '@/services/api';

export default function WishlistTabScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, addToCart } = useApp();

  const wishlistedItems = MOCK_PRODUCTS.filter((item) => wishlistIds.has(item.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản Phẩm Yêu Thích</Text>
      </View>

      {wishlistedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySub}>
            Lưu lại các tác phẩm nội thất bạn yêu thích bằng cách nhấn vào biểu tượng trái tim.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/(tabs)/shop' as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>KHÁM PHÁ BỘ SƯU TẬP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <TouchableOpacity
                onPress={() => router.push(`/(customer)/product/${item.id}` as any)}
                style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.brandName}>{item.brand || 'LUMORA'}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {/* Đồng bộ giá tiền hiển thị */}
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      addToCart(item);
                      router.push('/(customer)/(tabs)/cart' as any);
                    }}
                    style={styles.addBagBtn}
                    activeOpacity={0.8}
                  >
                    <Feather name="shopping-bag" size={13} color="#FFFFFF" />
                    <Text style={styles.addBagText}>Chuyển Vào Giỏ</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleWishlist(item.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart" size={22} color="#D93838" />
              </TouchableOpacity>
            </View>
          )}
        />
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
    fontSize: 18,
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
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 6,
  },
  brandName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
    marginBottom: 8,
  },
  addBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A6A48',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  addBagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 8,
  },
});
