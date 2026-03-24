import React from 'react'
import { CATEGORIES } from '../theme'

export const CategoryFilter = ({ selected, onSelect }) => (
  <div style={{
    display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  }}>
    {CATEGORIES.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        style={{
          whiteSpace: 'nowrap',
          padding: '7px 16px', borderRadius: 999,
          background: selected === cat ? 'var(--accent)' : 'var(--surface-elevated)',
          border: `1px solid ${selected === cat ? 'var(--accent)' : 'var(--border)'}`,
          color: selected === cat ? '#fff' : 'var(--text-secondary)',
          fontSize: 13, fontWeight: selected === cat ? 700 : 500,
          cursor: 'pointer', transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {cat}
      </button>
    ))}
  </div>
)
