import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Globe, Lock, BookMarked, ArrowLeft, Trash2, ExternalLink, Layout, Search, Filter, MoreVertical, X, Check, Bookmark } from 'lucide-react'
import { collectionsService } from '../services/collections'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { CATEGORY_COLORS, LAUNCH_STATUS_MAP } from '../theme'

// ─────────────────────────────────────────
// Collection detail view (items inside a collection)
// ─────────────────────────────────────────
const CollectionDetail = ({ collection, onBack, onDelete }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isOwner = user?.id === collection.user_id

  useEffect(() => { loadItems() }, [collection.id])

  const loadItems = async () => {
    try {
      const data = await collectionsService.getCollectionItems(collection.id)
      setItems(data || [])
    } catch (e) {
      toast.error('Failed to load collection items')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await collectionsService.removeFromCollection(collection.id, productId)
      setItems(prev => prev.filter(p => p.id !== productId))
      toast.success('Removed from collection')
    } catch (e) {
      toast.error('Failed to remove')
    }
  }

  const handleDeleteCollection = async () => {
    if (!window.confirm(`Delete "${collection.title}"? This can't be undone.`)) return
    try {
      await collectionsService.deleteCollection(collection.id)
      toast.success('Collection deleted')
      onDelete(collection.id)
    } catch (e) {
      toast.error('Failed to delete collection')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700,
          background: 'var(--surface-elevated)', border: '1px solid var(--border)', 
          cursor: 'pointer', marginBottom: 24, padding: '8px 16px', borderRadius: 999,
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back to Collections
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '20px',
              background: 'var(--accent-soft)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 8px 24px var(--accent-glow)'
            }}>
              <BookMarked size={32} color="var(--accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                {collection.title}
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {collection.is_public
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '2px 10px', borderRadius: 999 }}><Globe size={14} /> Public</span>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-elevated)', padding: '2px 10px', borderRadius: 999 }}><Lock size={14} /> Private</span>
                }
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  · {items.length} project{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <button onClick={handleDeleteCollection} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--error)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
            >
              <Trash2 size={14} /> Delete Collection
            </button>
          )}
        </div>

        {collection.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 20, lineHeight: 1.6, maxWidth: 600 }}>
            {collection.description}
          </p>
        )}
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ padding: '40px 0' }}><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '80px 0', 
            background: 'var(--surface)', border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)', borderStyle: 'dashed'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Empty Collection</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You haven't added any projects to this collection yet.</p>
            <button onClick={() => navigate('/')} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer'
            }}>Explore Projects</button>
          </div>
        ) : (
          items.map(product => {
            const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other
            const ls = LAUNCH_STATUS_MAP[product.launch_status]
            return (
              <div key={product.id} style={{
                display: 'flex', gap: 20, padding: 20,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', alignItems: 'center',
                transition: 'border-color 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 80, height: 60, borderRadius: 12, flexShrink: 0,
                  background: product.media_urls?.[0] ? undefined : `${catColor}15`,
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)'
                }}>
                  {product.media_urls?.[0]
                    ? <img src={product.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <span style={{ fontSize: 32 }}>{ls?.emoji || '🚀'}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <h3
                      style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 17, cursor: 'pointer', margin: 0 }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.title}
                    </h3>
                    {ls && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                        color: ls.color, background: `${ls.color}15`, border: `1px solid ${ls.color}30`,
                        textTransform: 'uppercase'
                      }}>{ls.label}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}>
                    {product.tagline}
                  </p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: catColor, background: `${catColor}15`,
                      padding: '2px 10px', borderRadius: 999, border: `1px solid ${catColor}30`
                    }}>{product.category}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      🚀 {product.upvote_count || 0} upvotes
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  {product.website_url && (
                    <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-primary)', textDecoration: 'none', transition: 'all 0.15s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {isOwner && (
                    <button onClick={() => handleRemove(product.id)} style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--error)', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Create collection form
// ─────────────────────────────────────────
const CreateForm = ({ onCreated, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title required'); return }
    setCreating(true)
    try {
      const data = await collectionsService.createCollection(user.id, title, description, isPublic)
      onCreated(data)
      toast.success('Collection created!')
    } catch (e) {
      toast.error('Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  const inputStyle = {
    padding: '12px 14px', background: 'var(--surface-elevated)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: 14,
  }

  return (
    <form onSubmit={handleCreate} style={{
      padding: 24, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid var(--accent)',
      marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 20,
      boxShadow: '0 12px 40px var(--accent-glow)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Plus size={20} color="var(--accent)" />
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18 }}>New Collection</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection Name</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. My Favorite SaaS Tools" style={inputStyle}
          maxLength={80}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What's this collection about?"
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
          maxLength={200}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => setIsPublic(!isPublic)} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: isPublic ? 'rgba(34,197,94,0.1)' : 'var(--surface-elevated)',
          border: `1px solid ${isPublic ? 'var(--success)' : 'var(--border)'}`,
          color: isPublic ? 'var(--success)' : 'var(--text-primary)',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.15s'
        }}>
          {isPublic ? <Globe size={16} /> : <Lock size={16} />}
          {isPublic ? 'Public' : 'Private'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <X size={16} /> Cancel
        </button>
        <button type="submit" disabled={creating} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: 14, opacity: creating ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Check size={16} /> {creating ? 'Creating...' : 'Create Collection'}
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────
// Main CollectionsPage
// ─────────────────────────────────────────
export const CollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCollection, setActiveCollection] = useState(null)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { loadCollections() }, [user])

  const loadCollections = async () => {
    try {
      const data = await collectionsService.getCollections(user?.id)
      setCollections(data || [])
    } catch (e) {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  if (activeCollection) {
    return (
      <CollectionDetail
        collection={activeCollection}
        onBack={() => setActiveCollection(null)}
        onDelete={(id) => {
          setCollections(prev => prev.filter(c => c.id !== id))
          setActiveCollection(null)
        }}
      />
    )
  }

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Collections
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Organize and share your favorite indie projects.
          </p>
        </div>
        {!creating && user && (
          <button onClick={() => setCreating(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px var(--accent-glow)'
          }}>
            <Plus size={18} /> New Collection
          </button>
        )}
      </div>

      {creating && (
        <CreateForm
          onCreated={(c) => { setCollections(prev => [c, ...prev]); setCreating(false) }}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : collections.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '100px 0', 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', borderStyle: 'dashed'
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📚</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>No Collections Yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 400, margin: '0 auto 32px' }}>
            Create your first collection to start organizing projects you love.
          </p>
          {!user && (
            <button onClick={() => navigate('/profile')} style={{
              padding: '12px 32px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer'
            }}>Sign In to Start</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {collections.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveCollection(c)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '14px',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookMarked size={24} color="var(--accent)" />
                </div>
                {c.is_public ? (
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', color: 'var(--success)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Public</div>
                ) : (
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--surface-elevated)', color: 'var(--text-muted)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Private</div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                  {c.title}
                </h3>
                <p style={{ 
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden', height: '3em'
                }}>
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ 
                marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600
              }}>
                <Bookmark size={14} />
                {c.collection_items?.[0]?.count || 0} projects
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
