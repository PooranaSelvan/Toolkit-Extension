import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Slim progress bar at the top — pure CSS animation, no framer-motion.
 * Avoids creating/destroying motion components on every route change.
 */
export default function PageProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] h-[2px] transition-opacity duration-150 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full rounded-r-full"
        style={{
          background: 'var(--color-primary)',
          width: loading ? '90%' : '100%',
          transition: loading ? 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'width 0.1s ease, opacity 0.15s ease',
        }}
      />
    </div>
  );
}
