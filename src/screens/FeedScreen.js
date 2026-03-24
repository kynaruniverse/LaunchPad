import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { productsService } from '../services/products';
import { votesService } from '../services/votes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SORT_OPTIONS = ['newest', 'trending'];

export const FeedScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userUpvotes, setUserUpvotes] = useState([]);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadFeed(true);
    if (user) loadUserUpvotes();
  }, [category, sort]);

  const loadUserUpvotes = async () => {
    try {
      const upvotes = await votesService.getUserUpvotes(user.id);
      setUserUpvotes(upvotes);
    } catch (e) {}
  };

  const loadFeed = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (!reset && !hasMore) return;

    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const data = await productsService.getFeed({ category, sort, page: currentPage });
      if (reset) {
        setProducts(data || []);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }
      setHasMore((data || []).length === 10);
    } catch (e) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  const handleUpvote = async (productId) => {
    if (!user) { toast.info('Sign in to upvote'); return; }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, productId);
      setUserUpvotes(prev =>
        isUpvoted ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, upvote_count: p.upvote_count + (isUpvoted ? 1 : -1) }
          : p
      ));
    } catch (e) {
      toast.error('Failed to upvote');
    }
  };

  const isNew = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000; // less than 24h
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🚀 LaunchPad</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={26} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Toggle */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            onPress={() => setSort(s)}
          >
            <Ionicons
              name={s === 'newest' ? 'time-outline' : 'trending-up-outline'}
              size={14}
              color={sort === s ? theme.colors.accent : theme.colors.text.muted}
            />
            <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CategoryFilter selected={category} onSelect={(cat) => { setCategory(cat); }} />

      <Text style={styles.feedLabel}>
        {category === 'All' ? 'All Products' : category} · {sort}
      </Text>
    </View>
  );

  if (loading) return <LoadingSpinner fullScreen message="Loading feed..." />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onUpvote={() => handleUpvote(item.id)}
            upvoted={userUpvotes.includes(item.id)}
            isNew={isNew(item.created_at)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="rocket-outline" size={48} color={theme.colors.text.muted} />
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Be the first to submit!</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
        onEndReached={() => loadFeed(false)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  },
  headerLeft: {},
  logo: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.extrabold,
    letterSpacing: -0.5,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortBtnActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  sortText: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
  },
  sortTextActive: { color: theme.colors.accent },
  feedLabel: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: { paddingBottom: 100 },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.semibold,
  },
  emptySubtext: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.sm,
  },
});
