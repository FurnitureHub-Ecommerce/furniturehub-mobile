import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width;

// Hệ thống Font chuẩn Luxury cho FurnitureHub
const FONTS = {
  SERIF: Platform.OS === "ios" ? "Didot" : "serif",
  SANS: Platform.OS === "ios" ? "System" : "sans-serif",
};

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  tag?: string;
  ctaText?: string;
  categoryId?: string;
}

interface BannerCarouselProps {
  banners: BannerItem[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
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
  }, [banners?.length]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / BANNER_WIDTH);
      if (index !== activeIndex && index >= 0 && index < banners.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, banners?.length],
  );

  if (!banners || banners.length === 0) return null;

  const renderItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() =>
        item.categoryId &&
        router.push(`/(customer)/category/${item.categoryId}` as any)
      }
      style={styles.heroContainer}
    >
      <Image source={{ uri: item.image }} style={styles.heroImage} />

      {/* Overlay phủ mờ sang trọng */}
      <View style={styles.heroOverlay}>
        {item.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.heroTag}>{item.tag.toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.heroTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.subtitle && (
          <Text style={styles.heroSub} numberOfLines={2}>
            {item.subtitle}
          </Text>
        )}

        <View style={styles.heroCTA}>
          <Text style={styles.heroCTAText}>
            {item.ctaText ? item.ctaText.toUpperCase() : "XEM NGAY"}
          </Text>
          <Feather name="arrow-right" size={13} color="#FFFFFF" />
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
        keyExtractor={(item, index) => item.id || index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
      />

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
    marginBottom: 0,
  },
  customText: {
    fontSize: 14,
    // 1. Luôn đặt lineHeight cao hơn fontSize từ 3 - 5px
    lineHeight: 18,
    // 2. Tắt padding mặc định của Android để canh lề chuẩn như iOS
    includeFontPadding: false,
    // 3. Căn giữa theo chiều dọc chuẩn trên Android
    textAlignVertical: "center",
    // 4. Chọn font hệ thống chung nếu không dùng font custom
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  heroContainer: {
    width: BANNER_WIDTH,
    height: 220,
    backgroundColor: "#19120C",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(18, 14, 10, 0.42)",
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 16,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  tagBadge: {
    backgroundColor: "rgba(25, 18, 12, 0.65)",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(230, 197, 148, 0.4)",
    marginBottom: 6,
  },
  heroTag: {
    color: "#E6C594",
    fontSize: 9,
    fontFamily: FONTS.SANS,
    fontWeight: "700",
    letterSpacing: 1.5,
    includeFontPadding: false,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: FONTS.SERIF,
    fontWeight: "300",
    lineHeight: 29,
    letterSpacing: 0.5,
    marginBottom: 4,
    includeFontPadding: false,
  },
  heroSub: {
    color: "#E5DDD3",
    fontSize: 12,
    fontFamily: FONTS.SANS,
    fontWeight: "400",
    lineHeight: 17,
    marginBottom: 14,
    includeFontPadding: false,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    gap: 6,
  },
  heroCTAText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: FONTS.SANS,
    fontWeight: "700",
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 22,
    backgroundColor: "#8A6A48",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#E2DBD0",
  },
});

export const shadowStyle = {
  // Dành cho iOS
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  // Dành cho Android
  elevation: 3,
};
