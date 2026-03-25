import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const success = useCallback((msg) => showToast(msg, 'success'), [showToast])
  const error = useCallback((msg) => showToast(msg, 'error'), [showToast])
  const info = useCallback((msg) => showToast(msg, 'info'), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div style={{
        position: 'fixed', top: 20, right: 20,
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360, width: 'calc(100vw - 40px)',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            background: t.type === 'success' ? '#0F2A1A' : t.type === 'error' ? '#2A0F0F' : 'var(--surface-elevated)',
            borderLeft: `3px solid ${t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--error)' : 'var(--accent)'}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease',
            pointerEvents: 'auto',
          }}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
