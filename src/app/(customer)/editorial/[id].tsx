import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LOOKBOOK_ITEM } from '@/services/mockData';

const { width } = Dimensions.get('window');

export default function EditorialDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = LOOKBOOK_ITEM;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài Viết Nổi Bật</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/shop' as any)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="shopping-bag" size={18} color="#252525" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cover Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.coverImage} />
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>

          {/* Author info */}
          <View style={styles.authorRow}>
            <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>{item.author}</Text>
              <Text style={styles.authorSub}>Chuyên gia thiết kế nội thất Lumora</Text>
            </View>
          </View>

          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.fullText}>{item.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
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
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageWrapper: {
    width: width,
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: '#8A6A48',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#252525',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 30,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
  },
  authorSub: {
    fontSize: 12,
    color: '#6E6860',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A6A48',
    lineHeight: 24,
    marginBottom: 16,
  },
  fullText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 24,
  },
});
