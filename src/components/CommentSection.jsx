import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { commentsService } from '../services/comments'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from './LoadingSpinner'

const CommentItem = ({ comment }) => (
  <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'var(--accent-soft)', border: '1px solid var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: 'var(--accent)',
    }}>
      {(comment.profiles?.username || 'U')[0].toUpperCase()}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {comment.profiles?.username || 'Anonymous'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {comment.content}
      </p>
    </div>
  </div>
)

export const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { loadComments() }, [productId])

  const loadComments = async () => {
    try {
      const data = await commentsService.getComments(productId)
      setComments(data || [])
    } catch (e) {
      toast.error('Could not load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!user) { toast.error('Sign in to comment'); return }
    setSubmitting(true)
    try {
      const c = await commentsService.addComment(user.id, productId, text.trim())
      setComments(prev => [...prev, c])
      setText('')
    } catch (e) {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        Comments ({comments.length})
      </h3>

      {loading ? <LoadingSpinner /> : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div>{comments.map(c => <CommentItem key={c.id} comment={c} />)}</div>
      )}

      {user && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            style={{
              flex: 1, padding: '10px 14px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)', fontSize: 14,
            }}
          />
          <button type="submit" disabled={!text.trim() || submitting} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: text.trim() ? 'var(--accent)' : 'var(--surface-elevated)',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s', flexShrink: 0,
          }}>
            <Send size={16} color="#fff" />
          </button>
        </form>
      )}

      {!user && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
          <a href="/profile" style={{ color: 'var(--accent)' }}>Sign in</a> to join the conversation
        </p>
      )}
    </div>
  )
}
