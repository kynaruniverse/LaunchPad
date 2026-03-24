import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Eye, MessageCircle, Calendar, Share2, Bookmark } from 'lucide-react'
import { MediaCarousel } from '../components/MediaCarousel'
import { CommentSection } from '../components/CommentSection'
import { UpvoteButton } from '../components/UpvoteButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { productsService } from '../services/products'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS } from '../theme'

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    if (user && product) checkUpvoted()
  }, [user, product])

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
      const has = await votesService.hasUpvoted(user.id, product.id)
      setUpvoted(has)
    } catch (e) {}
  }

  const handleUpvote = async () => {
    if (!user) { toast.info('Sign in to upvote'); return }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, product.id)
      setUpvoted(isUpvoted)
      setProduct(prev => ({ ...prev, upvote_count: prev.upvote_count + (isUpvoted ? 1 : -1) }))
    } catch (e) {
      toast.error('Failed to upvote')
    }
  }

  if (loading) return <LoadingSpinner fullScreen message="Loading product..." />
  if (!product) return null

  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '70px 16px 100px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
        background: 'none', border: 'none', cursor: 'pointer',
        marginBottom: 20, padding: 0,
      }}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Media */}
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24 }}>
        <MediaCarousel mediaUrls={product.media_urls} />
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 999,
            background: `${catColor}20`, color: catColor,
            fontSize: 12, fontWeight: 700,
          }}>
            {product.category}
          </span>
          {product.status === 'updated' && (
            <span style={{
              padding: '4px 12px', borderRadius: 999,
              background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
              fontSize: 12, fontWeight: 700,
            }}>
              UPDATED
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          {product.title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {product.tagline}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        {[
          { icon: Eye, label: `${product.view_count || 0} views` },
          { icon: MessageCircle, label: `${product.comment_count || 0} comments` },
          { icon: Calendar, label: new Date(product.created_at).toLocaleDateString() },
        ].map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <Icon size={14} />
            {label}
          </div>
        ))}
      </div>

      {/* About */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>About</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>{product.description}</p>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {product.tags.map((tag, i) => (
            <span key={i} style={{
              padding: '5px 12px', borderRadius: 999,
              background: 'var(--surface-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13,
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Maker */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: 'var(--radius-md)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
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
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Maker</p>
        </div>
      </div>

      {/* Comments */}
      <div style={{
        padding: 20, borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 32,
      }}>
        <CommentSection productId={product.id} />
      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 28px',
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 12, alignItems: 'center',
        zIndex: 50,
      }}>
        <UpvoteButton count={product.upvote_count || 0} upvoted={upvoted} onPress={handleUpvote} />
        <button style={{
          padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          <Bookmark size={18} />
        </button>
        <button style={{
          padding: '10px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer',
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
    </div>
  )
}
