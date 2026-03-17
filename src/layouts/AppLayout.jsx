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

      {/* Ambient background — layered gradient overlay for visual depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-200 to-base-300/40" />
        <div
          className="ambient-blob top-[-8%] right-[-8%] w-[min(650px,85vw)] h-[min(650px,85vw)] opacity-[0.04]"
          style={{ background: 'var(--color-primary)' }}
        />
        <div
          className="ambient-blob bottom-[-8%] left-[-8%] w-[min(500px,65vw)] h-[min(500px,65vw)] opacity-[0.03]"
          style={{ background: 'var(--color-secondary, var(--color-primary))' }}
        />
        <div
          className="ambient-blob top-[40%] left-[40%] w-[min(300px,40vw)] h-[min(300px,40vw)] opacity-[0.015]"
          style={{ background: 'var(--color-accent, var(--color-primary))' }}
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
