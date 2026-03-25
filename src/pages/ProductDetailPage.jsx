import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Eye, MessageCircle, Calendar, Share2, Bookmark, User } from 'lucide-react'
import { MediaCarousel } from '../components/MediaCarousel'
import { CommentSection } from '../components/CommentSection'
import { UpvoteButton } from '../components/UpvoteButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AddToCollectionModal } from '../components/AddToCollectionModal'
import { productsService } from '../services/products'
import { productUpdatesService } from '../services/productUpdates'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS, LAUNCH_STATUS_MAP, FEEDBACK_FOCUS_OPTIONS } from '../theme'

// ─────────────────────────────────────────
// Build Log (changelog entries)
// ─────────────────────────────────────────
const UPDATE_TYPES = [
  { value: 'update',       label: 'Update',       emoji: '📝' },
  { value: 'feature',      label: 'New Feature',  emoji: '✨' },
  { value: 'fix',          label: 'Bug Fix',      emoji: '🔧' },
  { value: 'announcement', label: 'Announcement', emoji: '📣' },
]

const BuildLog = ({ productId, isOwner, authorId }) => {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('update')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => { loadUpdates() }, [productId])

  const loadUpdates = async () => {
    try {
      const data = await productUpdatesService.getProductUpdates(productId)
      setUpdates(data || [])
    } catch (e) {
      // Table may not exist yet — silently skip
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const update = await productUpdatesService.addProductUpdate(productId, authorId, title.trim(), body.trim(), type)
      setUpdates(prev => [update, ...prev])
      setTitle(''); setBody(''); setShowForm(false)
      toast.success('Update posted!')
    } catch (err) {
      toast.error('Failed to post update')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (updates.length === 0 && !isOwner) return null

  return (
    <div style={{
      padding: 20, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid var(--border)',
      marginBottom: 32,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Build Log
          {updates.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 14 }}> ({updates.length})</span>}
        </h2>
        {isOwner && (
          <button onClick={() => setShowForm(v => !v)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: showForm ? 'var(--surface-elevated)' : 'var(--accent-soft)',
            border: `1px solid ${showForm ? 'var(--border)' : 'var(--accent)'}`,
            color: showForm ? 'var(--text-secondary)' : 'var(--accent)',
            cursor: 'pointer',
          }}>
            {showForm ? 'Cancel' : '+ Post update'}
          </button>
        )}
      </div>

      {showForm && isOwner && (
        <form onSubmit={handleAdd} style={{
          marginBottom: 20, padding: 16,
          background: 'var(--surface-elevated)', borderRadius: 'var(--radius-md)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {UPDATE_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)} style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: type === t.value ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                color: type === t.value ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}>{t.emoji} {t.label}</button>
            ))}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Update title" style={{
            padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
          }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What changed? (optional)" style={{
            padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, minHeight: 70, resize: 'vertical',
          }} />
          <button type="submit" disabled={!title.trim() || submitting} style={{
            padding: '10px', borderRadius: 8, background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 13, border: 'none',
            cursor: title.trim() ? 'pointer' : 'not-allowed', opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? 'Posting...' : 'Post Update'}
          </button>
        </form>
      )}

      {updates.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
          No build updates yet. Share what you're working on!
        </p>
      ) : (
        <div>
          {updates.map((u, i) => {
            const typeInfo = UPDATE_TYPES.find(t => t.value === u.type) || UPDATE_TYPES[0]
            return (
              <div key={u.id} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: i < updates.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{typeInfo.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{u.title}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {u.body && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{u.body}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────
export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { loadProduct() }, [id])
  useEffect(() => { if (user && id) checkUpvoted() }, [user, id])

  const loadProduct = async () => {
    try {
      const data = await productsService.getProduct(id)
      setProduct(data)
    } catch (e) {
      toast.error('Product not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const checkUpvoted = async () => {
    try {
      const has = await votesService.hasUpvoted(user.id, id)
      setUpvoted(has)
    } catch (e) {}
  }

  const handleUpvote = async () => {
    if (!user) { toast.info('Sign in to upvote'); return }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, product.id)
      setUpvoted(isUpvoted)
      setProduct(prev => ({
        ...prev,
        upvote_count: Math.max(0, (prev.upvote_count || 0) + (isUpvoted ? 1 : -1)),
      }))
    } catch (e) { toast.error('Failed to upvote') }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: product.title, text: product.tagline, url }) } catch (e) {}
    } else {
      try { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
      catch (e) { toast.error('Could not copy link') }
    }
  }

  const handleBookmark = () => {
    if (!user) { toast.info('Sign in to save to collections'); return }
    setShowCollectionModal(true)
  }

  if (loading) return <LoadingSpinner fullScreen message="Loading..." />
  if (!product) return null

  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other
  const launchStatus = LAUNCH_STATUS_MAP[product.launch_status]
  const isOwner = user?.id === product.user_id
  const feedbackFocusLabels = (product.feedback_focus || [])
    .map(v => FEEDBACK_FOCUS_OPTIONS.find(o => o.value === v)?.label || v)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '70px 16px 120px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
        background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0,
      }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Media */}
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24 }}>
        <MediaCarousel mediaUrls={product.media_urls} />
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', borderRadius: 999, background: `${catColor}20`, color: catColor, fontSize: 12, fontWeight: 700 }}>
            {product.category}
          </span>
          {launchStatus && (
            <span style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              color: launchStatus.color, background: `${launchStatus.color}18`,
              border: `1px solid ${launchStatus.color}35`,
            }}>
              {launchStatus.emoji} {launchStatus.label}
            </span>
          )}
          {product.is_indie && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              color: '#06B6D4', background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
              <User size={11} /> {product.team_size ? `Team of ${product.team_size}` : 'Solo maker'}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          {product.title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.tagline}</p>
      </div>

      {/* Feedback focus callout */}
      {feedbackFocusLabels.length > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 20,
          background: 'var(--accent-soft)', border: '1px solid rgba(255,87,34,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
              Maker is looking for feedback on:
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {feedbackFocusLabels.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        {[
          { icon: Eye,           label: `${product.view_count || 0} views` },
          { icon: MessageCircle, label: `${product.comment_count || 0} feedback` },
          { icon: Calendar,      label: new Date(product.created_at).toLocaleDateString() },
        ].map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <Icon size={14} />{label}
          </div>
        ))}
      </div>

      {/* About */}
      {product.description && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>About</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>{product.description}</p>
        </div>
      )}

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {product.tags.map((tag, i) => (
            <span key={i} style={{
              padding: '5px 12px', borderRadius: 999,
              background: 'var(--surface-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13,
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Maker card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 16,
        borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'var(--accent)',
        }}>
          {(product.profiles?.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
            {product.profiles?.username || 'Anonymous'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {product.is_indie ? 'Indie Maker' : 'Maker'}
          </p>
        </div>
      </div>

      {/* Build Log */}
      <BuildLog productId={product.id} isOwner={isOwner} authorId={user?.id} />

      {/* Feedback */}
      <div style={{
        padding: 20, borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        <CommentSection productId={product.id} productOwnerId={product.user_id} />
      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 28px',
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 12, alignItems: 'center', zIndex: 50,
      }}>
        <UpvoteButton count={product.upvote_count || 0} upvoted={upvoted} onPress={handleUpvote} />
        <button onClick={handleBookmark} aria-label="Save to collection" style={{
          padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          transition: 'color 0.15s, border-color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <Bookmark size={18} />
        </button>
        <button onClick={handleShare} aria-label="Share" style={{
          padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          <Share2 size={18} />
        </button>
        {product.website_url && (
          <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}>
            Visit Site <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Collection modal */}
      {showCollectionModal && (
        <AddToCollectionModal
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </div>
  )
}
