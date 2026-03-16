import { useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronRight, ChevronDown, X, Sparkles, Search, Home, LayoutDashboard } from 'lucide-react';
import { getTools, CATEGORIES, getToolsByCategory, searchTools } from '../utils/toolRegistry';
import { useTheme } from '../contexts/ThemeContext';
import { isVsCodeWebview, openExternal } from '../vscodeApi';

export default function Sidebar({ isOpen, onClose }) {
  const tools = getTools();
  const { theme, themes } = useTheme();
  const currentTheme = themes.find((t) => t.id === theme);
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
    if (openSet.size === 0 && sidebarCategories.length > 0) {
      openSet.add(sidebarCategories[0].id);
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

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Sidebar quick search results
  const sidebarResults = sidebarSearch.trim()
    ? searchTools(sidebarSearch).slice(0, 6)
    : [];

  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className={`fixed left-0 top-0 bottom-0 w-[272px] bg-base-100/95 backdrop-blur-xl border-r border-base-300/40 flex flex-col z-40 transition-transform duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-lg ${
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
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="relative group/search">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 transition-all duration-200 group-focus-within/search:opacity-60 group-focus-within/search:text-primary" />
          <input
            ref={sidebarSearchRef}
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Quick find..."
            aria-label="Search tools"
            className="input input-sm w-full pl-8 pr-14 rounded-xl bg-base-200/50 border-base-300/30 h-8 text-xs placeholder:text-base-content/30 focus:bg-base-100 focus:shadow-[0_0_0_3px] focus:shadow-primary/10 transition-shadow duration-200"
          />
          {sidebarSearch ? (
            <button 
              onClick={() => setSidebarSearch('')} 
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 kbd-hint pointer-events-none">/</span>
          )}
        </div>

        {/* Quick search results overlay */}
        <AnimatePresence>
          {sidebarResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1.5 rounded-xl border border-base-300/40 bg-base-100 shadow-lg overflow-hidden"
            >
              {sidebarResults.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onClick={() => { navigate(tool.path); handleNavClick(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/[0.06] transition-colors duration-150"
                  >
                    <Icon size={14} className="text-primary opacity-60 shrink-0" />
                    <span className="text-xs font-medium truncate">{tool.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
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

              {/* Category tools with animated expand/collapse */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 pt-1 pb-2 pl-1">
                      {categoryTools.map((tool, toolIdx) => {
                        const Icon = tool.icon;
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: toolIdx * 0.03, duration: 0.2 }}
                          >
                            <NavLink
                              to={tool.path}
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                `group/link relative flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-primary/[0.08] text-primary font-semibold shadow-sm'
                                    : 'text-base-content/55 hover:text-base-content/80 hover:bg-base-200/60'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  {isActive && (
                                    <motion.div
                                      layoutId="sidebar-active-bar"
                                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                  )}
                                  <div
                                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 shrink-0 ${
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
                                    className={`shrink-0 transition-all duration-200 ${
                                      isActive ? 'opacity-40' : 'opacity-0 group-hover/link:opacity-30 group-hover/link:translate-x-0.5'
                                    }`}
                                  />
                                </>
                              )}
                            </NavLink>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
          <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-base-300/50 shrink-0 group-hover/author:ring-primary/30 transition-all duration-200 shadow-sm">
            <img
              src="https://avatars.githubusercontent.com/u/130943602?v=4"
              alt="Poorana Selvan"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=PS&size=28&background=2D79FF&color=fff&bold=true&font-size=0.45';
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
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px]">{currentTheme?.emoji}</span>
            <p className="text-[10px] text-base-content/20 font-medium truncate">
              {currentTheme?.name || theme}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="badge badge-ghost badge-xs text-base-content/20 font-mono text-[9px]">v4.0</div>
            <motion.div
              key={toolCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="badge badge-primary badge-xs gap-1 font-bold shadow-sm shadow-primary/15"
            >
              <Sparkles size={8} />
              {toolCount}
            </motion.div>
          </div>
        </div>
      </div>
    </aside>
  );
}
