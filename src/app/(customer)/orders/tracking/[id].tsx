import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  getOrderTrackingApi,
  getOrderDetailApi,
  getUserProfileApi,
  OrderItem,
} from "@/services/api";

const FONTS = {
  SERIF: Platform.OS === "ios" ? "Didot" : "serif",
  SANS: Platform.OS === "ios" ? "System" : "sans-serif",
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        setLoading(true);
        const orderId = id || "";
        if (!orderId) return;

        const [orderRes, trackingRes, profileRes] = await Promise.allSettled([
          getOrderDetailApi(orderId),
          getOrderTrackingApi(orderId),
          getUserProfileApi(),
        ]);

        if (orderRes.status === "fulfilled") {
          setOrder(orderRes.value);
        }
        if (trackingRes.status === "fulfilled") {
          setTrackingData(trackingRes.value);
        }
        if (profileRes.status === "fulfilled") {
          setUserProfile(
            profileRes.value?.user ||
              profileRes.value?.data ||
              profileRes.value,
          );
        }
      } catch (error) {
        console.warn("Lỗi tải thông tin vận chuyển:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrackingData();
  }, [id]);

  // Việt hóa trạng thái hệ thống
  const formatStatusLabel = (rawStatus?: string) => {
    const s = (rawStatus || "").toLowerCase().trim();
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
    if (s === "cancelled" || s === "rejected" || s === "đã hủy")
      return "Đã hủy";
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

  // Tạo Timeline 4 bước chuẩn
  const buildTimeline = () => {
    const rawStatus = (trackingData?.status || order?.status || "pending")
      .toLowerCase()
      .trim();

    const createdTime =
      formatDateTime(trackingData?.createdAt || order?.date) || "Đã tiếp nhận";
    const updatedTime = formatDateTime(trackingData?.updatedAt) || "Mới đây";

    const isCancelled =
      rawStatus === "cancelled" ||
      rawStatus === "rejected" ||
      rawStatus === "đã hủy";

    if (isCancelled) {
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
          title: rawStatus === "rejected" ? "Đã từ chối" : "Đơn hàng đã hủy",
          description:
            rawStatus === "rejected"
              ? "Hết hàng hoặc thông tin không hợp lệ"
              : "Đã xác nhận hủy giao dịch",
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
    if (s === "cancelled" || s === "rejected" || s === "đã hủy")
      return { label: "ĐÃ HỦY", bg: "#FCE8E6", text: "#D93838" };
    return { label: "CHỜ XỬ LÝ", bg: "#FEF5E7", text: "#E67E22" };
  };

  const statusBadge = getStatusBadgeInfo();
  const rawSystemStatus = trackingData?.status || order?.status;

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
        <Text style={styles.headerTitle}>Theo Dõi Đơn Hàng</Text>
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
                <Text style={styles.infoVal}>
                  #{id ? id.slice(-8).toUpperCase() : "LUMORA"}
                </Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoSub}>Trạng thái hệ thống</Text>
                <Text style={styles.infoVal}>
                  {formatStatusLabel(rawSystemStatus)}
                </Text>
              </View>
            </View>

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
                          isError && { color: "#D93838" },
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
        </ScrollView>
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
    fontSize: 16,
    fontWeight: "700",
    color: "#2A2421",
    fontFamily: Platform.OS === "ios" ? "Palatino" : "serif",
    includeFontPadding: false,
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
    includeFontPadding: false,
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
    fontFamily: Platform.OS === "ios" ? "serif" : "serif",
    includeFontPadding: false,
  },
  carrierName: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#161413",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
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
    includeFontPadding: false,
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
  },
  infoCol: {
    flex: 1,
  },
  infoSub: {
    fontSize: 11,
    color: "#7A7067",
    marginBottom: 2,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
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
    includeFontPadding: false,
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
    fontFamily: Platform.OS === "ios" ? "serif" : "serif",
    includeFontPadding: false,
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
    backgroundColor: "#D93838",
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
    backgroundColor: "#F5C6C6",
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#7A7067",
    flex: 1,
    paddingRight: 6,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  stepDesc: {
    fontSize: 11.5,
    color: "#7A7067",
    lineHeight: 16,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  serviceNoteDesc: {
    fontSize: 11.5,
    color: "#ffffff",
    lineHeight: 16,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
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
    fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif',
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
  },
  addressHeaderTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#af671b",
   
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  recipientName: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#2A2421",
    marginBottom: 3,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  recipientAddress: {
    fontSize: 11.5,
    color: "#7A7067",
    lineHeight: 17,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
});
