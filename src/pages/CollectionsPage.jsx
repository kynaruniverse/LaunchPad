import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Globe, Lock, BookMarked, ArrowLeft, Trash2, ExternalLink } from 'lucide-react'
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
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: 20, padding: 0,
        }}>
          <ArrowLeft size={16} /> Collections
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-md)',
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BookMarked size={24} color="var(--accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {collection.title}
              </h1>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {collection.is_public
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--success)' }}><Globe size={12} /> Public</span>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Lock size={12} /> Private</span>
                }
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  · {items.length} project{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <button onClick={handleDeleteCollection} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--error)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>

        {collection.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12 }}>
            {collection.description}
          </p>
        )}
      </div>

      {/* Items */}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No projects in this collection yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Add projects using the bookmark icon on any product card.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(product => {
            const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other
            const ls = LAUNCH_STATUS_MAP[product.launch_status]
            return (
              <div key={product.id} style={{
                display: 'flex', gap: 14, padding: 16,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', alignItems: 'flex-start',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 64, height: 48, borderRadius: 8, flexShrink: 0,
                  background: product.media_urls?.[0] ? undefined : `${catColor}15`,
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.media_urls?.[0]
                    ? <img src={product.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <span style={{ fontSize: 24 }}>{ls?.emoji || '🚀'}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <p
                      style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.title}
                    </p>
                    {ls && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                        color: ls.color, background: `${ls.color}18`,
                      }}>{ls.emoji} {ls.label}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.tagline}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: catColor, background: `${catColor}18`,
                      padding: '2px 8px', borderRadius: 999,
                    }}>{product.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      🚀 {product.upvote_count || 0}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {product.website_url && (
                    <a href={product.website_url} target="_blank" rel="noopener noreferrer" style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)', textDecoration: 'none',
                    }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {isOwner && (
                    <button onClick={() => handleRemove(product.id)} style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--error)', cursor: 'pointer',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
      padding: 20, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid rgba(255,87,34,0.25)',
      marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>New Collection</h3>
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Collection name" style={inputStyle}
        maxLength={80}
      />
      <textarea
        value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
      />

      {/* Public / Private toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setIsPublic(true)} style={{
          flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
          background: isPublic ? 'rgba(34,197,94,0.1)' : 'var(--surface-elevated)',
          border: `1px solid ${isPublic ? 'var(--success)' : 'var(--border)'}`,
          color: isPublic ? 'var(--success)' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Globe size={14} /> Public
        </button>
        <button type="button" onClick={() => setIsPublic(false)} style={{
          flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
          background: !isPublic ? 'var(--surface-elevated)' : 'var(--surface-elevated)',
          border: `1px solid ${!isPublic ? 'var(--accent)' : 'var(--border)'}`,
          color: !isPublic ? 'var(--accent)' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Lock size={14} /> Private
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -6 }}>
        {isPublic ? 'Visible to everyone — great for curation.' : 'Only you can see this.'}
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
        }}>Cancel</button>
        <button type="submit" disabled={creating || !title.trim()} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
          fontWeight: 700, opacity: creating ? 0.7 : 1,
        }}>{creating ? 'Creating...' : 'Create'}</button>
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
  const [showForm, setShowForm] = useState(false)
  const [activeCollection, setActiveCollection] = useState(null)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (user) loadCollections()
    else setLoading(false)
  }, [user])

  const loadCollections = async () => {
    try {
      const data = await collectionsService.getUserCollections(user.id)
      setCollections(data || [])
    } catch (e) {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (newCollection) => {
    setCollections(prev => [newCollection, ...prev])
    setShowForm(false)
  }

  const handleDeleted = (collectionId) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId))
    setActiveCollection(null)
  }

  if (!user) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <BookMarked size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Sign in to create collections</p>
      <a href="/profile" style={{
        padding: '12px 28px', borderRadius: 999,
        background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none',
      }}>Sign In</a>
    </div>
  )

  // Show collection detail view
  if (activeCollection) {
    return (
      <div className="page">
        <CollectionDetail
          collection={activeCollection}
          onBack={() => setActiveCollection(null)}
          onDelete={handleDeleted}
        />
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Collections
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Curate and share your favourite indie projects
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 999, background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
        }}>
          <Plus size={16} /> New
        </button>
      </div>

      {showForm && (
        <CreateForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BookMarked size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No collections yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Create a collection to save and organise projects you love.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {collections.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveCollection(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BookMarked size={22} color="var(--accent)" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{c.title}</p>
                {c.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.description}
                  </p>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {c.item_count || 0} project{(c.item_count || 0) !== 1 ? 's' : ''}
                </p>
              </div>

              {c.is_public
                ? <Globe size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                : <Lock size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
