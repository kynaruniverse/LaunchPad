import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Modal, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CollectionCard = ({ collection, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardThumb}>
      <Ionicons name="albums-outline" size={28} color={theme.colors.accent} />
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle} numberOfLines={1}>{collection.title}</Text>
      {collection.description ? (
        <Text style={styles.cardDesc} numberOfLines={1}>{collection.description}</Text>
      ) : null}
      <View style={styles.cardMeta}>
        <Ionicons name={collection.is_public ? 'globe-outline' : 'lock-closed-outline'} size={12} color={theme.colors.text.muted} />
        <Text style={styles.cardMetaText}>{collection.is_public ? 'Public' : 'Private'}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
  </TouchableOpacity>
);

export const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) loadCollections();
    else setLoading(false);
  }, [user]);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCollections(data || []);
    } catch (e) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({ user_id: user.id, title: title.trim(), description: description.trim(), is_public: isPublic })
        .select()
        .single();
      if (error) throw error;
      setCollections(prev => [data, ...prev]);
      setShowModal(false);
      setTitle('');
      setDescription('');
      toast.success('Collection created!');
    } catch (e) {
      toast.error('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.authWall}>
        <Ionicons name="albums-outline" size={48} color={theme.colors.text.muted} />
        <Text style={styles.authWallText}>Sign in to create collections</Text>
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
        <Text style={styles.headerTitle}>Collections</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? <LoadingSpinner fullScreen /> : (
        <FlatList
          data={collections}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <CollectionCard
              collection={item}
              onPress={() => navigation.navigate('Feed')}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="albums-outline" size={48} color={theme.colors.text.muted} />
              <Text style={styles.emptyText}>No collections yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
                <Text style={styles.emptyBtnText}>Create your first collection</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Collection name"
              placeholderTextColor={theme.colors.text.muted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setIsPublic(!isPublic)}
            >
              <Ionicons
                name={isPublic ? 'globe-outline' : 'lock-closed-outline'}
                size={18}
                color={isPublic ? theme.colors.success : theme.colors.text.muted}
              />
              <Text style={styles.visibilityText}>{isPublic ? 'Public' : 'Private'}</Text>
              <View style={[styles.toggle, isPublic && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, creating && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createBtnText}>{creating ? 'Creating...' : 'Create Collection'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: theme.spacing.lg, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardThumb: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { color: theme.colors.text.primary, fontWeight: theme.fonts.weights.semibold, fontSize: theme.fonts.sizes.md },
  cardDesc: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardMetaText: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 14 },
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
  authWall: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: 16, padding: theme.spacing.xl },
  authWallText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.md, textAlign: 'center' },
  authBtn: { backgroundColor: theme.colors.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: theme.radius.lg },
  authBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    gap: 14,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.lg, fontWeight: theme.fonts.weights.bold },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.md,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  visibilityText: { flex: 1, color: theme.colors.text.primary, fontSize: theme.fonts.sizes.sm },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: { backgroundColor: theme.colors.success },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  createBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.md },
});
