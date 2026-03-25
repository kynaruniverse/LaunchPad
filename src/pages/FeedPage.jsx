import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, Clock, BarChart2, RefreshCw, Users } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { productsService } from '../services/products'
import { votesService } from '../services/votes'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const LIMIT = 10

// Transparent ranking tooltip
const RankingExplainer = ({ sort }) => {
  const [open, setOpen] = useState(false)
  const labels = {
    trending: '(upvotes × 3 + comments × 2) ÷ (1 + age in days)',
    pure:     'Total upvotes only — no time decay',
    newest:   'Sorted by submission date',
  }
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="How ranking works"
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'help', fontSize: 14, lineHeight: 1 }}
      >
        ℹ️
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 28, zIndex: 20,
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', width: 240, fontSize: 12,
          color: 'var(--text-secondary)', lineHeight: 1.6, pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
            How "{sort}" works:
          </strong>
          {labels[sort]}
          <div style={{ marginTop: 6, borderTop: '1px solid var(--border)', paddingTop: 6, color: 'var(--text-muted)', fontSize: 11 }}>
            Switch to "Pure" for upvotes only with no algorithm.
          </div>
        </div>
      )}
    </div>
  )
}

export const FeedPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [userUpvotes, setUserUpvotes] = useState([])

  // Filter state
  const [discoveryMode, setDiscoveryMode] = useState('leaderboard')
  const [sort, setSort] = useState('trending')
  const [range, setRange] = useState('all')
  const [category, setCategory] = useState('All')
  const [indieOnly, setIndieOnly] = useState(false)

  const pageRef = useRef(0)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { loadFeed(true) }, [sort, range, category, indieOnly, discoveryMode])
  useEffect(() => { if (user) loadUserUpvotes(); else setUserUpvotes([]) }, [user])

  const loadUserUpvotes = async () => {
    try {
      const upvotes = await votesService.getUserUpvotes(user.id)
      setUserUpvotes(upvotes)
    } catch (e) {}
  }

  const loadFeed = useCallback(async (reset = false) => {
    if (reset) { pageRef.current = 0; setLoading(true) }
    else setLoadingMore(true)

    try {
      const currentPage = pageRef.current
      let data
      if (discoveryMode === 'undiscovered') {
        data = await productsService.getUndiscovered({ category, page: currentPage, limit: LIMIT })
      } else {
        data = await productsService.getFeed({
          category,
          sort,
          range,
          isIndieOnly: indieOnly,
          page: currentPage,
          limit: LIMIT,
        })
      }
      const results = data || []
      if (reset) setProducts(results)
      else setProducts(prev => [...prev, ...results])
      pageRef.current = currentPage + 1
      setHasMore(results.length === LIMIT)
    } catch (e) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [sort, range, category, indieOnly, discoveryMode, toast])

  const handleUpvote = async (productId) => {
    if (!user) { toast.info('Sign in to upvote'); return }
    try {
      const isUpvoted = await votesService.toggleUpvote(user.id, productId)
      setUserUpvotes(prev => isUpvoted ? [...prev, productId] : prev.filter(id => id !== productId))
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, upvote_count: Math.max(0, (p.upvote_count || 0) + (isUpvoted ? 1 : -1)) }
          : p
      ))
    } catch (e) { toast.error('Failed to upvote') }
  }

  const isNew = (createdAt) => Date.now() - new Date(createdAt).getTime() < 86400000

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Discover Projects 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Ideas, MVPs, betas and live products — from the indie community.
        </p>
      </div>

      {/* Discovery mode */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'leaderboard',  label: '📈 Leaderboard' },
          { key: 'undiscovered', label: '💎 Undiscovered' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setDiscoveryMode(key)} style={{
            padding: '6px 14px', borderRadius: 999,
            background: discoveryMode === key ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1px solid ${discoveryMode === key ? 'var(--accent)' : 'var(--border)'}`,
            color: discoveryMode === key ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{label}</button>
        ))}

        {/* Indie only toggle */}
        <button
          onClick={() => setIndieOnly(v => !v)}
          style={{
            padding: '6px 14px', borderRadius: 999,
            background: indieOnly ? 'rgba(6,182,212,0.12)' : 'var(--surface)',
            border: `1px solid ${indieOnly ? '#06B6D4' : 'var(--border)'}`,
            color: indieOnly ? '#06B6D4' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Users size={13} /> Solo / Indie only
        </button>
      </div>

      {/* Sort + time range (leaderboard only) */}
      {discoveryMode === 'leaderboard' && (
        <>
          {/* Sort */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'trending', icon: TrendingUp, label: 'Trending' },
              { key: 'pure',     icon: BarChart2,  label: 'Pure' },
              { key: 'newest',   icon: Clock,      label: 'Newest' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setSort(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 999,
                background: sort === key ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${sort === key ? 'var(--accent)' : 'var(--border)'}`,
                color: sort === key ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <Icon size={13} />{label}
              </button>
            ))}
            <RankingExplainer sort={sort} />
          </div>

          {/* Time range */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'week',  label: 'This Week' },
              { key: 'all',   label: 'Evergreen' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setRange(key)} style={{
                padding: '5px 12px', borderRadius: 999,
                background: range === key ? 'var(--surface-elevated)' : 'transparent',
                border: `1px solid ${range === key ? 'var(--border)' : 'transparent'}`,
                color: range === key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: range === key ? 700 : 500, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        </>
      )}

      {/* Category filter */}
      <div style={{ marginBottom: 24 }}>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Feed */}
      {loading ? (
        <LoadingSpinner message="Loading feed..." />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Nothing here yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {indieOnly ? 'No indie-only projects match your filters.' : 'Be the first to submit!'}
          </p>
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
                fontSize: 14, fontWeight: 600,
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                opacity: loadingMore ? 0.6 : 1,
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
