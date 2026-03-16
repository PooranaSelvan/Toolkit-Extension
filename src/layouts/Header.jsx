import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Menu, Home, ChevronRight, LayoutDashboard, X } from 'lucide-react';
import { getTools, CATEGORIES } from '../utils/toolRegistry';
import { useTheme } from '../contexts/ThemeContext';
import { isVsCodeWebview } from '../vscodeApi';

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const tools = getTools();
  const currentTool = tools.find((t) => t.path === location.pathname);
  const { theme, setTheme, themes } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const quickThemes = ['toolbox', 'toolbox-dark', 'light', 'dark', 'dracula', 'nord', 'cyberpunk', 'coffee'];
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const toolCategory = currentTool ? CATEGORIES.find(c => c.id === currentTool.category) : null;

  return (
    <motion.header
      role="banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-14 sm:h-16 bg-base-100/80 backdrop-blur-2xl border-b border-base-300/25 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(0,0,0,0.02)] relative"
    >
      {/* Animated gradient accent line at bottom */}
      <div className="header-accent-line" />

      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle with morphing animation */}
        <button 
          onClick={() => { onMenuToggle(); setMenuOpen(!menuOpen); }} 
          className="btn btn-ghost btn-sm btn-square lg:hidden shrink-0 rounded-xl"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`transition-all duration-300 ease-spring ${menuOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </span>
        </button>

        {/* Breadcrumb / Page indicator */}
        {currentTool ? (
          <motion.div 
            className="flex items-center gap-2 min-w-0"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link 
              to="/" 
              className="btn btn-ghost btn-xs btn-square rounded-lg opacity-35 hover:opacity-100 hover:bg-primary/10 shrink-0 hidden sm:flex transition-all duration-200"
              aria-label="Go to homepage"
            >
              <Home size={14} />
            </Link>
            <ChevronRight size={12} className="text-base-content/15 hidden sm:block shrink-0" />
            {toolCategory && (
              <>
                <span className="text-[11px] font-medium text-base-content/30 hidden md:inline shrink-0">{toolCategory.emoji} {toolCategory.label}</span>
                <ChevronRight size={12} className="text-base-content/15 hidden md:block shrink-0" />
              </>
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center text-primary shrink-0 shadow-sm transition-all duration-300 hover:bg-primary/[0.12] hover:scale-105">
                <currentTool.icon size={15} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate leading-tight">{currentTool.name}</h2>
                <p className="text-[10px] opacity-35 truncate hidden sm:block leading-tight mt-0.5">{currentTool.description}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-105">
              {isDashboard ? (
                <LayoutDashboard size={15} className="text-primary" />
              ) : (
                <Sparkles size={15} className="text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                {isHome ? 'Home' : isDashboard ? 'Dashboard' : 'Developer Toolbox'}
              </h2>
              <p className="text-[10px] opacity-35 hidden sm:block leading-tight mt-0.5">
                {isHome
                  ? 'Your all-in-one developer toolkit'
                  : isDashboard
                  ? `${tools.filter(t => t.id !== 'settings').length} tools available`
                  : 'Developer Toolbox'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Dashboard link (visible on homepage) */}
        {isHome && (
          <Link
            to="/dashboard"
            className="btn btn-ghost btn-sm gap-2.5 rounded-xl hover:bg-primary/8 transition-all duration-200 border border-transparent hover:border-base-300/40 hidden sm:inline-flex"
          >
            <LayoutDashboard size={14} className="opacity-60" />
            <span className="text-xs font-semibold">Dashboard</span>
          </Link>
        )}

        {/* Theme switcher */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="btn btn-ghost btn-sm gap-2 rounded-xl hover:bg-primary/8 transition-all duration-200 border border-transparent hover:border-base-300/40"
          >
            <Palette size={14} className="opacity-60" />
            <span className="text-xs font-semibold hidden sm:inline">
              {themes.find(t => t.id === theme)?.emoji} Theme
            </span>
          </button>
          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed right-4 sm:right-6 lg:right-8 mt-2 z-50 p-4 shadow-2xl bg-base-100/98 backdrop-blur-2xl rounded-2xl border border-base-300/30 w-64 origin-top-right"
                >
                  <p className="text-[10px] font-bold opacity-35 uppercase tracking-[0.1em] mb-3 px-0.5">Quick Switch</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickThemes.map((t) => {
                      const themeData = themes.find((th) => th.id === t);
                      if (!themeData) return null;
                      return (
                        <button
                          key={t}
                          onClick={() => { setTheme(t); setThemeOpen(false); }}
                          className={`btn btn-xs justify-start gap-2 rounded-lg transition-all duration-200 group/theme ${
                            theme === t ? 'btn-primary shadow-md shadow-primary/25' : 'btn-ghost hover:bg-base-200/80'
                          }`}
                        >
                          <span className="group-hover/theme:scale-110 transition-transform duration-200">{themeData.emoji}</span>
                          <span className="truncate">{themeData.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="divider my-2.5 text-xs opacity-20">or</div>
                  <Link to="/settings" onClick={() => setThemeOpen(false)} className="btn btn-ghost btn-sm btn-block justify-start gap-2 text-primary rounded-xl hover:bg-primary/8 font-semibold">
                    <Palette size={14} />
                    All {themes.length} themes →
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        
      </div>
    </motion.header>
  );
}
