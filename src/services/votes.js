import { supabase } from './supabase';

export const votesService = {
  async toggleUpvote(userId, productId) {
    // Check if already upvoted
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Remove upvote
      await supabase.from('upvotes').delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      await supabase.from('products')
        .update({ upvote_count: supabase.rpc('decrement', { x: 1 }) })
        .eq('id', productId);

      // Manual decrement
      const { data: product } = await supabase
        .from('products').select('upvote_count').eq('id', productId).single();
      await supabase.from('products')
        .update({ upvote_count: Math.max(0, (product?.upvote_count || 1) - 1) })
        .eq('id', productId);

      return false; // not upvoted
    } else {
      // Add upvote
      await supabase.from('upvotes').insert({ user_id: userId, product_id: productId });

      const { data: product } = await supabase
        .from('products').select('upvote_count').eq('id', productId).single();
      await supabase.from('products')
        .update({ upvote_count: (product?.upvote_count || 0) + 1 })
        .eq('id', productId);

      return true; // upvoted
    }
  },

  async getUserUpvotes(userId) {
    const { data, error } = await supabase
      .from('upvotes')
      .select('product_id')
      .eq('user_id', userId);
    if (error) return [];
    return data.map(v => v.product_id);
  },

  async hasUpvoted(userId, productId) {
    const { data } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    return !!data;
  },
};
