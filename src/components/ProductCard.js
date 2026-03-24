import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { UpvoteButton } from './UpvoteButton';

const { width } = Dimensions.get('window');

export const ProductCard = ({ product, onPress, onUpvote, upvoted, isNew = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const categoryColor = theme.colors.categories[product.category] || theme.colors.categories.Other;
  const thumbnail = product.media_urls?.[0];

  return (
    <Animated.View style={[styles.wrapper, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* New Badge */}
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons name="cube-outline" size={32} color={categoryColor} />
            </View>
          )}
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20', borderColor: categoryColor + '40' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{product.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
          <Text style={styles.tagline} numberOfLines={2}>{product.tagline}</Text>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tags}>
              {product.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <UpvoteButton
              count={product.upvote_count || 0}
              upvoted={upvoted}
              onPress={onUpvote}
              size="sm"
            />
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.actionText}>{product.comment_count || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="bookmark-outline" size={14} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {/* Maker */}
            <View style={styles.maker}>
              <View style={styles.makerAvatar}>
                <Text style={styles.makerAvatarText}>
                  {(product.profiles?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.makerName} numberOfLines={1}>
                {product.profiles?.username || 'Anonymous'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: theme.fonts.weights.bold,
    letterSpacing: 0.5,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.bold,
  },
  content: {
    padding: theme.spacing.lg,
    gap: 8,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
  tagline: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.sm,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  tagText: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  actionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.xs,
  },
  maker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 120,
  },
  makerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makerAvatarText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: theme.fonts.weights.bold,
  },
  makerName: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.xs,
    flex: 1,
  },
});
