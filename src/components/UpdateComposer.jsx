import React, { useState } from 'react'
import { Send, Tag, MessageSquare, Plus, ChevronDown } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const UPDATE_TYPES = [
  { value: 'feature',      emoji: '🚀', label: 'Feature',      color: '#3B82F6' },
  { value: 'fix',          emoji: '🐞', label: 'Fix',          color: '#EF4444' },
  { value: 'announcement', emoji: '📢', label: 'Announcement', color: '#F59E0B' },
  { value: 'update',       emoji: '🔄', label: 'Update',       color: '#94A3B8' },
]

export const UpdateComposer = ({ products, onUpdatePosted }) => {
  const { user } = useAuth()
  const toast = useToast()
  
  const [selectedProductId, setSelectedProductId] = useState(products?.[0]?.id || '')
  const [selectedType, setSelectedType] = useState('feature')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !selectedProductId) return
    if (!user) { toast.error('Sign in to post updates'); return }
    
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('product_updates')
        .insert([{
          product_id: selectedProductId,
          author_id: user.id,
          title: title.trim(),
          body: body.trim(),
          type: selectedType
        }])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Update posted! 🚀')
      setTitle('')
      setBody('')
      if (onUpdatePosted) onUpdatePosted(data)
    } catch (err) {
      console.error('Error posting update:', err)
      toast.error('Failed to post update')
    } finally {
      setSubmitting(false)
    }
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ 
        padding: 32, textAlign: 'center', background: 'var(--surface-elevated)', 
        borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' 
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          You need to submit a product before you can post updates.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', flexDirection: 'column', gap: 20, 
      background: 'var(--surface)', padding: 24, 
      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Plus size={18} color="var(--accent)" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Post an Update</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Product selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Product</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 14, appearance: 'none', cursor: 'pointer'
              }}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Update Type</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {UPDATE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                style={{
                  padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedType === t.value ? `${t.color}18` : 'transparent',
                  border: `1px solid ${selectedType === t.value ? t.color : 'var(--border)'}`,
                  color: selectedType === t.value ? t.color : 'var(--text-muted)',
                  transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Added Dark Mode Support"
          style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--surface-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 14
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Body (Optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell your users what's new..."
          rows={4}
          style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--surface-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 14, resize: 'none'
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!title.trim() || submitting}
        style={{
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          background: title.trim() ? 'var(--accent)' : 'var(--surface-elevated)',
          color: '#fff', fontWeight: 700, border: 'none', cursor: title.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'background 0.15s', alignSelf: 'flex-end'
        }}
      >
        <Send size={16} />
        {submitting ? 'Posting...' : 'Post Update'}
      </button>
    </form>
  )
}
