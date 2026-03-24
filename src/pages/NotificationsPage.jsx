import React, { useState } from 'react'
import { Rocket, MessageCircle, UserPlus, TrendingUp } from 'lucide-react'

const MOCK = [
  { id: '1', type: 'upvote', title: 'Someone upvoted your product', sub: 'SuperTool got a new upvote', time: '2m ago', read: false, icon: Rocket, color: '#FF5722' },
  { id: '2', type: 'comment', title: 'New comment on your product', sub: '"This looks amazing!"', time: '1h ago', read: false, icon: MessageCircle, color: '#3B82F6' },
  { id: '3', type: 'follow', title: 'New follower', sub: '@devuser started following you', time: '3h ago', read: true, icon: UserPlus, color: '#22C55E' },
  { id: '4', type: 'trending', title: 'Trending in AI', sub: "Check out what's new today", time: '5h ago', read: true, icon: TrendingUp, color: '#8B5CF6' },
]

export const NotificationsPage = () => {
  const [notifs, setNotifs] = useState(MOCK)

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
          Notifications {unread > 0 && (
            <span style={{ color: 'var(--accent)', fontSize: 18 }}> ({unread})</span>
          )}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifs.map(n => {
          const Icon = n.icon
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 16, borderRadius: 'var(--radius-lg)',
                background: n.read ? 'var(--surface)' : 'var(--accent-soft)',
                border: `1px solid ${n.read ? 'var(--border)' : 'rgba(255,87,34,0.3)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: `${n.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={n.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 2 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.sub}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</p>
              </div>
              {!n.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
