import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Bookmark, TrendingUp, User, Users, Info } from 'lucide-react'
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
  const [hovered, setHovered] = useState(false)

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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.5)' : 'none',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          borderColor: hovered ? 'var(--accent)' : 'var(--border)'
        }}
      >
        {/* Thumbnail Area */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface-elevated)', overflow: 'hidden' }}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              style={{ 
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.5s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)'
              }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: `${catColor}10`,
            }}>
              <span style={{ fontSize: 48, filter: 'grayscale(0.5)' }}>{launchStatus?.emoji || '🚀'}</span>
            </div>
          )}

          {/* Overlay Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {isNew && (
              <div style={{
                padding: '4px 10px', borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
                boxShadow: '0 4px 12px var(--accent-glow)'
              }}>
                NEW
              </div>
            )}
            <div style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <TrendingUp size={10} color="var(--accent)" />
              {Number(product.trending_score || 0).toFixed(1)}
            </div>
          </div>

          {/* Category badge */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            padding: '5px 12px', borderRadius: 999,
            background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(8px)',
            border: `1px solid ${catColor}50`,
            color: catColor, fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {product.category}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <h3 style={{
                fontSize: 18, fontWeight: 800, color: 'var(--text-primary)',
                letterSpacing: '-0.01em', lineHeight: 1.2
              }}>
                {product.title}
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {launchStatus && (
                  <div title={launchStatus.desc} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                    color: launchStatus.color, background: `${launchStatus.color}15`,
                    border: `1px solid ${launchStatus.color}30`, textTransform: 'uppercase'
                  }}>
                    {launchStatus.label}
                  </div>
                )}
              </div>
            </div>
            <p style={{
              fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              minHeight: '3em'
            }}>
              {product.tagline}
            </p>
          </div>

          {/* Metadata Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {product.is_indie && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: '#06B6D4', background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.2)',
              }}>
                {product.team_size > 1 ? <Users size={12} /> : <User size={12} />}
                {product.team_size > 1 ? `Team of ${product.team_size}` : 'Solo Indie'}
              </span>
            )}
            {feedbackFocus && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)', background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
              }}>
                <MessageCircle size={12} />
                Focus: {feedbackFocus}
              </span>
            )}
          </div>

          {/* Bottom Actions Row */}
          <div
            style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              paddingTop: 16, borderTop: '1px solid var(--border)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            <UpvoteButton count={product.upvote_count || 0} upvoted={upvoted} onPress={onUpvote} size="sm" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <MessageCircle size={15} />
              {product.comment_count || 0}
            </div>

            <button
              onClick={handleBookmark}
              aria-label="Save to collection"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <Bookmark size={15} />
            </button>

            <div style={{ flex: 1 }} />

            {/* Maker Info */}
            <div 
              onClick={() => navigate(`/profile/${product.profiles?.username}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '8px',
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'var(--accent)',
              }}>
                {(product.profiles?.username || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.profiles?.username || 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection modal */}
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
