import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Clipboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getOrdersApi, OrderItem, formatCurrency } from "@/services/api";

const FONTS = {
  SERIF: Platform.OS === "ios" ? "System" : "sans-serif",
  SANS: Platform.OS === "ios" ? "System" : "sans-serif",
};

const ORDER_TABS = [
  { id: "all", label: "Tất Cả" },
  { id: "pending", label: "Chờ Xử Lý" },
  { id: "in_transit", label: "Đang Giao" },
  { id: "delivered", label: "Đã Giao" },
  { id: "cancelled", label: "Đã Hủy" },
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchOrders = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await getOrdersApi();
      setOrders(data);
      hasLoadedRef.current = true;
    } catch (err) {
      console.warn("Lỗi tải danh sách đơn hàng:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tự động fetch lại khi màn hình được active
  useFocusEffect(
    useCallback(() => {
      fetchOrders({ silent: hasLoadedRef.current });
    }, [fetchOrders])
  );

  // Polling nhẹ mỗi 12 giây nếu có đơn chưa hoàn thành/hủy
  useEffect(() => {
    const hasActiveOrders = orders.some((o) => {
      const s = (o.status || "").toLowerCase().trim();
      const l = (o.statusLabel || "").toLowerCase().trim();
      const isDone =
        s === "delivered" ||
        s === "completed" ||
        s === "đã giao hàng" ||
        s === "đã giao" ||
        l === "đã giao" ||
        l === "đã giao hàng" ||
        s === "cancelled" ||
        s === "canceled" ||
        s === "rejected" ||
        s === "đã hủy" ||
        s.includes("hủy") ||
        l.includes("hủy");
      return !isDone;
    });

    if (!hasActiveOrders) return;

    const intervalId = setInterval(() => {
      fetchOrders({ silent: true });
    }, 12000);

    return () => clearInterval(intervalId);
  }, [orders, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders({ silent: true });
  };

  const handleCopyOrderCode = async (orderCode: string, itemId: string) => {
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
      setCopiedId(itemId);
      setTimeout(() => {
        setCopiedId((prev) => (prev === itemId ? null : prev));
      }, 2000);
      if (Platform.OS !== "web") {
        Alert.alert("Đã sao chép", `Đã sao chép mã đơn hàng ${orderCode}`);
      }
    } catch (err) {
      console.warn("Không thể sao chép mã đơn hàng:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    const status = (order.status || "").toLowerCase().trim();
    const label = (order.statusLabel || "").toLowerCase().trim();

    if (activeTab === "pending") {
      return (
        status === "pending" ||
        status === "chờ xử lý" ||
        status === "confirmed" ||
        status === "đã xác nhận" ||
        status === "processing" ||
        status === "đang xử lý" ||
        status === "packing" ||
        status === "đang đóng gói" ||
        label.includes("xác nhận") ||
        label.includes("chờ") ||
        label.includes("xử lý")
      );
    }
    if (activeTab === "in_transit") {
      // Chỉ lấy đơn đang giao/vận chuyển, loại trừ tuyệt đối các đơn đã giao thành công
      const isDelivered =
        status === "delivered" ||
        status === "completed" ||
        status === "đã giao hàng" ||
        status === "đã giao" ||
        label === "đã giao" ||
        label === "đã giao hàng";

      if (isDelivered) return false;

      return (
        status === "in_transit" ||
        status === "shipping" ||
        status === "đang giao hàng" ||
        status === "đang vận chuyển" ||
        status === "đang giao" ||
        label.includes("vận chuyển") ||
        label.includes("đang giao")
      );
    }
    if (activeTab === "delivered") {
      return (
        status === "delivered" ||
        status === "completed" ||
        status === "đã giao hàng" ||
        status === "đã giao" ||
        label === "đã giao" ||
        label === "đã giao hàng"
      );
    }
    if (activeTab === "cancelled") {
      return (
        status === "cancelled" ||
        status === "canceled" ||
        status === "rejected" ||
        status === "đã hủy" ||
        status.includes("hủy") ||
        label.includes("hủy")
      );
    }
    return true;
  });

  // Việt hóa và định dạng badge trạng thái 100% tiếng Việt
  const getStatusInfo = (status?: string, statusLabel?: string) => {
    const s = (status || "").toLowerCase().trim();
    const l = (statusLabel || "").toLowerCase().trim();

    if (
      s === "delivered" ||
      s === "completed" ||
      s.includes("giao hàng") ||
      s === "đã giao" ||
      l === "đã giao hàng" ||
      l === "đã giao"
    ) {
      return { bg: "#E2F0D9", text: "#2E7D32", label: "Đã Giao" };
    }
    if (
      s === "shipping" ||
      s === "in_transit" ||
      s.includes("vận chuyển") ||
      s.includes("đang giao") ||
      l.includes("vận chuyển") ||
      l.includes("đang giao")
    ) {
      return { bg: "#F5EBE1", text: "#8A6A48", label: "Đang Giao" };
    }
    if (s === "confirmed" || s === "đã xác nhận" || l === "đã xác nhận") {
      return { bg: "#E6F4EA", text: "#137333", label: "Đã Xác Nhận" };
    }
    if (
      s === "packing" ||
      s === "processing" ||
      s === "đang xử lý" ||
      s === "đang đóng gói" ||
      l.includes("xử lý") ||
      l.includes("đóng gói")
    ) {
      return { bg: "#E8F0FE", text: "#1A73E8", label: "Đang Xử Lý" };
    }
    if (s === "pending" || s === "chờ xử lý" || l === "chờ xử lý") {
      return { bg: "#FEF5E7", text: "#E67E22", label: "Chờ Xử Lý" };
    }
    if (
      s === "rejected" ||
      s === "cancelled" ||
      s === "canceled" ||
      s.includes("hủy") ||
      l.includes("hủy")
    ) {
      return { bg: "#FCE8E6", text: "#D93838", label: "Đã Hủy" };
    }

    if (statusLabel && !/^[a-zA-Z_-]+$/.test(statusLabel)) {
      return { bg: "#E9E1D5", text: "#8A6A48", label: statusLabel };
    }

    return { bg: "#FEF5E7", text: "#E67E22", label: "Đang Xử Lý" };
  };

  // Đồng bộ mã đơn hàng: lấy 8 ký tự cuối viết hoa từ _id
  const getOrderCode = (order?: OrderItem) => {
    const rawId = order?._id || order?.id || "";
    return rawId ? `#${String(rawId).slice(-8).toUpperCase()}` : "";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          Lịch Sử Đơn Hàng
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabBar}>
        <FlatList
          horizontal
          data={ORDER_TABS}
          keyExtractor={(t) => t.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.id)}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={52} color="#C2B8A3" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySub}>
            {activeTab === "all"
              ? "Bạn chưa thực hiện đơn đặt hàng nào."
              : `Không có đơn hàng thuộc mục "${
                  ORDER_TABS.find((t) => t.id === activeTab)?.label
                }".`}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(customer)/(tabs)/shop" as any)}
            style={styles.exploreBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>MUA SẮM NGAY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8A6A48"
              colors={["#8A6A48"]}
            />
          }
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status, item.statusLabel);
            const totalQty =
              item.items?.reduce((sum, it) => sum + it.qty, 0) || 1;
            const orderCode = getOrderCode(item);
            const isCopied = copiedId === item.id;

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(customer)/orders/${item.id}` as any)
                }
                style={styles.orderCard}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.orderCodeWrap}>
                    <Text style={styles.orderId} numberOfLines={1}>
                      {orderCode}
                    </Text>
                    {orderCode ? (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCopyOrderCode(orderCode, item.id);
                        }}
                        style={styles.copyIconBtn}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name={isCopied ? "check" : "copy"}
                          size={12}
                          color={isCopied ? "#2E7D32" : "#8A6A48"}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusInfo.text }]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>Đặt ngày: {item.date}</Text>

                {item.items && item.items.length > 0 && (
                  <Text style={styles.firstItemName} numberOfLines={1}>
                    {item.items[0].title}
                    {item.items.length > 1 &&
                      ` và ${item.items.length - 1} sản phẩm khác`}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.itemCountText}>{totalQty} sản phẩm</Text>
                  <Text style={styles.totalText}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(customer)/orders/tracking/${item.id}` as any,
                      )
                    }
                    style={styles.trackBtn}
                    activeOpacity={0.8}
                  >
                    <Feather name="map-pin" size={13} color="#8A6A48" />
                    <Text style={styles.trackBtnText}>Theo Dõi Vận Chuyển</Text>
                  </TouchableOpacity>

                  <Feather name="chevron-right" size={16} color="#8A6A48" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
    includeFontPadding: false,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b221d",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  tabBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D8",
    backgroundColor: "#FFFFFF",
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#F7F4EE",
    borderWidth: 1,
    borderColor: "#E8E2D8",
  },
  tabChipActive: {
    backgroundColor: "#8A6A48",
    borderColor: "#8A6A48",
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A7067",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  tabChipTextActive: {
    color: "#FFFFFF",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
    marginTop: 16,
    marginBottom: 8,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12,
    color: "#7A7067",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  exploreBtn: {
    backgroundColor: "#8A6A48",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginBottom: 12,
    shadowColor: "#5C4A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  orderCodeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#2A2421",
    fontFamily: FONTS.SANS,
  },
  copyIconBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#FAF7F2",
    borderWidth: 1,
    borderColor: "#E8E2D8",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: FONTS.SANS,
  },
  dateText: {
    fontSize: 11.5,
    lineHeight: 18,
    color: "#7A7067",
    marginTop: 6,
    marginBottom: 8,
    fontFamily: FONTS.SANS,
  },
  firstItemName: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    color: "#2A2421",
    marginTop: 2,
    marginBottom: 10,
    fontFamily: FONTS.SANS,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F2ECE4",
    paddingTop: 8,
    marginBottom: 8,
  },
  itemCountText: {
    fontSize: 11,
    color: "#7A7067",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A6A48",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F6F0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8A6A48",
    fontFamily: FONTS.SANS,
    includeFontPadding: false,
  },
});
