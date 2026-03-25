import React, { useState, useEffect } from 'react'
import { Calendar, Tag, ChevronRight } from 'lucide-react'
import { supabase } from '../supabaseClient'

const UPDATE_TYPES = {
  feature:      { emoji: '🚀', label: 'Feature',      color: '#3B82F6' },
  fix:          { emoji: '🐞', label: 'Fix',          color: '#EF4444' },
  announcement: { emoji: '📢', label: 'Announcement', color: '#F59E0B' },
  update:       { emoji: '🔄', label: 'Update',       color: '#94A3B8' },
}

export const ProductUpdates = ({ productId }) => {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('product_updates')
          .select('*')
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

    if (productId) fetchUpdates()
  }, [productId])

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading updates...</div>
  if (updates.length === 0) return null

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Changelog</h3>
        <span style={{ 
          padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: 'var(--surface-elevated)', color: 'var(--text-muted)'
        }}>
          {updates.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {updates.map((update) => {
          const typeInfo = UPDATE_TYPES[update.type] || UPDATE_TYPES.update
          return (
            <div key={update.id} style={{
              position: 'relative', paddingLeft: 24,
              borderLeft: '2px solid var(--border)',
            }}>
              {/* Timeline dot */}
              <div style={{
                position: 'absolute', left: -7, top: 4,
                width: 12, height: 12, borderRadius: '50%',
                background: 'var(--surface)', border: `2px solid ${typeInfo.color}`,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: 12, fontWeight: 700, color: typeInfo.color,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {typeInfo.emoji} {typeInfo.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} />
                    {new Date(update.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {update.title}
                </h4>
                
                {update.body && (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
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
