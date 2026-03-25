import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Users, User, Info, CheckCircle2, Globe, Image as ImageIcon, Tag, Layout, MessageSquare } from 'lucide-react'
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
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 14, width: '100%',
  transition: 'border-color 0.15s',
}

const inputErrorStyle = {
  ...inputStyle,
  border: '1px solid var(--error)',
}

const Field = ({ label, required, hint, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>
    {children}
    {hint && !error && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{hint}</p>}
    {error && <p style={{ fontSize: 12, color: 'var(--error)', fontWeight: 600 }}>{error}</p>}
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
    <div className="page" style={{ maxWidth: 700, margin: '0 auto', padding: '80px 16px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Launch Your Project 🚀
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
          Whether it's a rough idea or a live product, LaunchPad is the place for indie makers to get real feedback.
        </p>
      </div>

      {!user ? (
        <div style={{
          padding: 48, borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Authentication Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Please sign in to share your project with the community.</p>
          <button onClick={() => navigate('/profile')} style={{
            padding: '12px 32px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px var(--accent-glow)'
          }}>Sign In / Sign Up</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Live preview card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Info size={14} />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</span>
            </div>
            <div style={{
              padding: 24, borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)', border: `2px solid var(--accent)`,
              display: 'flex', gap: 20, alignItems: 'center',
              boxShadow: '0 12px 32px var(--accent-glow)'
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px',
                background: form.category ? `${CATEGORY_COLORS[form.category]}20` : 'var(--accent-soft)',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                border: form.category ? `1px solid ${CATEGORY_COLORS[form.category]}40` : '1px solid var(--accent)'
              }}>
                {selectedStatus?.emoji || '🚀'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 20, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {form.title || 'Your Project Name'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {form.tagline || 'Your one-sentence tagline...'}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {form.category && (
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: CATEGORY_COLORS[form.category],
                      background: `${CATEGORY_COLORS[form.category]}15`,
                      padding: '3px 10px', borderRadius: 999, border: `1px solid ${CATEGORY_COLORS[form.category]}30`
                    }}>{form.category}</span>
                  )}
                  {selectedStatus && (
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: selectedStatus.color,
                      background: `${selectedStatus.color}15`,
                      padding: '3px 10px', borderRadius: 999, border: `1px solid ${selectedStatus.color}30`
                    }}>{selectedStatus.emoji} {selectedStatus.label}</span>
                  )}
                  {form.isIndie && (
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: '#06B6D4', background: 'rgba(6,182,212,0.12)',
                      padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(6,182,212,0.3)'
                    }}>SOLO INDIE</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Section: Basic Info */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <Layout size={18} color="var(--accent)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Basic Information</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Project Name" required error={errors.title}>
                  <input style={errors.title ? inputErrorStyle : inputStyle}
                    placeholder="e.g. LaunchPad" value={form.title}
                    onChange={e => set('title', e.target.value)} maxLength={60} />
                </Field>

                <Field label="Category" required error={errors.category}>
                  <select 
                    value={form.category} 
                    onChange={e => set('category', e.target.value)}
                    style={errors.category ? inputErrorStyle : inputStyle}
                  >
                    <option value="">Select a category</option>
                    {CATS.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tagline" required error={errors.tagline} hint="Explain the core value in one sentence.">
                <input style={errors.tagline ? inputErrorStyle : inputStyle}
                  placeholder="The feedback-driven community for indie makers" value={form.tagline}
                  onChange={e => set('tagline', e.target.value)} maxLength={100} />
              </Field>

              <Field label="Description" hint="Tell the story. What problem are you solving? What's the vision?">
                <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                  placeholder="Share more details about your project..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </Field>
            </section>

            {/* Section: Links & Media */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <Globe size={18} color="var(--accent)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Links & Media</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Website URL" error={errors.websiteUrl} hint="Direct link to your project">
                  <input style={errors.websiteUrl ? inputErrorStyle : inputStyle}
                    placeholder="https://..." value={form.websiteUrl}
                    onChange={e => set('websiteUrl', e.target.value)} />
                </Field>

                <Field label="Thumbnail URL" error={errors.mediaUrl} hint="Link to a 16:9 cover image">
                  <input style={errors.mediaUrl ? inputErrorStyle : inputStyle}
                    placeholder="https://.../image.png" value={form.mediaUrl}
                    onChange={e => set('mediaUrl', e.target.value)} />
                </Field>
              </div>

              <Field label="Tags" hint="Separate tags with commas (e.g. react, saas, ai)">
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input style={{ ...inputStyle, paddingLeft: 40 }}
                    placeholder="productivity, developer-tools" value={form.tags}
                    onChange={e => set('tags', e.target.value)} />
                </div>
              </Field>
            </section>

            {/* Section: Context & Feedback */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <MessageSquare size={18} color="var(--accent)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Context & Feedback</h2>
              </div>

              <Field label="Project Stage" required error={errors.launchStatus}
                hint="Be honest about where you are. This helps people calibrate their feedback.">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                  {LAUNCH_STATUSES.map(s => (
                    <button key={s.value} type="button" onClick={() => set('launchStatus', s.value)} style={{
                      padding: '12px', borderRadius: 'var(--radius-md)',
                      background: form.launchStatus === s.value ? `${s.color}15` : 'var(--surface-elevated)',
                      border: `1px solid ${form.launchStatus === s.value ? s.color : 'var(--border)'}`,
                      color: form.launchStatus === s.value ? s.color : 'var(--text-primary)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s'
                    }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Team Setup">
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => set('isIndie', true)} style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                    background: form.isIndie ? 'rgba(6,182,212,0.12)' : 'var(--surface-elevated)',
                    border: `1px solid ${form.isIndie ? '#06B6D4' : 'var(--border)'}`,
                    color: form.isIndie ? '#06B6D4' : 'var(--text-primary)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    <User size={18} /> Solo Indie
                  </button>
                  <button type="button" onClick={() => set('isIndie', false)} style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                    background: !form.isIndie ? 'var(--accent-soft)' : 'var(--surface-elevated)',
                    border: `1px solid ${!form.isIndie ? 'var(--accent)' : 'var(--border)'}`,
                    color: !form.isIndie ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    <Users size={18} /> Small Team
                  </button>
                </div>
                {!form.isIndie && (
                  <div style={{ marginTop: 12 }}>
                    <input style={inputStyle} type="number" placeholder="Team size (e.g. 3)" 
                      value={form.teamSize} onChange={e => set('teamSize', e.target.value)} />
                  </div>
                )}
              </Field>

              <Field label="Feedback Focus" hint="Select the areas where you need the most help right now.">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FEEDBACK_FOCUS_OPTIONS.map(opt => {
                    const active = form.feedbackFocus.includes(opt.value)
                    return (
                      <button key={opt.value} type="button" onClick={() => toggleFeedbackFocus(opt.value)} style={{
                        padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer',
                        background: active ? 'var(--accent)' : 'var(--surface-elevated)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        color: active ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.15s'
                      }}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </section>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={submitting} style={{
            padding: '18px', borderRadius: 'var(--radius-lg)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 800, fontSize: 18, border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 12px 32px var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            marginTop: 20, transition: 'transform 0.1s'
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {submitting ? 'Launching...' : 'Launch Project'}
            <Rocket size={20} />
          </button>
        </form>
      )}
    </div>
  )
}
