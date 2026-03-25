import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Bookmark } from 'lucide-react'
import { UpvoteButton } from './UpvoteButton'
import { AddToCollectionModal } from './AddToCollectionModal'
import { CATEGORY_COLORS, LAUNCH_STATUS_MAP } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const ProductCard = ({ product, onUpvote, upvoted, isNew = false }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other
  const thumbnail = product.media_urls?.[0]
  const launchStatus = LAUNCH_STATUS_MAP[product.launch_status]
  const feedbackFocus = product.feedback_focus?.[0]

  const handleBookmark = (e) => {
    e.stopPropagation()
    if (!user) { toast.info('Sign in to save to collections'); return }
    setShowCollectionModal(true)
  }

  return (
    <>
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s, transform 0.2s',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface-elevated)' }}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: `${catColor}15`,
            }}>
              <span style={{ fontSize: 40 }}>{launchStatus?.emoji || '🚀'}</span>
            </div>
          )}

          {/* Category badge */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            padding: '4px 10px', borderRadius: 999,
            background: `${catColor}25`, border: `1px solid ${catColor}50`,
            color: catColor, fontSize: 11, fontWeight: 700,
          }}>
            {product.category}
          </div>

          {/* NEW badge */}
          {isNew && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              padding: '3px 8px', borderRadius: 999,
              background: 'var(--accent)', color: '#fff',
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
            }}>
              NEW
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <h3 style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {product.title}
            </h3>
            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.tagline}
            </p>
          </div>

          {/* Status + indie + feedback focus pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {launchStatus && (
              <span style={{
                padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: launchStatus.color, background: `${launchStatus.color}18`,
                border: `1px solid ${launchStatus.color}40`,
              }}>
                {launchStatus.emoji} {launchStatus.label}
              </span>
            )}
            {product.is_indie && (
              <span style={{
                padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: '#06B6D4', background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.3)',
              }}>
                Solo
              </span>
            )}
            {feedbackFocus && (
              <span style={{
                padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)', background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
              }}>
                Feedback: {feedbackFocus}
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {product.tags.slice(0, 3).map((tag, i) => (
                <span key={i} style={{
                  padding: '3px 8px', borderRadius: 999,
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-muted)', fontSize: 11,
                }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={e => e.stopPropagation()}
          >
            <UpvoteButton count={product.upvote_count || 0} upvoted={upvoted} onPress={onUpvote} size="sm" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', color: 'var(--text-secondary)', fontSize: 12 }}>
              <MessageCircle size={13} />
              {product.comment_count || 0}
            </div>

            <button
              onClick={handleBookmark}
              aria-label="Save to collection"
              style={{
                padding: '5px 8px', borderRadius: 999,
                background: 'transparent', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <Bookmark size={13} />
            </button>

            <div style={{ flex: 1 }} />

            {/* Maker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--accent)',
              }}>
                {(product.profiles?.username || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.profiles?.username || 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection modal — rendered outside card so it's not clipped */}
      {showCollectionModal && (
        <div onClick={e => e.stopPropagation()}>
          <AddToCollectionModal
            productId={product.id}
            productTitle={product.title}
            onClose={() => setShowCollectionModal(false)}
          />
        </div>
      )}
    </>
  )
}
