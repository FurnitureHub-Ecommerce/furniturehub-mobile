import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  apiRequest,
  getOrderTrackingApi,
  getOrderDetailApi,
  getUserProfileApi,
  cancelOrderApi,
  OrderItem,
} from "@/services/api";

const FONTS = {
  SERIF: Platform.OS === "ios" ? "System" : "sans-serif",
  SANS: Platform.OS === "ios" ? "System" : "sans-serif",
};

const CANCEL_REASONS = [
  "Muốn thay đổi địa chỉ nhận hàng",
  "Muốn thay đổi sản phẩm (kích thước, màu sắc, số lượng)",
  "Thời gian giao hàng dự kiến quá lâu",
  "Tìm thấy mức giá tốt hơn ở nơi khác",
  "Đổi ý, không còn nhu cầu đặt mua",
  "Khác",
];

// Quét lý do hủy / từ chối từ nhiều nguồn dữ liệu của Order & Tracking
const extractCancelOrRejectReason = (
  orderObj?: any,
  trackingObj?: any,
  localReason?: string
): string => {
  const candidates: string[] = [];

  if (localReason && typeof localReason === "string" && localReason.trim()) {
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
        if (!step || typeof step !== "object") continue;
        const stepStatus = String(
          step.status ||
            step.state ||
            step.toStatus ||
            step.newStatus ||
            step.stepStatus ||
            step.title ||
            ""
        )
          .toUpperCase()
          .trim();

        const isCancelOrRejectStep =
          stepStatus === "CANCELLED" ||
          stepStatus === "CANCELED" ||
          stepStatus === "REJECTED" ||
          stepStatus.includes("CANCEL") ||
          stepStatus.includes("REJECT") ||
          stepStatus.includes("HỦY") ||
          stepStatus.includes("TỪ CHỐI");

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
            if (typeof sf === "string" && sf.trim().length > 0) {
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
    if (typeof field === "string" && field.trim().length > 0) {
      candidates.push(field.trim());
    }
  }

  const genericPlaceholders = [
    "đã xác nhận hủy giao dịch",
    "người mua yêu cầu hủy",
    "khách hàng yêu cầu hủy",
    "hết hàng hoặc thông tin không hợp lệ",
    "đơn hàng đã bị hủy",
    "đơn hàng bị từ chối",
  ];

  const cleanPrefix = (raw: string) => {
    // Chỉ loại bỏ tiền tố "Lý do:" nếu chuỗi đã có sẵn để tránh lặp "Lý do: Lý do: ..."
    // Tuyệt đối không dùng slice hoặc substring làm cụt chữ
    return raw.replace(/^lý\s*do\s*(hủy|từ\s*chối)?\s*:\s*/i, "").trim();
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

  return "";
};

// Kiểm tra đơn hàng có phải bị từ chối bởi Staff / Cửa hàng hay không
const checkIsRejectedByStaff = (orderObj?: any, trackingObj?: any): boolean => {
  const s = String(trackingObj?.status || orderObj?.status || "")
    .toLowerCase()
    .trim();
  const l = String(orderObj?.statusLabel || "")
    .toLowerCase()
    .trim();

  if (
    s === "rejected" ||
    s.includes("reject") ||
    s.includes("từ chối") ||
    l.includes("từ chối")
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
      ""
  )
    .toUpperCase()
    .trim();

  if (
    actor === "STAFF" ||
    actor === "ADMIN" ||
    actor === "STORE" ||
    actor === "SHOP" ||
    actor === "MANAGER"
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
        if (!step || typeof step !== "object") continue;
        const stepStatus = String(
          step.status || step.state || step.toStatus || step.newStatus || ""
        )
          .toUpperCase()
          .trim();

        if (
          stepStatus === "REJECTED" ||
          stepStatus.includes("REJECT") ||
          stepStatus.includes("TỪ CHỐI")
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
            ""
        )
          .toUpperCase()
          .trim();
        if (
          (stepStatus.includes("CANCEL") || stepStatus.includes("HỦY")) &&
          (stepActor === "STAFF" ||
            stepActor === "ADMIN" ||
            stepActor === "STORE" ||
            stepActor === "SHOP")
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

interface CancelOrderModalProps {
  visible: boolean;
  canceling: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  canceling,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  useEffect(() => {
    if (!visible) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [visible]);

  const cancelReason =
    selectedReason === "Khác" ? customReason.trim() : selectedReason.trim();
  const isConfirmDisabled = !cancelReason || canceling;

  const handleConfirmPress = () => {
    if (isConfirmDisabled) return;
    onConfirm(cancelReason);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lý Do Hủy Đơn Hàng</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={canceling}
              style={styles.modalCloseIcon}
            >
              <Feather name="x" size={18} color="#2A2421" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Vui lòng chọn hoặc nhập lý do hủy đơn hàng của bạn:
          </Text>

          <View style={styles.reasonList}>
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  activeOpacity={0.75}
                  onPress={() => setSelectedReason(reason)}
                  style={[
                    styles.radioItem,
                    isSelected && styles.radioItemActive,
                  ]}
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

          {selectedReason === "Khác" && (
            <TextInput
              style={styles.customReasonInput}
              placeholder="Nhập lý do hủy đơn cụ thể của bạn..."
              placeholderTextColor="#9A9086"
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={3}
            />
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={onClose}
              disabled={canceling}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBackBtnText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                isConfirmDisabled && styles.modalConfirmBtnDisabled,
              ]}
              onPress={handleConfirmPress}
              disabled={isConfirmDisabled}
              activeOpacity={0.85}
            >
              {canceling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalConfirmBtnText}>Xác nhận hủy</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hàm hủy đơn theo đúng yêu cầu: await cancelOrder(order._id || order.id, { reason: reason.trim() })
const cancelOrder = async (
  orderId: string,
  payload: { reason: string },
) => {
  return await cancelOrderApi(orderId, payload.reason);
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState<(OrderItem & Record<string, any>) | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchOrderDetail = useCallback(
    async (options?: { silent?: boolean; isRefresh?: boolean }) => {
      const silent = options?.silent ?? false;
      const isRefresh = options?.isRefresh ?? false;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }
        const orderId = id || "";
        if (!orderId) return;

        const [orderRes, rawOrderRes, trackingRes, profileRes] =
          await Promise.allSettled([
            getOrderDetailApi(orderId),
            apiRequest(`/api/orders/${orderId}`),
            getOrderTrackingApi(orderId),
            getUserProfileApi(),
          ]);

        const rawOrderObj =
          rawOrderRes.status === "fulfilled"
            ? rawOrderRes.value?.data?.order ||
              rawOrderRes.value?.data ||
              rawOrderRes.value?.order ||
              rawOrderRes.value ||
              {}
            : {};

        const trackingVal =
          trackingRes.status === "fulfilled" ? trackingRes.value : null;

        if (orderRes.status === "fulfilled") {
          const orderData = orderRes.value;
          setOrder({
            ...rawOrderObj,
            ...orderData,
            _id: rawOrderObj?._id || orderData?._id || orderData?.id,
            id: orderData?.id || rawOrderObj?._id || rawOrderObj?.id,
            timeline:
              rawOrderObj?.timeline ||
              rawOrderObj?.statusHistory ||
              rawOrderObj?.orderStatusHistory ||
              trackingVal?.timeline ||
              trackingVal?.statusHistory ||
              trackingVal?.orderStatusHistory,
            statusHistory:
              rawOrderObj?.statusHistory ||
              rawOrderObj?.orderStatusHistory ||
              trackingVal?.statusHistory,
            orderStatusHistory:
              rawOrderObj?.orderStatusHistory ||
              rawOrderObj?.statusHistory ||
              trackingVal?.orderStatusHistory,
            rejectReason:
              rawOrderObj?.rejectReason ||
              rawOrderObj?.rejectedReason ||
              rawOrderObj?.rejectionReason ||
              trackingVal?.rejectReason ||
              trackingVal?.rejectedReason,
            rejectedReason:
              rawOrderObj?.rejectedReason ||
              rawOrderObj?.rejectReason ||
              trackingVal?.rejectedReason,
            cancelReason:
              rawOrderObj?.cancelReason ||
              rawOrderObj?.cancellationReason ||
              orderData?.cancelReason ||
              trackingVal?.cancelReason,
            reason:
              rawOrderObj?.reason ||
              trackingVal?.reason ||
              orderData?.cancelReason,
          });
        } else if (rawOrderObj && (rawOrderObj._id || rawOrderObj.id)) {
          setOrder(rawOrderObj);
        }

        if (trackingVal) {
          setTrackingData(trackingVal);
        }
        if (profileRes.status === "fulfilled") {
          setUserProfile(
            profileRes.value?.user ||
              profileRes.value?.data ||
              profileRes.value,
          );
        }
        hasLoadedRef.current = true;
      } catch (error) {
        console.warn("Lỗi tải thông tin vận chuyển:", error);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        }
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  // Tự động fetch lại mỗi khi màn hình được active
  useFocusEffect(
    useCallback(() => {
      fetchOrderDetail({ silent: hasLoadedRef.current });
    }, [fetchOrderDetail])
  );

  const onRefresh = useCallback(() => {
    fetchOrderDetail({ silent: true, isRefresh: true });
  }, [fetchOrderDetail]);

  // Đồng bộ mã đơn hàng: lấy 8 ký tự cuối viết hoa từ _id
  const rawOrderId = order?._id || order?.id || id || "";
  const orderCode = rawOrderId ? `#${String(rawOrderId).slice(-8).toUpperCase()}` : "";

  const handleCopyOrderCode = async () => {
    if (!orderCode) return;
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(orderCode);
      } else if (Clipboard && typeof Clipboard.setString === "function") {
        Clipboard.setString(orderCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (Platform.OS !== "web") {
        Alert.alert("Đã sao chép", `Đã sao chép mã đơn hàng ${orderCode}`);
      }
    } catch (err) {
      console.warn("Không thể sao chép mã đơn hàng:", err);
    }
  };

  // Chỉ gọi API khi nhấn nút 'Xác nhận hủy' BÊN TRONG Modal
  const handleConfirmCancelWithReason = async (reason: string) => {
    if (!reason || reason.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng chọn hoặc nhập lý do hủy đơn hàng");
      return;
    }
    try {
      setCanceling(true);
      const targetOrderId = String(
        order?._id || order?.id || id || "",
      );

      // Gọi API hủy đơn và truyền kèm lý do vào body:
      await cancelOrder(targetOrderId, { reason: reason.trim() });

      setCancelModalVisible(false);
      setCancelReasonText(reason.trim());

      const nowIso = new Date().toISOString();
      setTrackingData((prev: any) => ({
        ...(prev || {}),
        status: "CANCELLED",
        updatedAt: nowIso,
        cancelReason: reason.trim(),
        reason: reason.trim(),
      }));
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "CANCELLED",
              statusLabel: "Đã Hủy",
              cancelReason: reason.trim(),
              reason: reason.trim(),
            }
          : prev,
      );

      setToastMessage("Đã hủy đơn hàng thành công");
      setTimeout(() => setToastMessage(null), 3000);
      Alert.alert("Thành công", "Đơn hàng đã được hủy");

      // Refresh lại dữ liệu đơn hàng
      await fetchOrderDetail({ silent: true });
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          error?.message ||
          "Không thể hủy đơn hàng",
      );
    } finally {
      setCanceling(false);
    }
  };

  const checkIsCancelled = (statusVal?: string) => {
    const s = (statusVal || "").toLowerCase().trim();
    return (
      s === "cancelled" ||
      s === "canceled" ||
      s === "rejected" ||
      s === "đã hủy" ||
      s === "da huy" ||
      s.includes("hủy") ||
      s.includes("từ chối") ||
      s.includes("cancel") ||
      s.includes("reject")
    );
  };

  const isRejectedByStaff = checkIsRejectedByStaff(order, trackingData);

  // Việt hóa trạng thái hệ thống
  const formatStatusLabel = (rawStatus?: string) => {
    if (isRejectedByStaff) return "Đơn hàng bị từ chối bởi Cửa hàng";
    const s = (rawStatus || "").toLowerCase().trim();
    if (checkIsCancelled(s)) return "Đã Hủy";
    if (s === "delivered" || s === "đã giao hàng") return "Đã giao hàng";
    if (
      s === "shipping" ||
      s === "in_transit" ||
      s === "đang giao hàng" ||
      s === "đang vận chuyển"
    )
      return "Đang vận chuyển";
    if (s === "confirmed" || s === "đã xác nhận" || s === "packing")
      return "Đã xác nhận";
    return "Chờ xử lý";
  };

  // Định dạng ngày giờ
  const formatDateTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Kiểm tra trạng thái đơn hàng đã hủy / từ chối hay chưa
  const isOrderCancelled =
    isRejectedByStaff ||
    checkIsCancelled(trackingData?.status) ||
    checkIsCancelled(order?.status) ||
    checkIsCancelled(order?.statusLabel);

  const rawSystemStatus = trackingData?.status || order?.status;
  const normalizedStatus = (rawSystemStatus || "").toLowerCase().trim();

  const isOrderDelivered =
    normalizedStatus === "delivered" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "đã giao hàng" ||
    normalizedStatus === "đã giao";

  const extractedReason = extractCancelOrRejectReason(
    order,
    trackingData,
    cancelReasonText
  );

  const reasonToDisplay =
    extractedReason ||
    (isRejectedByStaff
      ? "Cửa hàng từ chối tiếp nhận đơn hàng"
      : "Người mua yêu cầu hủy đơn hàng");

  // Polling nhẹ mỗi 12 giây nếu đơn chưa hoàn thành/hủy
  useEffect(() => {
    if (!id || isOrderDelivered || isOrderCancelled) return;

    const intervalId = setInterval(() => {
      fetchOrderDetail({ silent: true });
    }, 12000);

    return () => clearInterval(intervalId);
  }, [id, isOrderDelivered, isOrderCancelled, fetchOrderDetail]);

  // Tạo Timeline 4 bước chuẩn
  const buildTimeline = () => {
    const rawStatus = (trackingData?.status || order?.status || "pending")
      .toLowerCase()
      .trim();

    const createdTime =
      formatDateTime(trackingData?.createdAt || order?.date) || "Đã tiếp nhận";
    const updatedTime = formatDateTime(trackingData?.updatedAt) || "Mới đây";

    if (isOrderCancelled) {
      return [
        {
          step: 1,
          title: "Đặt hàng",
          description: "Đơn hàng đã tiếp nhận",
          time: createdTime,
          completed: true,
        },
        {
          step: 2,
          title: isRejectedByStaff
            ? "Đơn hàng bị từ chối bởi Cửa hàng"
            : "ĐÃ HỦY",
          description: `Lý do: ${reasonToDisplay}`,
          time: updatedTime,
          completed: true,
          isError: true,
        },
      ];
    }

    const stepOrder = ["pending", "confirmed", "shipping", "delivered"];
    let currentIdx = stepOrder.indexOf(rawStatus);
    if (currentIdx === -1) {
      if (
        rawStatus.includes("giao") ||
        rawStatus.includes("transit") ||
        rawStatus.includes("vận chuyển")
      )
        currentIdx = 2;
      else if (
        rawStatus.includes("xác nhận") ||
        rawStatus.includes("confirmed") ||
        rawStatus.includes("packing")
      )
        currentIdx = 1;
      else if (
        rawStatus.includes("hoàn tất") ||
        rawStatus.includes("delivered")
      )
        currentIdx = 3;
      else currentIdx = 0;
    }

    return [
      {
        step: 1,
        title: "Đặt hàng",
        description: "Đơn hàng đã tiếp nhận",
        time: createdTime,
        completed: currentIdx >= 0,
      },
      {
        step: 2,
        title: "Đã xác nhận",
        description: "Kho kiểm tra & đóng gói",
        time: currentIdx >= 1 ? "Hoàn tất" : "Chờ tiến trình",
        completed: currentIdx >= 1,
      },
      {
        step: 3,
        title: "Đang vận chuyển",
        description: "Dịch vụ giao White-Glove",
        time: currentIdx >= 2 ? "Hoàn tất" : "Chờ tiến trình",
        completed: currentIdx >= 2,
      },
      {
        step: 4,
        title: "Đã giao hàng",
        description: "Hoàn tất bàn giao",
        time: currentIdx >= 3 ? updatedTime : "Chờ hoàn tất",
        completed: currentIdx >= 3,
        current: currentIdx === 3,
      },
    ];
  };

  const timelineSteps = buildTimeline();

  const getStatusBadgeInfo = () => {
    if (isRejectedByStaff) {
      return { label: "ĐÃ TỪ CHỐI", bg: "#FEF2F2", text: "#DC2626" };
    }
    if (isOrderCancelled) {
      return { label: "ĐÃ HỦY", bg: "#FEF2F2", text: "#DC2626" };
    }
    const s = (trackingData?.status || order?.status || "")
      .toLowerCase()
      .trim();
    if (s === "delivered" || s === "đã giao hàng")
      return { label: "ĐÃ GIAO HÀNG", bg: "#E2F0D9", text: "#2E7D32" };
    if (
      s === "shipping" ||
      s === "in_transit" ||
      s === "đang giao hàng" ||
      s === "đang vận chuyển"
    )
      return { label: "ĐANG VẬN CHUYỂN", bg: "#F5EBE1", text: "#8A6A48" };
    if (s === "confirmed" || s === "đã xác nhận" || s === "packing")
      return { label: "ĐÃ XÁC NHẬN", bg: "#EBF3FA", text: "#2980B9" };
    return { label: "CHỜ XỬ LÝ", bg: "#FEF5E7", text: "#E67E22" };
  };

  const statusBadge = getStatusBadgeInfo();

  // Lấy thông tin họ tên, điện thoại, địa chỉ chi tiết
  const recipientName =
    order?.shippingAddress?.fullName ||
    order?.shippingAddress?.name ||
    userProfile?.fullName ||
    userProfile?.name ||
    "Khách hàng LUMORA";

  const recipientPhone =
    order?.shippingAddress?.phone || userProfile?.phone || "";

  const addr = order?.shippingAddress as any;

  const fullAddressString =
    [
      addr?.addressLine || addr?.detailAddress || addr?.street || addr?.address,
      addr?.ward,
      addr?.district,
      addr?.city || addr?.province,
    ]
      .filter(Boolean)
      .join(", ") || "Địa chỉ đang cập nhật";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color="#252525" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleStyle]}>
          Theo Dõi Đơn Hàng
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(customer)/orders/${id}` as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="file-text" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>
            Đang tải lộ trình vận chuyển ...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8A6A48"
              colors={["#8A6A48"]}
            />
          }
        >
          {/* Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.carrierLabel}>DỊCH VỤ VẬN CHUYỂN</Text>
                <Text style={styles.carrierName}>
                  FurnitureHub White-Glove Service
                </Text>
              </View>
              <View
                style={[
                  styles.transitBadge,
                  { backgroundColor: statusBadge.bg },
                ]}
              >
                <Text
                  style={[styles.transitBadgeText, { color: statusBadge.text }]}
                >
                  {statusBadge.label}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoSub}>Mã đơn hàng</Text>
                <View style={styles.orderCodeRow}>
                  <Text style={styles.infoVal}>
                    {orderCode || "#LUMORA"}
                  </Text>
                  {orderCode ? (
                    <TouchableOpacity
                      onPress={handleCopyOrderCode}
                      style={styles.copyCodeBtn}
                      activeOpacity={0.75}
                    >
                      <Feather
                        name={copied ? "check" : "copy"}
                        size={11}
                        color={copied ? "#2E7D32" : "#8A6A48"}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoSub}>Trạng thái hệ thống</Text>
                <Text
                  style={[
                    styles.infoVal,
                    isOrderCancelled && { color: "#DC2626", fontWeight: "700" },
                  ]}
                >
                  {formatStatusLabel(rawSystemStatus)}
                </Text>
              </View>
            </View>

            {/* Khối hiển thị lý do hủy / từ chối màu nền đỏ nhạt (#FEF2F2) */}
            {isOrderCancelled && (
              <View style={styles.cancelReasonBox}>
                <View style={styles.cancelReasonHeader}>
                  <Feather name="alert-circle" size={15} color="#DC2626" />
                  <Text style={styles.cancelReasonTitle}>
                    {isRejectedByStaff
                      ? "Đơn hàng bị từ chối bởi Cửa hàng"
                      : "Đơn hàng đã bị hủy"}
                  </Text>
                </View>
                <Text style={styles.cancelReasonText}>
                  {`Lý do: ${reasonToDisplay}`}
                </Text>
              </View>
            )}

            <View style={styles.estimatedDeliveryBox}>
              <Ionicons name="calendar-outline" size={18} color="#8A6A48" />
              <Text style={styles.estimatedText}>
                Cập nhật gần nhất:{" "}
                <Text style={styles.estimatedBold}>
                  {formatDateTime(trackingData?.updatedAt) ||
                    order?.date ||
                    "Mới đây"}
                </Text>
              </Text>
            </View>
          </View>

          {/* Stepper / Timeline */}
          <Text style={styles.sectionTitle}>
            LỘ TRÌNH VẬN CHUYỂN CHI TIẾT (4 BƯỚC)
          </Text>

          <View style={styles.timelineCard}>
            {timelineSteps.map((step: any, idx: number) => {
              const isLast = idx === timelineSteps.length - 1;
              const isCompleted = step.completed;
              const isCurrent = step.current;
              const isError = step.isError;

              return (
                <View key={step.step || idx} style={styles.timelineItem}>
                  {/* Left Column: Indicator Node + Line */}
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.nodeCircle,
                        isCompleted && styles.nodeCircleCompleted,
                        isError && styles.nodeCircleError,
                      ]}
                    >
                      {isError ? (
                        <Feather name="x" size={13} color="#FFFFFF" />
                      ) : isCompleted ? (
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
                          isError && styles.verticalLineError,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Step Info */}
                  <View
                    style={[styles.stepInfoCol, isLast && { paddingBottom: 0 }]}
                  >
                    <View style={styles.stepTitleRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isCompleted && styles.stepTitleActive,
                          isError && { color: "#DC2626", fontWeight: "700" },
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    {isError ? (
                      <View style={styles.timelineErrorBox}>
                        <Text style={styles.timelineErrorText}>
                          {step.description}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.stepDesc}>{step.description}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Destination Address Card - Full 100% Thông tin chính chủ */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Feather name="map-pin" size={15} color="#8A6A48" />
              <Text style={styles.addressHeaderTitle}>ĐỊA CHỈ GIAO ĐẾN</Text>
            </View>
            <Text style={styles.recipientName}>
              {recipientName} {recipientPhone ? `• ${recipientPhone}` : ""}
            </Text>
            <Text style={styles.recipientAddress}>{fullAddressString}</Text>
          </View>

          {/* Service Note Card */}
          <View style={styles.serviceNoteCard}>
            <View style={styles.serviceIconWrap}>
              <Feather name="shield" size={18} color="#8A6A48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceNoteTitle}>
                Đặc quyền Giao Hàng White-Glove
              </Text>
              <Text style={styles.serviceNoteDesc}>
                Nhân viên sẽ gọi trước khi giao 30 phút, hỗ trợ vận chuyển vào
                phòng và mở kiện sản phẩm kiểm tra theo yêu cầu.
              </Text>
            </View>
          </View>

          {/* Nút 'Hủy đơn hàng':
              - Ẩn hoàn toàn nếu trạng thái đã là 'Đã Hủy' hoặc 'CANCELLED'
              - CHỈ mở Modal: setCancelModalVisible(true) */}
          {!isOrderCancelled && !isOrderDelivered && (
            <TouchableOpacity
              style={styles.cancelOrderBtn}
              activeOpacity={0.85}
              onPress={() => setCancelModalVisible(true)}
            >
              <Feather name="x-circle" size={17} color="#D93838" />
              <Text style={styles.cancelOrderBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Modal chọn hoặc nhập lý do hủy đơn */}
      <CancelOrderModal
        visible={cancelModalVisible}
        canceling={canceling}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleConfirmCancelWithReason}
      />

      {/* Toast thông báo hủy thành công */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastBannerText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D8",
    backgroundColor: "#F7F4EE",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAE2D5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b221d",
    fontFamily: FONTS.SANS,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b221d",
    fontFamily: FONTS.SANS,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#7A7067",
    fontFamily: FONTS.SANS,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  carrierLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#cc6e0a",
    marginBottom: 3,
    fontFamily: FONTS.SANS,
  },
  carrierName: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#161413",
    fontFamily: FONTS.SANS,
  },
  transitBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  transitBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: FONTS.SANS,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2ECE4",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoSub: {
    fontSize: 11,
    color: "#7A7067",
    marginBottom: 2,
    fontFamily: FONTS.SANS,
  },
  orderCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  copyCodeBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#FAF7F2",
    borderWidth: 1,
    borderColor: "#E8E2D8",
  },
  infoVal: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  cancelReasonBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    marginBottom: 12,
  },
  cancelReasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cancelReasonTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#991B1B",
    fontFamily: FONTS.SANS,
    flex: 1,
  },
  cancelReasonText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#DC2626",
    fontWeight: "500",
    fontFamily: FONTS.SANS,
  },
  estimatedDeliveryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF7F2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    gap: 8,
  },
  estimatedText: {
    fontSize: 12,
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  estimatedBold: {
    fontWeight: "700",
    color: "#8A6A48",
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#ce6b00",
    marginBottom: 10,
    fontFamily: FONTS.SANS,
    marginLeft: 6,
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineItem: {
    flexDirection: "row",
  },
  indicatorCol: {
    alignItems: "center",
    width: 28,
    marginRight: 10,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EAE2D5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  nodeCircleCompleted: {
    backgroundColor: "#8A6A48",
  },
  nodeCircleError: {
    backgroundColor: "#DC2626",
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8A6A48",
  },
  nodeNumber: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#7A7067",
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E8E2D8",
    marginVertical: 3,
  },
  verticalLineCompleted: {
    backgroundColor: "#8A6A48",
  },
  verticalLineError: {
    backgroundColor: "#FECACA",
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    color: "#7A7067",
    flex: 1,
    paddingRight: 6,
    fontFamily: FONTS.SANS,
  },
  stepTitleActive: {
    color: "#2A2421",
    fontWeight: "700",
  },
  stepTime: {
    fontSize: 10.5,
    color: "#8A6A48",
    fontWeight: "500",
    fontFamily: FONTS.SANS,
  },
  stepDesc: {
    fontSize: 11.5,
    color: "#7A7067",
    lineHeight: 16,
    fontFamily: FONTS.SANS,
  },
  timelineErrorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  timelineErrorText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#DC2626",
    fontWeight: "500",
    fontFamily: FONTS.SANS,
  },
  serviceNoteCard: {
    flexDirection: "row",
    backgroundColor: "#ea8900",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginTop: 14,
    gap: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAF7F2",
    borderWidth: 1,
    borderColor: "#E8E2D8",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceNoteTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
    fontFamily: FONTS.SANS,
  },
  serviceNoteDesc: {
    fontSize: 11.5,
    color: "#ffffff",
    lineHeight: 16,
    fontFamily: FONTS.SANS,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    elevation: 2,
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  addressHeaderTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#af671b",
    fontFamily: FONTS.SANS,
  },
  recipientName: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#2A2421",
    marginBottom: 3,
    fontFamily: FONTS.SANS,
  },
  recipientAddress: {
    fontSize: 11.5,
    color: "#7A7067",
    lineHeight: 17,
    fontFamily: FONTS.SANS,
  },
  cancelOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#D93838",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  cancelOrderBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D93838",
    fontFamily: FONTS.SANS,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E2D8",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: "#7A7067",
    marginBottom: 14,
    fontFamily: FONTS.SANS,
  },
  reasonList: {
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  radioItemActive: {
    backgroundColor: "#FAF7F2",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#B8AEA2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioOuterActive: {
    borderColor: "#8A6A48",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8A6A48",
  },
  radioLabel: {
    flex: 1,
    fontSize: 13,
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  radioLabelActive: {
    fontWeight: "600",
    color: "#8A6A48",
  },
  customReasonInput: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    borderRadius: 10,
    backgroundColor: "#FAF7F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#2A2421",
    textAlignVertical: "top",
    marginBottom: 14,
    fontFamily: FONTS.SANS,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  modalBackBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#EAE2D5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  modalConfirmBtn: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#D93838",
    minWidth: 125,
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnDisabled: {
    backgroundColor: "#E5A9A9",
    opacity: 0.65,
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: FONTS.SANS,
  },
  toastBanner: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#2A2421",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toastBannerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: FONTS.SANS,
  },
});
