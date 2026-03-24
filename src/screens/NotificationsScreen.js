import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'upvote', title: 'Someone upvoted your product', subtitle: 'SuperTool got a new upvote', time: '2m ago', read: false, icon: 'rocket', color: '#FF5722' },
  { id: '2', type: 'comment', title: 'New comment on your product', subtitle: '"This looks amazing!"', time: '1h ago', read: false, icon: 'chatbubble', color: '#3B82F6' },
  { id: '3', type: 'follow', title: 'New follower', subtitle: '@devuser started following you', time: '3h ago', read: true, icon: 'person-add', color: '#22C55E' },
  { id: '4', type: 'trending', title: 'Trending in AI', subtitle: 'Check out what\'s new today', time: '5h ago', read: true, icon: 'trending-up', color: '#8B5CF6' },
];

const NotifItem = ({ notif, onRead }) => (
  <TouchableOpacity
    style={[styles.item, !notif.read && styles.itemUnread]}
    onPress={() => onRead(notif.id)}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrap, { backgroundColor: notif.color + '20' }]}>
      <Ionicons name={notif.icon} size={20} color={notif.color} />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{notif.title}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>{notif.subtitle}</Text>
      <Text style={styles.itemTime}>{notif.time}</Text>
    </View>
    {!notif.read && <View style={styles.unreadDot} />}
  </TouchableOpacity>
);

export const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const { user } = useAuth();

  const handleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleReadAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && <Text style={styles.badge}>{unreadCount}</Text>}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleReadAll}>
            <Text style={styles.readAllBtn}>Read all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <NotifItem notif={item} onRead={handleRead} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.text.muted} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
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
    gap: 12,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 52,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.bold,
  },
  badge: { color: theme.colors.accent },
  readAllBtn: { color: theme.colors.accent, fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.medium },
  list: { padding: theme.spacing.lg, gap: 8, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  itemUnread: {
    borderColor: theme.colors.accent + '30',
    backgroundColor: theme.colors.accentSoft,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1, gap: 2 },
  itemTitle: { color: theme.colors.text.primary, fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.sm },
  itemSubtitle: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.xs },
  itemTime: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 14 },
  emptyText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.md },
});
