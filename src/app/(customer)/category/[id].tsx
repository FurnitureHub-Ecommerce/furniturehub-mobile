import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { MOCK_PRODUCTS, CATEGORIES } from '@/services/mockData';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2;

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist } = useApp();

  const categoryObj = CATEGORIES.find((c) => c.id === id) || {
    id: id || 'cat-all',
    name: 'Danh Mục Sản Phẩm',
    image: '',
  };

  const products = MOCK_PRODUCTS.filter((p) => {
    if (id === 'cat-all' || !id) return true;
    return p.categorySlug === id;
  });

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
        <Text style={styles.headerTitle}>{categoryObj.name}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search')}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="box" size={48} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
          <Text style={styles.emptySub}>
            Các sản phẩm trong danh mục này đang được cập nhật. Vui lòng quay lại sau.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => {
            const isFav = wishlistIds.has(item.id);
            return (
              <TouchableOpacity
                onPress={() => router.push(`/(customer)/product/${item.id}`)}
                style={styles.productCard}
                activeOpacity={0.9}
              >
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <TouchableOpacity
                    onPress={() => toggleWishlist(item.id)}
                    style={styles.wishlistBtn}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={16}
                      color={isFav ? '#D93838' : '#252525'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#C89D5C" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                      ${item.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      style={styles.addCartBtn}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6E6860',
    textAlign: 'center',
  },
  gridContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 150,
    width: '100%',
    backgroundColor: '#F7F4EE',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: '#6E6860',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 6,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#252525',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
  addCartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8A6A48',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
