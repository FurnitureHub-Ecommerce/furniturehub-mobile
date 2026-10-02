import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#252525" />
          </TouchableOpacity>

          <View style={styles.headerGroup}>
            <Text style={styles.brandTitle}>LUMORA</Text>
            <Text style={styles.subtitle}>Tạo tài khoản cao cấp</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>HỌ VÀ TÊN</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Nguyễn Văn A"
              placeholderTextColor="#6E6860"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>ĐỊA CHỈ EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="ten@domain.com"
              placeholderTextColor="#6E6860"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6E6860"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>ĐĂNG KÝ TÀI KHOẢN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login' as any)}
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  headerGroup: {
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#252525',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E6860',
  },
  formGroup: {
    gap: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#252525',
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#252525',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#6E6860',
  },
  linkBold: {
    color: '#8A6A48',
    fontWeight: '700',
  },
});
