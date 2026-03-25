import { supabase } from '../supabaseClient'

export const UPDATE_TYPES = [
  { value: 'update',       label: 'Update',       emoji: '📝' },
  { value: 'feature',      label: 'New Feature',  emoji: '✨' },
  { value: 'fix',          label: 'Bug Fix',      emoji: '🔧' },
  { value: 'announcement', label: 'Announcement', emoji: '📣' },
]

export const productUpdatesService = {
  /**
   * Get all updates for a product, newest first.
   */
  async getProductUpdates(productId) {
    const { data, error } = await supabase
      .from('product_updates')
      .select('*, profiles:author_id (id, username, full_name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Post a new update/changelog entry.
   */
  async addProductUpdate(productId, authorId, title, body, type = 'update') {
    const { data, error } = await supabase
      .from('product_updates')
      .insert({ product_id: productId, author_id: authorId, title, body, type })
      .select('*, profiles:author_id (id, username, full_name, avatar_url)')
      .single()
    if (error) throw error
    return data
  },

  /**
   * Delete an update (author only — enforce in UI).
   */
  async deleteProductUpdate(updateId) {
    const { error } = await supabase
      .from('product_updates')
      .delete()
      .eq('id', updateId)
    if (error) throw error
  },
}
