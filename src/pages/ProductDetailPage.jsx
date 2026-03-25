import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Eye, MessageCircle, Calendar, Share2, Bookmark, User, Info, TrendingUp } from 'lucide-react'
import { MediaCarousel } from '../components/MediaCarousel'
import { CommentSection } from '../components/CommentSection'
import { UpvoteButton } from '../components/UpvoteButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AddToCollectionModal } from '../components/AddToCollectionModal'
import { ProductUpdates } from '../components/ProductUpdates'
import { UpdateComposer } from '../components/UpdateComposer'
import { productsService } from '../services/products'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS, LAUNCH_STATUS_MAP, FEEDBACK_FOCUS_OPTIONS } from '../theme'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [showUpdateComposer, setShowUpdateComposer] = useState(false)
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

      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
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

        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          {product.title}
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.tagline}</p>
      </div>

      {/* Feedback Focus Callout (Maker Request) */}
      {feedbackFocusLabels.length > 0 && (
        <div style={{
          padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: 32,
          background: 'var(--accent-soft)', border: '1px solid rgba(255,87,34,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
          }}>
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
              Maker is looking for feedback on:
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>
              {feedbackFocusLabels.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats & Metadata */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16,
        padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        {[
          { icon: Eye,           label: 'Views',    value: product.view_count || 0 },
          { icon: MessageCircle, label: 'Feedback', value: product.comment_count || 0 },
          { icon: Calendar,      label: 'Launched', value: new Date(product.created_at).toLocaleDateString() },
          { icon: TrendingUp,    label: 'Trending', value: product.trending_score ? Number(product.trending_score).toFixed(1) : '0.0' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={12} /> {label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* About Section */}
        {product.description && (
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>About</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {product.description}
            </p>
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                {product.tags.map((tag, i) => (
                  <span key={i} style={{
                    padding: '5px 12px', borderRadius: 999,
                    background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', fontSize: 13,
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Maker Info */}
        <section style={{ 
          padding: 24, borderRadius: 'var(--radius-lg)', 
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-soft)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'var(--accent)',
          }}>
            {(product.profiles?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 18 }}>
              {product.profiles?.username || 'Anonymous'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {product.is_indie ? 'Indie Maker' : 'Maker'} • {product.profiles?.full_name}
            </p>
          </div>
          {product.website_url && (
            <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              Website <ExternalLink size={14} />
            </a>
          )}
        </section>

        {/* Feedback Section (Primary for Phase 2) */}
        <section id="feedback" style={{ 
          padding: 24, borderRadius: 'var(--radius-lg)', 
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <CommentSection productId={product.id} productOwnerId={product.user_id} />
        </section>

        {/* Changelog / Build Updates Section */}
        <section>
          {isOwner && (
            <div style={{ marginBottom: 24 }}>
              {showUpdateComposer ? (
                <UpdateComposer 
                  products={[product]} 
                  onUpdatePosted={() => {
                    setShowUpdateComposer(false)
                    // Optionally trigger a refresh of updates
                  }} 
                />
              ) : (
                <button onClick={() => setShowUpdateComposer(true)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface)', border: '1px solid var(--accent)',
                  color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)' }}
                >
                  📝 Post an Update
                </button>
              )}
            </div>
          )}
          <ProductUpdates productId={product.id} isOwner={isOwner} />
        </section>
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
