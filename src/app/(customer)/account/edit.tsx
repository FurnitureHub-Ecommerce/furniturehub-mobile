import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfileApi, updateUserProfileApi } from '@/services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const data = await getUserProfileApi(token || undefined);
        const user = data.user || data.data || data;

        if (user) {
          setFullName(user.fullName || user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setAvatar(user.avatar || '');
        }
      } catch (err: any) {
        console.warn('Lỗi tải hồ sơ cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      await updateUserProfileApi(
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          avatar: avatar.trim(),
        },
        token || undefined
      );

      Alert.alert(
        'Thành Công',
        'Thông tin hồ sơ cá nhân của bạn đã được cập nhật.',
        [{ text: 'Đóng', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName || 'User'
  )}&background=8A6A48&color=fff&size=150`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8A6A48" />
          <Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatar || defaultAvatar }} style={styles.avatar} />
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                onPress={() => {
                  Alert.prompt
                    ? Alert.prompt(
                        'Cập nhật Avatar',
                        'Nhập đường link hình ảnh đại diện mới:',
                        (text) => text && setAvatar(text)
                      )
                    : Alert.alert('Avatar', 'Tính năng thay đổi avatar qua URL được hỗ trợ.');
                }}
              >
                <Feather name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHelper}>Ảnh đại diện thành viên Concierge</Text>
          </View>

          {/* Form with Fixed Icon Padding */}
          <View style={styles.formCard}>
            {/* Họ và tên */}
            <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Feather name="user" size={18} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập họ và tên đầy đủ"
                placeholderTextColor="#A0988E"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email (Read-only) */}
            <Text style={styles.inputLabel}>ĐỊA CHỈ EMAIL (TÀI KHOẢN ĐĂNG NHẬP)</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <View style={styles.iconBox}>
                <Feather name="mail" size={18} color="#999187" />
              </View>
              <TextInput
                style={[styles.textInput, styles.textInputDisabled]}
                placeholder="email@example.com"
                placeholderTextColor="#999187"
                value={email}
                editable={false}
              />
              <Feather name="lock" size={15} color="#999187" style={{ marginLeft: 8 }} />
            </View>

            {/* Số điện thoại */}
            <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI LIÊN HỆ</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Feather name="phone" size={18} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 0901234567"
                placeholderTextColor="#A0988E"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* URL Hình đại diện */}
            <Text style={styles.inputLabel}>ĐƯỜNG DẪN ẢNH ĐẠI DIỆN (URL TÙY CHỌN)</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <Feather name="image" size={18} color="#8A6A48" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="https://..."
                placeholderTextColor="#A0988E"
                value={avatar}
                onChangeText={setAvatar}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            activeOpacity={0.88}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>LƯU THAY ĐỔI HỒ SƠ</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E6860',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#8A6A48',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8A6A48',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHelper: {
    fontSize: 12,
    color: '#6E6860',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 12,
  },
  // Ô nhập liệu fix triệt để khoảng cách padding icon
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    height: 50,
    paddingHorizontal: 14, // Padding bao quanh cân đối
    marginBottom: 6,
  },
  inputDisabled: {
    backgroundColor: '#F0ECE4',
    borderColor: '#E2DBD0',
  },
  iconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Khoảng cách giữa icon và chữ nhập
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#252525',
    paddingVertical: 0,
    height: '100%',
  },
  textInputDisabled: {
    color: '#8E8E93',
  },
  saveBtn: {
    height: 52,
    backgroundColor: '#8A6A48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A6A48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
