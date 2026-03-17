import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import ScrollToTop from '../components/ScrollToTop';
import PageProgress from '../components/PageProgress';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Minimal page transition — opacity-only for minimal GPU cost.
 * Removed AnimatePresence entirely: it was rendering BOTH old and new pages
 * simultaneously during transitions (mode="sync"), doubling DOM elements
 * and computation. A simple fade-in on mount is sufficient and much cheaper.
 */
const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const pageVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Stable toggle/close callbacks to avoid unnecessary re-renders
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Close sidebar on Escape key (global handler for accessibility)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-base-200 relative overflow-x-hidden">
      {/* Top page progress bar */}
      <PageProgress />

      {/* Skip to main content */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Ambient background — static gradient overlay.
          Previously used 3 animated blobs with will-change: transform and
          continuous CSS animations, but at 1.5–3.5% opacity the movement
          is imperceptible while the GPU cost is significant. */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-200 to-base-300/40" />
        <div
          className="ambient-blob top-[-5%] right-[-5%] w-[min(600px,80vw)] h-[min(600px,80vw)] opacity-[0.035]"
          style={{ background: 'var(--color-primary)' }}
        />
        <div
          className="ambient-blob bottom-[-5%] left-[-5%] w-[min(450px,60vw)] h-[min(450px,60vw)] opacity-[0.025]"
          style={{ background: 'var(--color-secondary, var(--color-primary))' }}
        />
      </div>

      {/* Mobile sidebar overlay — CSS transition, no AnimatePresence overhead */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-label="Close sidebar"
        role="button"
        tabIndex={-1}
      />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div
        className="min-h-screen min-h-[100dvh] flex flex-col transition-[margin] duration-300 ease-out lg:ml-[var(--sidebar-width,272px)]"
      >
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full max-w-full"
          tabIndex={-1}
          role="main"
        >
          <ScrollToTop />
          {/* Simple fade-in on route change — no AnimatePresence.
              AnimatePresence was rendering both old + new pages simultaneously
              during transitions, doubling DOM and causing severe jank. */}
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
            className="w-full max-w-full"
          >
            {/* Per-route error boundary — prevents a single tool crash
                from taking down the entire app shell */}
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
