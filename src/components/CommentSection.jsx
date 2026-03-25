import React, { useState, useEffect } from 'react'
import { Send, ChevronDown } from 'lucide-react'
import { commentsService, FEEDBACK_TYPES, FEEDBACK_STATUSES } from '../services/comments'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from './LoadingSpinner'

// Individual feedback item
const FeedbackItem = ({ comment, isOwner, onStatusUpdate }) => {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const typeInfo  = FEEDBACK_TYPES.find(t => t.value === comment.type)   || FEEDBACK_TYPES[0]
  const statusInfo = FEEDBACK_STATUSES.find(s => s.value === comment.feedback_status) || FEEDBACK_STATUSES[0]

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      opacity: comment.feedback_status === 'done' ? 0.7 : 1,
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: 'var(--accent-soft)', border: '1px solid var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: 'var(--accent)',
      }}>
        {(comment.profiles?.username || 'U')[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {comment.profiles?.username || 'Anonymous'}
          </span>

          {/* Feedback type badge */}
          <span style={{
            padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            color: typeInfo.color, background: `${typeInfo.color}18`,
            border: `1px solid ${typeInfo.color}35`,
          }}>
            {typeInfo.emoji} {typeInfo.label}
          </span>

          {/* Feedback status — owner controls, viewer sees */}
          {isOwner ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setStatusMenuOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  color: statusInfo.color, background: `${statusInfo.color}18`,
                  border: `1px solid ${statusInfo.color}35`,
                  cursor: 'pointer',
                }}
              >
                {statusInfo.label} <ChevronDown size={10} />
              </button>
              {statusMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
                  background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 140,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {FEEDBACK_STATUSES.map(s => (
                    <button key={s.value} onClick={() => {
                      onStatusUpdate(comment.id, s.value)
                      setStatusMenuOpen(false)
                    }} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '9px 12px',
                      background: comment.feedback_status === s.value ? `${s.color}15` : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      color: comment.feedback_status === s.value ? s.color : 'var(--text-primary)',
                      fontSize: 12, fontWeight: comment.feedback_status === s.value ? 700 : 400,
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            comment.feedback_status !== 'new' && (
              <span style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: statusInfo.color, background: `${statusInfo.color}18`,
                border: `1px solid ${statusInfo.color}35`,
              }}>
                {statusInfo.label}
              </span>
            )
          )}

          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Content */}
        <p style={{
          fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6,
          textDecoration: comment.feedback_status === 'done' ? 'line-through' : 'none',
        }}>
          {comment.content}
        </p>
      </div>
    </div>
  )
}

export const CommentSection = ({ productId, productOwnerId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [selectedType, setSelectedType] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const isOwner = user?.id === productOwnerId

  useEffect(() => { loadComments() }, [productId])

  const loadComments = async () => {
    try {
      const data = await commentsService.getComments(productId)
      setComments(data || [])
    } catch (e) {
      toast.error('Could not load feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!user) { toast.error('Sign in to leave feedback'); return }
    setSubmitting(true)
    try {
      const c = await commentsService.addComment(productId, user.id, text.trim(), selectedType)
      // The service now returns the new comment. We need to reload to get profiles joined or manually construct it.
      // For simplicity and consistency with joined data, we reload.
      await loadComments()
      setText('')
      setSelectedType('general')
      toast.success('Feedback posted! +1 point')
    } catch (e) {
      toast.error('Failed to post feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (commentId, status) => {
    try {
      await commentsService.updateFeedbackStatus(commentId, status)
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, feedback_status: status } : c))

      // Award feedback points when a maker marks feedback as done
      if (status === 'done') toast.success('Feedback marked as done! ✅')
      else toast.success('Status updated')
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  // Feedback summary counts
  const typeCounts = FEEDBACK_TYPES.slice(1).reduce((acc, t) => {
    acc[t.value] = comments.filter(c => c.type === t.value).length
    return acc
  }, {})

  return (
    <div>
      {/* Header with summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Feedback ({comments.length})
        </h3>
        {comments.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {FEEDBACK_TYPES.slice(1).map(t => typeCounts[t.value] > 0 ? (
              <span key={t.value} style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: t.color, background: `${t.color}15`,
              }}>
                {t.emoji} {typeCounts[t.value]}
              </span>
            ) : null)}
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
          No feedback yet — be the first to share your thoughts!
        </p>
      ) : (
        <div>
          {comments.map(c => (
            <FeedbackItem
              key={c.id}
              comment={c}
              isOwner={isOwner}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Compose */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {/* Type selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {FEEDBACK_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                style={{
                  padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedType === t.value ? `${t.color}18` : 'transparent',
                  border: `1px solid ${selectedType === t.value ? t.color : 'var(--border)'}`,
                  color: selectedType === t.value ? t.color : 'var(--text-muted)',
                  transition: 'all 0.12s',
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Leave ${selectedType === 'general' ? 'a comment' : 'your ' + selectedType}...`}
              style={{
                flex: 1, padding: '10px 14px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: text.trim() ? 'var(--accent)' : 'var(--surface-elevated)',
                border: 'none', cursor: text.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
          <a href="/profile" style={{ color: 'var(--accent)' }}>Sign in</a> to leave feedback
        </p>
      )}
    </div>
  )
}
