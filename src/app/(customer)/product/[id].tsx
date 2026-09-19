import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { MOCK_PRODUCTS } from '@/services/mockData';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, wishlistIds, toggleWishlist, cartCount } = useApp();

  const product = MOCK_PRODUCTS.find((p) => p.id === id) || {
    id: id || 'prod-1',
    title: 'Ghế Bành Vải Bouclé Mềm Aethel',
    category: 'Phòng Khách',
    categorySlug: 'cat-living',
    price: 1280,
    originalPrice: 1450,
    rating: 4.9,
    reviewCount: 42,
    description:
      'Chế tác thủ công với lớp bọc vải bouclé mềm mại cao cấp trên khung gỗ tự nhiên sấy khô tiêu chuẩn. Thiết kế tối ưu mang lại sự êm ái tuyệt đối.',
    dimensions: 'R 88cm x S 92cm x C 78cm',
    material: 'Vải Bouclé Ý tự nhiên, Gỗ Sồi đạt chuẩn FSC',
    image:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1000&auto=format&fit=crop&q=80',
    filterType: 'featured' as const,
  };

  const isWishlisted = wishlistIds.has(product.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => toggleWishlist(product.id)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#D93838' : '#252525'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(customer)/cart' as any)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Feather name="shopping-bag" size={18} color="#252525" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        {/* Product Meta */}
        <View style={styles.detailsContainer}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <Text style={styles.titleText}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#C89D5C" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} Đánh giá)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              ${product.price.toLocaleString()}
            </Text>
            {product.originalPrice && (
              <Text style={styles.originalPriceText}>
                ${product.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Specs */}
          <View style={styles.specsCard}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Kích thước:</Text>
              <Text style={styles.specValue}>{product.dimensions}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Chất liệu:</Text>
              <Text style={styles.specValue}>{product.material}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Bag Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            addToCart(product);
            router.push('/(customer)/cart' as any);
          }}
          style={styles.addBagBtn}
          activeOpacity={0.88}
        >
          <Feather name="shopping-bag" size={16} color="#FFFFFF" />
          <Text style={styles.addBagText}>THÊM VÀO GIỎ HÀNG</Text>
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
    paddingVertical: 12,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D93838',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: 320,
    backgroundColor: '#E9E1D5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#252525',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6E6860',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8A6A48',
  },
  originalPriceText: {
    fontSize: 14,
    color: '#6E6860',
    textDecorationLine: 'line-through',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6E6860',
    lineHeight: 22,
    marginBottom: 20,
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 13,
    color: '#6E6860',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
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
  addBagBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
