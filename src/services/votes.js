import { supabase } from '../supabaseClient'

export const votesService = {
  async toggleUpvote(userId, productId) {
    const { data: existing } = await supabase
      .from('upvotes').select('id').eq('user_id', userId).eq('product_id', productId).single()

    const { data: product } = await supabase
      .from('products').select('upvote_count').eq('id', productId).single()

    if (existing) {
      await supabase.from('upvotes').delete().eq('user_id', userId).eq('product_id', productId)
      await supabase.from('products').update({ upvote_count: Math.max(0, (product?.upvote_count || 1) - 1) }).eq('id', productId)
      return false
    } else {
      await supabase.from('upvotes').insert({ user_id: userId, product_id: productId })
      await supabase.from('products').update({ upvote_count: (product?.upvote_count || 0) + 1 }).eq('id', productId)
      return true
    }
  },

  async getUserUpvotes(userId) {
    const { data } = await supabase.from('upvotes').select('product_id').eq('user_id', userId)
    return (data || []).map(v => v.product_id)
  },

  async hasUpvoted(userId, productId) {
    const { data } = await supabase.from('upvotes').select('id').eq('user_id', userId).eq('product_id', productId).single()
    return !!data
  },
}
