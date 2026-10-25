import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 12) / 2;

interface ProductCardProps {
  item: any;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: any) => void;
  onPress: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ item, isWishlisted, onToggleWishlist, onAddToCart, onPress }) => {
    const productId = String(item.id || item._id);

    const btnScale = useRef(new Animated.Value(1)).current;
    const [isAdding, setIsAdding] = useState(false);

    // Kiểm tra hết hàng từ dữ liệu thật của Backend:
    // Hết hàng nếu availableStock <= 0 hoặc inStock === false hoặc stockCount <= 0
    const isOutOfStock = useMemo(() => {
      if (item.availableStock !== undefined && Number(item.availableStock) <= 0) {
        return true;
      }
      if (item.stockCount !== undefined && Number(item.stockCount) <= 0) {
        return true;
      }
      if (item.inStock === false || item.isActive === false) {
        return true;
      }
      return false;
    }, [item]);

    const imageUri =
      item.image ||
      (Array.isArray(item.images) && item.images[0]) ||
      item.imageUrl ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600';

    const numericRating = Number(item.rating) || 5.0;
    const numericPrice = Number(item.price || item.minPrice) || 0;
    const numericOriginalPrice = item.originalPrice ? Number(item.originalPrice) : null;
    const reviewCount = Number(item.reviewCount) || 0;

    const handleQuickAdd = useCallback(
      (e: any) => {
        e.stopPropagation();
        if (isOutOfStock) return; // Chặn nếu hết hàng

        Animated.sequence([
          Animated.timing(btnScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
          Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();

        setIsAdding(true);
        setTimeout(() => setIsAdding(false), 500);

        onAddToCart(item);
      },
      [item, isOutOfStock, onAddToCart, btnScale]
    );

    return (
      <TouchableOpacity
        onPress={() => onPress(productId)}
        style={[styles.card, isOutOfStock && styles.cardDisabled]}
        activeOpacity={0.92}
      >
        {/* Ảnh, Badge Hết Hàng & Nút Wishlist */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={[styles.image, isOutOfStock && styles.imageMuted]} />
          
          {/* Badge trạng thái Hết Hàng hoặc Tag khuyến mãi */}
          {isOutOfStock ? (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>HẾT HÀNG</Text>
            </View>
          ) : item.tag ? (
            <View style={styles.badgeTag}>
              <Text style={styles.badgeText}>{item.tag}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleWishlist(productId);
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

        {/* Thông tin sản phẩm */}
        <View style={styles.infoWrapper}>
          <Text style={styles.brandCategory} numberOfLines={1}>
            {typeof item.brand === 'object' ? item.brand?.name : item.brand || item.category || 'NỘI THẤT'}
          </Text>

          <Text style={styles.title} numberOfLines={2}>
            {item.title || item.name || 'Sản phẩm'}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#ddab61" />
            <Text style={styles.ratingText}>{numericRating.toFixed(1)}</Text>
            {reviewCount > 0 ? (
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            ) : null}
          </View>

          {/* Giá & Nút Thêm vào giỏ */}
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={[styles.price, isOutOfStock && styles.priceMuted]}>
                {formatCurrency(numericPrice)}
              </Text>
              {numericOriginalPrice ? (
                <Text style={styles.originalPrice}>
                  {formatCurrency(numericOriginalPrice)}
                </Text>
              ) : null}
            </View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={handleQuickAdd}
                disabled={isOutOfStock}
                style={[
                  styles.addCartBtn,
                  isAdding && styles.addCartBtnActive,
                  isOutOfStock && styles.addCartBtnDisabled,
                ]}
                activeOpacity={0.85}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isOutOfStock ? (
                  <Feather name="slash" size={13} color="#A1998E" />
                ) : (
                  <Feather name="plus" size={15} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </Animated.View>
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
  cardDisabled: {
    borderColor: '#EAE5DC',
    backgroundColor: '#FAFAF8',
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
  imageMuted: {
    opacity: 0.45,
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
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3A3835',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outOfStockBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
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
    marginBottom: 8,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceGroup: {
    flexDirection: 'column',
    flex: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A48',
  },
  priceMuted: {
    color: '#9E978E',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999187',
    textDecorationLine: 'line-through',
  },
  addCartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8A6A48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCartBtnActive: {
    backgroundColor: '#27AE60',
  },
  addCartBtnDisabled: {
    backgroundColor: '#EBE5DC',
    borderWidth: 1,
    borderColor: '#D8D0C3',
  },
});