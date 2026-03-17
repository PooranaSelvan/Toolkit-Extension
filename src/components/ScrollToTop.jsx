import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop — pure CSS transitions, no framer-motion.
 * 1. Scrolls to top on route change
 * 2. Shows a floating "back to top" button when scrolled down
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);
  const mainElRef = useRef(null);

  const getMainEl = useCallback(() => {
    if (!mainElRef.current) {
      mainElRef.current = document.getElementById('main-content');
    }
    return mainElRef.current;
  }, []);

  useEffect(() => {
    try {
      const mainEl = getMainEl();
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {}
  }, [pathname, getMainEl]);

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
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [getMainEl]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-xl bg-primary/90 text-primary-content flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary active:scale-95 transition-all duration-200 ${
        showButton ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2 pointer-events-none'
      }`}
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
