import { supabase } from '../supabaseClient'

// Fields selected on every product query — includes new Phase 1 columns
const PRODUCT_SELECT = `
  *,
  profiles:user_id (id, username, full_name, avatar_url)
`

export const productsService = {
  /**
   * Get the main feed.
   * sort:         'trending' | 'pure' | 'newest'
   * range:        'today' | 'week' | 'all'
   * isIndieOnly:  boolean
   * launchStatus: 'idea' | 'mvp' | 'beta' | 'live' | 'sunset' | null
   */
  async getFeed({
    category = 'All',
    sort = 'newest',
    range = 'all',
    isIndieOnly = false,
    launchStatus = null,
    page = 0,
    limit = 10,
  } = {}) {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .range(page * limit, (page + 1) * limit - 1)

    if (category !== 'All') query = query.eq('category', category)
    if (isIndieOnly)         query = query.eq('is_indie', true)
    if (launchStatus)        query = query.eq('launch_status', launchStatus)

    // Time range filter on launch_date
    if (range === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('launch_date', today)
    } else if (range === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      query = query.gte('launch_date', weekAgo)
    }

    // Sort
    if (sort === 'trending') {
      query = query.order('trending_score', { ascending: false, nullsFirst: false })
    } else if (sort === 'pure') {
      query = query.order('upvote_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Undiscovered: low upvote count products.
   */
  async getUndiscovered({ category = 'All', page = 0, limit = 10 } = {}) {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .range(page * limit, (page + 1) * limit - 1)
      .lte('upvote_count', 5)
      .order('created_at', { ascending: false })

    if (category !== 'All') query = query.eq('category', category)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Get a single product — increments view count via RPC.
   */
  async getProduct(id) {
    const { data, error } = await supabase.rpc('increment_product_view', { product_id: id })
    if (error) throw error
    // RPC returns SETOF → array; take first row
    return Array.isArray(data) ? data[0] : data
  },

  /**
   * Submit a new product with all Phase 1 fields.
   */
  async submitProduct({
    userId,
    title,
    tagline,
    description,
    category,
    tags,
    mediaUrls,
    websiteUrl,
    launchStatus = 'live',
    isIndie = true,
    teamSize = null,
    feedbackFocus = [],
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id:        userId,
        title,
        tagline,
        description,
        category,
        tags,
        media_urls:     mediaUrls,
        website_url:    websiteUrl,
        launch_status:  launchStatus,
        is_indie:       isIndie,
        team_size:      teamSize || null,
        feedback_focus: feedbackFocus,
        status:         'active',
        launch_date:    new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * All products for a specific user (dashboard).
   */
  async getUserProducts(userId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Update the legacy display status (active / updated / retired).
   */
  async updateProductStatus(productId, status) {
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Update the launch lifecycle status (idea / mvp / beta / live / sunset).
   */
  async updateLaunchStatus(productId, launchStatus) {
    const { data, error } = await supabase
      .from('products')
      .update({ launch_status: launchStatus })
      .eq('id', productId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Generic product field update.
   */
  async updateProduct(productId, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
