import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { commentsService } from '../services/comments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from './LoadingSpinner';

const CommentItem = ({ comment }) => (
  <View style={styles.comment}>
    <View style={styles.commentAvatar}>
      <Text style={styles.commentAvatarText}>
        {(comment.profiles?.username || 'U')[0].toUpperCase()}
      </Text>
    </View>
    <View style={styles.commentBody}>
      <Text style={styles.commentUsername}>{comment.profiles?.username || 'Anonymous'}</Text>
      <Text style={styles.commentText}>{comment.content}</Text>
      <Text style={styles.commentTime}>
        {new Date(comment.created_at).toLocaleDateString()}
      </Text>
    </View>
  </View>
);

export const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadComments();
    const sub = commentsService.subscribeToComments(productId, (payload) => {
      if (payload.new) setComments(prev => [...prev, payload.new]);
    });
    return () => sub?.unsubscribe?.();
  }, [productId]);

  const loadComments = async () => {
    try {
      const data = await commentsService.getComments(productId);
      setComments(data || []);
    } catch (e) {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!user) { toast.error('Sign in to comment'); return; }
    setSubmitting(true);
    try {
      const newComment = await commentsService.addComment(user.id, productId, text.trim());
      setComments(prev => [...prev, newComment]);
      setText('');
    } catch (e) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments ({comments.length})</Text>

      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={comments}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No comments yet. Be the first!</Text>
          }
        />
      )}

      {user && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.text.muted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleSubmit}
            disabled={!text.trim() || submitting}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    marginBottom: theme.spacing.lg,
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.sizes.sm,
  },
  commentBody: { flex: 1 },
  commentUsername: {
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.semibold,
    fontSize: theme.fonts.sizes.sm,
  },
  commentText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  commentTime: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.xs,
    marginTop: 4,
  },
  empty: {
    color: theme.colors.text.muted,
    fontSize: theme.fonts.sizes.sm,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
