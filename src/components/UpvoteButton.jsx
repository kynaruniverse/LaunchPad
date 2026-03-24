import React, { useState } from 'react'
import { Rocket } from 'lucide-react'

export const UpvoteButton = ({ count = 0, upvoted = false, onPress, size = 'md' }) => {
  const [anim, setAnim] = useState(false)

  const handleClick = () => {
    setAnim(true)
    setTimeout(() => setAnim(false), 300)
    onPress?.()
  }

  const isSmall = size === 'sm'

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: isSmall ? '5px 10px' : '8px 14px',
        borderRadius: 999,
        background: upvoted ? 'var(--accent-soft)' : 'var(--surface-elevated)',
        border: `1px solid ${upvoted ? 'var(--accent)' : 'var(--border)'}`,
        color: upvoted ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: isSmall ? 12 : 14,
        fontWeight: 600,
        cursor: 'pointer',
        transform: anim ? 'scale(1.2)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <Rocket size={isSmall ? 13 : 15} fill={upvoted ? 'var(--accent)' : 'none'} />
      {count}
    </button>
  )
}
