import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

export interface FilterState {
  categoryId: string;
  priceRange: 'all' | 'under-2m' | '2m-5m' | '5m-10m' | 'above-10m';
  sortOrder: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  inStockOnly: boolean;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterState;
  categories: any[];
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  matchingCount: number;
}

const PRICE_TIERS = [
  { id: 'all', label: 'Tất Cả Mức Giá' },
  { id: 'under-2m', label: 'Dưới 2 Triệu' },
  { id: '2m-5m', label: 'Từ 2 - 5 Triệu' },
  { id: '5m-10m', label: 'Từ 5 - 10 Triệu' },
  { id: 'above-10m', label: 'Trên 10 Triệu' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới Nhất' },
  { id: 'price-asc', label: 'Giá: Thấp Đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao Đến Thấp' },
  { id: 'rating', label: 'Đánh Giá Cao Nhất' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  categories,
  onClose,
  onApplyFilters,
  onResetFilters,
  matchingCount,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bộ Lọc Tìm Kiếm</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#252525" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Sắp xếp */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SẮP XẾP THEO</Text>
                <View style={styles.chipsWrap}>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = localFilters.sortOrder === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setLocalFilters((prev) => ({ ...prev, sortOrder: opt.id as any }))}
                        style={[styles.chip, isSelected && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Khoảng giá theo tiền VNĐ */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>KHOẢNG GIÁ (VNĐ)</Text>
                <View style={styles.chipsWrap}>
                  {PRICE_TIERS.map((tier) => {
                    const isSelected = localFilters.priceRange === tier.id;
                    return (
                      <TouchableOpacity
                        key={tier.id}
                        onPress={() => setLocalFilters((prev) => ({ ...prev, priceRange: tier.id as any }))}
                        style={[styles.chip, isSelected && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {tier.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Chỉ hiện sản phẩm còn hàng */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Chỉ hiện sản phẩm còn hàng</Text>
                  <Text style={styles.switchSub}>Lọc bỏ các sản phẩm đã hết hàng trong kho</Text>
                </View>
                <Switch
                  value={localFilters.inStockOnly}
                  onValueChange={(val) => setLocalFilters((prev) => ({ ...prev, inStockOnly: val }))}
                  trackColor={{ false: '#E2DBD0', true: '#8A6A48' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Text style={styles.resetText}>Đặt Lại</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
                <Text style={styles.applyText}>
                  Áp Dụng ({matchingCount} Sản Phẩm)
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F7F4EE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  safeArea: {
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#252525',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  chipsWrap: {
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
    marginBottom: 20,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11,
    color: '#6E6860',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DBD0',
    backgroundColor: '#F7F4EE',
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6860',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#8A6A48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});