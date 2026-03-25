import React, { useState, useEffect } from 'react'
import { X, Plus, BookMarked, Globe, Lock } from 'lucide-react'
import { collectionsService } from '../services/collections'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from './LoadingSpinner'

export const AddToCollectionModal = ({ productId, productTitle, onClose }) => {
  const [collections, setCollections] = useState([])
  const [contained, setContained] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [toggling, setToggling] = useState(null) // collectionId being toggled
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { loadData() }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const loadData = async () => {
    try {
      const [cols, inSet] = await Promise.all([
        collectionsService.getUserCollections(user.id),
        collectionsService.getCollectionsContaining(productId, user.id),
      ])
      setCollections(cols || [])
      setContained(inSet)
    } catch (e) {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (collectionId) => {
    setToggling(collectionId)
    try {
      if (contained.has(collectionId)) {
        await collectionsService.removeFromCollection(collectionId, productId)
        setContained(prev => { const s = new Set(prev); s.delete(collectionId); return s })
        toast.success('Removed from collection')
      } else {
        const added = await collectionsService.addToCollection(collectionId, productId, user.id)
        if (added) {
          setContained(prev => new Set([...prev, collectionId]))
          toast.success('Added to collection!')
        } else {
          toast.info('Already in this collection')
        }
      }
    } catch (e) {
      toast.error('Failed to update collection')
    } finally {
      setToggling(null)
    }
  }

  const handleCreateAndAdd = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const col = await collectionsService.createCollection(user.id, newTitle, '', true)
      await collectionsService.addToCollection(col.id, productId, user.id)
      setCollections(prev => [col, ...prev])
      setContained(prev => new Set([...prev, col.id]))
      setNewTitle('')
      setShowNewForm(false)
      toast.success(`Added to "${col.title}"!`)
    } catch (e) {
      toast.error('Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 400,
        margin: '0 16px',
        background: 'var(--surface-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Save to Collection
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{productTitle}</p>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Existing collections */}
              {collections.length === 0 && !showNewForm ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No collections yet. Create one below!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {collections.map(c => {
                    const isSaved = contained.has(c.id)
                    const isLoading = toggling === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleToggle(c.id)}
                        disabled={isLoading}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 'var(--radius-md)',
                          background: isSaved ? 'var(--accent-soft)' : 'var(--surface)',
                          border: `1px solid ${isSaved ? 'var(--accent)' : 'var(--border)'}`,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          textAlign: 'left', width: '100%',
                          opacity: isLoading ? 0.6 : 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: isSaved ? 'var(--accent)' : 'var(--surface-elevated)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <BookMarked size={16} color={isSaved ? '#fff' : 'var(--text-secondary)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, color: isSaved ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {c.title}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {c.item_count || 0} projects · {c.is_public ? 'Public' : 'Private'}
                          </p>
                        </div>
                        {isSaved && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>✓ Saved</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* New collection form */}
              {showNewForm ? (
                <form onSubmit={handleCreateAndAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Collection name"
                    maxLength={80}
                    style={{
                      padding: '10px 12px', background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      color: 'var(--text-primary)', fontSize: 14,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowNewForm(false)} style={{
                      flex: 1, padding: '10px', borderRadius: 8,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    }}>Cancel</button>
                    <button type="submit" disabled={!newTitle.trim() || creating} style={{
                      flex: 1, padding: '10px', borderRadius: 8,
                      background: 'var(--accent)', color: '#fff',
                      border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: 13, opacity: creating ? 0.7 : 1,
                    }}>{creating ? 'Creating...' : 'Create & Save'}</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowNewForm(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '11px 14px', borderRadius: 'var(--radius-md)',
                  background: 'transparent', border: '1px dashed var(--border)',
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <Plus size={14} /> New Collection
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
