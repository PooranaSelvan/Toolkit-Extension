import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Wrench, Zap, Shield, Clock, Sparkles,
  Search, X, Command, Heart, TrendingUp,
} from 'lucide-react';
import { getTools, CATEGORIES, getToolsByCategory, searchTools } from '../utils/toolRegistry';
import SEO from '../components/SEO';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const RECENT_TOOLS_KEY = 'devtoolbox-recent-tools';

function getRecentTools() {
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const tools = useMemo(() => getTools().filter((t) => t.id !== 'settings'), []);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const recentToolIds = useMemo(() => getRecentTools(), []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.some(c => c.id === cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setQuery('');
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filteredTools = useMemo(() => {
    let result = tools;
    if (query.trim()) {
      result = searchTools(query);
    }
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }
    return result;
  }, [tools, query, selectedCategory]);

  const displayCategories = CATEGORIES.filter((c) => c.id !== 'preferences');

  const recentTools = useMemo(() => {
    return recentToolIds
      .map(id => tools.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [recentToolIds, tools]);

  return (
    <>
      <SEO 
        title="Dashboard - WebToolkit"
        description={`Browse ${tools.length} free, fast, and privacy-first developer utilities — all running client-side.`}
        keywords="developer dashboard, tool collection, utilities, web development tools"
      />
      <div className="max-w-6xl mx-auto" role="main">
        {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center mb-12 pt-4 pb-8"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-[0.04] blur-3xl"
            style={{ background: 'var(--color-primary)' }}
            animate={{ x: [0, 15, -10, 0], y: [0, -10, 8, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-8 right-1/4 w-56 h-56 rounded-full opacity-[0.03] blur-3xl"
            style={{ background: 'var(--color-secondary, var(--color-primary))' }}
            animate={{ x: [0, -12, 15, 0], y: [0, 8, -12, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-[-8px] rounded-[24px] bg-primary/8 animate-glow-pulse blur-lg" />
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/25 relative overflow-hidden group/logo cursor-pointer transition-transform duration-300 hover:scale-105">
            <Wrench size={36} className="text-primary-content relative z-10 transition-transform duration-300 group-hover/logo:rotate-[-8deg]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shadow-md ring-2 ring-base-200">
            <Sparkles size={14} className="text-secondary-content" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Developer <span className="gradient-text-animated">Toolbox</span>
        </h1>
        <p className="max-w-lg mx-auto text-sm sm:text-base opacity-50 leading-relaxed">
          {tools.length} free, fast, and privacy-first developer utilities — all running client-side.
        </p>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className={`relative max-w-xl mx-auto transition-all duration-300 ${searchFocused ? 'scale-[1.01]' : 'scale-100'}`}>
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${searchFocused ? 'text-primary opacity-70 scale-105' : 'opacity-30'}`} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search tools... (e.g. JSON, color, API, hash)"
            aria-label="Search all tools"
            className="input w-full pl-11 pr-24 h-12 text-sm rounded-2xl shadow-sm border-base-300/40 bg-base-100 focus:shadow-lg focus:shadow-primary/10 focus:border-primary/30 transition-all duration-300"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="btn btn-ghost btn-xs btn-circle"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="kbd kbd-xs opacity-30 hidden sm:inline-flex gap-0.5">
              <Command size={10} />K
            </kbd>
          </div>
        </div>
      </motion.div>

      {/* ── Feature Highlights ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10"
      >
        {[
          { icon: Zap, label: 'Lightning Fast', desc: 'Instant results, zero latency', color: 'text-warning', bg: 'bg-warning/10', border: 'hover:border-warning/30' },
          { icon: Shield, label: 'Privacy First', desc: 'Everything runs client-side', color: 'text-success', bg: 'bg-success/10', border: 'hover:border-success/30' },
          { icon: Clock, label: 'Save Time', desc: 'Automate repetitive tasks', color: 'text-info', bg: 'bg-info/10', border: 'hover:border-info/30' },
        ].map(({ icon: Icon, label, desc, color, bg, border }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-2xl border border-base-300/40 bg-base-100/80 p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-300 group ${border} hover:-translate-y-1 hover:shadow-md cursor-default`}
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-base-content/45 mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Recently Used Tools ── */}
      {recentTools.length > 0 && !query && selectedCategory === 'all' && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-primary opacity-60" />
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-40">Recently Used</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {recentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex items-center gap-2.5 p-3 rounded-xl border border-base-300/40 bg-base-100/60 hover:border-primary/25 hover:bg-primary/[0.04] transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/12 transition-colors duration-200">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors duration-200">{tool.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Filter Pills ── */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 -mx-1 px-1 overflow-x-auto pb-2 sm:pb-0 sm:overflow-visible scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`btn btn-sm rounded-xl gap-2 transition-all duration-200 ${
            selectedCategory === 'all' ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost border border-base-300/50 hover:border-primary/30'
          }`}
        >
          <Sparkles size={13} />
          All Tools
          <span className={`badge badge-xs ${selectedCategory === 'all' ? 'bg-primary-content/20 text-primary-content border-0' : 'badge-ghost'}`}>
            {tools.length}
          </span>
        </button>
        {displayCategories.map((cat) => {
          const count = getToolsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm rounded-xl gap-1.5 sm:gap-2 transition-all duration-200 shrink-0 ${
                selectedCategory === cat.id ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost border border-base-300/50 hover:border-primary/30'
              }`}
            >
              <span className="text-xs">{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden text-[11px]">{cat.label.split(' ')[0]}</span>
              <span className={`badge badge-xs ${selectedCategory === cat.id ? 'bg-primary-content/20 text-primary-content border-0' : 'badge-ghost'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tool Grid ── */}
      {filteredTools.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${query}-${selectedCategory}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const category = CATEGORIES.find((c) => c.id === tool.category);
            return (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link
                  to={tool.path}
                  className="group block h-full"
                  onClick={() => {
                    try {
                      const recent = getRecentTools().filter(id => id !== tool.id);
                      recent.unshift(tool.id);
                      localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recent.slice(0, 8)));
                    } catch {}
                  }}
                >
                  <div className="h-full rounded-2xl border border-base-300/40 bg-base-100 p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.08] hover:-translate-y-2 card-shine gradient-border-hover relative overflow-hidden">
                    {/* Subtle corner gradient on hover */}
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                         style={{ background: 'radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--color-primary) 6%, transparent), transparent 70%)' }} />
                    <div className="flex items-start gap-3.5 relative">
                      <div className="w-12 h-12 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0 text-primary transition-all duration-300 group-hover:bg-primary/[0.12] group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10 group-hover:rotate-[-3deg]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-bold group-hover:text-primary transition-colors duration-200 truncate">
                            {tool.name}
                          </h3>
                          <ArrowRight
                            size={14}
                            strokeWidth={2.5}
                            className="shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-1 text-primary"
                          />
                        </div>
                        <p className="text-xs text-base-content/50 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                        {category && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="badge badge-ghost badge-xs gap-1 text-base-content/35 font-medium">
                              {category.emoji} {category.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center py-24"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-base-200/80 flex items-center justify-center mx-auto mb-5 relative"
          >
            <Search size={28} className="opacity-20" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center">
              <X size={10} className="text-warning" />
            </div>
          </motion.div>
          <p className="text-base font-semibold opacity-50 mb-1">No tools found for "{query}"</p>
          <p className="text-sm opacity-30 mb-6">Try a different search term or browse categories</p>
          <button onClick={() => { setQuery(''); setSelectedCategory('all'); }} className="btn btn-sm btn-primary btn-outline rounded-xl gap-2.5">
            <Sparkles size={13} />
            Show all tools
          </button>
        </motion.div>
      )}

      {/* ── Footer ── */}
      <div className="mt-20 mb-6">
        <div className="gradient-line mb-10" />

        <div className="flex flex-col items-center gap-5">
          <a
            href="https://github.com/PooranaSelvan"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-base-300/40 bg-base-100/80 hover:border-primary/20 hover:shadow-lg transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-base-300/40 group-hover:ring-primary/30 transition-colors duration-200 shrink-0">
              <img
                src="https://avatars.githubusercontent.com/u/130943602?v=4"
                alt="Poorana Selvan"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=PS&size=36&background=2D79FF&color=fff&bold=true';
                }}
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold group-hover:text-primary transition-colors duration-200 flex items-center gap-1.5">
                Built by Poorana Selvan
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-25 group-hover:opacity-60 transition-opacity" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </p>
              <p className="text-[10px] opacity-30">@PooranaSelvan</p>
            </div>
          </a>

          <p className="text-[11px] opacity-20 flex items-center gap-1.5 flex-wrap justify-center">
            Crafted with <Heart size={10} className="text-error" /> by Poorana Selvan
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
