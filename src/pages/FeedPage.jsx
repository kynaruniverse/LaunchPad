import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, Clock, BarChart2, RefreshCw, Users, Info, Sparkles, Trophy } from 'lucide-react'
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
    pure:     'Total upvotes only — no time decay algorithm',
    newest:   'Sorted by submission date (newest first)',
  }
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="How ranking works"
        style={{ 
          background: 'var(--surface-elevated)', border: '1px solid var(--border)', 
          color: 'var(--text-muted)', cursor: 'help', fontSize: 12, 
          width: 24, height: 24, borderRadius: '50%', display: 'flex', 
          alignItems: 'center', justifyContent: 'center' 
        }}
      >
        <Info size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 32, zIndex: 100,
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', width: 260, fontSize: 12,
          color: 'var(--text-secondary)', lineHeight: 1.6, pointerEvents: 'none',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
            Ranking Algorithm: {sort.toUpperCase()}
          </strong>
          <p>{labels[sort]}</p>
          <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10, color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>
            We believe in transparency. Switch to "Pure" for a raw leaderboard.
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
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Discover Projects 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
          Explore ideas, MVPs, and live products from the indie community. Feedback-driven and transparent.
        </p>
      </div>

      {/* Discovery Mode & Filters Bar */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32,
        padding: 20, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'leaderboard',  label: 'Leaderboard', icon: Trophy },
              { key: 'undiscovered', label: 'Undiscovered', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setDiscoveryMode(key)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                background: discoveryMode === key ? 'var(--accent)' : 'var(--surface-elevated)',
                border: `1px solid ${discoveryMode === key ? 'var(--accent)' : 'var(--border)'}`,
                color: discoveryMode === key ? '#fff' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIndieOnly(v => !v)}
            style={{
              padding: '8px 16px', borderRadius: 999,
              background: indieOnly ? 'rgba(6,182,212,0.12)' : 'transparent',
              border: `1px solid ${indieOnly ? '#06B6D4' : 'var(--border)'}`,
              color: indieOnly ? '#06B6D4' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <Users size={16} /> Solo / Indie only
          </button>
        </div>

        {/* Sorting & Time Range (Conditional) */}
        {discoveryMode === 'leaderboard' && (
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            flexWrap: 'wrap', gap: 16, paddingTop: 16, borderTop: '1px solid var(--border)' 
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[
                { key: 'trending', icon: TrendingUp, label: 'Trending' },
                { key: 'pure',     icon: BarChart2,  label: 'Pure' },
                { key: 'newest',   icon: Clock,      label: 'Newest' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setSort(key)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  background: sort === key ? 'var(--surface-elevated)' : 'transparent',
                  border: `1px solid ${sort === key ? 'var(--border)' : 'transparent'}`,
                  color: sort === key ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: sort === key ? 700 : 500, cursor: 'pointer',
                }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
              <RankingExplainer sort={sort} />
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-elevated)', padding: 4, borderRadius: 8 }}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'week',  label: 'Week' },
                { key: 'all',   label: 'All' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setRange(key)} style={{
                  padding: '4px 12px', borderRadius: 6,
                  background: range === key ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  color: range === key ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: 32 }}>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Feed Content */}
      {loading ? (
        <div style={{ padding: '40px 0' }}>
          <LoadingSpinner message="Curating your feed..." />
        </div>
      ) : products.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '100px 0', 
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' 
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🏜️</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 300, margin: '0 auto' }}>
            {indieOnly ? 'Try turning off the "Indie only" filter or exploring other categories.' : 'Be the first to submit a project in this category!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                width: '100%', padding: '16px', marginTop: 12,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)',
                fontSize: 15, fontWeight: 700,
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                opacity: loadingMore ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { if (!loadingMore) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {loadingMore ? <LoadingSpinner /> : <><RefreshCw size={18} /> Load more projects</>}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
