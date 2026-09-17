import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function WishlistScreen() {
  const router = useRouter();

  const wishlistedItems = [
    {
      id: 'prod-1',
      title: 'Ghế Bành Vải Bouclé Mềm Aethel',
      price: 1280,
      image:
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-3',
      title: 'Đèn Thả Trần Đồng Thau Solis',
      price: 490,
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
    },
  ];

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
        <Text style={styles.headerTitle}>Danh Sách Yêu Thích</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={wishlistedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>
                ${item.price.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(customer)/cart')}
                style={styles.addBagBtn}
              >
                <Feather name="shopping-bag" size={12} color="#FFFFFF" />
                <Text style={styles.addBagText}>Chuyển Vào Giỏ</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.removeBtn}>
              <Ionicons name="heart" size={20} color="#D93838" />
            </TouchableOpacity>
          </View>
        )}
      />
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
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DBD0',
    marginBottom: 14,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6A48',
    marginBottom: 8,
  },
  addBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A6A48',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  addBagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 8,
  },
});
