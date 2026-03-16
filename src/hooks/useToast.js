import { useState, useCallback } from 'react';

let toastId = 0;

const VALID_TYPES = new Set(['info', 'success', 'error', 'warning']);

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    try {
      const id = ++toastId;
      const safeType = VALID_TYPES.has(type) ? type : 'info';
      const safeDuration = typeof duration === 'number' && duration >= 0 ? duration : 3000;
      const safeMessage = message != null ? String(message) : 'Notification';
      setToasts((prev) => [...prev, { id, message: safeMessage, type: safeType, duration: safeDuration }]);
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
