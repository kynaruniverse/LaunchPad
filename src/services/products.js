import { supabase } from '../supabaseClient'

export const productsService = {
  async getFeed({ category = 'All', sort = 'newest', page = 0, limit = 10 } = {}) {
    let query = supabase
      .from('products')
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .range(page * limit, (page + 1) * limit - 1)
  
    if (category !== 'All') query = query.eq('category', category)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'trending') query = query.order('trending_score', { ascending: false })
    else if (sort === 'popular') query = query.order('upvote_count', { ascending: false })
  
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getUndiscovered({ category = 'All', page = 0, limit = 10 } = {}) {
    let query = supabase
      .from('products')
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .range(page * limit, (page + 1) * limit - 1)
      .lte('upvote_count', 5)
      .order('created_at', { ascending: false })

    if (category !== 'All') query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getProduct(id) {
    const { data: product, error } = await supabase.rpc('increment_product_view', { product_id: id })
    if (error) throw error
    return product
  },

  async submitProduct({ userId, title, tagline, description, category, tags, mediaUrls, websiteUrl }) {
    const { data, error } = await supabase
      .from('products')
      .insert({ user_id: userId, title, tagline, description, category, tags, media_urls: mediaUrls, website_url: websiteUrl, status: 'active' })
      .select().single()
    if (error) throw error
    return data
  },

  async getUserProducts(userId) {
    const { data, error } = await supabase
      .from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async updateProductStatus(productId, status) {
    const { data, error } = await supabase
      .from('products').update({ status }).eq('id', productId).select().single()
    if (error) throw error
    return data
  },
}