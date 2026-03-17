import { useMemo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Wrench, Zap, Shield, Sparkles,
  Heart, TrendingUp, Code2,
  ChevronRight, Star, Globe, Layers,
  Palette, Settings,
  ExternalLink, ArrowUpRight, TerminalSquare,
  Clock, Cpu, Search,
} from 'lucide-react';
import { getTools, CATEGORIES, getToolsByCategory } from '../utils/toolRegistry';
import { isVsCodeWebview, openExternal } from '../vscodeApi';
import SEO from '../components/SEO';

const RECENT_TOOLS_KEY = 'devtoolbox-recent-tools';
function getRecentTools() {
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

const FEATURED_TOOL_IDS = ['api-tester', 'json-formatter', 'color-palette', 'grid-generator', 'regex-generator', 'jwt-decoder'];



/**
 * Lightweight visibility hook using a single shared IntersectionObserver.
 * Replaces framer-motion's useInView which creates one observer per call.
 */
function useOnScreen(ref, { once = true, margin = '-60px' } = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin]);
  return visible;
}

// Animated counter — uses lightweight useOnScreen instead of framer useInView
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useOnScreen(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    const end = Math.max(0, Math.round(Number(target) || 0));
    if (end <= 0) { setCount(0); return; }
    hasAnimated.current = true;
    let start = 0;
    const steps = Math.max(1, Math.ceil(duration / 16));
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return { count, ref };
}

/* AnimatedSection — CSS class-based reveal instead of framer-motion per-section.
   Avoids creating a motion.div + IntersectionObserver for every section. */
function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref, { once: true, margin: '-60px' });
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

// Feature card — lightweight, no per-card motion wrapper
function FeatureCard({ icon: Icon, title, description, color, accentColor }) {
  return (
    <div
      className="group rounded-2xl border border-base-300/40 bg-base-100/80 p-6 h-full flex flex-col transition-all duration-200 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-1 feature-accent-card relative overflow-hidden"
      style={{ '--accent-color': accentColor }}
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg transition-transform duration-200 group-hover:scale-105`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors duration-200">{title}</h3>
      <p className="text-sm opacity-50 leading-relaxed flex-1">{description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary/0 group-hover:text-primary/60 transition-all duration-200">
        Learn more <ChevronRight size={12} />
      </div>
    </div>
  );
}

// Tool showcase card — lightweight, no per-card motion wrapper
function ToolShowcaseCard({ tool }) {
  const Icon = tool.icon;
  const category = CATEGORIES.find((c) => c.id === tool.category);

  return (
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
      <div className="h-full rounded-2xl border border-base-300/40 bg-base-100/80 p-6 transition-all duration-200 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/[0.08] hover:-translate-y-1 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center text-primary transition-all duration-200 group-hover:bg-primary/[0.14] group-hover:scale-105">
            <Icon size={26} strokeWidth={1.7} />
          </div>
          <ArrowUpRight
            size={18}
            className="opacity-0 transition-opacity duration-200 group-hover:opacity-50 text-primary"
          />
        </div>

        <h3 className="text-[15px] font-bold mb-2 group-hover:text-primary transition-colors duration-200">
          {tool.name}
        </h3>
        <p className="text-xs text-base-content/50 leading-relaxed mb-4 line-clamp-2">
          {tool.description}
        </p>

        <div className="flex items-center justify-between">
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-base-200/60 text-[10px] text-base-content/40 font-semibold border border-base-300/20">
              {category.emoji} {category.label}
            </span>
          )}
          <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-70 transition-opacity duration-200 flex items-center gap-1">
            Open <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Interactive search preview for hero
function HeroSearchPreview({ tools }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (tools || []).filter(
      t => t && t.name && (
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (Array.isArray(t.tags) && t.tags.some(tag => typeof tag === 'string' && tag.includes(q)))
      )
    ).slice(0, 5);
  }, [query, tools]);

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-md mx-auto mb-6 px-4 sm:px-0"
    >
      <div className={`relative flex items-center rounded-2xl border ${focused ? 'border-primary/40 shadow-lg shadow-primary/10' : 'border-base-300/50'} bg-base-100/90 backdrop-blur-sm transition-all duration-300`}>
        <Search size={16} className={`ml-4 shrink-0 ${focused ? 'text-primary' : 'opacity-30'} transition-colors duration-200`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Quick search tools..."
          value={query}
          onChange={e => setQuery(e.target.value.slice(0, 100))}
          onFocus={() => {
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => setFocused(false), 200);
          }}
          className="w-full bg-transparent border-none outline-none px-3 py-3 text-sm font-medium placeholder:opacity-35 min-w-0"
          maxLength={100}
          aria-label="Search tools"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="mr-3 opacity-30 hover:opacity-60 transition-opacity shrink-0 p-1" aria-label="Clear search">
            <span className="text-xs font-bold">✕</span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {focused && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mx-4 sm:mx-0 mt-2 rounded-xl border border-base-300/40 bg-base-100/98 backdrop-blur-2xl shadow-2xl shadow-base-content/[0.08] overflow-hidden overflow-y-auto max-h-[min(300px,50vh)] z-50 scrollbar-thin"
            role="listbox"
          >
            {filtered.map((tool) => {
              const Icon = tool.icon;
              if (!Icon) return null;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-primary/[0.06] transition-colors duration-150 border-b border-base-300/10 last:border-b-0"
                  role="option"
                  onClick={() => setQuery('')}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center text-primary shrink-0">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{tool.name}</p>
                    <p className="text-[10px] opacity-40 truncate">{tool.description}</p>
                  </div>
                  <ArrowRight size={12} className="opacity-20 shrink-0 ml-auto" />
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Category card — lightweight
function CategoryShowcaseCard({ category, categoryTools }) {
  return (
    <Link to={`/dashboard?category=${category.id}`} className="group block h-full">
      <div className="rounded-2xl border border-base-300/40 bg-base-100/80 p-6 h-full transition-all duration-200 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="w-14 h-14 rounded-2xl bg-base-200/60 flex items-center justify-center group-hover:bg-primary/[0.08] transition-colors duration-200">
            <span className="text-2xl">{category.emoji}</span>
          </div>
          <span className="badge badge-primary badge-sm font-bold shadow-sm shadow-primary/15">
            {categoryTools.length} tools
          </span>
        </div>
        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors duration-200">{category.label}</h3>

        {/* Tool icon preview row */}
        <div className="flex items-center gap-1.5 mb-4">
          {categoryTools.slice(0, 4).map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <div key={tool.id} className="w-8 h-8 rounded-lg bg-base-200/80 flex items-center justify-center text-base-content/40 group-hover:text-primary/60 transition-colors duration-200 border border-base-300/20">
                <ToolIcon size={14} strokeWidth={1.8} />
              </div>
            );
          })}
          {categoryTools.length > 4 && (
            <div className="w-8 h-8 rounded-lg bg-base-200/80 flex items-center justify-center text-[10px] font-bold text-base-content/30 border border-base-300/20">
              +{categoryTools.length - 4}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {categoryTools.slice(0, 3).map((tool) => (
            <span key={tool.id} className="badge badge-ghost badge-xs font-medium">
              {tool.name}
            </span>
          ))}
          {categoryTools.length > 3 && (
            <span className="badge badge-ghost badge-xs font-medium opacity-50">
              +{categoryTools.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          Browse category <ChevronRight size={13} />
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const tools = useMemo(() => getTools().filter((t) => t.id !== 'settings'), []);
  const featuredTools = useMemo(
    () => FEATURED_TOOL_IDS.map(id => tools.find(t => t.id === id)).filter(Boolean),
    [tools]
  );
  const displayCategories = CATEGORIES.filter((c) => c.id !== 'preferences');

  const recentToolIds = useMemo(() => getRecentTools(), []);
  const recentTools = useMemo(() => {
    return recentToolIds.map(id => tools.find(t => t.id === id)).filter(Boolean).slice(0, 4);
  }, [recentToolIds, tools]);

  // Counters for stats
  const toolCounter = useCounter(tools.length, 1200);
  const categoryCounter = useCounter(displayCategories.length, 1200);
  const privacyCounter = useCounter(100, 1000);

  return (
    <>
      <SEO 
        title="Home - WebToolkit"
        description={`${tools.length} free, fast, and privacy-first developer utilities — all running client-side.`}
        keywords="developer tools, web utilities, online tools, developer utilities"
      />
      <div className="max-w-6xl mx-auto" role="main">
        {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative text-center pt-6 sm:pt-10 pb-16 sm:pb-24">
        {/* Static background — no parallax, no JS-driven scroll tracking */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="hero-grid-bg absolute inset-0 opacity-60" />
          <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[120px] bg-primary opacity-[0.06]" />
          <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] bg-secondary opacity-[0.05]" />
        </div>

        <div>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="floating-badge inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/[0.06] hover:bg-primary/[0.1] transition-all duration-300 shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-bold text-primary tracking-wide">
              {tools.length}+ Free Developer Tools
            </span>
            <Sparkles size={13} className="text-primary opacity-60" />
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8"
        >
          <div className="absolute inset-[-12px] rounded-[32px] bg-primary/8 blur-xl" />
          <div className="w-full h-full rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/25 relative overflow-hidden group/logo cursor-pointer transition-transform duration-300 hover:scale-105">
            <Wrench size={44} className="text-primary-content relative z-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover/logo:rotate-[-12deg]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-lg ring-3 ring-base-200"
          >
            <Sparkles size={18} className="text-secondary-content" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]"
        >
          Your All-in-One
          <br />
          <span className="gradient-text-animated">WebToolkit</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-base sm:text-lg opacity-50 leading-relaxed mb-8 px-4"
        >
          {tools.length} beautifully crafted, lightning-fast utilities — all running client-side
          with zero data collection. Build faster, ship better.
        </motion.p>

        {/* Inline search */}
        <HeroSearchPreview tools={tools} />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10"
        >
          <Link to="/dashboard" className="btn btn-primary btn-lg rounded-full px-8 font-bold gap-2.5 shadow-sm shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 btn-gradient-primary cta-glow group">
            <TerminalSquare size={18} />
            Explore All Tools
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <a
            href="https://github.com/PooranaSelvan/Toolkit-Extension"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (isVsCodeWebview()) { e.preventDefault(); openExternal('https://github.com/PooranaSelvan/Toolkit-Extension'); } }}
            className="btn btn-outline rounded-full gap-2.5 px-7 border-base-300/50 hover:border-primary/30 hover:bg-primary/5 group"
          >
            <Star size={16} className="group-hover:text-warning transition-colors duration-300" />
            Star on GitHub
            <ExternalLink size={13} className="opacity-40" />
          </a>
        </motion.div>

        {/* Trust signals — simple CSS transitions, no per-item motion wrappers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
        >
          {[
            { icon: Shield, text: 'Privacy First', color: 'text-success' },
            { icon: Zap, text: 'Zero Latency', color: 'text-warning' },
            { icon: Globe, text: 'Works Offline', color: 'text-info' },
            { icon: Code2, text: 'Open Source', color: 'text-primary' },
          ].map(({ icon: Icon, text, color }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-base-200/60 border border-base-300/30 text-xs font-medium cursor-default opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <Icon size={12} className={color} /> {text}
            </span>
          ))}
        </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <AnimatedSection className="mb-28">
        <div className="text-center mb-14">
          <span className="badge badge-primary badge-sm gap-1.5 mb-4 font-semibold shadow-sm shadow-primary/15 inline-flex">
            <Zap size={11} /> Why WebToolkit?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Built for <span className="gradient-text">Speed & Privacy</span>
          </h2>
          <p className="text-sm opacity-45 mt-3 max-w-lg mx-auto leading-relaxed">
            Every tool runs entirely in your browser — your data never leaves your machine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Instant results with zero network requests. Everything processes client-side for the fastest possible experience."
            color="bg-gradient-to-br from-amber-500 to-orange-500"
            accentColor="#f59e0b"
          />
          <FeatureCard
            icon={Shield}
            title="100% Private"
            description="Your data never leaves your browser. No servers, no tracking, no analytics — complete privacy by design."
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
            accentColor="#3b82f6"
          />
          <FeatureCard
            icon={Layers}
            title={`${tools.length}+ Pro Tools`}
            description="A comprehensive toolkit covering every developer need in one place, with new tools added regularly."
            color="bg-gradient-to-br from-blue-500 to-indigo-500"
            accentColor="#6366f1"
          />
          <FeatureCard
            icon={Palette}
            title="Beautiful UI"
            description="Modern design that auto-syncs with your VS Code theme — seamless dark and light mode support."
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            accentColor="#a855f7"
          />
        </div>
      </AnimatedSection>

      {/* ═══════════ RECENTLY USED (if any) ═══════════ */}
      {recentTools.length > 0 && (
        <AnimatedSection className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={17} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">Continue Where You Left Off</h2>
                <p className="text-[11px] opacity-40 mt-0.5">Your recently used tools</p>
              </div>
            </div>
            <Link to="/dashboard" className="text-[11px] font-semibold text-primary/60 hover:text-primary transition-colors duration-200 flex items-center gap-1 group">
              View all <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-base-300/40 bg-base-100/80 hover:border-primary/25 hover:bg-primary/[0.04] hover:-translate-y-1 hover:shadow-md transition-all duration-200 h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-200">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold truncate block group-hover:text-primary transition-colors duration-200">{tool.name}</span>
                    <span className="text-[10px] opacity-35 truncate block">{tool.description.slice(0, 30)}...</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </AnimatedSection>
      )}

      {/* ═══════════ FEATURED TOOLS ═══════════ */}
      <AnimatedSection className="mb-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="badge badge-secondary badge-sm gap-1.5 mb-3 font-semibold shadow-sm">
              <Star size={11} /> Featured
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Popular Tools
            </h2>
            <p className="text-sm opacity-45 mt-2">The most-loved utilities in our collection</p>
          </div>
          <Link
            to="/dashboard"
            className="btn btn-ghost btn-sm rounded-xl gap-2 text-primary hover:bg-primary/8 font-semibold group/btn border border-transparent hover:border-primary/15"
          >
            View all {tools.length} tools
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featuredTools.map((tool) => (
            <ToolShowcaseCard key={tool.id} tool={tool} />
          ))}
        </div>
      </AnimatedSection>

      {/* ═══════════ TOOL CATEGORIES ═══════════ */}
      <AnimatedSection className="mb-28">
        <div className="text-center mb-14">
          <span className="badge badge-ghost badge-sm gap-1.5 mb-4 font-semibold">
            <Layers size={11} /> Categories
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-sm opacity-45 mt-3">Find the right tool for every task</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {displayCategories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            return (
              <CategoryShowcaseCard key={category.id} category={category} categoryTools={categoryTools} />
            );
          })}
        </div>
      </AnimatedSection>

      {/* ═══════════ STATS SECTION ═══════════ */}
      <AnimatedSection className="mb-28">
        <div className="text-center mb-12">
          <span className="badge badge-ghost badge-sm gap-1.5 mb-4 font-semibold">
            <TrendingUp size={11} /> Impact
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            By the <span className="gradient-text">Numbers</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { counter: toolCounter, label: 'Developer Tools', suffix: '+', icon: Wrench, color: 'text-primary', bg: 'bg-primary/10', borderHover: 'hover:border-primary/20' },
            { counter: categoryCounter, label: 'Tool Categories', suffix: '', icon: Layers, color: 'text-secondary', bg: 'bg-secondary/10', borderHover: 'hover:border-secondary/20' },
            { counter: privacyCounter, label: 'Client-Side', suffix: '%', icon: Cpu, color: 'text-success', bg: 'bg-success/10', borderHover: 'hover:border-success/20' },
            { counter: null, value: 0, label: 'Data Collected', suffix: '', icon: Shield, color: 'text-info', bg: 'bg-info/10', borderHover: 'hover:border-info/20' },
          ].map(({ counter, value, label, suffix, icon: Icon, color, bg, borderHover }) => {
            const displayValue = counter ? counter.count : (value ?? 0);
            return (
              <div
                key={label}
                className={`stat-card-frost rounded-2xl p-4 sm:p-7 text-center group cursor-default hover:-translate-y-1 transition-transform duration-200 ${borderHover}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={18} className={`${color} sm:w-5 sm:h-5`} />
                </div>
                <div ref={counter?.ref ?? undefined} className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1.5">
                  <span className="counter-highlight gradient-text">{displayValue}{suffix}</span>
                </div>
                <p className="text-[10px] sm:text-xs font-semibold opacity-45 tracking-wide">{label}</p>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* ═══════════ ALL TOOLS GRID ═══════════ */}
      <AnimatedSection className="mb-28">
        <div className="text-center mb-14">
          <span className="badge badge-ghost badge-sm gap-1.5 mb-4 font-semibold">
            <Wrench size={11} /> Complete Collection
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            All <span className="gradient-text">{tools.length} Tools</span>
          </h2>
          <p className="text-sm opacity-45 mt-3 max-w-md mx-auto">Every utility you need, in one place — explore the full collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tools.map((tool) => (
            <ToolShowcaseCard key={tool.id} tool={tool} />
          ))}
        </div>
      </AnimatedSection>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <AnimatedSection className="mb-16">
        <div className="relative rounded-3xl overflow-hidden border border-primary/20">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, color-mix(in oklch, var(--color-primary) 12%, var(--color-base-100)), color-mix(in oklch, var(--color-primary) 6%, var(--color-base-100)), color-mix(in oklch, var(--color-secondary, var(--color-primary)) 8%, var(--color-base-100)))'
          }} />
          
          {/* Grid pattern in CTA */}
          <div className="hero-grid-bg absolute inset-0 opacity-30" />
          
          {/* Static gradient blobs — infinite animations removed for performance */}
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full blur-[80px] bg-primary/8" />
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full blur-[80px] bg-secondary/6" />

          <div className="relative px-8 py-16 sm:py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-7 relative hover:scale-105 transition-transform duration-200">
              <div className="absolute inset-[-4px] rounded-2xl bg-primary/8 blur-md" />
              <Sparkles size={28} className="text-primary relative z-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">
              Ready to <span className="gradient-text-animated">Build Faster</span>?
            </h2>
            <p className="text-sm sm:text-base opacity-50 max-w-lg mx-auto mb-10 leading-relaxed">
              Jump into the dashboard and start using {tools.length}+ tools right now.
              No sign-up, no limits — completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard" className="btn btn-primary btn-lg rounded-full px-8 font-bold gap-2.5 shadow-md shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 btn-gradient-primary cta-glow group">
                <TerminalSquare size={17} />
                Open Dashboard
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/settings"
                className="btn btn-outline rounded-full gap-2.5 px-6 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              >
                <Settings size={15} />
                Settings & Info
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
{/* ═══════════ FOOTER ═══════════ */}
      <footer className="mb-8" role="contentinfo">
        <div className="section-divider mb-10">
          <Sparkles size={10} className="text-primary/30" />
        </div>
        <div className="flex flex-col items-center gap-5">
          <a
            href="https://github.com/PooranaSelvan"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (isVsCodeWebview()) { e.preventDefault(); openExternal('https://github.com/PooranaSelvan'); } }}
            className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-base-300/40 bg-base-100/80 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 max-w-full"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-base-300/40 group-hover:ring-primary/30 transition-all duration-200 shrink-0 group-hover:scale-105 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              <img
                src="https://avatars.githubusercontent.com/u/130943602?v=4&s=80"
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                width={40}
                height={40}
                onError={(e) => {
                  try { e.target.onerror = null; e.target.style.display = 'none'; } catch { /* safe */ }
                }}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold group-hover:text-primary transition-colors duration-200 flex items-center gap-1.5 truncate">
                Built by Poorana Selvan
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-25 group-hover:opacity-60 transition-opacity shrink-0" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </p>
              <p className="text-[10px] opacity-30">@PooranaSelvan</p>
            </div>
          </a>
          <p className="text-[11px] opacity-20 flex items-center gap-1.5 flex-wrap justify-center">
            Crafted with <Heart size={10} className="text-error" aria-label="love" /> by Poorana Selvan
          </p>
        </div>
      </footer>      </div>
    </>
  );
}
