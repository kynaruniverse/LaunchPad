import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const MediaCarousel = ({ mediaUrls = [] }) => {
  const [index, setIndex] = useState(0)

  if (!mediaUrls || mediaUrls.length === 0) return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      background: 'var(--surface-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 48,
    }}>
      🚀
    </div>
  )

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(mediaUrls.length - 1, i + 1))

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
      <img
        src={mediaUrls[index]}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
      />

      {/* Arrows */}
      {index > 0 && (
        <button onClick={prev} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronLeft size={20} color="#fff" />
        </button>
      )}
      {index < mediaUrls.length - 1 && (
        <button onClick={next} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronRight size={20} color="#fff" />
        </button>
      )}

      {/* Dots */}
      {mediaUrls.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {mediaUrls.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} style={{
              width: i === index ? 20 : 6, height: 6, borderRadius: 999,
              background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}

      {/* Counter */}
      {mediaUrls.length > 1 && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.5)', borderRadius: 999,
          padding: '3px 10px', fontSize: 12, color: '#fff',
        }}>
          {index + 1}/{mediaUrls.length}
        </div>
      )}
    </div>
  )
}
