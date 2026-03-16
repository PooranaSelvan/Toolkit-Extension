import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import ScrollToTop from '../components/ScrollToTop';
import PageProgress from '../components/PageProgress';

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)' },
};

const pageTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1],
  duration: 0.35,
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-base-200 relative">
      {/* Top page progress bar */}
      <PageProgress />

      {/* Skip to main content */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-200 to-base-300/40" />
        <div
          className="ambient-blob ambient-blob-1 top-[-5%] right-[-5%] w-[600px] h-[600px] opacity-[0.035]"
          style={{ background: 'var(--color-primary)' }}
        />
        <div
          className="ambient-blob ambient-blob-2 bottom-[-5%] left-[-5%] w-[450px] h-[450px] opacity-[0.025]"
          style={{ background: 'var(--color-secondary, var(--color-primary))' }}
        />
        <div
          className="ambient-blob ambient-blob-1 top-[40%] left-[30%] w-[300px] h-[300px] opacity-[0.015]"
          style={{ background: 'var(--color-accent, var(--color-primary))', animationDelay: '-7s' }}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[272px] min-h-screen flex flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto" tabIndex={-1}>
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
