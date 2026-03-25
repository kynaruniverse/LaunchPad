import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { productsService } from '../services/products'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS } from '../theme'

const CATS = Object.keys(CATEGORY_COLORS)

const isValidUrl = (str) => {
  if (!str.trim()) return true // optional fields
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const Field = ({ label, required, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>}
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

const inputErrorStyle = {
  ...inputStyle,
  border: '1px solid var(--error)',
}

export const SubmitPage = () => {
  const [form, setForm] = useState({
    title: '', tagline: '', description: '',
    category: '', tags: '', websiteUrl: '', mediaUrl: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.tagline.trim()) e.tagline = 'Tagline is required'
    if (!form.category) e.category = 'Category is required'
    if (form.websiteUrl && !isValidUrl(form.websiteUrl)) {
      e.websiteUrl = 'Enter a valid URL (https://...)'
    }
    if (form.mediaUrl && !isValidUrl(form.mediaUrl)) {
      e.mediaUrl = 'Enter a valid image URL (https://...)'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to submit'); return }

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const first = Object.values(errs)[0]
      toast.error(first)
      return
    }

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
    } catch (err) {
      toast.error(err.message || 'Submission failed. Try again.')
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
            background: 'var(--surface)', border: `1px solid rgba(255,87,34,0.25)`,
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-md)',
              background: form.category ? `${CATEGORY_COLORS[form.category]}20` : 'var(--accent-soft)',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🚀</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.title || 'Product Name'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <input
              style={errors.title ? inputErrorStyle : inputStyle}
              placeholder="e.g. SuperTool"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={60}
            />
            {errors.title && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 2 }}>{errors.title}</p>}
          </Field>

          <Field label="Tagline" required>
            <input
              style={errors.tagline ? inputErrorStyle : inputStyle}
              placeholder="One line that explains what it does"
              value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
              maxLength={100}
            />
            {errors.tagline && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 2 }}>{errors.tagline}</p>}
          </Field>

          <Field label="Description">
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
              placeholder="Describe your product..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          <Field label="Category" required>
            {errors.category && <p style={{ fontSize: 11, color: 'var(--error)' }}>{errors.category}</p>}
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

          <Field label="Tags" hint="Comma separated, e.g: ai, productivity, saas">
            <input
              style={inputStyle}
              placeholder="ai, productivity, saas"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </Field>

          <Field label="Website URL">
            <input
              style={errors.websiteUrl ? inputErrorStyle : inputStyle}
              placeholder="https://yourproduct.com"
              value={form.websiteUrl}
              onChange={e => set('websiteUrl', e.target.value)}
              type="url"
            />
            {errors.websiteUrl && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 2 }}>{errors.websiteUrl}</p>}
          </Field>

          <Field label="Screenshot / Image URL" hint="Direct link to an image (png, jpg, webp)">
            <input
              style={errors.mediaUrl ? inputErrorStyle : inputStyle}
              placeholder="https://example.com/screenshot.png"
              value={form.mediaUrl}
              onChange={e => set('mediaUrl', e.target.value)}
              type="url"
            />
            {errors.mediaUrl && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 2 }}>{errors.mediaUrl}</p>}
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
