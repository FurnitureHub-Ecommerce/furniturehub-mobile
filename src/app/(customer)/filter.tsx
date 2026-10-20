import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '@/services/mockData';

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-1000', label: 'Dưới $1,000' },
  { id: '1000-2500', label: '$1,000 - $2,500' },
  { id: '2500-5000', label: '$2,500 - $5,000' },
  { id: 'above-5000', label: 'Trên $5,000' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới Nhất' },
  { id: 'price-asc', label: 'Giá: Thấp Đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao Đến Thấp' },
  { id: 'rating', label: 'Đánh Giá Cao Nhất' },
];

const BRANDS = [
  { id: 'all', label: 'Tất cả thương hiệu' },
  { id: 'lumora', label: 'Lumora Signature' },
  { id: 'komorebi', label: 'Komorebi Atelier' },
  { id: 'aethel', label: 'Aethel Nordic' },
];

export default function FilterScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  const handleReset = () => {
    setSelectedCategory('cat-all');
    setSelectedPrice('all');
    setSelectedSort('newest');
    setSelectedBrand('all');
    setInStockOnly(false);
  };

  const handleApply = () => {
    // Quay lại màn hình Shop / Cửa hàng
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="x" size={20} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ Lọc Tìm Kiếm</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Đặt Lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sort Order */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SẮP XẾP THEO</Text>
          <View style={styles.chipGrid}>
            {SORT_OPTIONS.map((item) => {
              const active = selectedSort === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedSort(item.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANH MỤC SẢN PHẨM</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price Ranges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KHOẢNG GIÁ</Text>
          <View style={styles.chipGrid}>
            {PRICE_RANGES.map((item) => {
              const active = selectedPrice === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedPrice(item.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Brand */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THƯƠNG HIỆU & NHÀ THIẾT KẾ</Text>
          <View style={styles.chipGrid}>
            {BRANDS.map((item) => {
              const active = selectedBrand === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedBrand(item.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* In Stock Only Switch */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Chỉ hiển thị sản phẩm còn hàng</Text>
            <Text style={styles.switchSub}>Ẩn các biến thể tạm thời hết hàng</Text>
          </View>
          <Switch
            value={inStockOnly}
            onValueChange={setInStockOnly}
            trackColor={{ false: '#E2DBD0', true: '#8A6A48' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : inStockOnly ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </ScrollView>

      {/* Footer Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleApply}
          style={styles.applyBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.applyBtnText}>ÁP DỤNG BỘ LỌC</Text>
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
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A6A48',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  chipActive: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#252525',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginTop: 8,
    marginBottom: 20,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 12,
    color: '#6E6860',
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
  applyBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
