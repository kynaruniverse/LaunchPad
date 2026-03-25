import React, { useState, useEffect } from 'react'
import { Calendar, User, Trash2, Edit3 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const UPDATE_TYPES = {
  feature:      { emoji: '🚀', label: 'Feature',      color: '#3B82F6' },
  fix:          { emoji: '🐞', label: 'Bug Fix',      color: '#EF4444' },
  announcement: { emoji: '📢', label: 'Announcement', color: '#F59E0B' },
  update:       { emoji: '🔄', label: 'Update',       color: '#94A3B8' },
}

const getTimeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return date.toLocaleDateString()
}

export const ProductUpdates = ({ productId, isOwner }) => {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    loadUpdates()
  }, [productId])

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('product_updates')
        .select(`
          *,
          profiles:author_id (username, full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUpdates(data || [])
    } catch (err) {
      console.error('Error fetching updates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (updateId) => {
    if (!window.confirm('Delete this update?')) return
    try {
      const { error } = await supabase
        .from('product_updates')
        .delete()
        .eq('id', updateId)
      
      if (error) throw error
      setUpdates(prev => prev.filter(u => u.id !== updateId))
      toast.success('Update deleted')
    } catch (err) {
      toast.error('Failed to delete update')
    }
  }

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading updates...</div>
  
  if (updates.length === 0) {
    return (
      <div style={{
        padding: '40px 24px', textAlign: 'center', background: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)'
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>No updates yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {isOwner ? 'Share your progress with the community.' : 'Check back for updates.'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <Edit3 size={20} color="var(--accent)" />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Build in Public
        </h3>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {updates.length} update{updates.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {updates.map((update, idx) => {
          const typeInfo = UPDATE_TYPES[update.type] || UPDATE_TYPES.update
          const canDelete = isOwner && user?.id === update.author_id
          
          return (
            <div key={update.id} style={{ display: 'flex', gap: 16 }}>
              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: typeInfo.color, border: '2px solid var(--background)',
                  boxShadow: `0 0 8px ${typeInfo.color}80`
                }} />
                {idx < updates.length - 1 && (
                  <div style={{
                    width: 2, height: 40, background: 'var(--border)', marginTop: 8
                  }} />
                )}
              </div>

              {/* Update Card */}
              <div style={{
                flex: 1, padding: 20, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: typeInfo.color,
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: `${typeInfo.color}15`, padding: '2px 10px', borderRadius: 999
                      }}>
                        {typeInfo.emoji} {typeInfo.label.toUpperCase()}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: 16, fontWeight: 800, color: 'var(--text-primary)',
                      margin: 0, marginBottom: 8, letterSpacing: '-0.01em'
                    }}>
                      {update.title}
                    </h4>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {getTimeAgo(update.created_at)}
                      </span>
                      {update.profiles?.username && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} /> {update.profiles.username}
                        </span>
                      )}
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(update.id)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--error)', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {update.body && (
                  <p style={{
                    fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                  }}>
                    {update.body}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
