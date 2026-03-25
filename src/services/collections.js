import { supabase } from '../supabaseClient'

export const collectionsService = {
  /**
   * Get all collections owned by a user, with item count.
   */
  async getUserCollections(userId) {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Get all PUBLIC collections (for Explore/discovery use).
   */
  async getPublicCollections() {
    const { data, error } = await supabase
      .from('collections')
      .select('*, profiles:user_id (id, username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data || []
  },

  /**
   * Get the products inside a specific collection.
   */
  async getCollectionItems(collectionId) {
    const { data, error } = await supabase
      .from('collection_items')
      .select(`
        *,
        product:product_id (
          *,
          profiles:user_id (id, username, full_name, avatar_url)
        )
      `)
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(item => item.product).filter(Boolean)
  },

  /**
   * Create a new collection.
   */
  async createCollection(userId, title, description, isPublic) {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id:     userId,
        title:       title.trim(),
        description: description?.trim() || null,
        is_public:   isPublic,
        item_count:  0,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Delete a collection (cascade deletes items too).
   */
  async deleteCollection(collectionId) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
    if (error) throw error
  },

  /**
   * Add a product to a collection.
   * Returns false if already in collection (duplicate), true on success.
   */
  async addToCollection(collectionId, productId, userId) {
    const { error } = await supabase
      .from('collection_items')
      .insert({ collection_id: collectionId, product_id: productId, added_by: userId })
    if (error) {
      if (error.code === '23505') return false // already exists — not a real error
      throw error
    }
    return true
  },

  /**
   * Remove a product from a collection.
   */
  async removeFromCollection(collectionId, productId) {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('product_id', productId)
    if (error) throw error
  },

  /**
   * Check which of the user's collections already contain a given product.
   * Returns a Set of collection IDs.
   */
  async getCollectionsContaining(productId, userId) {
    const { data, error } = await supabase
      .from('collection_items')
      .select('collection_id')
      .eq('product_id', productId)
      .eq('added_by', userId)
    if (error) throw error
    return new Set((data || []).map(r => r.collection_id))
  },
}
