import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, CATEGORIES } from '../theme';
import { productsService } from '../services/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORY_OPTIONS = CATEGORIES.filter(c => c !== 'All');

export const SubmitProductScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!tagline.trim()) { toast.error('Tagline is required'); return; }
    if (!category) { toast.error('Category is required'); return; }
    if (!user) { toast.error('Sign in to submit'); return; }

    setSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const mediaUrls = mediaUrl.trim() ? [mediaUrl.trim()] : [];

      await productsService.submitProduct({
        userId: user.id,
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        tags: tagsArray,
        mediaUrls,
        websiteUrl: websiteUrl.trim(),
      });

      toast.success('Product submitted!');
      navigation.navigate('Feed');
    } catch (e) {
      toast.error('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, required, children }) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Product</Text>
        <TouchableOpacity
          style={[styles.submitHeaderBtn, submitting && styles.submitHeaderBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitHeaderBtnText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.previewLeft}>
            <View style={styles.previewThumb}>
              <Ionicons name="cube-outline" size={24} color={theme.colors.accent} />
            </View>
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle} numberOfLines={1}>{title || 'Product Name'}</Text>
            <Text style={styles.previewTagline} numberOfLines={1}>{tagline || 'Short tagline...'}</Text>
            {category ? (
              <View style={[styles.previewCategory, { backgroundColor: (theme.colors.categories[category] || '#666') + '20' }]}>
                <Text style={[styles.previewCategoryText, { color: theme.colors.categories[category] || '#666' }]}>{category}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.previewLabel}>Live Preview</Text>

        {/* Form */}
        <Field label="Product Name" required>
          <TextInput
            style={styles.input}
            placeholder="e.g. SuperTool"
            placeholderTextColor={theme.colors.text.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
        </Field>

        <Field label="Tagline" required>
          <TextInput
            style={styles.input}
            placeholder="One line that explains what it does"
            placeholderTextColor={theme.colors.text.muted}
            value={tagline}
            onChangeText={setTagline}
            maxLength={100}
          />
        </Field>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe your product in detail..."
            placeholderTextColor={theme.colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Category" required>
          <View style={styles.categoryGrid}>
            {CATEGORY_OPTIONS.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Tags">
          <TextInput
            style={styles.input}
            placeholder="ai, productivity, saas (comma separated)"
            placeholderTextColor={theme.colors.text.muted}
            value={tags}
            onChangeText={setTags}
          />
        </Field>

        <Field label="Website URL">
          <TextInput
            style={styles.input}
            placeholder="https://yourproduct.com"
            placeholderTextColor={theme.colors.text.muted}
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </Field>

        <Field label="Media URL (image link)">
          <TextInput
            style={styles.input}
            placeholder="https://example.com/screenshot.png"
            placeholderTextColor={theme.colors.text.muted}
            value={mediaUrl}
            onChangeText={setMediaUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </Field>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="rocket" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>{submitting ? 'Launching...' : 'Launch Product'}</Text>
        </TouchableOpacity>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
  submitHeaderBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  submitHeaderBtnDisabled: { opacity: 0.5 },
  submitHeaderBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 60, gap: 20 },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent + '40',
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: 12,
  },
  previewLeft: {},
  previewThumb: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: { flex: 1, gap: 4 },
  previewTitle: { color: theme.colors.text.primary, fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.md },
  previewTagline: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.sm },
  previewCategory: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.full, marginTop: 2 },
  previewCategoryText: { fontSize: theme.fonts.sizes.xs, fontWeight: theme.fonts.weights.bold },
  previewLabel: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.xs, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  field: { gap: 8 },
  label: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.semibold },
  required: { color: theme.colors.accent },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.md,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryOptionActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  categoryOptionText: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.sm },
  categoryOptionTextActive: { color: theme.colors.accent, fontWeight: theme.fonts.weights.bold },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    marginTop: 8,
    ...theme.shadows.accent,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.lg },
});
