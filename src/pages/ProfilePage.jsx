import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, BookMarked, Bell, Pencil, Check, X, ExternalLink, Award, Globe, Twitter, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/auth'

const inputStyle = {
  padding: '12px 14px', width: '100%',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: 14,
  transition: 'border-color 0.15s',
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
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '60px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: 'var(--accent)', 
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px var(--accent-glow)'
        }}>
          <Award size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>LaunchPad</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          {mode === 'signin' ? 'Sign in to your account' : 'Join the indie maker community'}
        </p>
      </div>

      <div style={{
        display: 'flex', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: 6, marginBottom: 32, gap: 6,
      }}>
        {['signin', 'signup'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
            background: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? '#fff' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'signup' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>FULL NAME</label>
              <input style={inputStyle} placeholder="Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>USERNAME</label>
              <input style={inputStyle} placeholder="janedoe" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" />
            </div>
          </>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>EMAIL</label>
          <input style={inputStyle} placeholder="jane@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>PASSWORD</label>
          <input style={inputStyle} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        
        <button type="submit" disabled={loading} style={{
          padding: '14px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          fontWeight: 700, fontSize: 16, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 8px 24px var(--accent-glow)', marginTop: 8,
          transition: 'transform 0.1s'
        }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {opts.textarea ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={opts.placeholder}
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
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
      padding: 24, borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)', border: '1px solid var(--accent)',
      marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 20,
      boxShadow: '0 12px 40px var(--accent-glow)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Pencil size={18} color="var(--accent)" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</h3>
      </div>
      
      {field('Full Name',   fullName,   setFullName,   { placeholder: 'Your name', maxLength: 80 })}
      {field('Bio',         bio,        setBio,        { placeholder: 'What do you build?', textarea: true, maxLength: 200 })}
      {field('Website',     websiteUrl, setWebsiteUrl, { placeholder: 'https://yoursite.com', type: 'url' })}
      {field('Twitter / X handle', twitter,    setTwitter,    { placeholder: 'e.g. janedoe' })}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <X size={16} /> Cancel
        </button>
        <button type="submit" disabled={saving} style={{
          flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
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
    { icon: LayoutDashboard, label: 'Maker Dashboard',  to: '/dashboard', desc: 'Manage your projects and feedback' },
    { icon: BookMarked,      label: 'My Collections',    to: '/collections', desc: 'Saved projects and lists' },
    { icon: Bell,            label: 'Notifications',  to: '/notifications', desc: 'Activity on your products' },
  ]

  const feedbackPoints = displayProfile?.feedback_points || 0

  return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', padding: '40px 0 48px' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '30px', margin: '0 auto',
            background: 'var(--accent-soft)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 800, color: 'var(--accent)',
            boxShadow: '0 8px 32px var(--accent-glow)'
          }}>
            {(displayProfile?.username || user.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{
            position: 'absolute', bottom: -10, right: -10,
            background: 'var(--surface-elevated)', border: '2px solid var(--border)',
            borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <Award size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{feedbackPoints}</span>
          </div>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
          {displayProfile?.username || 'Indie Maker'}
        </h2>

        {displayProfile?.full_name && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
            {displayProfile.full_name}
          </p>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          <Mail size={13} /> {user.email}
        </p>

        {displayProfile?.bio ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>
            {displayProfile.bio}
          </p>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic', marginBottom: 24 }}>
            No bio yet. Tell the community what you build!
          </p>
        )}

        {/* Links */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {displayProfile?.website_url && (
            <a href={displayProfile.website_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Globe size={14} /> Website
            </a>
          )}
          {displayProfile?.twitter && (
            <a href={`https://twitter.com/${displayProfile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1DA1F2'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Twitter size={14} fill="#1DA1F2" color="#1DA1F2" /> @{displayProfile.twitter.replace('@', '')}
            </a>
          )}
        </div>

        {/* Edit button */}
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 'var(--radius-full)',
            background: 'var(--surface-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          >
            <Pencil size={14} /> Edit Profile
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
        border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Settings</h3>
        </div>
        {menuItems.map(({ icon: Icon, label, to, desc }, i) => (
          <button key={to} onClick={() => navigate(to)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '20px',
            background: 'none', border: 'none',
            borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer', transition: 'background 0.12s',
            textAlign: 'left'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '12px',
                background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="var(--accent)" />
              </div>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, display: 'block' }}>{label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</span>
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 20, fontWeight: 300 }}>›</span>
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        color: 'var(--error)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        transition: 'all 0.15s'
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
      >
        <LogOut size={18} /> Sign Out of LaunchPad
      </button>
    </div>
  )
}
