import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfileApi } from "@/services/api";

export default function AccountScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useFocusEffect để tự động cập nhật khi quay lại từ màn hình chỉnh sửa hồ sơ
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUserData = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            setIsLoading(false);
            return;
          }

          const data = await getUserProfileApi(token);
          const user = data.user || data.data || data;

          if (isActive && user) {
            setProfile(user);
          }
        } catch (error) {
          console.warn("Lỗi tải thông tin tài khoản:", error);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchUserData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const menuItems = [
    {
      id: "orders",
      title: "Lịch Sử & Theo Dõi Đơn Hàng",
      subtitle: "Xem tiến trình giao hàng & quản lý đơn",
      icon: "package",
      route: "/(customer)/orders",
    },
    {
      id: "address",
      title: "Sổ Địa Chỉ Giao Hàng",
      subtitle: "Quản lý các địa chỉ nhận hàng",
      icon: "map-pin",
      route: "/(customer)/account/address",
    },
    {
      id: "wishlist",
      title: "Bộ Sưu Tập Yêu Thích",
      subtitle: "Các sản phẩm nội thất đã lưu",
      icon: "heart",
      route: "/(customer)/(tabs)/wishlist",
    },
    {
      id: "edit_profile",
      title: "Thông Tin Cá Nhân",
      subtitle: "Cập nhật họ tên, số điện thoại, avatar",
      icon: "user",
      route: "/(customer)/account/edit",
    },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ Của Tôi</Text>
        <TouchableOpacity
          onPress={() => router.push("/(customer)/account/edit" as any)}
          style={styles.editIconBtn}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={17} color="#8A6A48" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isLoading ? (
            <ActivityIndicator color="#8A6A48" style={{ padding: 20 }} />
          ) : (
            <>
              <Image
                source={{
                  uri:
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile?.fullName || profile?.name || "Nam Anh"
                    )}&background=8A6A48&color=fff&size=150`,
                }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.fullName || profile?.name || "Nam Anh"}
                </Text>
                <Text style={styles.profileEmail}>
                  {profile?.email || "namanh@furniturehub.com"}
                </Text>
                {profile?.phone && (
                  <Text style={styles.profilePhone}>{profile.phone}</Text>
                )}
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>CONCIERGE MEMBER</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(customer)/account/edit" as any)}
                style={styles.editProfileSmallBtn}
                activeOpacity={0.8}
              >
                <Feather name="edit" size={14} color="#8A6A48" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Menu Options */}
        <Text style={styles.sectionHeader}>DỊCH VỤ & TÙY CHỌN</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
              style={styles.menuRow}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Feather name={item.icon as any} size={18} color="#8A6A48" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#C2B8A3" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { backgroundColor: "#FCE8E6" },
          ]}
        >
          <Feather name="log-out" size={16} color="#D93838" />
          <Text style={styles.logoutText}>Đăng Xuất Tài Khoản</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9E1D5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#252525",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#8A6A48",
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252525",
  },
  profileEmail: {
    fontSize: 12,
    color: "#6E6860",
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 12,
    color: "#6E6860",
    marginTop: 1,
  },
  vipBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E9E1D5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  vipBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A6A48",
    letterSpacing: 1,
  },
  editProfileSmallBtn: {
    padding: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A6A48",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    overflow: "hidden",
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F4EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#252525",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2DBD0",
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D93838",
    letterSpacing: 0.5,
  },
});
