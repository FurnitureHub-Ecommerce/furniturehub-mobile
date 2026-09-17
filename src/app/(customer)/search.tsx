import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const suggestions = [
    'Bàn Ăn Gỗ Sồi Nguyên Khối',
    'Ghế Bành Vải Bouclé',
    'Đèn Thả Trần Đồng Thau',
    'Sofa Góc Nỉ Nhung',
    'Bàn Trà Đá Travertine',
  ];

  const searchResults = [
    {
      id: 'prod-1',
      title: 'Ghế Bành Vải Bouclé Mềm Aethel',
      category: 'Phòng Khách',
      price: 1280,
      rating: 4.9,
      image:
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-2',
      title: 'Bàn Ăn Gỗ Sồi Nguyên Khối Komorebi',
      category: 'Phòng Ăn',
      price: 2450,
      rating: 5.0,
      image:
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search Input */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#252525" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Feather name="search" size={18} color="#6E6860" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bàn gỗ sồi, sofa da, vải bouclé..."
            placeholderTextColor="#6E6860"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={18} color="#6E6860" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {query.length === 0 ? (
          <View>
            <Text style={styles.sectionTitle}>TÌM KIẾM PHỔ BIẾN</Text>
            <View style={styles.tagGroup}>
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setQuery(item)}
                  style={styles.tagPill}
                  activeOpacity={0.75}
                >
                  <Feather name="trending-up" size={13} color="#8A6A48" />
                  <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.id}`)}
                style={styles.resultCard}
                activeOpacity={0.88}
              >
                <Image source={{ uri: item.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultCategory}>{item.category}</Text>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#C89D5C" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.resultPrice}>
                    ${item.price.toLocaleString()}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#6E6860" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DBD0',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#252525',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A48',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  tagGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#252525',
    fontWeight: '500',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 12,
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 14,
  },
  resultCategory: {
    fontSize: 10,
    color: '#6E6860',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#252525',
    marginLeft: 4,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A6A48',
  },
});
