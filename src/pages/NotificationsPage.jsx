import React, { useState, useEffect } from 'react'
import { Rocket, MessageCircle, UserPlus, TrendingUp } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/LoadingSpinner'

const ICON_MAP = {
  upvote: Rocket,
  comment: MessageCircle,
  follow: UserPlus,
}

const COLOR_MAP = {
  upvote: '#FF5722',
  comment: '#3B82F6',
  follow: '#22C55E',
}

const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getTitle = (n) => {
  if (n.type === 'upvote') return `${n.actorName} upvoted your product`
  if (n.type === 'comment') return `${n.actorName} commented on ${n.productTitle || 'your product'}`
  if (n.type === 'follow') return `${n.actorName} started following you`
  return 'New notification'
}

const getSub = (n) => {
  if (n.type === 'comment' && n.commentSnippet) return `"${n.commentSnippet}${n.commentSnippet.length >= 50 ? '...' : ''}"`
  if (n.type === 'upvote' && n.productTitle) return n.productTitle
  return ''
}

export const NotificationsPage = () => {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (user) loadNotifications()
    else setLoading(false)
  }, [user])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (username, full_name),
          product:product_id (title),
          comment:comment_id (content)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        read: n.read,
        created_at: n.created_at,
        actorName: n.actor?.username || 'Someone',
        productTitle: n.product?.title,
        commentSnippet: n.comment?.content?.substring(0, 50),
      }))
      setNotifs(formatted)
    } catch (e) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      if (error) throw error
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      if (error) throw error
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (e) {
      toast.error('Failed to mark all as read')
    }
  }

  if (!user) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Sign in to see notifications</p>
      <a href="/profile" style={{
        padding: '10px 24px', borderRadius: 'var(--radius-full)',
        background: 'var(--accent)', color: '#fff', fontWeight: 700, textDecoration: 'none',
      }}>Sign In</a>
    </div>
  )

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
          Notifications{unreadCount > 0 && (
            <span style={{
              marginLeft: 10, padding: '2px 10px', borderRadius: 999,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              fontSize: 14, fontWeight: 700,
            }}>{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map(n => {
            const Icon = ICON_MAP[n.type] || TrendingUp
            const color = COLOR_MAP[n.type] || '#8B5CF6'
            const sub = getSub(n)
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 16, borderRadius: 'var(--radius-lg)',
                  background: n.read ? 'var(--surface)' : 'var(--accent-soft)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(255,87,34,0.3)'}`,
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 2 }}>
                    {getTitle(n)}
                  </p>
                  {sub && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {getTimeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
