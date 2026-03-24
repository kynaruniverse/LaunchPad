import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Rocket, MessageCircle, Plus, MoreHorizontal } from 'lucide-react'
import { productsService } from '../services/products'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'

const STATUS_COLORS = { active: '#22C55E', updated: '#F59E0B', retired: '#5A5A70' }

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex: 1, padding: 16, borderRadius: 'var(--radius-lg)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
  </div>
)

export const DashboardPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(null)
  const { user, profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => { if (user) loadProducts() }, [user])

  const loadProducts = async () => {
    try {
      const data = await productsService.getUserProducts(user.id)
      setProducts(data || [])
    } catch (e) { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (productId, status) => {
    try {
      await productsService.updateProductStatus(productId, status)
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p))
      toast.success(`Status → ${status}`)
      setMenuOpen(null)
    } catch (e) { toast.error('Failed to update') }
  }

  if (!user) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Sign in to access your dashboard</p>
      <a href="/profile" style={{
        padding: '12px 28px', borderRadius: 'var(--radius-full)',
        background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none',
      }}>Sign In</a>
    </div>
  )

  const totalViews = products.reduce((a, p) => a + (p.view_count || 0), 0)
  const totalUpvotes = products.reduce((a, p) => a + (p.upvote_count || 0), 0)
  const totalComments = products.reduce((a, p) => a + (p.comment_count || 0), 0)

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Hey, {profile?.username || 'Maker'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{products.length} product{products.length !== 1 ? 's' : ''} submitted</p>
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <StatCard icon={Eye} label="Views" value={totalViews} color="#3B82F6" />
        <StatCard icon={Rocket} label="Upvotes" value={totalUpvotes} color="var(--accent)" />
        <StatCard icon={MessageCircle} label="Comments" value={totalComments} color="#8B5CF6" />
      </div>

      {/* Products */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Your Products</h2>

      {loading ? <LoadingSpinner /> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No products yet</p>
          <button onClick={() => navigate('/submit')} style={{
            padding: '10px 24px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-soft)', border: '1px solid var(--accent)',
            color: 'var(--accent)', fontWeight: 600, cursor: 'pointer',
          }}>Submit your first product</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(p => (
            <div key={p.id} style={{
              padding: 16, borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{p.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }} >{p.tagline}</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ icon: Eye, val: p.view_count || 0 }, { icon: Rocket, val: p.upvote_count || 0 }, { icon: MessageCircle, val: p.comment_count || 0 }].map(({ icon: Icon, val }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Icon size={12} />{val}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: `${STATUS_COLORS[p.status]}20`,
                  color: STATUS_COLORS[p.status],
                  border: `1px solid ${STATUS_COLORS[p.status]}40`,
                  textTransform: 'capitalize',
                }}>
                  {p.status}
                </span>
                <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} style={{
                  background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                }}>
                  <MoreHorizontal size={14} color="var(--text-secondary)" />
                </button>
              </div>
              {menuOpen === p.id && (
                <div style={{
                  position: 'absolute', right: 16, top: 60, zIndex: 10,
                  background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 140,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  {['active', 'updated', 'retired'].map(s => (
                    <button key={s} onClick={() => handleStatusChange(p.id, s)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', width: '100%',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-primary)', fontSize: 13, textAlign: 'left',
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
