import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { MediaCarousel } from '../components/MediaCarousel';
import { CommentSection } from '../components/CommentSection';
import { UpvoteButton } from '../components/UpvoteButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { productsService } from '../services/products';
import { votesService } from '../services/votes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const categoryColor = theme.colors.categories[product.category] || theme.colors.categories.Other;

  useEffect(() => {
    loadFullProduct();
    if (user) checkUpvoted();
  }, []);

  const loadFullProduct = async () => {
    try {
      const data = await productsService.getProduct(product.id);
      setProduct(data);
    } catch (e) {}
  };

  const checkUpvoted = async () => {
    try {
      const has = await votesService.hasUpvoted(user.id, product.id);
      setUpvoted(has);
    } catch (e) {}
  };

  const handleUpvote = async () => {
    if (!user) { toast.info('Sign in to upvote'); return; }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, product.id);
      setUpvoted(isUpvoted);
      setProduct(prev => ({
        ...prev,
        upvote_count: prev.upvote_count + (isUpvoted ? 1 : -1),
      }));
    } catch (e) {
      toast.error('Failed to upvote');
    }
  };

  const handleVisitSite = () => {
    if (product.website_url) Linking.openURL(product.website_url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Back Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="bookmark-outline" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Media */}
        <MediaCarousel mediaUrls={product.media_urls} />

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{product.category}</Text>
          </View>

          {/* Title & Tagline */}
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.tagline}>{product.tagline}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={16} color={theme.colors.text.muted} />
              <Text style={styles.statText}>{product.view_count || 0} views</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.colors.text.muted} />
              <Text style={styles.statText}>{product.comment_count || 0} comments</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.muted} />
              <Text style={styles.statText}>
                {new Date(product.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Maker Info */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Made by</Text>
          <TouchableOpacity style={styles.makerRow}>
            <View style={styles.makerAvatar}>
              <Text style={styles.makerAvatarText}>
                {(product.profiles?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.makerName}>{product.profiles?.username || 'Anonymous'}</Text>
              <Text style={styles.makerHandle}>@{product.profiles?.username?.toLowerCase() || 'user'}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
          </TouchableOpacity>

          {/* Comments */}
          <View style={styles.divider} />
          <CommentSection productId={product.id} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <UpvoteButton count={product.upvote_count || 0} upvoted={upvoted} onPress={handleUpvote} />
        {product.website_url && (
          <TouchableOpacity style={styles.visitBtn} onPress={handleVisitSite}>
            <Text style={styles.visitBtnText}>Visit Site</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 52,
    paddingBottom: theme.spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,10,15,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,10,15,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: 100 },
  content: { padding: theme.spacing.lg, gap: 12 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  categoryText: { fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: theme.fonts.weights.extrabold,
    lineHeight: 30,
  },
  tagline: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.md,
    lineHeight: 22,
  },
  statsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold,
    marginBottom: 4,
  },
  description: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.md,
    lineHeight: 24,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.xs },
  makerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  makerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makerAvatarText: {
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.sizes.lg,
  },
  makerName: { color: theme.colors.text.primary, fontWeight: theme.fonts.weights.semibold },
  makerHandle: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: theme.spacing.lg,
    paddingBottom: 32,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  visitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    ...theme.shadows.accent,
  },
  visitBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.md },
});
