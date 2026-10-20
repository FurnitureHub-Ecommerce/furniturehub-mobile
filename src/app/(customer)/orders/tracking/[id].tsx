import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getOrderTrackingApi, getOrderDetailApi, OrderItem } from '@/services/api';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  useEffect(() => {
    const loadTracking = async () => {
      try {
        setLoading(true);
        const orderId = id || 'LUM-89210';
        const [orderData, trackingData] = await Promise.all([
          getOrderDetailApi(orderId),
          getOrderTrackingApi(orderId),
        ]);
        setOrder(orderData);
        setTrackingInfo(trackingData);
      } catch (error) {
        console.warn('Lỗi tải thông tin vận chuyển:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [id]);

  const timelineSteps = trackingInfo?.timeline || [
    { step: 1, title: 'Đã Đặt Hàng Thành Công', description: 'Đơn hàng được ghi nhận vào hệ thống concierge', time: '14/09/2026 09:30', completed: true },
    { step: 2, title: 'Đã Xác Nhận & Thanh Toán', description: 'Thanh toán thành công qua thẻ tín dụng', time: '14/09/2026 10:15', completed: true },
    { step: 3, title: 'Đang Đóng Gói Cao Cấp', description: 'Được đóng kiện bảo vệ góc bởi chuyên viên nội thất', time: '14/09/2026 15:45', completed: true },
    { step: 4, title: 'Đang Vận Chuyển Concierge', description: 'Đội ngũ giao xe chuyên dụng đang trên đường giao', time: '15/09/2026 08:30', completed: false, current: true },
    { step: 5, title: 'Giao Hàng & Bàn Giao', description: 'Hỗ trợ mở hộp, sắp đặt vị trí phòng và ký biên bản', time: 'Dự kiến 16/09/2026', completed: false },
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
        <Text style={styles.headerTitle}>Theo Dõi Đơn Hàng</Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/${id || 'LUM-89210'}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="file-text" size={18} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải lộ trình vận chuyển...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Tracking Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.carrierLabel}>ĐƠN VỊ VẬN CHUYỂN</Text>
                <Text style={styles.carrierName}>
                  {trackingInfo?.carrier || 'FurnitureHub Concierge Express'}
                </Text>
              </View>
              <View style={styles.transitBadge}>
                <Text style={styles.transitBadgeText}>ĐANG GIAO</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoSub}>Mã đơn hàng</Text>
                <Text style={styles.infoVal}>#{id || order?.id || 'LUM-89210'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoSub}>Mã vận đơn</Text>
                <Text style={styles.infoVal}>{trackingInfo?.trackingNumber || `FHB-${id || '89210'}`}</Text>
              </View>
            </View>

            <View style={styles.estimatedDeliveryBox}>
              <Ionicons name="calendar-outline" size={18} color="#8A6A48" />
              <Text style={styles.estimatedText}>
                Dự kiến bàn giao:{' '}
                <Text style={styles.estimatedBold}>{trackingInfo?.estimatedDelivery || '16 tháng 09, 2026'}</Text>
              </Text>
            </View>
          </View>

          {/* Stepper / Timeline */}
          <Text style={styles.sectionTitle}>LỘ TRÌNH VẬN CHUYỂN CHI TIẾT</Text>

          <View style={styles.timelineCard}>
            {timelineSteps.map((step: any, idx: number) => {
              const isLast = idx === timelineSteps.length - 1;
              const isCompleted = step.completed;
              const isCurrent = step.current;

              return (
                <View key={step.step || idx} style={styles.timelineItem}>
                  {/* Left Column: Indicator Node + Line */}
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.nodeCircle,
                        isCompleted && styles.nodeCircleCompleted,
                        isCurrent && styles.nodeCircleCurrent,
                      ]}
                    >
                      {isCompleted ? (
                        <Feather name="check" size={13} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <View style={styles.currentDot} />
                      ) : (
                        <Text style={styles.nodeNumber}>{idx + 1}</Text>
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalLine,
                          isCompleted && styles.verticalLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Step Info */}
                  <View style={[styles.stepInfoCol, isLast && { paddingBottom: 0 }]}>
                    <View style={styles.stepTitleRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          (isCompleted || isCurrent) && styles.stepTitleActive,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Concierge Delivery Service Note */}
          <View style={styles.serviceNoteCard}>
            <View style={styles.serviceIconWrap}>
              <Feather name="shield" size={20} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceNoteTitle}>Đặc quyền Giao Hàng Concierge</Text>
              <Text style={styles.serviceNoteDesc}>
                Nhân viên giao hàng sẽ liên hệ trước 30 phút, mang sản phẩm vào tận vị trí phòng và hỗ trợ bóc dỡ bao bì theo yêu cầu của bạn.
              </Text>
            </View>
          </View>

          {/* Destination Address */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Feather name="map-pin" size={18} color="#8A6A48" />
              <Text style={styles.addressHeaderTitle}>Địa Chỉ Giao Đến</Text>
            </View>
            <Text style={styles.recipientName}>
              {order?.shippingAddress?.fullName || 'Nam Anh'} • {order?.shippingAddress?.phone || '0901 234 567'}
            </Text>
            <Text style={styles.recipientAddress}>
              {order?.shippingAddress?.street || '742 Evergreen Terrace, Phường Bến Nghé, Quận 1'}, {order?.shippingAddress?.city || 'TP. Hồ Chí Minh'}
            </Text>
          </View>
        </ScrollView>
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
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E6860',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carrierLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  carrierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
  },
  transitBadge: {
    backgroundColor: '#EAE1D2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  transitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2DBD0',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoSub: {
    fontSize: 11,
    color: '#6E6860',
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
  },
  estimatedDeliveryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  estimatedText: {
    fontSize: 13,
    color: '#252525',
  },
  estimatedBold: {
    fontWeight: '700',
    color: '#8A6A48',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 18,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  nodeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCircleCompleted: {
    backgroundColor: '#8A6A48',
  },
  nodeCircleCurrent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8A6A48',
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A6A48',
  },
  nodeNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6E6860',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2DBD0',
    marginVertical: 4,
  },
  verticalLineCompleted: {
    backgroundColor: '#8A6A48',
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: 24,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6860',
    flex: 1,
    paddingRight: 6,
  },
  stepTitleActive: {
    color: '#252525',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 11,
    color: '#8A6A48',
    fontWeight: '500',
  },
  stepDesc: {
    fontSize: 12,
    color: '#6E6860',
    lineHeight: 18,
  },
  serviceNoteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  serviceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 2,
  },
  serviceNoteDesc: {
    fontSize: 12,
    color: '#6E6860',
    lineHeight: 17,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#252525',
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 12,
    color: '#6E6860',
    lineHeight: 18,
  },
});
