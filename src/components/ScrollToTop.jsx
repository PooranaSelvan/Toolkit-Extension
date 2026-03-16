import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop — Two responsibilities:
 * 1. Scrolls to top on route change (UX standard)
 * 2. Shows a floating "back to top" button when scrolled down
 *
 * Uses a ref-cached element lookup to avoid repeated DOM queries,
 * and scrolls both the main content container and window for compatibility.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);
  const mainElRef = useRef(null);

  // Cache the main content element
  const getMainEl = useCallback(() => {
    if (!mainElRef.current) {
      mainElRef.current = document.getElementById('main-content');
    }
    return mainElRef.current;
  }, []);

  // Scroll to top on route change — both main container and window
  useEffect(() => {
    try {
      const mainEl = getMainEl();
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'instant' });
      }
      // Also reset window scroll as a safety net
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      // Silently handle any scroll errors
    }
  }, [pathname, getMainEl]);

  // Track scroll position for floating button
  useEffect(() => {
    const mainEl = getMainEl();
    if (!mainEl) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setShowButton(mainEl.scrollTop > 400);
          ticking = false;
        });
      }
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, [getMainEl]);

  const scrollToTop = useCallback(() => {
    try {
      const mainEl = getMainEl();
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // Fallback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [getMainEl]);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-xl bg-primary/90 text-primary-content flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 backdrop-blur-sm"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
