import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfileApi } from "@/services/api";

export default function AccountScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy token đã được lưu từ lúc đăng nhập
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          console.log("Chưa có token đăng nhập!");
          setIsLoading(false);
          return;
        }

        // Gọi API GET /api/users/profile theo đúng chuẩn Swagger[cite: 19]
        const data = await getUserProfileApi(token);

        // Dữ liệu trả về theo Swagger là { user: { fullName, email, role, ... } }
        if (data && data.user) {
          setProfile(data.user);
        }
      } catch (error) {
        console.log("Lỗi tải thông tin tài khoản từ API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const menuItems = [
    {
      id: "orders",
      title: "Lịch Sử & Theo Dõi Đơn Hàng",
      icon: "package",
      route: "/(customer)/orders",
    },
    {
      id: "address",
      title: "Địa Chỉ Giao Hàng Đã Lưu",
      icon: "map-pin",
      route: "/(customer)/address",
    },
    {
      id: "wishlist",
      title: "Danh Sách Sản Phẩm Yêu Thích",
      icon: "heart",
      route: "/(customer)/wishlist",
    },
    {
      id: "settings",
      title: "Cài Đặt Tài Khoản & Bảo Mật",
      icon: "settings",
      route: "/(customer)/settings",
    },
  ];

  const handleLogout = async () => {
    // Xóa token khi đăng xuất
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài Khoản Của Tôi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                profile?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=8A6A48&color=fff&size=150`,
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.fullName || "Đang tải tên..."}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.email || "Đang tải email..."}
            </Text>
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>
                {profile?.role ? profile.role.toUpperCase() : "CUSTOMER"}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
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
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Feather name="chevron-right" size={18} color="#6E6860" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { backgroundColor: '#f6dada' }, // Đổi sang màu nền hồng nhạt khi click vào
          ]}
        >
          <Feather name="log-out" size={16} color="#D93838" />
          <Text style={styles.logoutText}>Đăng Xuất</Text>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DBD0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#252525",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  scrollContent: {
    padding: 20,
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
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#252525",
  },
  profileEmail: {
    fontSize: 13,
    color: "#6E6860",
    marginTop: 2,
    marginBottom: 6,
  },
  vipBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E9E1D5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  vipBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A6A48",
    letterSpacing: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F4EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#252525",
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
    fontSize: 14,
    fontWeight: "600",
    color: "#D93838",
  },
});
