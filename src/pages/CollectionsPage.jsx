import React, { useState, useEffect } from 'react'
import { Plus, Globe, Lock, BookMarked } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const CollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => { if (user) loadCollections(); else setLoading(false) }, [user])

  const loadCollections = async () => {
    try {
      const { data } = await supabase.from('collections').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setCollections(data || [])
    } catch (e) { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title required'); return }
    setCreating(true)
    try {
      const { data } = await supabase.from('collections').insert({ user_id: user.id, title: title.trim(), description: description.trim(), is_public: isPublic }).select().single()
      setCollections(prev => [data, ...prev])
      setShowForm(false); setTitle(''); setDescription('')
      toast.success('Collection created!')
    } catch (e) { toast.error('Failed to create') }
    finally { setCreating(false) }
  }

  if (!user) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <BookMarked size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Sign in to create collections</p>
      <a href="/profile" style={{ padding: '12px 28px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Sign In</a>
    </div>
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Collections</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          borderRadius: 999, background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
        }}>
          <Plus size={16} /> New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{
          padding: 20, borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)', border: '1px solid var(--accent)40',
          marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>New Collection</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Collection name" style={{
            padding: '12px 14px', background: 'var(--surface-elevated)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontSize: 14,
          }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" style={{
            padding: '12px 14px', background: 'var(--surface-elevated)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontSize: 14, minHeight: 80, resize: 'vertical',
          }} />
          <button type="button" onClick={() => setIsPublic(!isPublic)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'var(--surface-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 14,
          }}>
            {isPublic ? <Globe size={16} color="var(--success)" /> : <Lock size={16} color="var(--text-muted)" />}
            {isPublic ? 'Public' : 'Private'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
            }}>Cancel</button>
            <button type="submit" disabled={creating} style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 700,
            }}>{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <BookMarked size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No collections yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {collections.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 16,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-soft)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BookMarked size={22} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{c.title}</p>
                {c.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.description}</p>}
              </div>
              {c.is_public ? <Globe size={14} color="var(--success)" /> : <Lock size={14} color="var(--text-muted)" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
