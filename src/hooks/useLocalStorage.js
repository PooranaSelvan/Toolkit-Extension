import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for persistent state via localStorage.
 * Debounces localStorage writes to prevent blocking the main thread
 * during rapid updates (e.g., code editing keystrokes).
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback value if nothing in storage
 * @returns {[*, Function, Function]} [storedValue, setValue, removeValue]
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Error reading key "${key}"`, error);
      return initialValue;
    }
  });

  const pendingWriteRef = useRef(null);
  const latestValueRef = useRef(storedValue);

  // Flush any pending write to localStorage on unmount
  useEffect(() => {
    return () => {
      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
        try {
          window.localStorage.setItem(key, JSON.stringify(latestValueRef.current));
        } catch { /* ignore */ }
      }
    };
  }, [key]);

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          latestValueRef.current = valueToStore;

          // Debounce the localStorage write to avoid blocking main thread
          // during rapid updates (typing, bracket auto-close, etc.)
          if (pendingWriteRef.current) {
            clearTimeout(pendingWriteRef.current);
          }
          pendingWriteRef.current = setTimeout(() => {
            pendingWriteRef.current = null;
            try {
              window.localStorage.setItem(key, JSON.stringify(latestValueRef.current));
            } catch { /* ignore quota errors */ }
          }, 500);

          return valueToStore;
        });
      } catch (error) {
        console.warn(`useLocalStorage: Error setting key "${key}"`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
        pendingWriteRef.current = null;
      }
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      latestValueRef.current = initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Error removing key "${key}"`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
