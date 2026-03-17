import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Menu, Home, ChevronRight, LayoutDashboard, X, ArrowRight } from 'lucide-react';
import { getTools, CATEGORIES } from '../utils/toolRegistry';

export default function Header({ onMenuToggle, isSidebarOpen = false }) {
  const location = useLocation();
  const tools = useMemo(() => getTools(), []);
  const currentTool = useMemo(() => tools.find((t) => t.path === location.pathname), [tools, location.pathname]);

  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isSettings = location.pathname === '/settings';
  const toolCategory = currentTool ? CATEGORIES.find(c => c.id === currentTool.category) : null;

  const pageTitle = isHome ? 'Home' : isDashboard ? 'Dashboard' : isSettings ? 'Settings' : 'Developer Toolbox';
  const pageSubtitle = isHome
    ? 'Your all-in-one developer toolkit'
    : isDashboard
    ? `${tools.filter(t => t.id !== 'settings').length} tools available`
    : isSettings
    ? 'Manage your data and view app info'
    : 'Developer Toolbox';

  const ToolIcon = currentTool?.icon;

  return (
    <header
      role="banner"
      className="h-14 sm:h-16 bg-base-100/80 backdrop-blur-xl border-b border-base-300/20 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.03)] relative shrink-0 w-full max-w-full"
    >
      {/* Bottom accent line */}
      <div className="header-accent-line" />

      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="btn btn-ghost btn-sm btn-square lg:hidden shrink-0 rounded-xl hover:bg-primary/8"
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar-nav"
        >
          <span className={`transition-all duration-300 ease-spring ${isSidebarOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </span>
        </button>

        {/* Breadcrumb / Page indicator */}
        {currentTool ? (
          <motion.div
            className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link
              to="/"
              className="btn btn-ghost btn-xs btn-square rounded-lg opacity-45 hover:opacity-100 hover:bg-primary/10 shrink-0 hidden sm:flex transition-all duration-200"
              aria-label="Go to homepage"
            >
              <Home size={14} />
            </Link>
            <ChevronRight size={11} className="text-base-content/25 hidden sm:block shrink-0" aria-hidden="true" />
            {toolCategory && (
              <>
                <Link
                  to={`/dashboard?category=${toolCategory.id}`}
                  className="text-[11px] font-medium text-base-content/50 hidden lg:inline-flex items-center gap-1.5 shrink-0 truncate max-w-[140px] hover:text-primary/70 transition-colors duration-200"
                >
                  {toolCategory.icon && (() => { const CatIcon = toolCategory.icon; return <CatIcon size={11} strokeWidth={2} className="shrink-0" />; })()}
                  {toolCategory.label}
                </Link>
                <ChevronRight size={11} className="text-base-content/25 hidden lg:block shrink-0" aria-hidden="true" />
              </>
            )}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-primary/[0.1] to-primary/[0.05] flex items-center justify-center text-primary shrink-0 shadow-sm ring-1 ring-primary/10">
                {ToolIcon ? <ToolIcon size={15} strokeWidth={2} /> : <Sparkles size={15} />}
              </div>
              <div className="min-w-0 overflow-hidden">
                <h2 className="text-xs sm:text-sm font-bold truncate leading-tight">{currentTool.name}</h2>
                <p className="text-[10px] opacity-45 truncate hidden sm:block leading-tight mt-0.5">{currentTool.description}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/8 flex items-center justify-center shadow-sm shrink-0 ring-1 ring-primary/8">
              {isDashboard ? (
                <LayoutDashboard size={15} className="text-primary" />
              ) : (
                <Sparkles size={15} className="text-primary" />
              )}
            </div>
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-xs sm:text-sm font-bold leading-tight truncate">{pageTitle}</h2>
              <p className="text-[10px] opacity-45 hidden sm:block leading-tight mt-0.5 truncate">{pageSubtitle}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-2">
        {isHome && (
          <Link
            to="/dashboard"
            className="btn btn-sm gap-2 rounded-xl bg-primary/[0.06] hover:bg-primary/[0.12] border border-primary/15 hover:border-primary/25 text-primary transition-all duration-200 hidden sm:inline-flex shadow-sm hover:shadow-md hover:shadow-primary/8"
          >
            <LayoutDashboard size={14} />
            <span className="text-xs font-semibold">Dashboard</span>
            <ArrowRight size={12} className="opacity-40" />
          </Link>
        )}
      </div>
    </header>
  );
}
