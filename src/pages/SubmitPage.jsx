import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Users, User } from 'lucide-react'
import { productsService } from '../services/products'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CATEGORY_COLORS, LAUNCH_STATUSES, FEEDBACK_FOCUS_OPTIONS } from '../theme'

const CATS = Object.keys(CATEGORY_COLORS)

const isValidUrl = (str) => {
  if (!str.trim()) return true
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

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

const Field = ({ label, required, hint, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>
    {children}
    {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>}
    {error && <p style={{ fontSize: 11, color: 'var(--error)' }}>{error}</p>}
  </div>
)

export const SubmitPage = () => {
  const [form, setForm] = useState({
    title: '', tagline: '', description: '',
    category: '', tags: '', websiteUrl: '', mediaUrl: '',
    launchStatus: 'live',
    isIndie: true,
    teamSize: '',
    feedbackFocus: [],
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

  const toggleFeedbackFocus = (val) => {
    setForm(f => ({
      ...f,
      feedbackFocus: f.feedbackFocus.includes(val)
        ? f.feedbackFocus.filter(v => v !== val)
        : [...f.feedbackFocus, val],
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())    e.title    = 'Title is required'
    if (!form.tagline.trim())  e.tagline  = 'Tagline is required'
    if (!form.category)        e.category = 'Please pick a category'
    if (!form.launchStatus)    e.launchStatus = 'Please pick a status'
    if (form.websiteUrl && !isValidUrl(form.websiteUrl)) e.websiteUrl = 'Enter a valid URL (https://...)'
    if (form.mediaUrl   && !isValidUrl(form.mediaUrl))   e.mediaUrl   = 'Enter a valid image URL (https://...)'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to submit'); return }

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error(Object.values(errs)[0])
      return
    }

    setSubmitting(true)
    try {
      await productsService.submitProduct({
        userId:        user.id,
        title:         form.title.trim(),
        tagline:       form.tagline.trim(),
        description:   form.description.trim(),
        category:      form.category,
        tags:          form.tags.split(',').map(t => t.trim()).filter(Boolean),
        mediaUrls:     form.mediaUrl.trim() ? [form.mediaUrl.trim()] : [],
        websiteUrl:    form.websiteUrl.trim(),
        launchStatus:  form.launchStatus,
        isIndie:       form.isIndie,
        teamSize:      form.isIndie && form.teamSize ? parseInt(form.teamSize, 10) : null,
        feedbackFocus: form.feedbackFocus,
      })
      toast.success('Product launched! 🚀')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStatus = LAUNCH_STATUSES.find(s => s.value === form.launchStatus)

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Submit a Project 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Ideas, MVPs, betas — all welcome. Be honest about where you are.
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

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
            }}>
              {selectedStatus?.emoji || '🚀'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.title || 'Project Name'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.tagline || 'Short tagline...'}
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {form.category && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: CATEGORY_COLORS[form.category],
                    background: `${CATEGORY_COLORS[form.category]}20`,
                    padding: '2px 8px', borderRadius: 999,
                  }}>{form.category}</span>
                )}
                {selectedStatus && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: selectedStatus.color,
                    background: `${selectedStatus.color}20`,
                    padding: '2px 8px', borderRadius: 999,
                  }}>{selectedStatus.emoji} {selectedStatus.label}</span>
                )}
                {form.isIndie && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: '#06B6D4', background: 'rgba(6,182,212,0.12)',
                    padding: '2px 8px', borderRadius: 999,
                  }}>Solo maker</span>
                )}
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: -14 }}>LIVE PREVIEW</p>

          {/* Basic info */}
          <Field label="Project Name" required error={errors.title}>
            <input style={errors.title ? inputErrorStyle : inputStyle}
              placeholder="e.g. SuperTool" value={form.title}
              onChange={e => set('title', e.target.value)} maxLength={60} />
          </Field>

          <Field label="Tagline" required error={errors.tagline}>
            <input style={errors.tagline ? inputErrorStyle : inputStyle}
              placeholder="One line that explains what it does" value={form.tagline}
              onChange={e => set('tagline', e.target.value)} maxLength={100} />
          </Field>

          <Field label="Description" hint="Tell people what problem you're solving and where you're at">
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
              placeholder="Describe your project..."
              value={form.description}
              onChange={e => set('description', e.target.value)} />
          </Field>

          {/* Status — key differentiator */}
          <Field label="Stage / Status" required error={errors.launchStatus}
            hint="Be honest — rough projects are welcome. This helps people calibrate their feedback.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LAUNCH_STATUSES.map(s => (
                <button key={s.value} type="button" onClick={() => set('launchStatus', s.value)} style={{
                  padding: '9px 16px', borderRadius: 999,
                  background: form.launchStatus === s.value ? `${s.color}20` : 'var(--surface)',
                  border: `1px solid ${form.launchStatus === s.value ? s.color : 'var(--border)'}`,
                  color: form.launchStatus === s.value ? s.color : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
            {form.launchStatus && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {LAUNCH_STATUSES.find(s => s.value === form.launchStatus)?.desc}
              </p>
            )}
          </Field>

          {/* Indie toggle */}
          <Field label="Team" hint="This helps the community understand the context behind your project">
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => set('isIndie', true)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)',
                background: form.isIndie ? 'rgba(6,182,212,0.12)' : 'var(--surface)',
                border: `1px solid ${form.isIndie ? '#06B6D4' : 'var(--border)'}`,
                color: form.isIndie ? '#06B6D4' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <User size={15} /> Solo / Indie
              </button>
              <button type="button" onClick={() => set('isIndie', false)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)',
                background: !form.isIndie ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${!form.isIndie ? 'var(--accent)' : 'var(--border)'}`,
                color: !form.isIndie ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Users size={15} /> Small Team
              </button>
            </div>
            {!form.isIndie && (
              <input style={{ ...inputStyle, marginTop: 8 }}
                type="number" min={2} max={50}
                placeholder="Team size (optional)"
                value={form.teamSize}
                onChange={e => set('teamSize', e.target.value)} />
            )}
          </Field>

          {/* Feedback focus */}
          <Field label="What feedback do you want most?"
            hint="Select all that apply. This gets shown on your product page.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FEEDBACK_FOCUS_OPTIONS.map(opt => {
                const active = form.feedbackFocus.includes(opt.value)
                return (
                  <button key={opt.value} type="button" onClick={() => toggleFeedbackFocus(opt.value)} style={{
                    padding: '7px 14px', borderRadius: 999,
                    background: active ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
                  }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Category */}
          <Field label="Category" required error={errors.category}>
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

          {/* Tags */}
          <Field label="Tags" hint="Comma separated — e.g: ai, productivity, saas">
            <input style={inputStyle}
              placeholder="ai, productivity, saas"
              value={form.tags}
              onChange={e => set('tags', e.target.value)} />
          </Field>

          {/* URLs */}
          <Field label="Website URL" error={errors.websiteUrl}>
            <input style={errors.websiteUrl ? inputErrorStyle : inputStyle}
              placeholder="https://yourproject.com"
              value={form.websiteUrl}
              onChange={e => set('websiteUrl', e.target.value)}
              type="url" />
          </Field>

          <Field label="Screenshot / Image URL" hint="Direct link to an image (png, jpg, webp)" error={errors.mediaUrl}>
            <input style={errors.mediaUrl ? inputErrorStyle : inputStyle}
              placeholder="https://example.com/screenshot.png"
              value={form.mediaUrl}
              onChange={e => set('mediaUrl', e.target.value)}
              type="url" />
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
            {submitting ? 'Launching...' : 'Launch Project'}
          </button>
        </form>
      )}
    </div>
  )
}
