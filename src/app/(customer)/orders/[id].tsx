import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  apiRequest,
  getOrderDetailApi,
  getOrderTrackingApi,
  cancelOrderApi,
  OrderItem,
  formatCurrency,
  getProductsApi,
} from '@/services/api';

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

// Quét lý do hủy / từ chối từ nhiều nguồn dữ liệu của Order & Tracking
const extractCancelOrRejectReason = (
  orderObj?: any,
  trackingObj?: any,
  localReason?: string
): string => {
  const candidates: string[] = [];

  if (localReason && typeof localReason === 'string' && localReason.trim()) {
    candidates.push(localReason.trim());
  }

  // 1. Quét mảng tiến trình: timeline, statusHistory, orderStatusHistory (ở bước CANCELLED hoặc REJECTED)
  const historyArrays = [
    orderObj?.timeline,
    orderObj?.statusHistory,
    orderObj?.orderStatusHistory,
    orderObj?.history,
    orderObj?.trackingTimeline,
    trackingObj?.timeline,
    trackingObj?.statusHistory,
    trackingObj?.orderStatusHistory,
    trackingObj?.history,
    trackingObj?.steps,
  ];

  for (const arr of historyArrays) {
    if (Array.isArray(arr) && arr.length > 0) {
      const reversed = [...arr].reverse();
      for (const step of reversed) {
        if (!step || typeof step !== 'object') continue;
        const stepStatus = String(
          step.status ||
            step.state ||
            step.toStatus ||
            step.newStatus ||
            step.stepStatus ||
            step.title ||
            ''
        )
          .toUpperCase()
          .trim();

        const isCancelOrRejectStep =
          stepStatus === 'CANCELLED' ||
          stepStatus === 'CANCELED' ||
          stepStatus === 'REJECTED' ||
          stepStatus.includes('CANCEL') ||
          stepStatus.includes('REJECT') ||
          stepStatus.includes('HỦY') ||
          stepStatus.includes('TỪ CHỐI');

        if (isCancelOrRejectStep) {
          const stepFields = [
            step.rejectReason,
            step.rejectedReason,
            step.rejectionReason,
            step.cancelReason,
            step.cancellationReason,
            step.reason,
            step.note,
            step.notes,
            step.comment,
            step.message,
            step.description,
          ];
          for (const sf of stepFields) {
            if (typeof sf === 'string' && sf.trim().length > 0) {
              candidates.push(sf.trim());
            }
          }
        }
      }
    }
  }

  // 2. Kết hợp các trường trực tiếp trên order và tracking
  const directFields = [
    orderObj?.rejectReason,
    orderObj?.rejectedReason,
    orderObj?.rejectionReason,
    orderObj?.cancelReason,
    orderObj?.cancellationReason,
    orderObj?.canceledReason,
    orderObj?.reason,
    orderObj?.statusReason,
    orderObj?.adminNote,
    orderObj?.staffNote,
    orderObj?.note,
    trackingObj?.rejectReason,
    trackingObj?.rejectedReason,
    trackingObj?.rejectionReason,
    trackingObj?.cancelReason,
    trackingObj?.cancellationReason,
    trackingObj?.canceledReason,
    trackingObj?.reason,
    trackingObj?.statusReason,
    trackingObj?.note,
  ];

  for (const field of directFields) {
    if (typeof field === 'string' && field.trim().length > 0) {
      candidates.push(field.trim());
    }
  }

  const genericPlaceholders = [
    'đã xác nhận hủy giao dịch',
    'người mua yêu cầu hủy',
    'khách hàng yêu cầu hủy',
    'hết hàng hoặc thông tin không hợp lệ',
    'đơn hàng đã bị hủy',
    'đơn hàng bị từ chối',
  ];

  const cleanPrefix = (raw: string) => {
    // Chỉ loại bỏ tiền tố "Lý do:" nếu chuỗi đã có sẵn để tránh lặp "Lý do: Lý do: ..."
    // Tuyệt đối không dùng slice hoặc substring làm cụt chữ
    return raw.replace(/^lý\s*do\s*(hủy|từ\s*chối)?\s*:\s*/i, '').trim();
  };

  for (const item of candidates) {
    const cleaned = cleanPrefix(item);
    if (
      cleaned.length > 0 &&
      !genericPlaceholders.includes(cleaned.toLowerCase())
    ) {
      return cleaned;
    }
  }

  if (candidates.length > 0) {
    const fallbackCleaned = cleanPrefix(candidates[0]);
    if (fallbackCleaned.length > 0) return fallbackCleaned;
  }

  return '';
};

// Kiểm tra đơn hàng có phải bị từ chối bởi Staff / Cửa hàng hay không
const checkIsRejectedByStaff = (orderObj?: any, trackingObj?: any): boolean => {
  const s = String(trackingObj?.status || orderObj?.status || '')
    .toLowerCase()
    .trim();
  const l = String(orderObj?.statusLabel || '')
    .toLowerCase()
    .trim();

  if (
    s === 'rejected' ||
    s.includes('reject') ||
    s.includes('từ chối') ||
    l.includes('từ chối')
  ) {
    return true;
  }

  if (
    orderObj?.rejectReason ||
    orderObj?.rejectedReason ||
    orderObj?.rejectionReason ||
    trackingObj?.rejectReason ||
    trackingObj?.rejectedReason ||
    trackingObj?.rejectionReason
  ) {
    return true;
  }

  const actor = String(
    orderObj?.cancelledBy ||
      orderObj?.canceledBy ||
      orderObj?.rejectedBy ||
      orderObj?.updatedByRole ||
      trackingObj?.cancelledBy ||
      trackingObj?.rejectedBy ||
      ''
  )
    .toUpperCase()
    .trim();

  if (
    actor === 'STAFF' ||
    actor === 'ADMIN' ||
    actor === 'STORE' ||
    actor === 'SHOP' ||
    actor === 'MANAGER'
  ) {
    return true;
  }

  const historyArrays = [
    orderObj?.timeline,
    orderObj?.statusHistory,
    orderObj?.orderStatusHistory,
    orderObj?.history,
    trackingObj?.timeline,
    trackingObj?.statusHistory,
    trackingObj?.orderStatusHistory,
    trackingObj?.history,
    trackingObj?.steps,
  ];

  for (const arr of historyArrays) {
    if (Array.isArray(arr)) {
      for (const step of arr) {
        if (!step || typeof step !== 'object') continue;
        const stepStatus = String(
          step.status || step.state || step.toStatus || step.newStatus || ''
        )
          .toUpperCase()
          .trim();

        if (
          stepStatus === 'REJECTED' ||
          stepStatus.includes('REJECT') ||
          stepStatus.includes('TỪ CHỐI')
        ) {
          return true;
        }
        if (step.rejectReason || step.rejectedReason || step.rejectionReason) {
          return true;
        }
        const stepActor = String(
          step.updatedByRole ||
            step.role ||
            step.actor ||
            step.cancelledBy ||
            step.rejectedBy ||
            step.performerRole ||
            ''
        )
          .toUpperCase()
          .trim();
        if (
          (stepStatus.includes('CANCEL') || stepStatus.includes('HỦY')) &&
          (stepActor === 'STAFF' ||
            stepActor === 'ADMIN' ||
            stepActor === 'STORE' ||
            stepActor === 'SHOP')
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetId = (params.id || params.orderId) as string;

  const [order, setOrder] = useState<(OrderItem & Record<string, any>) | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('Đổi ý không mua nữa');
  const [customReason, setCustomReason] = useState<string>('');
  const [localCancelReason, setLocalCancelReason] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const hasLoadedRef = useRef(false);

  const fetchOrderAndProducts = useCallback(
    async (options?: { silent?: boolean; isRefresh?: boolean }) => {
      const silent = options?.silent ?? false;
      const isRefresh = options?.isRefresh ?? false;

      if (!targetId) {
        if (!silent) {
          setErrorMsg('Mã đơn hàng không hợp lệ');
          setLoading(false);
        }
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }
        if (!silent) {
          setErrorMsg(null);
        }

        // Gọi đồng thời API chi tiết đơn hàng, raw order payload, tracking và danh sách sản phẩm
        const [orderData, rawOrderRes, trackingRes, productsList] = await Promise.all([
          getOrderDetailApi(targetId),
          apiRequest(`/api/orders/${targetId}`).catch(() => null),
          getOrderTrackingApi(targetId).catch(() => null),
          getProductsApi().catch(() => []),
        ]);

        const rawOrderObj =
          rawOrderRes?.data?.order ||
          rawOrderRes?.data ||
          rawOrderRes?.order ||
          rawOrderRes ||
          {};

        // Dùng danh sách sản phẩm thật để map và bổ sung/ghi đè hình ảnh chuẩn từ kho sản phẩm nếu item thiếu ảnh
        if (orderData && Array.isArray(orderData.items)) {
          orderData.items = orderData.items.map((orderItem: any) => {
            const matchedProduct = Array.isArray(productsList)
              ? productsList.find(
                  (p: any) =>
                    String(p._id || p.id) === String(orderItem.productId || orderItem.id) ||
                    p.name?.toLowerCase() === orderItem.title?.toLowerCase()
                )
              : null;

            const realImage =
              matchedProduct?.image ||
              (Array.isArray(matchedProduct?.images) && matchedProduct.images.length > 0
                ? matchedProduct.images[0]
                : null) ||
              orderItem.image;

            return {
              ...orderItem,
              image: realImage,
            };
          });
        }

        const mergedOrder = {
          ...rawOrderObj,
          ...orderData,
          _id: rawOrderObj?._id || orderData?._id || orderData?.id,
          id: orderData?.id || rawOrderObj?._id || rawOrderObj?.id,
          timeline:
            rawOrderObj?.timeline ||
            rawOrderObj?.statusHistory ||
            rawOrderObj?.orderStatusHistory ||
            trackingRes?.timeline ||
            trackingRes?.statusHistory ||
            trackingRes?.orderStatusHistory,
          statusHistory:
            rawOrderObj?.statusHistory ||
            rawOrderObj?.orderStatusHistory ||
            trackingRes?.statusHistory,
          orderStatusHistory:
            rawOrderObj?.orderStatusHistory ||
            rawOrderObj?.statusHistory ||
            trackingRes?.orderStatusHistory,
          rejectReason:
            rawOrderObj?.rejectReason ||
            rawOrderObj?.rejectedReason ||
            rawOrderObj?.rejectionReason ||
            trackingRes?.rejectReason ||
            trackingRes?.rejectedReason,
          rejectedReason:
            rawOrderObj?.rejectedReason ||
            rawOrderObj?.rejectReason ||
            trackingRes?.rejectedReason,
          cancelReason:
            rawOrderObj?.cancelReason ||
            rawOrderObj?.cancellationReason ||
            orderData?.cancelReason ||
            trackingRes?.cancelReason,
          reason:
            rawOrderObj?.reason ||
            trackingRes?.reason ||
            orderData?.cancelReason,
        };

        setOrder(mergedOrder);
        if (trackingRes) {
          setTrackingData(trackingRes);
        }
        hasLoadedRef.current = true;
        setErrorMsg(null);
      } catch (err: any) {
        console.warn('Lỗi lấy API chi tiết đơn hàng:', err);
        if (!silent) {
          setErrorMsg(err.message || 'Không thể lấy dữ liệu đơn hàng từ máy chủ');
        }
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        }
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [targetId]
  );

  // Tự động fetch lại API chi tiết đơn hàng mỗi khi màn hình được active
  useFocusEffect(
    useCallback(() => {
      fetchOrderAndProducts({ silent: hasLoadedRef.current });
    }, [fetchOrderAndProducts])
  );

  const onRefresh = useCallback(() => {
    fetchOrderAndProducts({ silent: true, isRefresh: true });
  }, [fetchOrderAndProducts]);

  // Đồng bộ mã đơn hàng: lấy 8 ký tự cuối viết hoa từ _id
  const rawOrderId = order?._id || order?.id || '';
  const orderCode = rawOrderId ? `#${String(rawOrderId).slice(-8).toUpperCase()}` : '';

  const handleCopyOrderCode = async () => {
    if (!orderCode) return;
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(orderCode);
      } else if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(orderCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (Platform.OS !== 'web') {
        Alert.alert('Đã sao chép', `Đã sao chép mã đơn hàng ${orderCode}`);
      }
    } catch (err) {
      console.warn('Không thể sao chép mã đơn hàng:', err);
    }
  };

  const isPending =
    order?.status?.toLowerCase() === 'pending' ||
    order?.status?.toLowerCase() === 'chờ xử lý' ||
    order?.status?.toLowerCase() === 'processing';

  const isRejectedByStaff = checkIsRejectedByStaff(order, trackingData);

  const isCancelled =
    isRejectedByStaff ||
    order?.status?.toLowerCase() === 'cancelled' ||
    order?.status?.toLowerCase() === 'canceled' ||
    order?.status?.toLowerCase() === 'rejected' ||
    order?.status?.toLowerCase() === 'đã hủy' ||
    order?.status?.toLowerCase().includes('hủy') ||
    order?.status?.toLowerCase().includes('từ chối') ||
    order?.statusLabel?.toLowerCase() === 'đã hủy' ||
    order?.statusLabel?.toLowerCase().includes('từ chối');

  const isCompleted =
    order?.status?.toLowerCase() === 'delivered' ||
    order?.status?.toLowerCase() === 'completed' ||
    order?.status?.toLowerCase() === 'đã giao hàng' ||
    order?.status?.toLowerCase() === 'đã giao' ||
    order?.statusLabel?.toLowerCase() === 'đã giao hàng' ||
    order?.statusLabel?.toLowerCase() === 'đã giao';

  const cancelOrRejectReason = extractCancelOrRejectReason(
    order,
    trackingData,
    localCancelReason
  );

  // Nếu trạng thái đơn chưa hoàn thành/hủy, thêm polling nhẹ mỗi 12 giây để tự động đồng bộ khi Staff đổi trạng thái
  useEffect(() => {
    if (!targetId || !order || isCompleted || isCancelled) return;

    const intervalId = setInterval(() => {
      fetchOrderAndProducts({ silent: true });
    }, 12000);

    return () => clearInterval(intervalId);
  }, [targetId, order?.status, isCompleted, isCancelled, fetchOrderAndProducts]);

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
      const targetOrderId = order?._id || order?.id || targetId || '';
      await cancelOrderApi(targetOrderId, { reason: finalReason });

      setLocalCancelReason(finalReason);

      if (order) {
        setOrder({
          ...order,
          status: 'cancelled',
          statusLabel: 'Đã Hủy',
          cancelReason: finalReason,
          cancellationReason: finalReason,
          reason: finalReason,
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

  const getStatusInfo = (status?: string, statusLabel?: string) => {
    const s = (status || '').toLowerCase().trim();
    const l = (statusLabel || '').toLowerCase().trim();

    if (isRejectedByStaff) {
      return {
        bg: '#FEF2F2',
        text: '#DC2626',
        label: 'Đơn hàng bị từ chối bởi Cửa hàng',
      };
    }

    if (
      s === 'delivered' ||
      s === 'completed' ||
      s.includes('giao hàng') ||
      s === 'đã giao' ||
      l === 'đã giao hàng' ||
      l === 'đã giao'
    ) {
      return { bg: '#E2F0D9', text: '#2E7D32', label: 'Đã Giao Hàng' };
    }
    if (
      s === 'shipping' ||
      s === 'in_transit' ||
      s.includes('vận chuyển') ||
      s.includes('đang giao') ||
      l.includes('vận chuyển') ||
      l.includes('đang giao')
    ) {
      return { bg: '#F5EBE1', text: '#8A6A48', label: 'Đang Vận Chuyển' };
    }
    if (s === 'confirmed' || s === 'đã xác nhận' || l === 'đã xác nhận') {
      return { bg: '#E6F4EA', text: '#137333', label: 'Đã Xác Nhận' };
    }
    if (
      s === 'packing' ||
      s === 'processing' ||
      s === 'đang xử lý' ||
      s === 'đang đóng gói' ||
      l.includes('xử lý') ||
      l.includes('đóng gói')
    ) {
      return { bg: '#E8F0FE', text: '#1A73E8', label: 'Đang Xử Lý' };
    }
    if (s === 'pending' || s === 'chờ xử lý' || l === 'chờ xử lý') {
      return { bg: '#FEF5E7', text: '#E67E22', label: 'Chờ Xử Lý' };
    }
    if (
      s === 'rejected' ||
      s === 'cancelled' ||
      s === 'canceled' ||
      s.includes('hủy') ||
      l.includes('hủy')
    ) {
      return { bg: '#FEF2F2', text: '#DC2626', label: 'Đã Hủy' };
    }

    if (statusLabel && !/^[a-zA-Z_-]+$/.test(statusLabel)) {
      return { bg: '#E9E1D5', text: '#8A6A48', label: statusLabel };
    }

    return { bg: '#FEF5E7', text: '#E67E22', label: 'Đang Xử Lý' };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color="#8A6A48" />
        <Text style={styles.loadingText}>Đang lấy chi tiết đơn hàng...</Text>
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

  const statusInfo = getStatusInfo(order.status, order.statusLabel);

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
          Chi Tiết Đơn {orderCode}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="truck" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8A6A48"
            colors={['#8A6A48']}
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
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

            {/* Mã đơn hàng & Nút sao chép */}
            {orderCode ? (
              <View style={styles.orderCodeRow}>
                <Text style={styles.orderCodeText}>{orderCode}</Text>
                <TouchableOpacity
                  onPress={handleCopyOrderCode}
                  style={styles.copyCodeBtn}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={copied ? 'check' : 'copy'}
                    size={12}
                    color={copied ? '#2E7D32' : '#8A6A48'}
                  />
                  <Text
                    style={[
                      styles.copyCodeBtnText,
                      copied && { color: '#2E7D32' },
                    ]}
                  >
                    {copied ? 'Đã chép' : 'Sao chép'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <Text style={styles.orderDate}>Ngày đặt đơn: {order.date}</Text>

          {/* Khối hiển thị lý do hủy / từ chối màu nền đỏ nhạt (#FEF2F2) */}
          {isCancelled && (
            <View style={styles.cancelReasonBox}>
              <View style={styles.cancelReasonHeader}>
                <Feather name="alert-circle" size={15} color="#DC2626" />
                <Text style={styles.cancelReasonTitle}>
                  {isRejectedByStaff
                    ? 'Đơn hàng bị từ chối bởi Cửa hàng'
                    : 'Đơn hàng đã bị hủy'}
                </Text>
              </View>
              <Text style={styles.cancelReasonText}>
                {`Lý do: ${
                  cancelOrRejectReason ||
                  (isRejectedByStaff
                    ? 'Cửa hàng từ chối tiếp nhận đơn hàng'
                    : 'Người mua yêu cầu hủy đơn hàng')
                }`}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push(`/(customer)/orders/tracking/${order.id}` as any)}
            style={styles.trackOrderBtn}
            activeOpacity={0.8}
          >
            <Feather name="map-pin" size={13} color="#8A6A48" />
            <Text style={styles.trackOrderBtnText}>Theo Dõi Lộ Trình Vận Chuyển</Text>
            <Feather name="chevron-right" size={14} color="#8A6A48" />
          </TouchableOpacity>
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={14} color="#8A6A48" />
              <Text style={styles.sectionHeaderTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
            </View>
            <Text style={styles.addressName}>
              {order.shippingAddress.fullName || 'Người nhận'}{' '}
              {order.shippingAddress.phone ? `• ${order.shippingAddress.phone}` : ''}
            </Text>
            <Text style={styles.addressStreet}>
              {order.shippingAddress.street}{' '}
              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
            </Text>
          </View>
        )}

        {/* Items List */}
        <Text style={styles.sectionTag}>SẢN PHẨM ĐÃ ĐẶT ({order.items.length})</Text>
        {order.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemCard}>
            <Image
              source={{
                uri:
                  item.image && item.image.trim().length > 0
                    ? item.image
                    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600',
              }}
              style={styles.productItemImage}
              resizeMode="cover"
            />

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

              {isCompleted && (
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
            <Text style={styles.summaryLabel}>Mã đơn hàng</Text>
            <Text style={styles.summaryValue}>{orderCode}</Text>
          </View>
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
        {isPending && !isCancelled && (
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
  },
  emptyTitle: {
    fontSize: 14,
    color: '#2A2421',
    fontFamily: FONTS.SANS,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
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
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b221d',
    fontFamily: FONTS.SANS,
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
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: FONTS.SANS,
    flexShrink: 1,
  },
  orderCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderCodeText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '700',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D8',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  copyCodeBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
  },
  orderDate: {
    fontSize: 11.5,
    lineHeight: 18,
    color: '#7A7067',
    marginTop: 4,
    marginBottom: 8,
    fontFamily: FONTS.SANS,
  },
  cancelReasonBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  cancelReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cancelReasonTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#991B1B',
    fontFamily: FONTS.SANS,
    flex: 1,
  },
  cancelReasonText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#DC2626',
    fontWeight: '500',
    fontFamily: FONTS.SANS,
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
  },
  addressName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2A2421',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
  },
  addressStreet: {
    fontSize: 11.5,
    color: '#7A7067',
    lineHeight: 17,
    fontFamily: FONTS.SANS,
  },
  sectionTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
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
  },
  itemVariant: {
    fontSize: 10.5,
    color: '#7A7067',
    marginBottom: 2,
    fontFamily: FONTS.SANS,
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
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
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
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
  },
  paymentMethodVal: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#2A2421',
    fontFamily: FONTS.SANS,
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
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A6A48',
    fontFamily: FONTS.SANS,
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
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#7A7067',
    marginBottom: 14,
    fontFamily: FONTS.SANS,
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
  },
  productItemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#EAE2D5',
    borderWidth: 1,
    borderColor: '#E8E2D8',
  },
});
