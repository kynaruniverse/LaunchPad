import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, BookMarked, Bell, Pencil, Check, X, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/auth'

const inputStyle = {
  padding: '12px 14px', width: '100%',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: 14,
}

// ─────────────────────────────────────────
// Auth form (sign in / sign up)
// ─────────────────────────────────────────
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
        <p style={{ color: 'var(--text-secondary)' }}>
          {mode === 'signin' ? 'Welcome back' : 'Join the indie maker community'}
        </p>
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
          boxShadow: '0 0 20px var(--accent-glow)', marginTop: 4,
        }}>
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────
// Inline profile edit form
// ─────────────────────────────────────────
const EditProfileForm = ({ profile, onSaved, onCancel }) => {
  const [fullName,   setFullName]   = useState(profile?.full_name   || '')
  const [bio,        setBio]        = useState(profile?.bio         || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '')
  const [twitter,    setTwitter]    = useState(profile?.twitter     || '')
  const [saving, setSaving] = useState(false)
  const { user, refreshProfile } = useAuth()
  const toast = useToast()

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await authService.updateProfile(user.id, {
        full_name:   fullName.trim() || null,
        bio:         bio.trim()        || null,
        website_url: websiteUrl.trim() || null,
        twitter:     twitter.trim()    || null,
      })
      refreshProfile()
      onSaved(updated)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const field = (label, value, onChange, opts = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      {opts.textarea ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={opts.placeholder}
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          maxLength={opts.maxLength}
        />
      ) : (
        <input
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={opts.placeholder}
          style={inputStyle}
          maxLength={opts.maxLength}
          type={opts.type || 'text'}
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSave} style={{
      padding: 20, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid rgba(255,87,34,0.25)',
      marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</h3>
      {field('Full Name',   fullName,   setFullName,   { placeholder: 'Your name', maxLength: 80 })}
      {field('Bio',         bio,        setBio,        { placeholder: 'What do you build?', textarea: true, maxLength: 200 })}
      {field('Website',     websiteUrl, setWebsiteUrl, { placeholder: 'https://yoursite.com', type: 'url' })}
      {field('Twitter / X', twitter,    setTwitter,    { placeholder: '@handle' })}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <X size={14} /> Cancel
        </button>
        <button type="submit" disabled={saving} style={{
          flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Check size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────
// Main ProfilePage
// ─────────────────────────────────────────
export const ProfilePage = () => {
  const { user, profile, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [localProfile, setLocalProfile] = useState(null)

  const displayProfile = localProfile || profile

  const handleSignOut = async () => {
    try { await signOut(); toast.success('Signed out') }
    catch (e) { toast.error('Failed to sign out') }
  }

  if (!user) return (
    <div className="page"><AuthForm /></div>
  )

  const menuItems = [
    { icon: LayoutDashboard, label: 'My Dashboard',  to: '/dashboard' },
    { icon: BookMarked,      label: 'Collections',    to: '/collections' },
    { icon: Bell,            label: 'Notifications',  to: '/notifications' },
  ]

  const feedbackPoints = displayProfile?.feedback_points || 0

  return (
    <div className="page">
      {/* Avatar + name */}
      <div style={{ textAlign: 'center', padding: '32px 0 28px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
          background: 'var(--accent-soft)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: 'var(--accent)',
        }}>
          {(displayProfile?.username || user.email || 'U')[0].toUpperCase()}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
          {displayProfile?.username || 'User'}
        </h2>

        {displayProfile?.full_name && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 2 }}>
            {displayProfile.full_name}
          </p>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>{user.email}</p>

        {displayProfile?.bio && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, maxWidth: 340, margin: '0 auto 10px' }}>
            {displayProfile.bio}
          </p>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {displayProfile?.website_url && (
            <a href={displayProfile.website_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>
              <ExternalLink size={12} /> Website
            </a>
          )}
          {displayProfile?.twitter && (
            <a href={`https://twitter.com/${displayProfile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}>
              𝕏 {displayProfile.twitter}
            </a>
          )}
        </div>

        {/* Feedback points badge */}
        {feedbackPoints > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            color: '#F59E0B', fontSize: 13, fontWeight: 700, marginBottom: 16,
          }}>
            ⭐ {feedbackPoints} feedback point{feedbackPoints !== 1 ? 's' : ''}
          </div>
        )}

        {/* Edit button */}
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Pencil size={13} /> Edit Profile
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <EditProfileForm
          profile={displayProfile}
          onSaved={(updated) => { setLocalProfile(updated); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Navigation menu */}
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
            cursor: 'pointer', transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
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

      {/* Sign out */}
      <button onClick={handleSignOut} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        color: 'var(--error)', fontWeight: 600, fontSize: 15, cursor: 'pointer',
      }}>
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  )
}
