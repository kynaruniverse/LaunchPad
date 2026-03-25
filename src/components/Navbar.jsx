import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Rocket, Home, BookMarked, LayoutDashboard, User, Bell, Plus, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

const navLinks = [
  { to: '/', icon: Home, label: 'Discover' },
  { to: '/collections', icon: BookMarked, label: 'Collections' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export const Navbar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Fetch unread notifications
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      
      if (!error) setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to new notifications
    const channel = supabase
      .channel('unread-notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <>
      {/* Top bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 20px', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-glow)'
          }}>
            <Rocket size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
            LaunchPad
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              color: pathname === to ? 'var(--accent)' : 'var(--text-secondary)',
              background: pathname === to ? 'var(--accent-soft)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <Link to="/notifications" style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.15s',
              color: pathname === '/notifications' ? 'var(--accent)' : 'var(--text-secondary)'
            }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                  borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--background)', padding: '0 4px'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          
          <button onClick={() => navigate('/submit')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            border: 'none', boxShadow: '0 4px 12px var(--accent-glow)',
            transition: 'transform 0.15s'
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={18} />
            <span className="desktop-nav">Submit</span>
          </button>

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none', width: 38, height: 38, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={20} color="var(--text-primary)" /> : <Menu size={20} color="var(--text-primary)" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, top: 64, zIndex: 98,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
            }}
          />
          <div style={{
            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}>
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 'var(--radius-md)',
                fontSize: 16, fontWeight: 700, textDecoration: 'none',
                color: pathname === to ? 'var(--accent)' : 'var(--text-primary)',
                background: pathname === to ? 'var(--accent-soft)' : 'transparent',
              }}>
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
