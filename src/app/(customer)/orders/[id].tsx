import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getOrderDetailApi, cancelOrderApi, OrderItem, formatCurrency } from '@/services/api';

const FONTS = {
  SERIF: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  SANS: Platform.OS === 'ios' ? 'System' : 'sans-serif',
};

const CANCEL_REASONS = [
  'Đổi ý không mua nữa',
  'Thời gian giao lâu',
  'Muốn đổi địa chỉ nhận',
  'Lý do khác',
];

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetId = (params.id || params.orderId) as string;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('Đổi ý không mua nữa');
  const [customReason, setCustomReason] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!targetId) {
        setErrorMsg('Mã đơn hàng không hợp lệ');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await getOrderDetailApi(targetId);
        setOrder(data);
      } catch (err: any) {
        console.warn('Lỗi lấy API chi tiết đơn hàng:', err);
        setErrorMsg(err.message || 'Không thể lấy dữ liệu đơn hàng từ máy chủ');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [targetId]);

  const isPending =
    order?.status?.toLowerCase() === 'pending' ||
    order?.status?.toLowerCase() === 'chờ xử lý' ||
    order?.status?.toLowerCase() === 'processing';

  const isCancelled =
    order?.status?.toLowerCase() === 'cancelled' ||
    order?.status?.toLowerCase() === 'canceled' ||
    order?.status?.toLowerCase() === 'rejected' ||
    order?.status?.toLowerCase() === 'đã hủy' ||
    order?.statusLabel?.toLowerCase() === 'đã hủy';

  const handleConfirmCancel = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác') {
      if (!customReason.trim()) {
        Alert.alert('Thông Báo', 'Vui lòng nhập lý do cụ thể khi chọn "Lý do khác".');
        return;
      }
      finalReason = customReason.trim();
    }

    if (!finalReason) {
      Alert.alert('Thông Báo', 'Vui lòng chọn lý do hủy đơn hàng.');
      return;
    }

    try {
      setCancelling(true);
      const targetOrderId = order?.id || targetId || '';
      await cancelOrderApi(targetOrderId, { reason: finalReason });

      if (order) {
        setOrder({
          ...order,
          status: 'cancelled',
          statusLabel: 'Đã Hủy',
          cancelReason: finalReason,
          cancellationReason: finalReason,
        });
      }

      setCancelModalVisible(false);
      Alert.alert('Thành Công', 'Đơn hàng của bạn đã được hủy.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể hủy đơn hàng vào lúc này.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusInfo = (status?: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
      case 'đã giao hàng':
        return { bg: '#E2F0D9', text: '#2E7D32', label: 'Đã Giao Hàng' };
      case 'in_transit':
      case 'đang giao hàng':
      case 'đang vận chuyển':
        return { bg: '#F5EBE1', text: '#8A6A48', label: 'Đang Vận Chuyển' };
      case 'pending':
      case 'chờ xử lý':
        return { bg: '#FEF5E7', text: '#E67E22', label: 'Chờ Xử Lý' };
      case 'rejected':
      case 'cancelled':
      case 'đã hủy':
        return { bg: '#FCE8E6', text: '#D93838', label: 'Đã Hủy' };
      default:
        return { bg: '#E9E1D5', text: '#8A6A48', label: status || 'Đang xử lý' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color="#8A6A48" />
        <Text style={styles.loadingText}>Đang lấy chi tiết đơn hàng từ Server...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !order) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <Feather name="alert-circle" size={48} color="#D93838" />
        <Text style={styles.emptyTitle}>{errorMsg || 'Không tải được đơn hàng'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>QUAY LẠI</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color="#252525" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleStyle]}>
          Chi Tiết Đơn #{order.id ? order.id.slice(-8).toUpperCase() : ''}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="truck" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusInfo.text },
              ]}
            />
            <Text
              style={[
                styles.statusTitle,
                { color: statusInfo.text },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.orderDate}>Ngày đặt đơn: {order.date}</Text>

          {isCancelled && (
            <Text style={styles.cancelReasonText}>
              Lý do: {order.cancelReason || order.cancellationReason || 'Người mua yêu cầu hủy'}
            </Text>
          )}

          {order.status !== 'cancelled' && order.status !== 'rejected' && (
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
              style={styles.trackOrderBtn}
              activeOpacity={0.8}
            >
              <Feather name="map-pin" size={13} color="#8A6A48" />
              <Text style={styles.trackOrderBtnText}>Theo Dõi Lộ Trình Vận Chuyển</Text>
              <Feather name="chevron-right" size={14} color="#8A6A48" />
            </TouchableOpacity>
          )}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={14} color="#8A6A48" />
              <Text style={styles.sectionHeaderTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
            </View>
            <Text style={styles.addressName}>
              {order.shippingAddress.fullName || 'Người nhận'} {order.shippingAddress.phone ? `• ${order.shippingAddress.phone}` : ''}
            </Text>
            <Text style={styles.addressStreet}>
              {order.shippingAddress.street} {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
            </Text>
          </View>
        )}

        {/* Items List */}
        <Text style={styles.sectionTag}>SẢN PHẨM ĐÃ ĐẶT ({order.items.length})</Text>
        {order.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemCard}>
            {/* Box Icon thay thế thẻ Image */}
            <View style={styles.packageIconBox}>
              <Feather name="package" size={24} color="#8A6A48" />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.color ? (
                <Text style={styles.itemVariant}>Phân loại: {item.color}</Text>
              ) : null}
              <View style={styles.priceRow}>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              </View>

              {order.status === 'delivered' && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/(customer)/review?orderId=${order.id}&productId=${item.productId || item.id}&productTitle=${encodeURIComponent(
                        item.title
                      )}` as any
                    )
                  }
                  style={styles.reviewItemBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={12} color="#C89D5C" />
                  <Text style={styles.reviewItemBtnText}>Đánh Giá Sản Phẩm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>CHI TIẾT THANH TOÁN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính tiền hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.shipping)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phương thức thanh toán</Text>
            <Text style={styles.paymentMethodVal}>{order.paymentMethod}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Nút hủy đơn hàng */}
        {isPending && (
          <TouchableOpacity
            onPress={() => {
              setSelectedReason('Đổi ý không mua nữa');
              setCustomReason('');
              setCancelModalVisible(true);
            }}
            style={styles.cancelBtn}
            activeOpacity={0.85}
          >
            <Feather name="x-circle" size={15} color="#D93838" />
            <Text style={styles.cancelBtnText}>HỦY ĐƠN HÀNG NÀY</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal Chọn Lý Do Hủy Đơn */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!cancelling) setCancelModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lý Do Hủy Đơn Hàng</Text>
                <TouchableOpacity
                  onPress={() => setCancelModalVisible(false)}
                  disabled={cancelling}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color="#2A2421" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Vui lòng chọn lý do hủy đơn hàng của bạn:
              </Text>

              {/* Danh sách radio buttons */}
              <View style={styles.reasonList}>
                {CANCEL_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.radioOption,
                        isSelected && styles.radioOptionActive,
                      ]}
                      onPress={() => setSelectedReason(reason)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterActive,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text
                        style={[
                          styles.radioLabel,
                          isSelected && styles.radioLabelActive,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Ô TextInput khi chọn 'Lý do khác' */}
              {selectedReason === 'Lý do khác' && (
                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Nhập lý do cụ thể của bạn..."
                  placeholderTextColor="#9A9086"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}

              {/* Modal footer / Actions */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalBackBtn}
                  onPress={() => setCancelModalVisible(false)}
                  disabled={cancelling}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBackBtnText}>Đóng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    cancelling && { opacity: 0.7 },
                  ]}
                  onPress={handleConfirmCancel}
                  disabled={cancelling}
                  activeOpacity={0.85}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalConfirmBtnText}>Xác nhận hủy</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  backBtn: {
    backgroundColor: '#8A6A48',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D8',
    backgroundColor: '#F7F4EE',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE2D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b221d',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b221d',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  orderDate: {
    fontSize: 11,
    color: '#7A7067',
    marginBottom: 8,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    gap: 8,
    marginTop: 4,
  },
  trackOrderBtnText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  addressName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  addressStreet: {
    fontSize: 11.5,
    color: '#7A7067',
    lineHeight: 17,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  sectionTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  packageIconBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
    lineHeight: 17,
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemVariant: {
    fontSize: 10.5,
    color: '#7A7067',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  reviewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E8E2D8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  reviewItemBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#5C4A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7A7067',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  paymentMethodVal: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F5C6C6',
    borderRadius: 22,
    gap: 6,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D93838',
    letterSpacing: 1,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  cancelReasonText: {
    fontSize: 11.5,
    color: '#D93838',
    marginTop: -2,
    marginBottom: 6,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#7A7067',
    marginBottom: 14,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  reasonList: {
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  radioOptionActive: {
    backgroundColor: '#FAF7F2',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B8AEA2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioOuterActive: {
    borderColor: '#8A6A48',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A6A48',
  },
  radioLabel: {
    flex: 1,
    fontSize: 13,
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  radioLabelActive: {
    fontWeight: '600',
    color: '#8A6A48',
  },
  customReasonInput: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2A2421',
    textAlignVertical: 'top',
    marginBottom: 14,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBackBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#EAE2D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  modalConfirmBtn: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#D93838',
    minWidth: 125,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
});