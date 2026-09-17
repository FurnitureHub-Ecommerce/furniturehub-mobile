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
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2;

export default function ShopScreen() {
  const router = useRouter();

  const products = [
    {
      id: 'prod-1',
      title: 'Ghế Bành Vải Bouclé Mềm Aethel',
      category: 'Phòng Khách',
      price: 1280,
      rating: 4.9,
      image:
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-2',
      title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
      category: 'Phòng Ăn',
      price: 2450,
      rating: 5.0,
      image:
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-3',
      title: 'Đèn Thả Trần Đồng Thau Solis',
      category: 'Đèn & Chiếu Sáng',
      price: 490,
      rating: 4.8,
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-4',
      title: 'Giường Ngủ Kiểu Nhật Gỗ Nara',
      category: 'Phòng Ngủ',
      price: 2890,
      rating: 4.95,
      image:
        'https://images.unsplash.com/photo-1540518614846-7ede433c517a?w=600&auto=format&fit=crop&q=80',
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
        <Text style={styles.headerTitle}>Tất Cả Sản Phẩm</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/search')}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="sliders" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/product/${item.id}`)}
            style={styles.productCard}
            activeOpacity={0.9}
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
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
              <Text style={styles.productPrice}>
                ${item.price.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#252525',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
});
