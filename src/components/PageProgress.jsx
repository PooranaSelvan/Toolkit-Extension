import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Slim progress bar at the top of the page during route transitions.
 * Mimics NProgress / YouTube-style loading behavior.
 */
export default function PageProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] h-[2.5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full rounded-r-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), color-mix(in oklch, var(--color-primary) 80%, var(--color-secondary, var(--color-primary))))',
              boxShadow: '0 0 10px var(--color-primary), 0 0 5px var(--color-primary)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: '90%' }}
            exit={{ width: '100%', opacity: 0 }}
            transition={{
              width: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              opacity: { delay: 0.2, duration: 0.2 },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
