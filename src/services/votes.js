import { supabase } from '../supabaseClient'

export const votesService = {
  /**
   * Toggle an upvote for a user on a product.
   * Returns true if the product is now upvoted, false if it was removed.
   * NOTE: upvote_count should ideally be maintained by a DB trigger.
   * This implementation uses a check-then-act pattern with error guards
   * to keep client-side counts consistent until a DB trigger is added.
   */
  async toggleUpvote(userId, productId) {
    // Check existing vote
    const { data: existing, error: checkError } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      if (deleteError) throw deleteError

      // Decrement count — only after successful delete
      await supabase.rpc('decrement_upvote', { p_id: productId }).catch(() => {
        // Fallback: manual decrement
        supabase
          .from('products')
          .select('upvote_count')
          .eq('id', productId)
          .single()
          .then(({ data }) => {
            if (data) {
              supabase.from('products')
                .update({ upvote_count: Math.max(0, (data.upvote_count || 1) - 1) })
                .eq('id', productId)
            }
          })
      })
      return false
    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from('upvotes')
        .insert({ user_id: userId, product_id: productId })
      if (insertError) throw insertError

      // Increment count — only after successful insert
      await supabase.rpc('increment_upvote', { p_id: productId }).catch(() => {
        // Fallback: manual increment
        supabase
          .from('products')
          .select('upvote_count')
          .eq('id', productId)
          .single()
          .then(({ data }) => {
            if (data) {
              supabase.from('products')
                .update({ upvote_count: (data.upvote_count || 0) + 1 })
                .eq('id', productId)
            }
          })
      })
      return true
    }
  },

  async getUserUpvotes(userId) {
    const { data, error } = await supabase
      .from('upvotes')
      .select('product_id')
      .eq('user_id', userId)
    if (error) throw error
    return (data || []).map(v => v.product_id)
  },

  async hasUpvoted(userId, productId) {
    const { data, error } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()
    if (error) throw error
    return !!data
  },
}
