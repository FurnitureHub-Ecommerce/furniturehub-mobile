import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Banner } from '@/services/mockData';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);

  // Auto Scroll Timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / BANNER_WIDTH);
      if (index !== activeIndex && index >= 0 && index < banners.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, banners.length]
  );

  const renderItem = ({ item }: { item: Banner }) => (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={() => router.push(`/(customer)/category/${item.categoryId}` as any)}
      style={styles.heroContainer}
    >
      <Image source={{ uri: item.image }} style={styles.heroImage} />
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTag}>{item.tag}</Text>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroSub}>{item.subtitle}</Text>
        <View style={styles.heroCTA}>
          <Text style={styles.heroCTAText}>{item.ctaText}</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  heroContainer: {
    width: BANNER_WIDTH,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 16, 12, 0.45)',
    padding: 22,
    justifyContent: 'flex-end',
  },
  heroTag: {
    color: '#E9E1D5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 4,
  },
  heroSub: {
    color: '#E2DBD0',
    fontSize: 12,
    marginBottom: 14,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    gap: 8,
  },
  heroCTAText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#8A6A48',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1C7BD',
  },
});
