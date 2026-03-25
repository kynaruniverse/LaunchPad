import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Rocket, MessageCircle, Plus, MoreHorizontal, TrendingUp, Pencil } from 'lucide-react'
import { productsService } from '../services/products'
import { commentsService, FEEDBACK_TYPES, FEEDBACK_STATUSES } from '../services/comments'
import { productUpdatesService } from '../services/productUpdates'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { LAUNCH_STATUS_MAP } from '../theme'

const STATUS_COLORS = { active: '#22C55E', updated: '#F59E0B', retired: '#5A5A70' }

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex: 1, padding: 16, borderRadius: 'var(--radius-lg)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0,
  }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
  </div>
)

const TrendingBadge = ({ score }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, position: 'relative', cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TrendingUp size={12} />
      {score !== undefined ? Number(score).toFixed(1) : '0.0'}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 10px', width: 190, fontSize: 11,
          color: 'var(--text-secondary)', textAlign: 'center',
          zIndex: 100, pointerEvents: 'none', marginBottom: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Trending Score</strong><br />
          (upvotes × 3 + comments × 2) ÷ (1 + age in days)
        </div>
      )}
    </div>
  )
}

// Inline changelog composer
const UpdateComposer = ({ products, onPosted }) => {
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('update')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const allTypes = [
    { value: 'update', emoji: '📝', label: 'Update' },
    { value: 'feature', emoji: '✨', label: 'Feature' },
    { value: 'fix', emoji: '🔧', label: 'Fix' },
    { value: 'announcement', emoji: '📣', label: 'Announcement' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !productId) return
    setSubmitting(true)
    try {
      await productUpdatesService.addProductUpdate(productId, user.id, title.trim(), body.trim(), type)
      setTitle(''); setBody('')
      toast.success('Update posted! 📝')
      onPosted?.()
    } catch (err) {
      toast.error('Failed to post update')
    } finally {
      setSubmitting(false)
    }
  }

  if (products.length === 0) return null

  return (
    <div style={{
      padding: 16, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid var(--border)',
      marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pencil size={14} color="var(--accent)" /> Post a Build Update
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Product selector */}
        <select value={productId} onChange={e => setProductId(e.target.value)} style={{
          padding: '9px 12px', background: 'var(--surface-elevated)',
          border: '1px solid var(--border)', borderRadius: 8,
          color: 'var(--text-primary)', fontSize: 13,
        }}>
          {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allTypes.map(t => (
            <button key={t.value} type="button" onClick={() => setType(t.value)} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: type === t.value ? 'var(--accent-soft)' : 'transparent',
              border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
              color: type === t.value ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Update title (e.g. Added dark mode)"
          style={{
            padding: '10px 12px', background: 'var(--surface-elevated)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-primary)', fontSize: 14,
          }} />

        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="What changed? What did you learn? (optional)"
          style={{
            padding: '10px 12px', background: 'var(--surface-elevated)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-primary)', fontSize: 14,
            minHeight: 70, resize: 'vertical',
          }} />

        <button type="submit" disabled={!title.trim() || submitting} style={{
          padding: '10px', borderRadius: 8,
          background: title.trim() ? 'var(--accent)' : 'var(--surface-elevated)',
          color: '#fff', fontWeight: 700, fontSize: 13, border: 'none',
          cursor: title.trim() ? 'pointer' : 'not-allowed',
          opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? 'Posting...' : 'Post Update'}
        </button>
      </form>
    </div>
  )
}

export const DashboardPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(null)
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'feedback' | 'updates'
  const [recentFeedback, setRecentFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const { user, profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) loadProducts()
    else setLoading(false)
  }, [user])

  useEffect(() => {
    if (menuOpen === null) return
    const handler = () => setMenuOpen(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  useEffect(() => {
    if (activeTab === 'feedback' && products.length > 0 && recentFeedback.length === 0) {
      loadRecentFeedback()
    }
  }, [activeTab, products])

  const loadProducts = async () => {
    try {
      const data = await productsService.getUserProducts(user.id)
      setProducts(data || [])
    } catch (e) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentFeedback = async () => {
    setFeedbackLoading(true)
    try {
      const all = await Promise.all(
        products.map(p =>
          commentsService.getComments(p.id)
            .then(comments => comments.map(c => ({ ...c, productTitle: p.title, productId: p.id })))
            .catch(() => [])
        )
      )
      const flat = all.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20)
      setRecentFeedback(flat)
    } catch (e) {}
    finally { setFeedbackLoading(false) }
  }

  const handleStatusChange = async (productId, status) => {
    try {
      await productsService.updateProductStatus(productId, status)
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p))
      toast.success(`Status → ${status}`)
      setMenuOpen(null)
    } catch (e) { toast.error('Failed to update') }
  }

  const handleFeedbackStatus = async (commentId, status) => {
    try {
      await commentsService.updateFeedbackStatus(commentId, status)
      setRecentFeedback(prev => prev.map(c => c.id === commentId ? { ...c, feedback_status: status } : c))
      if (status === 'done') toast.success('Marked done ✅')
    } catch (e) { toast.error('Failed to update') }
  }

  if (!user) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Sign in to access your dashboard</p>
      <a href="/profile" style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
        Sign In
      </a>
    </div>
  )

  const totalViews    = products.reduce((a, p) => a + (p.view_count || 0), 0)
  const totalUpvotes  = products.reduce((a, p) => a + (p.upvote_count || 0), 0)
  const totalComments = products.reduce((a, p) => a + (p.comment_count || 0), 0)

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Hey, {profile?.username || 'Maker'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {products.length} project{products.length !== 1 ? 's' : ''} · {profile?.feedback_points || 0} feedback points
          </p>
        </div>
        <button onClick={() => navigate('/submit')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 16px', borderRadius: 'var(--radius-full)',
          background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
        }}>
          <Plus size={16} /> Submit
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <StatCard icon={Eye} label="Views" value={totalViews} color="#3B82F6" />
        <StatCard icon={Rocket} label="Upvotes" value={totalUpvotes} color="var(--accent)" />
        <StatCard icon={MessageCircle} label="Feedback" value={totalComments} color="#8B5CF6" />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24, gap: 4,
      }}>
        {[
          { key: 'products', label: 'My Projects' },
          { key: 'feedback', label: `Feedback${totalComments > 0 ? ` (${totalComments})` : ''}` },
          { key: 'updates',  label: 'Post Update' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            flex: 1, padding: '9px', borderRadius: 8,
            background: activeTab === key ? 'var(--accent)' : 'transparent',
            color: activeTab === key ? '#fff' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Tab: Products */}
      {activeTab === 'products' && (
        loading ? <LoadingSpinner /> : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No projects yet</p>
            <button onClick={() => navigate('/submit')} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-soft)', border: '1px solid var(--accent)',
              color: 'var(--accent)', fontWeight: 600, cursor: 'pointer',
            }}>Submit your first project</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(p => {
              const ls = LAUNCH_STATUS_MAP[p.launch_status]
              return (
                <div key={p.id} style={{
                  padding: 16, borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${p.id}`)}>
                      {p.title}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.tagline}
                    </p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                        <Eye size={12} /> {p.view_count || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                        <Rocket size={12} /> {p.upvote_count || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                        <MessageCircle size={12} /> {p.comment_count || 0}
                      </span>
                      <TrendingBadge score={p.trending_score} />
                      {ls && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: ls.color,
                          background: `${ls.color}15`, border: `1px solid ${ls.color}35`,
                          padding: '2px 8px', borderRadius: 999,
                        }}>{ls.emoji} {ls.label}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: `${STATUS_COLORS[p.status] || STATUS_COLORS.active}20`,
                      color: STATUS_COLORS[p.status] || STATUS_COLORS.active,
                      border: `1px solid ${STATUS_COLORS[p.status] || STATUS_COLORS.active}40`,
                      textTransform: 'capitalize',
                    }}>{p.status || 'active'}</span>
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id) }} style={{
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                    }}>
                      <MoreHorizontal size={14} color="var(--text-secondary)" />
                    </button>
                  </div>

                  {menuOpen === p.id && (
                    <div onClick={(e) => e.stopPropagation()} style={{
                      position: 'absolute', right: 16, top: 60, zIndex: 10,
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 140,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                      {['active', 'updated', 'retired'].map(s => (
                        <button key={s} onClick={() => handleStatusChange(p.id, s)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', width: '100%',
                          background: p.status === s ? `${STATUS_COLORS[s]}15` : 'none',
                          border: 'none', cursor: 'pointer',
                          color: p.status === s ? STATUS_COLORS[s] : 'var(--text-primary)',
                          fontSize: 13, textAlign: 'left', fontWeight: p.status === s ? 700 : 400,
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Tab: Feedback queue */}
      {activeTab === 'feedback' && (
        feedbackLoading ? <LoadingSpinner message="Loading feedback..." /> :
        recentFeedback.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💬</p>
            <p>No feedback yet across your projects.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentFeedback.map((c, i) => {
              const typeInfo   = FEEDBACK_TYPES.find(t => t.value === c.type) || FEEDBACK_TYPES[0]
              const statusInfo = FEEDBACK_STATUSES.find(s => s.value === c.feedback_status) || FEEDBACK_STATUSES[0]
              return (
                <div key={c.id} style={{
                  padding: '14px 0', borderBottom: i < recentFeedback.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: c.feedback_status === 'done' ? 0.6 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                          {c.productTitle}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          color: typeInfo.color, background: `${typeInfo.color}15`,
                        }}>
                          {typeInfo.emoji} {typeInfo.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          by {c.profiles?.username || 'anon'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
                        textDecoration: c.feedback_status === 'done' ? 'line-through' : 'none',
                      }}>
                        {c.content}
                      </p>
                    </div>
                    {/* Quick status update */}
                    <select
                      value={c.feedback_status || 'new'}
                      onChange={e => handleFeedbackStatus(c.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: `${statusInfo.color}15`, border: `1px solid ${statusInfo.color}35`,
                        color: statusInfo.color, cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {FEEDBACK_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Tab: Post update */}
      {activeTab === 'updates' && (
        products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>Submit a project first before posting updates.</p>
          </div>
        ) : (
          <UpdateComposer products={products} onPosted={() => setActiveTab('products')} />
        )
      )}
    </div>
  )
}
