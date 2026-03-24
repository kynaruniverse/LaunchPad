import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { productsService } from '../services/products'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS } from '../theme'

const CATS = Object.keys(CATEGORY_COLORS)

const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>
    {children}
  </div>
)

const inputStyle = {
  padding: '12px 14px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 14, width: '100%',
}

export const SubmitPage = () => {
  const [form, setForm] = useState({ title: '', tagline: '', description: '', category: '', tags: '', websiteUrl: '', mediaUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.tagline.trim()) { toast.error('Tagline is required'); return }
    if (!form.category) { toast.error('Category is required'); return }
    if (!user) { toast.error('Sign in to submit'); return }

    setSubmitting(true)
    try {
      await productsService.submitProduct({
        userId: user.id,
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        mediaUrls: form.mediaUrl.trim() ? [form.mediaUrl.trim()] : [],
        websiteUrl: form.websiteUrl.trim(),
      })
      toast.success('Product launched! 🚀')
      navigate('/')
    } catch (e) {
      toast.error('Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Submit a Product 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Share your product with the LaunchPad community
        </p>
      </div>

      {!user ? (
        <div style={{
          padding: 32, borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Sign in to submit a product</p>
          <a href="/profile" style={{
            padding: '10px 24px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>Sign In</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Live preview */}
          <div style={{
            padding: 16, borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)', border: `1px solid var(--accent)40`,
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-md)',
              background: 'var(--accent-soft)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🚀</div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                {form.title || 'Product Name'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {form.tagline || 'Short tagline...'}
              </p>
              {form.category && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: CATEGORY_COLORS[form.category],
                  background: `${CATEGORY_COLORS[form.category]}20`,
                  padding: '2px 8px', borderRadius: 999, marginTop: 4, display: 'inline-block',
                }}>
                  {form.category}
                </span>
              )}
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: -12 }}>LIVE PREVIEW</p>

          <Field label="Product Name" required>
            <input style={inputStyle} placeholder="e.g. SuperTool" value={form.title} onChange={e => set('title', e.target.value)} maxLength={60} />
          </Field>

          <Field label="Tagline" required>
            <input style={inputStyle} placeholder="One line that explains what it does" value={form.tagline} onChange={e => set('tagline', e.target.value)} maxLength={100} />
          </Field>

          <Field label="Description">
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe your product..." value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <Field label="Category" required>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATS.map(cat => (
                <button key={cat} type="button" onClick={() => set('category', cat)} style={{
                  padding: '8px 16px', borderRadius: 999,
                  background: form.category === cat ? 'var(--accent-soft)' : 'var(--surface)',
                  border: `1px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  color: form.category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tags">
            <input style={inputStyle} placeholder="ai, productivity, saas (comma separated)" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </Field>

          <Field label="Website URL">
            <input style={inputStyle} placeholder="https://yourproduct.com" value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} />
          </Field>

          <Field label="Screenshot / Image URL">
            <input style={inputStyle} placeholder="https://example.com/screenshot.png" value={form.mediaUrl} onChange={e => set('mediaUrl', e.target.value)} />
          </Field>

          <button type="submit" disabled={submitting} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px', borderRadius: 'var(--radius-lg)',
            background: 'var(--accent)', color: '#fff',
            fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            border: 'none', boxShadow: '0 0 24px var(--accent-glow)',
          }}>
            <Rocket size={20} fill="#fff" />
            {submitting ? 'Launching...' : 'Launch Product'}
          </button>
        </form>
      )}
    </div>
  )
}
