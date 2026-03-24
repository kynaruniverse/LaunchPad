import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { productsService } from '../services/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const STATUS_COLORS = {
  active: theme.colors.success,
  updated: theme.colors.warning,
  retired: theme.colors.text.muted,
};

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProductItem = ({ product, onStatusChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const statusColor = STATUS_COLORS[product.status] || theme.colors.text.muted;

  return (
    <View style={styles.productItem}>
      <View style={styles.productItemLeft}>
        <View style={styles.productItemInfo}>
          <Text style={styles.productItemTitle} numberOfLines={1}>{product.title}</Text>
          <Text style={styles.productItemTagline} numberOfLines={1}>{product.tagline}</Text>
          <View style={styles.productItemStats}>
            <View style={styles.miniStat}>
              <Ionicons name="eye-outline" size={12} color={theme.colors.text.muted} />
              <Text style={styles.miniStatText}>{product.view_count || 0}</Text>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="rocket-outline" size={12} color={theme.colors.text.muted} />
              <Text style={styles.miniStatText}>{product.upvote_count || 0}</Text>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="chatbubble-outline" size={12} color={theme.colors.text.muted} />
              <Text style={styles.miniStatText}>{product.comment_count || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.productItemRight}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{product.status}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          {['active', 'updated', 'retired'].map(s => (
            <TouchableOpacity
              key={s}
              style={styles.menuItem}
              onPress={() => { onStatusChange(product.id, s); setShowMenu(false); }}
            >
              <View style={[styles.menuDot, { backgroundColor: STATUS_COLORS[s] }]} />
              <Text style={styles.menuItemText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const MakerDashboardScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    try {
      const data = await productsService.getUserProducts(user.id);
      setProducts(data || []);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId, status) => {
    try {
      await productsService.updateProductStatus(productId, status);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p));
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const totalViews = products.reduce((acc, p) => acc + (p.view_count || 0), 0);
  const totalUpvotes = products.reduce((acc, p) => acc + (p.upvote_count || 0), 0);
  const totalComments = products.reduce((acc, p) => acc + (p.comment_count || 0), 0);

  if (!user) {
    return (
      <View style={styles.authWall}>
        <Ionicons name="lock-closed-outline" size={48} color={theme.colors.text.muted} />
        <Text style={styles.authWallText}>Sign in to access your dashboard</Text>
        <TouchableOpacity style={styles.authBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.authBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate('Submit')}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <View style={styles.welcomeAvatar}>
            <Text style={styles.welcomeAvatarText}>
              {(profile?.username || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeName}>Hey, {profile?.username || 'Maker'} 👋</Text>
            <Text style={styles.welcomeSub}>{products.length} product{products.length !== 1 ? 's' : ''} submitted</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Total Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="eye-outline" label="Views" value={totalViews} color={theme.colors.categories.Web} />
          <StatCard icon="rocket-outline" label="Upvotes" value={totalUpvotes} color={theme.colors.accent} />
          <StatCard icon="chatbubble-outline" label="Comments" value={totalComments} color={theme.colors.categories.AI} />
        </View>

        {/* Products */}
        <Text style={styles.sectionTitle}>Your Products</Text>

        {loading ? <LoadingSpinner /> : products.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={40} color={theme.colors.text.muted} />
            <Text style={styles.emptyText}>No products yet</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Submit')}
            >
              <Text style={styles.emptyBtnText}>Submit your first product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map(p => (
            <ProductItem key={p.id} product={p} onStatusChange={handleStatusChange} />
          ))
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.bold },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  submitBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.sm },
  scroll: { padding: theme.spacing.lg, gap: 16, paddingBottom: 100 },
  welcome: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  welcomeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeAvatarText: { color: theme.colors.accent, fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.bold },
  welcomeName: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold },
  welcomeSub: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.sm },
  sectionTitle: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.md, fontWeight: theme.fonts.weights.bold, marginTop: 8 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.extrabold },
  statLabel: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs },
  productItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  productItemLeft: { flex: 1 },
  productItemInfo: { gap: 4 },
  productItemTitle: { color: theme.colors.text.primary, fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.md },
  productItemTagline: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.sm },
  productItemStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniStatText: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs },
  productItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  statusText: { fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold, textTransform: 'capitalize' },
  menuBtn: { padding: 4 },
  menu: {
    position: 'absolute',
    right: 12,
    top: 44,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  menuDot: { width: 8, height: 8, borderRadius: 4 },
  menuItemText: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.sm },
  authWall: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: theme.spacing.xl,
  },
  authWallText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.md, textAlign: 'center' },
  authBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
  },
  authBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold },
  empty: { alignItems: 'center', padding: theme.spacing.xxl, gap: 12 },
  emptyText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.md },
  emptyBtn: {
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  emptyBtnText: { color: theme.colors.accent, fontWeight: theme.fonts.weights.semibold },
});
