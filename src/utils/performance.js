/**
 * Performance monitoring utilities
 */

// Debounce function for performance optimization
// Returns a debounced function with a .cancel() method for cleanup in useEffect
export function debounce(func, wait = 300) {
  let timeout;
  function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  executedFunction.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };
  return executedFunction;
}

// Throttle function for performance optimization
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Shared IntersectionObserver singleton for lazy loading images (one observer for all images)
let _sharedImageObserver = null;

function getSharedImageObserver() {
  if (_sharedImageObserver) return _sharedImageObserver;
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;

  _sharedImageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      try {
        if (entry.isIntersecting) {
          const image = entry.target;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.classList.add('loaded');
          }
          _sharedImageObserver.unobserve(image);
        }
      } catch (err) {
        console.warn('[LazyLoad] Error processing intersection entry:', err);
      }
    });
  });

  return _sharedImageObserver;
}

// Lazy load images using a shared observer
export function lazyLoadImage(img) {
  try {
    if (!img) return;
    const observer = getSharedImageObserver();
    if (observer) {
      observer.observe(img);
    } else {
      // Fallback for older browsers without IntersectionObserver
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    }
  } catch (err) {
    console.warn('[LazyLoad] Failed to initialize lazy loading:', err);
    // Fallback: load immediately
    if (img?.dataset?.src) {
      img.src = img.dataset.src;
    }
  }
}

// Request idle callback polyfill — safe for SSR/non-browser environments
export const requestIdleCallback =
  (typeof window !== 'undefined' && window.requestIdleCallback) ||
  function (cb) {
    const start = Date.now();
    return setTimeout(() => {
      try {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
      } catch (err) {
        console.warn('[requestIdleCallback] Callback error:', err);
      }
    }, 1);
  };

export const cancelIdleCallback =
  (typeof window !== 'undefined' && window.cancelIdleCallback) ||
  function (id) {
    clearTimeout(id);
  };

// Measure component render time (dev only)
export function measureRenderTime(componentName, callback) {
  try {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = callback();
      const end = performance.now();
      console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return callback();
  } catch (err) {
    console.error(`[Performance] Error measuring ${componentName}:`, err);
    // Still attempt to run the callback
    try { return callback(); } catch { return undefined; }
  }
}

// Check if user prefers reduced motion
export function prefersReducedMotion() {
  try {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  } catch {
    return false;
  }
}

// Local storage with quota handling
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('[safeLocalStorage] Quota exceeded. Unable to save key:', key);
        // Only remove the *same* key to make room, never delete unrelated data
        try {
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          // Still failing — give up gracefully
        }
      }
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },
};
