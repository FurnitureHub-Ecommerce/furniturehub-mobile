import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BRANDS, SORT_OPTIONS } from '@/services/mockData';

export interface FilterState {
  brandId: string;
  priceRange: 'all' | 'under500' | '500-1500' | '1500-3000' | 'above3000';
  sortOrder: string;
  inStockOnly: boolean;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterState;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  matchingCount: number;
}

const PRICE_TIERS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'under500', label: 'Dưới $500' },
  { id: '500-1500', label: '$500 - $1,500' },
  { id: '1500-3000', label: '$1,500 - $3,000' },
  { id: 'above3000', label: 'Trên $3,000' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApplyFilters,
  onResetFilters,
  matchingCount,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
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
            {/* Modal Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bộ Lọc Nâng Cao</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#252525" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* BRAND FILTER (Task 4) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>THƯƠNG HIỆU (BRAND)</Text>
                <View style={styles.chipsWrap}>
                  {BRANDS.map((brand) => {
                    const isSelected = localFilters.brandId === brand.id;
                    return (
                      <TouchableOpacity
                        key={brand.id}
                        onPress={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            brandId: brand.id,
                          }))
                        }
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {brand.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* PRICE RANGE FILTER */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>KHOẢNG GIÁ ($ USD)</Text>
                <View style={styles.chipsWrap}>
                  {PRICE_TIERS.map((tier) => {
                    const isSelected = localFilters.priceRange === tier.id;
                    return (
                      <TouchableOpacity
                        key={tier.id}
                        onPress={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            priceRange: tier.id as any,
                          }))
                        }
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {tier.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SORT ORDER FILTER */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SẮP XẾP SẢN PHẨM</Text>
                <View style={styles.sortList}>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = localFilters.sortOrder === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            sortOrder: opt.id,
                          }))
                        }
                        style={[
                          styles.sortOption,
                          isSelected && styles.sortOptionActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.sortOptionText,
                            isSelected && styles.sortOptionTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {isSelected && (
                          <Feather name="check" size={16} color="#8A6A48" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* IN STOCK TOGGLE */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Chỉ hiện sản phẩm còn hàng</Text>
                  <Text style={styles.switchSub}>
                    Lọc bỏ các biến thể sản phẩm đã hết hàng trong kho
                  </Text>
                </View>
                <Switch
                  value={localFilters.inStockOnly}
                  onValueChange={(val) =>
                    setLocalFilters((prev) => ({ ...prev, inStockOnly: val }))
                  }
                  trackColor={{ false: '#E2DBD0', true: '#8A6A48' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.resetBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.resetText}>Thiết Lập Lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                style={styles.applyBtn}
                activeOpacity={0.85}
              >
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
    fontSize: 18,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 12,
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
  sortList: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  sortOptionActive: {
    borderColor: '#8A6A48',
    backgroundColor: '#FDFBF7',
  },
  sortOptionText: {
    fontSize: 13,
    color: '#252525',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#8A6A48',
    fontWeight: '700',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
  },
  switchSub: {
    fontSize: 12,
    color: '#6E6860',
    marginTop: 2,
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
    paddingHorizontal: 16,
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
