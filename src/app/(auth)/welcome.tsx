import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.background}
    >
      {/* Thay thế LinearGradient bằng View phủ màu tối */}
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.brandTitle}>LUMORA</Text>
            <Text style={styles.subtitle}>Không gian sống tinh tế & đẳng cấp</Text>
          </View>

          <View style={styles.buttonGroup}>
            <Pressable 
              style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.85 }]} 
              onPress={() => router.push('/(auth)/login' as any)}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.registerButton, pressed && { opacity: 0.85 }]} 
              onPress={() => router.push('/(auth)/register' as any)}
            >
              <Text style={styles.registerButtonText}>Chưa có tài khoản? Đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 18, 12, 0.75)', // Màu phủ tối phong cách nội thất sang trọng
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  contentContainer: {
    width: '100%',
  },
  headerTextGroup: {
    marginBottom: 40,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '300',
    color: '#FFF',
    letterSpacing: 6,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#E2DBD0',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    gap: 14,
  },
  loginButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#8A6A48',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});