import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { registerApi } from '@/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State thông báo toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(""));
    }, 2000);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      showToast("Vui lòng nhập đầy đủ tất cả các thông tin.", "error");
      return;
    }

    try {
      setLoading(true);
      await registerApi(fullName, email, password, phone);
      showToast("Đăng ký thành công!", "success");

      setTimeout(() => {
        router.push('/(auth)/login');
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
        {/* Toast thông báo */}
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
              <Text style={styles.title}>ĐĂNG KÝ</Text>
              <Text style={styles.subtitle}>Tạo tài khoản khách hàng thành viên</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>HỌ VÀ TÊN</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#A0988E"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>ĐỊA CHỈ EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="ten@domain.com"
                placeholderTextColor="#A0988E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
              <TextInput
                style={styles.input}
                placeholder="0912345678"
                placeholderTextColor="#A0988E"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.label}>MẬT KHẨU</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#A0988E"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#8A6A48" />
                </Pressable>
              </View>

              <Pressable 
                style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
                </Text>
              </Pressable>

              <Pressable onPress={() => router.push('/(auth)/login')} style={styles.linkButton}>
                <Text style={styles.linkText}>
                  Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
                </Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  closeButton: { position: 'absolute', top: 40, left: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '300', color: '#FFF', letterSpacing: 3, marginBottom: 4, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif' },
  subtitle: { fontSize: 13, color: '#D5CEC5', textAlign: 'center' },
  card: { backgroundColor: '#F9F6F0', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 30, marginHorizontal: -20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  label: { fontSize: 10, fontWeight: '700', color: '#8A6A48', letterSpacing: 1.5, marginBottom: 4, marginTop: 10 },
  input: { height: 46, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2DBD0', paddingHorizontal: 14, fontSize: 14, color: '#252525' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2DBD0', height: 46, paddingHorizontal: 14 },
  passwordInput: { flex: 1, fontSize: 14, color: '#252525' },
  eyeIcon: { padding: 4 },
  primaryButton: { height: 50, backgroundColor: '#8A6A48', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#8A6A48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  linkButton: { marginTop: 14, alignItems: 'center' },
  linkText: { fontSize: 13, color: '#6E6860' },
  linkBold: { color: '#8A6A48', fontWeight: '700' },
});