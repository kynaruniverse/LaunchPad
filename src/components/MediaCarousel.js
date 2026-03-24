import React, { useState, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions,
  FlatList, TouchableOpacity, Text,
} from 'react-native';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const MediaCarousel = ({ mediaUrls = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  if (!mediaUrls || mediaUrls.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="image-outline" size={48} color={theme.colors.text.muted} />
        <Text style={styles.placeholderText}>No media</Text>
      </View>
    );
  }

  const goTo = (index) => {
    if (index < 0 || index >= mediaUrls.length) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mediaUrls}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
        )}
      />

      {/* Dots */}
      {mediaUrls.length > 1 && (
        <View style={styles.dots}>
          {mediaUrls.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Arrows */}
      {mediaUrls.length > 1 && (
        <>
          {activeIndex > 0 && (
            <TouchableOpacity style={[styles.arrow, styles.arrowLeft]} onPress={() => goTo(activeIndex - 1)}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {activeIndex < mediaUrls.length - 1 && (
            <TouchableOpacity style={[styles.arrow, styles.arrowRight]} onPress={() => goTo(activeIndex + 1)}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Counter */}
      {mediaUrls.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIndex + 1}/{mediaUrls.length}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  image: {
    width,
    height: '100%',
  },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.sm,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 12 },
  arrowRight: { right: 12 },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  counterText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
  },
});
