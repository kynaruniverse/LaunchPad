import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Rocket, MessageCircle, Plus, MoreHorizontal, TrendingUp, Pencil, CheckCircle2, Clock, ListFilter } from 'lucide-react'
import { productsService } from '../services/products'
import { commentsService, FEEDBACK_TYPES, FEEDBACK_STATUSES } from '../services/comments'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { UpdateComposer } from '../components/UpdateComposer'
import { LAUNCH_STATUS_MAP } from '../theme'

const STATUS_COLORS = { active: '#22C55E', updated: '#F59E0B', retired: '#5A5A70' }

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex: 1, padding: 20, borderRadius: 'var(--radius-lg)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, minWidth: 0,
  }}>
    <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
    </div>
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
          borderRadius: 8, padding: '8px 12px', width: 220, fontSize: 11,
          color: 'var(--text-secondary)', textAlign: 'center',
          zIndex: 100, pointerEvents: 'none', marginBottom: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Trending Score Formula</strong><br />
          (upvotes × 3 + comments × 2) ÷ (1 + age in days)
        </div>
      )}
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
    if (activeTab === 'feedback' && products.length > 0) {
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
      const flat = all.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 30)
      setRecentFeedback(flat)
    } catch (e) {
      console.error('Error loading feedback:', e)
    } finally { 
      setFeedbackLoading(false) 
    }
  }

  const handleStatusChange = async (productId, status) => {
    try {
      await productsService.updateProductStatus(productId, status)
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p))
      toast.success(`Status updated to ${status}`)
      setMenuOpen(null)
    } catch (e) { toast.error('Failed to update status') }
  }

  const handleFeedbackStatus = async (commentId, status) => {
    try {
      await commentsService.updateFeedbackStatus(commentId, status)
      setRecentFeedback(prev => prev.map(c => c.id === commentId ? { ...c, feedback_status: status } : c))
      if (status === 'done') {
        toast.success('Feedback marked as done! +3 points awarded')
      } else {
        toast.success(`Feedback marked as ${status}`)
      }
    } catch (e) { toast.error('Failed to update feedback status') }
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
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Maker Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{products.length} project{products.length !== 1 ? 's' : ''}</span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{profile?.feedback_points || 0} feedback points</span>
          </p>
        </div>
        <button onClick={() => navigate('/submit')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px var(--accent-glow)'
        }}>
          <Plus size={18} /> Submit Project
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="#3B82F6" />
        <StatCard icon={Rocket} label="Total Upvotes" value={totalUpvotes} color="var(--accent)" />
        <StatCard icon={MessageCircle} label="Total Feedback" value={totalComments} color="#8B5CF6" />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 6, marginBottom: 32, gap: 6,
      }}>
        {[
          { key: 'products', label: 'My Projects' },
          { key: 'feedback', label: `Feedback Queue${totalComments > 0 ? ` (${totalComments})` : ''}` },
          { key: 'updates',  label: 'Post Update' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
            background: activeTab === key ? 'var(--accent)' : 'transparent',
            color: activeTab === key ? '#fff' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: 400 }}>
        {/* Tab: Products */}
        {activeTab === 'products' && (
          loading ? <LoadingSpinner /> : products.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '80px 0', 
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' 
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No projects yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                Start your journey by submitting your first indie project to the community.
              </p>
              <button onClick={() => navigate('/submit')} style={{
                padding: '12px 28px', borderRadius: 'var(--radius-full)',
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                color: 'var(--accent)', fontWeight: 700, cursor: 'pointer',
              }}>Submit your first project</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {products.map(p => {
                const ls = LAUNCH_STATUS_MAP[p.launch_status]
                return (
                  <div key={p.id} style={{
                    padding: 20, borderRadius: 'var(--radius-lg)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    display: 'flex', gap: 16, alignItems: 'center', position: 'relative',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 17, cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${p.id}`)}>
                          {p.title}
                        </h3>
                        {ls && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, color: ls.color,
                            background: `${ls.color}15`, border: `1px solid ${ls.color}35`,
                            padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>{ls.emoji} {ls.label}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.tagline}
                      </p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                          <Eye size={14} /> {p.view_count || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                          <Rocket size={14} /> {p.upvote_count || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                          <MessageCircle size={14} /> {p.comment_count || 0}
                        </span>
                        <TrendingBadge score={p.trending_score} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: `${STATUS_COLORS[p.status] || STATUS_COLORS.active}15`,
                          color: STATUS_COLORS[p.status] || STATUS_COLORS.active,
                          border: `1px solid ${STATUS_COLORS[p.status] || STATUS_COLORS.active}35`,
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>{p.status || 'active'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id) }} style={{
                        background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)'
                      }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    {menuOpen === p.id && (
                      <div onClick={(e) => e.stopPropagation()} style={{
                        position: 'absolute', right: 20, top: 70, zIndex: 100,
                        background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 160,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                      }}>
                        <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                          UPDATE STATUS
                        </div>
                        {['active', 'updated', 'retired'].map(s => (
                          <button key={s} onClick={() => handleStatusChange(p.id, s)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px', width: '100%',
                            background: p.status === s ? `${STATUS_COLORS[s]}15` : 'none',
                            border: 'none', cursor: 'pointer',
                            color: p.status === s ? STATUS_COLORS[s] : 'var(--text-primary)',
                            fontSize: 14, textAlign: 'left', fontWeight: p.status === s ? 700 : 500,
                          }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)' }}>
                          <button 
                            onClick={() => navigate(`/product/${p.id}`)}
                            style={{ width: '100%', padding: '12px 14px', border: 'none', background: 'none', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}
                          >
                            View Public Page
                          </button>
                        </div>
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
          feedbackLoading ? <LoadingSpinner message="Loading feedback queue..." /> :
          recentFeedback.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>💬</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Queue is empty</h3>
              <p>No feedback yet across your projects. Keep building!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                <ListFilter size={14} />
                <span>Showing recent feedback across all projects</span>
              </div>
              {recentFeedback.map((c, i) => {
                const typeInfo   = FEEDBACK_TYPES.find(t => t.value === c.type) || FEEDBACK_TYPES[0]
                const statusInfo = FEEDBACK_STATUSES.find(s => s.value === c.feedback_status) || FEEDBACK_STATUSES[0]
                return (
                  <div key={c.id} style={{
                    padding: 20, borderRadius: 'var(--radius-lg)', 
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    opacity: c.feedback_status === 'done' ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: 'var(--accent)',
                      }}>
                        {(c.profiles?.username || 'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.profiles?.username || 'Anonymous'}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>on</span>
                          <span 
                            onClick={() => navigate(`/product/${c.productId}`)}
                            style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}
                          >
                            {c.productTitle}
                          </span>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                            color: typeInfo.color, background: `${typeInfo.color}15`,
                            border: `1px solid ${typeInfo.color}35`,
                          }}>
                            {typeInfo.emoji} {typeInfo.label}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6,
                          textDecoration: c.feedback_status === 'done' ? 'line-through' : 'none',
                          marginBottom: 16
                        }}>
                          {c.content}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>STATUS:</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {FEEDBACK_STATUSES.map(s => (
                                <button
                                  key={s.value}
                                  onClick={() => handleFeedbackStatus(c.id, s.value)}
                                  style={{
                                    padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                    cursor: 'pointer',
                                    background: c.feedback_status === s.value ? `${s.color}20` : 'var(--surface-elevated)',
                                    border: `1px solid ${c.feedback_status === s.value ? s.color : 'var(--border)'}`,
                                    color: c.feedback_status === s.value ? s.color : 'var(--text-muted)',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Tab: Post update */}
        {activeTab === 'updates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '0 8px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Build in Public</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                Share your progress, new features, or bug fixes with the community. Updates appear on your project's changelog.
              </p>
            </div>
            <UpdateComposer 
              products={products} 
              onUpdatePosted={() => {
                setActiveTab('products')
                toast.success('Update posted successfully!')
              }} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
