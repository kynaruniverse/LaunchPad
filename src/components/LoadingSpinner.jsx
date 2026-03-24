import React from 'react'

export const LoadingSpinner = ({ fullScreen = false, message = '' }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (fullScreen) return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      {spinner}
    </div>
  )

  return (
    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
      {spinner}
    </div>
  )
}
