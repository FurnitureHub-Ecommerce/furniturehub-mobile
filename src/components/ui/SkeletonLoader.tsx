import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2;

export const SkeletonLoader: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Banner Skeleton */}
      <Animated.View style={[styles.bannerSkeleton, { opacity }]} />

      {/* Category Pills Skeleton */}
      <View style={styles.catRow}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.catSkeleton, { opacity }]} />
        ))}
      </View>

      {/* Product Cards Skeleton Grid */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.cardSkeleton}>
            <Animated.View style={[styles.imageSkeleton, { opacity }]} />
            <Animated.View style={[styles.lineShort, { opacity }]} />
            <Animated.View style={[styles.lineLong, { opacity }]} />
            <Animated.View style={[styles.linePrice, { opacity }]} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bannerSkeleton: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#E2DBD0',
    marginBottom: 20,
  },
  catRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  catSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2DBD0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardSkeleton: {
    width: COLUMN_WIDTH,
    height: 240,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  imageSkeleton: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#E2DBD0',
    marginBottom: 10,
  },
  lineShort: {
    width: '40%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2DBD0',
    marginBottom: 6,
  },
  lineLong: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2DBD0',
    marginBottom: 10,
  },
  linePrice: {
    width: '50%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2DBD0',
  },
});
