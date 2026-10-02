import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Product } from '@/services/mockData';

const { width } = Dimensions.get('window');
// Calculate width for 2 columns grid with padding
const CARD_WIDTH = (width - 40 - 12) / 2;

interface ProductCardProps {
  item: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onPress: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ item, isWishlisted, onToggleWishlist, onAddToCart, onPress }) => {
    return (
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        style={styles.card}
        activeOpacity={0.92}
      >
        {/* Image & Wishlist Button */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.image} />
          {item.tag && (
            <View style={styles.badgeTag}>
              <Text style={styles.badgeText}>{item.tag}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleWishlist(item.id);
            }}
            style={styles.wishlistBtn}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={16}
              color={isWishlisted ? '#D93838' : '#252525'}
            />
          </TouchableOpacity>
        </View>

        {/* Content Info */}
        <View style={styles.infoWrapper}>
          <Text style={styles.brandCategory} numberOfLines={1}>
            {item.brand || item.category}
          </Text>

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#C89D5C" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          {/* Color Variant Swatches Dots (Task 4 & 5) */}
          {item.colors && item.colors.length > 0 && (
            <View style={styles.colorDotsRow}>
              {item.colors.slice(0, 3).map((c) => (
                <View
                  key={c.id}
                  style={[styles.colorDot, { backgroundColor: c.hex }]}
                />
              ))}
              {item.colors.length > 3 && (
                <Text style={styles.moreColorsText}>
                  +{item.colors.length - 3}
                </Text>
              )}
            </View>
          )}

          {/* Price & Add to Cart button */}
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ${item.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(item);
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
  }
);

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#252525',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 145,
    backgroundColor: '#F7F4EE',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8A6A48',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoWrapper: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  brandCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 4,
    lineHeight: 18,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#252525',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 11,
    color: '#6E6860',
    marginLeft: 2,
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  moreColorsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6E6860',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceGroup: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999187',
    textDecorationLine: 'line-through',
  },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8A6A48',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
