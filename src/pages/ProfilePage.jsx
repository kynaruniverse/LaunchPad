import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, BookMarked, Bell, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const inputStyle = {
  padding: '12px 14px', width: '100%',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: 14,
}

const AuthForm = () => {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Email and password required'); return }
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        toast.success('Welcome back!')
      } else {
        if (!username) { toast.error('Username required'); setLoading(false); return }
        await signUp(email, password, username, fullName)
        toast.success('Account created! Check your email to confirm.')
      }
    } catch (e) {
      toast.error(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>LaunchPad</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{mode === 'signin' ? 'Welcome back' : 'Join the community'}</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
        padding: 4, marginBottom: 24,
      }}>
        {['signin', 'signup'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
            background: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? '#fff' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <>
            <input style={inputStyle} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <input style={inputStyle} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" />
          </>
        )}
        <input style={inputStyle} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" />
        <input style={inputStyle} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} style={{
          padding: '14px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          fontWeight: 700, fontSize: 15, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 0 20px var(--accent-glow)',
          marginTop: 4,
        }}>
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export const ProfilePage = () => {
  const { user, profile, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try { await signOut(); toast.success('Signed out') }
    catch (e) { toast.error('Failed to sign out') }
  }

  if (!user) return (
    <div className="page"><AuthForm /></div>
  )

  const menuItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', to: '/dashboard' },
    { icon: BookMarked, label: 'Collections', to: '/collections' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
  ]

  return (
    <div className="page">
      {/* Profile header */}
      <div style={{ textAlign: 'center', padding: '32px 0 40px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
          background: 'var(--accent-soft)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: 'var(--accent)',
        }}>
          {(profile?.username || user.email || 'U')[0].toUpperCase()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {profile?.username || 'User'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user.email}</p>
        {profile?.bio && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>{profile.bio}</p>}
      </div>

      {/* Menu */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16,
      }}>
        {menuItems.map(({ icon: Icon, label, to }, i) => (
          <button key={to} onClick={() => navigate(to)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '16px 20px',
            background: 'none', border: 'none',
            borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="var(--accent)" />
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 15 }}>{label}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      <button onClick={handleSignOut} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: 'var(--error)', fontWeight: 600, fontSize: 15, cursor: 'pointer',
      }}>
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  )
}
