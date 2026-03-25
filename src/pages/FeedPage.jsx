import React, { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Clock, RefreshCw, Rocket } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { productsService } from '../services/products'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const FeedPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [discoveryMode, setDiscoveryMode] = useState('leaderboard') // 'leaderboard' or 'undiscovered'
  const [loadingMore, setLoadingMore] = useState(false)
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [userUpvotes, setUserUpvotes] = useState([])
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    loadFeed(true)
  }, [category, sort, discoveryMode])  // Added discoveryMode dependency

  useEffect(() => {
    if (user) loadUserUpvotes()
  }, [user])

  const loadUserUpvotes = async () => {
    try {
      const upvotes = await votesService.getUserUpvotes(user.id)
      setUserUpvotes(upvotes)
    } catch (e) {}
  }

  const loadFeed = async (reset = false) => {
    const currentPage = reset ? 0 : page
    reset ? setLoading(true) : setLoadingMore(true)
    try {
      let data
      if (discoveryMode === 'undiscovered') {
        data = await productsService.getUndiscovered({ category, page: currentPage })
      } else {
        data = await productsService.getFeed({ category, sort, page: currentPage })
      }
      if (reset) {
        setProducts(data || [])
        setPage(1)
      } else {
        setProducts(prev => [...prev, ...(data || [])])
        setPage(p => p + 1)
      }
      setHasMore((data || []).length === 10)
    } catch (e) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleUpvote = async (productId) => {
    if (!user) { toast.info('Sign in to upvote'); return }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, productId)
      setUserUpvotes(prev => isUpvoted ? [...prev, productId] : prev.filter(id => id !== productId))
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, upvote_count: p.upvote_count + (isUpvoted ? 1 : -1) } : p
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
        <button
          onClick={() => setDiscoveryMode('leaderboard')}
          style={{
            padding: '6px 12px', borderRadius: 999,
            background: discoveryMode === 'leaderboard' ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1px solid ${discoveryMode === 'leaderboard' ? 'var(--accent)' : 'var(--border)'}`,
            color: discoveryMode === 'leaderboard' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          📈 Leaderboard
        </button>
        <button
          onClick={() => setDiscoveryMode('undiscovered')}
          style={{
            padding: '6px 12px', borderRadius: 999,
            background: discoveryMode === 'undiscovered' ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1px solid ${discoveryMode === 'undiscovered' ? 'var(--accent)' : 'var(--border)'}`,
            color: discoveryMode === 'undiscovered' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          💎 Undiscovered
        </button>
      </div>

      {/* Sort (only show in leaderboard mode) */}
      {discoveryMode === 'leaderboard' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
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
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              onMouseEnter={e => { e.currentTarget.nextSibling.style.display = 'block'; }}
              onMouseLeave={e => { e.currentTarget.nextSibling.style.display = 'none'; }}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'help'
              }}
            >
              ℹ️
            </button>
            <div style={{
              display: 'none', position: 'absolute', right: 0, top: 30,
              background: 'var(--surface-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 12, width: 220, fontSize: 12, zIndex: 10,
              color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              <strong>How ranking works:</strong><br/>
              • Newest: by launch date<br/>
              • Popular: total upvotes<br/>
              • Trending: upvotes & comments with recency boost
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={{ marginBottom: 24 }}>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Feed */}
      {loading ? <LoadingSpinner message="Loading feed..." /> : products.length === 0 ? (
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
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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