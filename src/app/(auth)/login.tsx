import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { loginApi } from "@/services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State quản lý thông báo tùy chỉnh
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Hàm hiển thị Toast tự biến mất
  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    
    // Hiệu ứng hiện lên
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Sau 2 giây tự động ẩn đi
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(""));
    }, 2000);
  };

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@remembered_email');
        const savedPassword = await AsyncStorage.getItem('@remembered_password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Lỗi đọc dữ liệu đã lưu", error);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Vui lòng nhập email và mật khẩu.", "error");
      return;
    }

    try {
      setLoading(true);
      await loginApi(email, password);

      if (rememberMe) {
        await AsyncStorage.setItem('@remembered_email', email);
        await AsyncStorage.setItem('@remembered_password', password);
      } else {
        await AsyncStorage.removeItem('@remembered_email');
        await AsyncStorage.removeItem('@remembered_password');
      }

      showToast("Đăng nhập thành công!", "success");
      
      // Chờ thông báo hiển thị 1.5s rồi chuyển trang
      setTimeout(() => {
        router.replace("/(customer)/home" as any);
      }, 1500);

    } catch (error: any) {
      showToast(error.message || "Có lỗi xảy ra.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Component Toast hiển thị thông báo tự biến mất */}
        {toastMessage ? (
          <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, backgroundColor: toastType === 'success' ? '#2E7D32' : '#C62828' }]}>
            <Feather name={toastType === 'success' ? "check-circle" : "alert-circle"} size={18} color="#FFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        ) : null}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <Feather name="x" size={22} color="#FFF" />
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.title}>ĐĂNG NHẬP</Text>
              <Text style={styles.subtitle}>Khám phá bộ sưu tập nội thất độc quyền</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color="#8A6A48" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email của bạn"
                  placeholderTextColor="#A0988E"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color="#8A6A48" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#A0988E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#8A6A48" />
                </Pressable>
              </View>

              <View style={styles.rowBetween}>
                <Pressable style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Feather name="check" size={12} color="#FFF" />}
                  </View>
                  <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
                </Pressable>
              </View>

              <Pressable 
                style={[styles.button, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/(auth)/register")} style={styles.switchContainer}>
                <Text style={styles.switchText}>Chưa có tài khoản? <Text style={styles.boldText}>Đăng ký ngay</Text></Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(25, 18, 12, 0.7)' },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    gap: 8,
  },
  toastText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 40 },
  closeButton: { position: 'absolute', top: 40, left: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20, paddingHorizontal: 4 },
  title: { fontSize: 28, fontWeight: '300', color: '#FFF', letterSpacing: 3, marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#D5CEC5', textAlign: 'center' },
  card: { backgroundColor: '#F9F6F0', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36, marginHorizontal: -20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2DBD0', borderRadius: 12, marginBottom: 14, paddingHorizontal: 14, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#252525' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 4 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#8A6A48', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxChecked: { backgroundColor: '#8A6A48' },
  rememberText: { fontSize: 13, color: '#6E6860' },
  button: { height: 50, borderRadius: 25, backgroundColor: '#8A6A48', justifyContent: "center", alignItems: "center", marginTop: 4, shadowColor: '#8A6A48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  buttonText: { color: "#FFF", fontSize: 13, fontWeight: "700", letterSpacing: 1.5 },
  switchContainer: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 13, color: '#6E6860' },
  boldText: { color: '#8A6A48', fontWeight: '700' }
});