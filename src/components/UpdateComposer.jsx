import React, { useState } from 'react'
import { Send, X, ChevronDown, Loader } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const UPDATE_TYPES = [
  { value: 'feature',      emoji: '🚀', label: 'Feature',      color: '#3B82F6' },
  { value: 'fix',          emoji: '🐞', label: 'Bug Fix',      color: '#EF4444' },
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
    if (!title.trim() || !selectedProductId) { toast.error('Product and title required'); return }
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
      setSelectedType('feature')
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
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
          You need to submit a product before you can post updates.
        </p>
      </div>
    )
  }

  const selectedTypeInfo = UPDATE_TYPES.find(t => t.value === selectedType)

  const inputStyle = {
    padding: '12px 14px',
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', flexDirection: 'column', gap: 20, 
      background: 'var(--surface)', padding: 24, 
      borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent)',
      boxShadow: '0 12px 40px var(--accent-glow)'
    }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>
          Post an Update
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Share progress with your community
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Product selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                width: '100%', ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 40
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {UPDATE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedTypeInfo.value === t.value ? `${t.color}15` : 'var(--surface-elevated)',
                  border: `1px solid ${selectedTypeInfo.value === t.value ? t.color : 'var(--border)'}`,
                  color: selectedTypeInfo.value === t.value ? t.color : 'var(--text-muted)',
                  transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. ${selectedTypeInfo?.label} launched`}
          style={inputStyle}
          maxLength={100}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description (Optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell your users what's new, what you learned, or what's next..."
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
          maxLength={500}
        />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
          {body.length}/500
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" disabled={!title.trim() || submitting} style={{
          flex: 1, padding: '12px 24px', borderRadius: 'var(--radius-md)',
          background: title.trim() && !submitting ? 'var(--accent)' : 'var(--surface-elevated)',
          color: title.trim() && !submitting ? '#fff' : 'var(--text-muted)',
          fontWeight: 700, border: 'none', cursor: title.trim() && !submitting ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 0.15s', opacity: submitting ? 0.7 : 1
        }}>
          {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          {submitting ? 'Posting...' : 'Post Update'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
