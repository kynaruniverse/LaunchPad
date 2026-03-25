import { supabase } from '../supabaseClient'

export const FEEDBACK_TYPES = [
  { value: 'general',    label: 'General',    emoji: '💬', color: '#9090A8' },
  { value: 'issue',      label: 'Issue',      emoji: '🐛', color: '#EF4444' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡', color: '#F59E0B' },
  { value: 'praise',     label: 'Praise',     emoji: '🙌', color: '#22C55E' },
  { value: 'question',   label: 'Question',   emoji: '❓', color: '#3B82F6' },
]

export const FEEDBACK_STATUSES = [
  { value: 'new',         label: 'New',         color: '#9090A8' },
  { value: 'planned',     label: 'Planned',     color: '#3B82F6' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'done',        label: 'Done',        color: '#22C55E' },
]

export const commentsService = {
  /**
   * Get all top-level comments/feedback for a product, oldest-first.
   */
  async getComments(productId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .eq('product_id', productId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  },

  /**
   * Add a comment/feedback item.
   * Increments comment_count on the product and awards 1 feedback point to the commenter.
   * type: 'general' | 'issue' | 'suggestion' | 'praise' | 'question'
   */
  async addComment(userId, productId, content, type = 'general', parentId = null) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id:    userId,
        product_id: productId,
        content,
        type,
        parent_id:  parentId,
      })
      .select('*, profiles:user_id (id, username, full_name, avatar_url)')
      .single()
    if (error) throw error

    // Increment product comment_count — only after confirmed insert
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

    // Award 1 feedback point to the commenter (non-blocking)
    supabase.rpc('increment_feedback_points', { u_id: userId, points: 1 }).catch(() => {
      // Silently fail — points are cosmetic, not critical
    })

    return data
  },

  /**
   * Update feedback_status on a comment (product owner only — enforce in UI).
   * If marking as 'done', awards a 3-point bonus to the original commenter.
   */
  async updateFeedbackStatus(commentId, status) {
    // First fetch the comment so we know the original author
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id, feedback_status')
      .eq('id', commentId)
      .single()
    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('comments')
      .update({ feedback_status: status })
      .eq('id', commentId)
      .select()
      .single()
    if (error) throw error

    // Award bonus points when transitioning TO done (not already done)
    if (status === 'done' && comment.feedback_status !== 'done') {
      supabase.rpc('award_done_bonus', { c_id: commentId }).catch(() => {})
    }

    return data
  },
}
