import { useState, useCallback, useRef } from 'react';

const VALID_TYPES = new Set(['info', 'success', 'error', 'warning']);
const MAX_TOASTS = 5;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    try {
      const id = ++toastIdRef.current;
      const safeType = VALID_TYPES.has(type) ? type : 'info';
      const safeDuration = typeof duration === 'number' && duration >= 0 ? duration : 3000;
      const safeMessage = message != null ? String(message) : 'Notification';
      setToasts((prev) => {
        const next = [...prev, { id, message: safeMessage, type: safeType, duration: safeDuration }];
        // Prevent unbounded accumulation — drop oldest toasts beyond the limit
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
      return id;
    } catch (err) {
      console.warn('[useToast] Failed to add toast:', err);
      return -1;
    }
  }, []);

  const removeToast = useCallback((id) => {
    try {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    } catch (err) {
      console.warn('[useToast] Failed to remove toast:', err);
    }
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}
