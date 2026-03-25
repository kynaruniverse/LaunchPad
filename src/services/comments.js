import { supabase } from '../supabaseClient'

export const commentsService = {
  async getComments(productId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .eq('product_id', productId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async addComment(userId, productId, content, parentId = null) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: userId, product_id: productId, content, parent_id: parentId })
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .single()
    if (error) throw error

    // Increment comment count — only after successful insert
    const { data: product } = await supabase
      .from('products')
      .select('comment_count')
      .eq('id', productId)
      .single()

    if (product) {
      await supabase
        .from('products')
        .update({ comment_count: (product.comment_count || 0) + 1 })
        .eq('id', productId)
    }

    return data
  },
}
