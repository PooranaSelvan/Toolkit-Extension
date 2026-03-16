import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronRight, ChevronDown, X, Sparkles, Search, Home, LayoutDashboard } from 'lucide-react';
import { getTools, CATEGORIES, getToolsByCategory, searchTools } from '../utils/toolRegistry';
import { isVsCodeWebview, openExternal } from '../vscodeApi';
import { APP_VERSION } from '../constants/version';

export default function Sidebar({ isOpen, onClose }) {
  const tools = useMemo(() => getTools(), []);
  const toolCount = tools.filter((t) => t.id !== 'settings').length;
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const sidebarSearchRef = useRef(null);

  const sidebarCategories = CATEGORIES.filter((c) => c.id !== 'preferences');

  const getInitialOpen = () => {
    const currentTool = tools.find((t) => t.path === location.pathname);
    const openSet = new Set();
    if (currentTool && currentTool.category !== 'preferences') {
      openSet.add(currentTool.category);
    }
    // Default: open all categories so tools are immediately accessible
    // without requiring users to expand categories first
    if (openSet.size === 0) {
      sidebarCategories.forEach((c) => openSet.add(c.id));
    }
    return openSet;
  };

  const [openCategories, setOpenCategories] = useState(getInitialOpen);

  useEffect(() => {
    const currentTool = tools.find((t) => t.path === location.pathname);
    if (currentTool && currentTool.category !== 'preferences') {
      setOpenCategories((prev) => {
        if (prev.has(currentTool.category)) return prev;
        const next = new Set(prev);
        next.add(currentTool.category);
        return next;
      });
    }
  }, [location.pathname, tools]);

  const toggleCategory = useCallback((categoryId) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleNavClick = useCallback(() => {
    setSidebarSearch('');
    // Only close on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [onClose]);

  // Keyboard shortcuts: Escape closes sidebar, / focuses sidebar search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (sidebarSearch) {
          setSidebarSearch('');
          sidebarSearchRef.current?.blur();
        } else if (isOpen) {
          onClose();
        }
      }
      // "/" key focuses sidebar search when not already typing in an input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select' && !document.activeElement?.isContentEditable) {
          e.preventDefault();
          sidebarSearchRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sidebarSearch]);

  // Prevent body scroll when sidebar is open on mobile.
  // Uses class-based approach for safer cleanup — avoids inline style conflicts.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isNarrow = window.innerWidth < 1024;
    if (isOpen && isNarrow) {
      document.body.classList.add('sidebar-body-lock');
      document.documentElement.classList.add('sidebar-body-lock');
    } else {
      document.body.classList.remove('sidebar-body-lock');
      document.documentElement.classList.remove('sidebar-body-lock');
    }
    return () => {
      document.body.classList.remove('sidebar-body-lock');
      document.documentElement.classList.remove('sidebar-body-lock');
    };
  }, [isOpen]);

  // Sidebar quick search results
  const sidebarResults = sidebarSearch.trim()
    ? searchTools(sidebarSearch).slice(0, 6)
    : [];

  return (
    <aside
      id="sidebar-nav"
      role="navigation"
      aria-label="Main navigation"
      className={`fixed left-0 top-0 bottom-0 w-[272px] bg-base-100 border-r border-base-300/40 flex flex-col z-40 transition-transform duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* ── Brand ── */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-base-300/40 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden group/logo transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 cursor-pointer brand-logo-ring">
          <Wrench size={20} className="text-primary-content relative z-10 transition-transform duration-300 group-hover/logo:rotate-[-12deg]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 bg-white/0 group-hover/logo:bg-white/5 transition-colors duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[13px] font-extrabold leading-tight tracking-tight">Web</h1>
          <h1 className="text-[13px] font-extrabold leading-tight gradient-text">Toolkit</h1>
        </div>
        <button 
          onClick={onClose} 
          className="btn btn-ghost btn-sm btn-square lg:hidden rounded-xl hover:bg-error/10 hover:text-error transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Sidebar Quick Search ── */}
      <div className="px-3 pt-3 pb-1 shrink-0 relative z-10">
        <div className="relative group/search">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 transition-all duration-200 group-focus-within/search:opacity-60 group-focus-within/search:text-primary" />
          <input
            ref={sidebarSearchRef}
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value.slice(0, 100))}
            placeholder="Quick find..."
            aria-label="Search tools"
            maxLength={100}
            className="input input-sm w-full pl-8 pr-14 rounded-xl bg-base-200/50 border-base-300/30 h-8 text-xs placeholder:text-base-content/30 focus:bg-base-100 focus:shadow-[0_0_0_3px] focus:shadow-primary/10 transition-shadow duration-200"
          />
          {sidebarSearch ? (
            <button 
              onClick={() => setSidebarSearch('')} 
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60 p-0.5"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 kbd-hint pointer-events-none select-none">/</span>
          )}
        </div>

        {/* Quick search results overlay — absolute positioned to float above nav
            without pushing it down or blocking interaction with tool links */}
        <AnimatePresence>
          {sidebarResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-3 right-3 mt-1.5 rounded-xl border border-base-300/40 bg-base-100 shadow-lg overflow-hidden max-h-[280px] overflow-y-auto scrollbar-thin z-50"
              role="listbox"
              aria-label="Search results"
            >
              {sidebarResults.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => { navigate(tool.path); handleNavClick(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-primary/[0.06] transition-colors duration-150 focus:bg-primary/[0.06] outline-none"
                    role="option"
                  >
                    <Icon size={14} className="text-primary opacity-60 shrink-0" />
                    <span className="text-xs font-medium truncate">{tool.name}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results feedback */}
        {sidebarSearch.trim() && sidebarResults.length === 0 && (
          <div className="mt-1.5 px-3 py-3 text-center">
            <p className="text-[11px] opacity-30">No tools found</p>
          </div>
        )}
      </div>

{/* Navigation */}
      <nav ref={navRef} className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin">
        {/* Home & Dashboard quick links */}
        <div className="space-y-0.5 mb-2 pb-2">
          <NavLink
            to="/"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group/link relative flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary/[0.08] text-primary font-semibold shadow-sm'
                  : 'text-base-content/55 hover:text-base-content/80 hover:bg-base-200/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 shrink-0 ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-base-content/40 group-hover/link:bg-base-200/80 group-hover/link:text-base-content/60'
                }`}>
                  <Home size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className="flex-1 truncate">Home</span>
                <ChevronRight size={13} strokeWidth={2} className={`shrink-0 transition-opacity duration-200 ${
                  isActive ? 'opacity-40' : 'opacity-0 group-hover/link:opacity-30'
                }`} />
              </>
            )}
          </NavLink>
          <NavLink
            to="/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group/link relative flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary/[0.08] text-primary font-semibold shadow-sm'
                  : 'text-base-content/55 hover:text-base-content/80 hover:bg-base-200/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 shrink-0 ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-base-content/40 group-hover/link:bg-base-200/80 group-hover/link:text-base-content/60'
                }`}>
                  <LayoutDashboard size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className="flex-1 truncate">Dashboard</span>
                <ChevronRight size={13} strokeWidth={2} className={`shrink-0 transition-opacity duration-200 ${
                  isActive ? 'opacity-40' : 'opacity-0 group-hover/link:opacity-30'
                }`} />
              </>
            )}
          </NavLink>
          <div className="gradient-line mx-3 mt-2" />
        </div>        {sidebarCategories.map((category, catIdx) => {
          const categoryTools = getToolsByCategory(category.id);
          if (categoryTools.length === 0) return null;

          const isExpanded = openCategories.has(category.id);
          const hasActiveTool = categoryTools.some((t) => t.path === location.pathname);

          return (
            <div key={category.id} className={catIdx > 0 ? 'mt-1' : ''}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 group cursor-pointer select-none ${
                  hasActiveTool
                    ? 'text-primary bg-primary/[0.04]'
                    : 'text-base-content/40 hover:text-base-content/60 hover:bg-base-200/50'
                }`}
              >
                <span className="text-sm leading-none">{category.emoji}</span>
                <span className="flex-1 text-left truncate">{category.label}</span>
                <span
                  className={`text-[9px] font-semibold tabular-nums min-w-[18px] h-[18px] flex items-center justify-center rounded-md transition-all duration-200 ${
                    hasActiveTool
                      ? 'bg-primary/10 text-primary scale-105'
                      : 'bg-base-200/80 text-base-content/30 group-hover:bg-base-200 group-hover:text-base-content/40 group-hover:scale-105'
                  }`}
                >
                  {categoryTools.length}
                </span>
                <ChevronDown
                  size={12}
                  className={`shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  } ${hasActiveTool ? 'opacity-40' : 'opacity-25 group-hover:opacity-40'}`}
                />
              </button>

              {/* Category tools — simple show/hide to avoid animation-related
                  click-blocking and reduce per-frame layout recalculations */}
              {isExpanded && (
                <div className="space-y-0.5 pt-1 pb-2 pl-1">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <NavLink
                        key={tool.id}
                        to={tool.path}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `group/link relative flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-colors duration-200 ${
                            isActive
                              ? 'bg-primary/[0.08] text-primary font-semibold shadow-sm'
                              : 'text-base-content/55 hover:text-base-content/80 hover:bg-base-200/60'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                            )}
                            <div
                              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 shrink-0 ${
                                isActive
                                  ? 'bg-primary/12 text-primary'
                                  : 'text-base-content/40 group-hover/link:bg-base-200/80 group-hover/link:text-base-content/60'
                              }`}
                            >
                              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                            </div>
                            <span className="flex-1 truncate">{tool.name}</span>
                            <ChevronRight
                              size={13}
                              strokeWidth={2}
                              className={`shrink-0 transition-opacity duration-200 ${
                                isActive ? 'opacity-40' : 'opacity-0 group-hover/link:opacity-30'
                              }`}
                            />
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Settings */}
        <div className="mt-3 pt-3">
          <div className="gradient-line mx-3 mb-3" />
          {getToolsByCategory('preferences').map((tool) => {
            const Icon = tool.icon;
            return (
              <NavLink
                key={tool.id}
                to={tool.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `group/link relative flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary/[0.08] text-primary font-semibold shadow-sm'
                      : 'text-base-content/55 hover:text-base-content/80 hover:bg-base-200/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 shrink-0 ${
                        isActive
                          ? 'bg-primary/12 text-primary'
                          : 'text-base-content/40 group-hover/link:bg-base-200/80 group-hover/link:text-base-content/60'
                      }`}
                    >
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                    <span className="flex-1 truncate">{tool.name}</span>
                    <ChevronRight
                      size={13}
                      strokeWidth={2}
                      className={`shrink-0 transition-opacity duration-200 ${
                        isActive ? 'opacity-40' : 'opacity-0 group-hover/link:opacity-30'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-base-300/40 shrink-0 space-y-2.5 bg-base-100/50">
        {/* Author */}
        <a
          href="https://github.com/PooranaSelvan"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (isVsCodeWebview()) { e.preventDefault(); openExternal('https://github.com/PooranaSelvan'); } }}
          className="flex items-center gap-2.5 px-1.5 py-1.5 -mx-1 rounded-xl hover:bg-base-200/60 transition-all duration-200 group/author"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-base-300/50 shrink-0 group-hover/author:ring-primary/30 transition-all duration-200 shadow-sm bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            <img
              src="https://avatars.githubusercontent.com/u/130943602?v=4&s=56"
              alt="Poorana Selvan"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width={28}
              height={28}
              onError={(e) => {
                try {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                } catch { /* safe */ }
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-base-content/60 group-hover/author:text-primary truncate leading-tight transition-colors duration-200">
              Poorana Selvan
            </p>
            <p className="text-[10px] text-base-content/25 leading-tight">
              @PooranaSelvan
            </p>
          </div>
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-base-content/15 group-hover/author:text-primary/50 transition-colors duration-200 shrink-0" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>

        {/* Version & tool count */}
        <div className="flex items-center justify-end px-1 gap-1.5">
          <div className="badge badge-ghost badge-xs text-base-content/20 font-mono text-[9px]">v{APP_VERSION}</div>
          <div className="badge badge-primary badge-xs gap-1 font-bold shadow-sm shadow-primary/15">
            <Sparkles size={8} />
            {toolCount}
          </div>
        </div>
      </div>
    </aside>
  );
}
