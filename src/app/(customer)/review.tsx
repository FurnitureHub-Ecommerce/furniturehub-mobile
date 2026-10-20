import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { createReviewApi } from '@/services/api';

const RATING_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường, tạm ổn',
  4: 'Hài lòng với sản phẩm',
  5: 'Xuất sắc, vượt mong đợi!',
};

const QUICK_TAGS = [
  'Chất lượng gỗ cao cấp',
  'Đóng gói cẩn thận',
  'Đúng hình ảnh & mô tả',
  'Màu sắc trang nhã',
  'Giao hàng tận phòng',
  'Dịch vụ chu đáo',
];

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    productId?: string;
    productTitle?: string;
    productImage?: string;
  }>();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Chất lượng gỗ cao cấp']);
  const [submitting, setSubmitting] = useState(false);

  const productTitle = params.productTitle || 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi';
  const productImage =
    params.productImage ||
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Nhận xét còn trống', 'Vui lòng chia sẻ đôi điều cảm nhận của bạn về sản phẩm.');
      return;
    }

    try {
      setSubmitting(true);
      await createReviewApi({
        productId: params.productId || 'prod-1',
        rating,
        comment: comment.trim(),
        orderId: params.orderId,
      });

      Alert.alert(
        'Đánh Giá Thành Công',
        'Cảm ơn bạn đã đóng góp đánh giá quý báu để nâng cao chất lượng trải nghiệm.',
        [{ text: 'Đóng', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Gửi đánh giá không thành công.');
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Đánh Giá Sản Phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Snapshot Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: productImage }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productBrand}>LUMORA CONCIERGE</Text>
            <Text style={styles.productTitle} numberOfLines={2}>
              {productTitle}
            </Text>
            {params.orderId && (
              <Text style={styles.orderNumber}>Đơn hàng #{params.orderId}</Text>
            )}
          </View>
        </View>

        {/* 1-5 Star Rating Picker */}
        <View style={styles.ratingCard}>
          <Text style={styles.sectionLabel}>CHẤT LƯỢNG TRẢI NGHIỆM TỔNG THỂ</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#DDAB61' : '#C2B8A3'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabelText}>{RATING_LABELS[rating]}</Text>
        </View>

        {/* Quick Review Attributes */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionLabel}>ĐIỂM NỔI BẬT BẠN THÍCH NHẤT</Text>
          <View style={styles.tagGrid}>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={isSelected ? 'check' : 'plus'}
                    size={12}
                    color={isSelected ? '#FFFFFF' : '#8A6A48'}
                  />
                  <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Detailed Review Text Input with Fixed Padding */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>CHI TIẾT NHẬN XÉT CỦA BẠN</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Feather name="edit-3" size={15} color="#8A6A48" style={{ marginRight: 8 }} />
              <Text style={styles.inputHelper}>Chia sẻ cảm nhận chân thật</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Độ hoàn thiện bề mặt, độ êm của nệm, sự phối hợp nội thất trong không gian nhà bạn..."
              placeholderTextColor="#999187"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
            <Text style={styles.charCounter}>{comment.length}/500 ký tự</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmitReview}
          disabled={submitting}
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>GỬI ĐÁNH GIÁ CHẤT LƯỢNG</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 3,
  },
  orderNumber: {
    fontSize: 11,
    color: '#6E6860',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A6A48',
    marginTop: 6,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 6,
  },
  tagChipSelected: {
    backgroundColor: '#8A6A48',
    borderColor: '#8A6A48',
  },
  tagChipText: {
    fontSize: 12,
    color: '#252525',
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    padding: 14,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F4EE',
  },
  inputHelper: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6A48',
  },
  textArea: {
    minHeight: 100,
    fontSize: 14,
    color: '#252525',
    lineHeight: 20,
  },
  charCounter: {
    fontSize: 11,
    color: '#999187',
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
