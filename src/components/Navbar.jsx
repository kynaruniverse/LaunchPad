import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Rocket, Home, BookMarked, LayoutDashboard, User, Bell, Plus, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

  return (
    <>
      {/* Top bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        height: 60, display: 'flex', alignItems: 'center',
        padding: '0 20px', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Rocket size={22} color="var(--accent)" fill="var(--accent)" />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
            LaunchPad
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              color: pathname === to ? 'var(--accent)' : 'var(--text-secondary)',
              background: pathname === to ? 'var(--accent-soft)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/notifications" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={16} color="var(--text-secondary)" />
          </Link>
          <button onClick={() => navigate('/submit')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            border: 'none',
          }}>
            <Plus size={16} />
            <span>Submit</span>
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', width: 36, height: 36, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={18} color="var(--text-primary)" /> : <Menu size={18} color="var(--text-primary)" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              color: pathname === to ? 'var(--accent)' : 'var(--text-primary)',
              background: pathname === to ? 'var(--accent-soft)' : 'transparent',
            }}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
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
