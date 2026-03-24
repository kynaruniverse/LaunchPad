import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = (msg) => showToast(msg, 'success');
  const error = (msg) => showToast(msg, 'error');
  const info = (msg) => showToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(toast => (
          <View key={toast.id} style={[styles.toast, styles[toast.type]]}>
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    padding: 14,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  info: { backgroundColor: theme.colors.surfaceElevated, borderLeftWidth: 3, borderLeftColor: theme.colors.accent },
  success: { backgroundColor: '#0F2A1A', borderLeftWidth: 3, borderLeftColor: theme.colors.success },
  error: { backgroundColor: '#2A0F0F', borderLeftWidth: 3, borderLeftColor: theme.colors.error },
  text: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.sm, fontWeight: theme.fonts.weights.medium },
});
