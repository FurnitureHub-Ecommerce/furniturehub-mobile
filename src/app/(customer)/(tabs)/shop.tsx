import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { MOCK_PRODUCTS, CATEGORIES } from '@/services/mockData';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2;

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart, wishlistIds, toggleWishlist } = useApp();
  const [selectedCat, setSelectedCat] = useState('cat-all');

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (selectedCat === 'cat-all') return true;
    return p.categorySlug === selectedCat;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cửa Hàng Nội Thất</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search')}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const isActive = selectedCat === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCat(item.id)}
                style={[styles.catPill, isActive && styles.catPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, isActive && styles.catTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
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
                  activeOpacity={0.8}
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
                  <Text style={styles.reviewCount}>({item.reviewCount})</Text>
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
                    activeOpacity={0.8}
                  >
                    <Feather name="plus" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryBar: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  catPillActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6860',
  },
  catTextActive: {
    color: '#FFFFFF',
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
  reviewCount: {
    fontSize: 11,
    color: '#6E6860',
    marginLeft: 2,
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
