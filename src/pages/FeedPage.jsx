import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, Clock, RefreshCw, Rocket } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { productsService } from '../services/products'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const LIMIT = 10

export const FeedPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [discoveryMode, setDiscoveryMode] = useState('leaderboard')
  const [loadingMore, setLoadingMore] = useState(false)
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [hasMore, setHasMore] = useState(true)
  const [userUpvotes, setUserUpvotes] = useState([])
  const pageRef = useRef(0)
  const { user } = useAuth()
  const toast = useToast()

  // Reset and reload whenever filters change
  useEffect(() => {
    loadFeed(true)
  }, [category, sort, discoveryMode])

  useEffect(() => {
    if (user) loadUserUpvotes()
    else setUserUpvotes([])
  }, [user])

  const loadUserUpvotes = async () => {
    try {
      const upvotes = await votesService.getUserUpvotes(user.id)
      setUserUpvotes(upvotes)
    } catch (e) {
      // Non-critical — swallow silently
    }
  }

  const loadFeed = useCallback(async (reset = false) => {
    if (reset) {
      pageRef.current = 0
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const currentPage = pageRef.current
      let data
      if (discoveryMode === 'undiscovered') {
        data = await productsService.getUndiscovered({ category, page: currentPage, limit: LIMIT })
      } else {
        data = await productsService.getFeed({ category, sort, page: currentPage, limit: LIMIT })
      }

      const results = data || []

      if (reset) {
        setProducts(results)
      } else {
        setProducts(prev => [...prev, ...results])
      }

      pageRef.current = currentPage + 1
      setHasMore(results.length === LIMIT)
    } catch (e) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, sort, discoveryMode, toast])

  const handleUpvote = async (productId) => {
    if (!user) { toast.info('Sign in to upvote'); return }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, productId)
      setUserUpvotes(prev =>
        isUpvoted ? [...prev, productId] : prev.filter(id => id !== productId)
      )
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, upvote_count: Math.max(0, (p.upvote_count || 0) + (isUpvoted ? 1 : -1)) }
          : p
      ))
    } catch (e) {
      toast.error('Failed to upvote')
    }
  }

  const isNew = (createdAt) => Date.now() - new Date(createdAt).getTime() < 86400000

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Discover Products 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          The best new tools, apps and products — every day.
        </p>
      </div>

      {/* Discovery Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'leaderboard', label: '📈 Leaderboard' },
          { key: 'undiscovered', label: '💎 Undiscovered' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDiscoveryMode(key)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              background: discoveryMode === key ? 'var(--accent-soft)' : 'var(--surface)',
              border: `1px solid ${discoveryMode === key ? 'var(--accent)' : 'var(--border)'}`,
              color: discoveryMode === key ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort (leaderboard only) */}
      {discoveryMode === 'leaderboard' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { key: 'newest', icon: Clock, label: 'Newest' },
            { key: 'popular', icon: TrendingUp, label: 'Most Upvoted' },
            { key: 'trending', icon: Rocket, label: 'Trending' },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setSort(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 999,
              background: sort === key ? 'var(--accent-soft)' : 'var(--surface)',
              border: `1px solid ${sort === key ? 'var(--accent)' : 'var(--border)'}`,
              color: sort === key ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <Icon size={13} />
              {label}
            </button>
          ))}

          {/* Ranking info tooltip */}
          <RankingInfo />
        </div>
      )}

      {/* Categories */}
      <div style={{ marginBottom: 24 }}>
        <CategoryFilter selected={category} onSelect={(cat) => setCategory(cat)} />
      </div>

      {/* Feed */}
      {loading ? (
        <LoadingSpinner message="Loading feed..." />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No products yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Be the first to submit!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onUpvote={() => handleUpvote(p.id)}
              upvoted={userUpvotes.includes(p.id)}
              isNew={isNew(p.created_at)}
            />
          ))}

          {hasMore && (
            <button
              onClick={() => loadFeed(false)}
              disabled={loadingMore}
              style={{
                width: '100%', padding: '14px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 600, cursor: loadingMore ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loadingMore ? 0.6 : 1,
              }}
            >
              {loadingMore ? <LoadingSpinner /> : <><RefreshCw size={15} /> Load more</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Extracted tooltip component using React state instead of broken CSS hack
const RankingInfo = () => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginLeft: 'auto', position: 'relative' }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="How ranking works"
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'help', fontSize: 16 }}
      >
        ℹ️
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 30,
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 12, width: 220, fontSize: 12, zIndex: 10,
          color: 'var(--text-secondary)', lineHeight: 1.5,
          pointerEvents: 'none',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>How ranking works:</strong><br />
          • Newest: by launch date<br />
          • Popular: total upvotes<br />
          • Trending: upvotes & comments with recency boost
        </div>
      )}
    </div>
  )
}
