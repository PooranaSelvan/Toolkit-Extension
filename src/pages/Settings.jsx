import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Palette, Monitor, Check,
  Sun, Moon, Trash2, Database, Info, Sparkles,
  ExternalLink, Heart, Code2, Star,
  Globe, MapPin
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getTools } from '../utils/toolRegistry';

// ─── Inline SVG icons (Github & Twitter are deprecated in lucide-react) ───
const GithubIcon = ({ size = 16, className = '' }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} className={className} fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

// ─── Author Details ───
const AUTHOR = {
  name: 'Poorana Selvan',
  username: 'PooranaSelvan',
  bio: 'Passionate Full-Stack Developer crafting clean, performant, and user-friendly web experiences.',
  avatar: 'https://avatars.githubusercontent.com/u/130943602?v=4',
  location: 'India',
  github: 'https://github.com/PooranaSelvan',
  portfolio: 'https://poorana-portfolio.vercel.app/',
  
};

export default function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const [filter, setFilter] = useState('all');
  const [cleared, setCleared] = useState(false);

  const filteredThemes = filter === 'all'
    ? themes
    : themes.filter((t) => t.category.toLowerCase() === filter);

  const handleClearData = () => {
    try {
      if (window.confirm('Are you sure? This will clear all saved API collections, history, and settings.')) {
        const currentTheme = theme;
        try {
          localStorage.clear();
          localStorage.setItem('devtoolbox-theme', currentTheme);
        } catch (storageErr) {
          console.error('[Settings] Failed to clear localStorage:', storageErr);
        }
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
      }
    } catch (err) {
      console.error('[Settings] Error during data clear:', err);
    }
  };

  const storageUsed = (() => {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          total += (key.length + (value ? value.length : 0)) * 2; // UTF-16 = 2 bytes per char
        }
      }
    } catch (e) {
      console.warn('[Settings] Error calculating storage size:', e);
    }
    return (total / 1024).toFixed(1);
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon size={20} className="text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-sm opacity-60 mt-1 ml-[52px]">
          Customize your WebToolkit experience
        </p>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="rounded-xl glass-card glass-highlight p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-primary/10">
                <Palette size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Appearance</h2>
                <p className="text-xs opacity-60">Choose a theme that suits your style</p>
              </div>
            </div>

            {/* Active theme badge */}
            <div className="badge badge-primary badge-lg gap-2 font-semibold shrink-0">
              <Sparkles size={14} />
              {themes.find(t => t.id === theme)?.emoji} {themes.find(t => t.id === theme)?.name || theme}
            </div>
          </div>

          {/* Filter tabs with sliding indicator */}
          <div className="flex gap-1.5 w-fit p-1.5 rounded-xl mb-6 overflow-x-auto glass-base !bg-base-200/40 relative">
            {['all', 'light', 'dark'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${filter === f ? 'text-primary-content shadow-sm' : 'hover:bg-base-100 text-base-content'}`}
              >
                {filter === f && (
                  <motion.div
                    layoutId="settings-filter-pill"
                    className="absolute inset-0 bg-primary rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {f === 'all' && <Monitor size={14} />}
                  {f === 'light' && <Sun size={14} />}
                  {f === 'dark' && <Moon size={14} />}
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className={`badge badge-xs ${filter === f ? 'bg-primary-content/20 text-primary-content border-0' : 'badge-ghost'}`}>
                    {f === 'all' ? themes.length : themes.filter(t => t.category.toLowerCase() === f).length}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Theme grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredThemes.map((t, i) => {
              const isActive = theme === t.id;
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  onClick={() => setTheme(t.id)}
                  data-theme={t.id}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${
                    isActive
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-md'
                      : 'border border-base-300 hover:border-primary/30'
                  }`}
                >
                  {/* Theme preview with shine effect */}
                  <div className="bg-base-100 p-3 relative overflow-hidden group-hover:after:animate-shine-sweep">
                    {/* Color dots */}
                    <div className="flex gap-1.5 mb-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary transition-transform duration-200 group-hover:scale-110" />
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary transition-transform duration-200 group-hover:scale-110" style={{ transitionDelay: '50ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-200 group-hover:scale-110" style={{ transitionDelay: '100ms' }} />
                    </div>

                    {/* Lines */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <div className="h-2 flex-1 rounded-full bg-primary" />
                        <div className="h-2 w-4 rounded-full bg-secondary" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-2 w-6 rounded-full bg-base-300" />
                        <div className="h-2 flex-1 rounded-full bg-accent" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-2 flex-1 rounded-full bg-base-300" />
                        <div className="h-2 w-8 rounded-full bg-primary" />
                      </div>
                    </div>

                    {/* Color bar */}
                    <div className="flex gap-1 mt-2.5">
                      <div className="h-3 flex-1 rounded bg-primary opacity-20" />
                      <div className="h-3 flex-1 rounded bg-secondary opacity-20" />
                      <div className="h-3 flex-1 rounded bg-accent opacity-20" />
                      <div className="h-3 flex-1 rounded bg-neutral opacity-20" />
                    </div>
                  </div>

                  {/* Theme label */}
                  <div className="bg-base-200 px-3 py-2 flex items-center gap-2">
                    <span className="text-xs">{t.emoji}</span>
                    <span className="text-xs font-semibold text-base-content truncate">{t.name}</span>
                    {isActive && (
                      <Check size={14} className="ml-auto text-primary shrink-0" />
                    )}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <Check size={10} className="text-primary-content" />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Data & Storage Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
<div className="rounded-xl glass-card glass-highlight p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-warning/10 backdrop-blur-sm flex items-center justify-center border border-warning/10">
              <Database size={18} className="text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Data & Storage</h2>
              <p className="text-xs opacity-60">Manage your locally stored data</p>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl glass-base !bg-base-200/30 p-4 group/card hover:!bg-base-200/50 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-50">Storage Used</span>
                <Database size={16} className="text-primary opacity-40 group-hover/card:opacity-70 transition-opacity duration-200" />
              </div>
              <p className="text-2xl font-bold">
                {storageUsed} <span className="text-sm font-normal opacity-50">KB</span>
              </p>
              {/* Animated progress bar for storage */}
              <div className="mt-2 h-1.5 bg-base-300/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((parseFloat(storageUsed) / 5120) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-primary/60 rounded-full"
                />
              </div>
              <p className="text-[11px] opacity-40 mt-1.5">API history, collections, theme prefs</p>
            </div>
            <div className="rounded-xl glass-base !bg-base-200/30 p-4 group/card hover:!bg-base-200/50 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-50">Storage Items</span>
                <Info size={16} className="text-secondary opacity-40 group-hover/card:opacity-70 transition-opacity duration-200" />
              </div>
              <p className="text-2xl font-bold">
                {localStorage.length}
              </p>
              <p className="text-[11px] opacity-40 mt-1">Keys stored in browser</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClearData}
              className="btn btn-error btn-sm gap-2.5 rounded-xl"
            >
              <Trash2 size={14} />
              Clear All Data
            </button>

            {cleared && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="alert alert-success py-2 px-4"
              >
                <Check size={16} />
                <span className="text-sm font-medium">All data cleared successfully!</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Author / Creator Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="rounded-xl glass-card overflow-hidden gradient-border-hover">
          {/* Author Header Banner */}
          <div className="relative h-28 sm:h-32 overflow-hidden group/banner">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, 
                  color-mix(in oklch, var(--color-primary) 80%, var(--color-secondary)) 0%, 
                  var(--color-primary) 40%, 
                  color-mix(in oklch, var(--color-secondary, var(--color-primary)) 70%, var(--color-primary)) 100%)`,
              }}
            />
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                                radial-gradient(circle at 60% 80%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px, 80px 80px, 40px 40px',
            }} />
            {/* Floating shapes with enhanced animation */}
            <div className="absolute top-4 right-8 w-16 h-16 rounded-full border border-white/10 animate-float-slow group-hover/banner:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-4 left-12 w-10 h-10 rounded-lg border border-white/10 rotate-12 animate-float group-hover/banner:rotate-45 transition-transform duration-500" />
            <div className="absolute top-8 left-1/3 w-6 h-6 rounded-full bg-white/5 group-hover/banner:bg-white/10 transition-colors duration-500" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar - overlapping banner */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-10 mb-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-base-100 shadow-xl">
                  <img
                    src={AUTHOR.avatar}
                    alt={AUTHOR.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(AUTHOR.name)}&size=96&background=2D79FF&color=fff&bold=true`;
                    }}
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success ring-2 ring-base-100 flex items-center justify-center">
                  <Check size={12} className="text-success-content" />
                </div>
              </div>

              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold tracking-tight">{AUTHOR.name}</h2>
                  <span className="badge badge-primary badge-sm gap-1 font-semibold shadow-sm shadow-primary/15">
                    <Code2 size={10} />
                    Creator
                  </span>
                </div>
                <p className="text-xs opacity-50 flex items-center gap-1.5">
                  <GithubIcon size={12} />
                  @{AUTHOR.username}
                  {AUTHOR.location && (
                    <>
                      <span className="opacity-30 mx-0.5">·</span>
                      <MapPin size={11} />
                      {AUTHOR.location}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm leading-relaxed opacity-65 mb-5">
              {AUTHOR.bio}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm gap-2.5 rounded-xl bg-neutral text-neutral-content hover:bg-neutral/80 border-0 shadow-sm hover:shadow-lg hover:shadow-black/15 transition-all duration-200 hover:-translate-y-0.5"
              >
                <GithubIcon size={15} />
                GitHub
                <ExternalLink size={11} className="opacity-50" />
              </a>
              <a
                href={AUTHOR.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm gap-2.5 rounded-xl btn-primary shadow-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Globe size={15} />
                Portfolio
                <ExternalLink size={11} className="opacity-50" />
              </a>
            </div>

            {/* Separator */}
            <div className="gradient-line my-5" />

            {/* Open Source CTA */}
            <div className="rounded-xl bg-gradient-to-r from-primary/5 via-base-200/50 to-secondary/5 border border-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-0.5">Enjoying WebToolkit?</p>
                <p className="text-xs opacity-50">Star the repo on GitHub to show your support and help others discover it!</p>
              </div>
              <a
                href={`${AUTHOR.github}/Developer-Toolbox`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary rounded-xl gap-2.5 shrink-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
              >
                <Star size={14} />
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="rounded-xl glass-card glass-highlight p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-info/10 backdrop-blur-sm flex items-center justify-center border border-info/10">
              <Info size={18} className="text-info" />
            </div>
            <div>
              <h2 className="text-lg font-bold">About</h2>
              <p className="text-xs opacity-60">WebToolkit information</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <tbody>
                <tr><td className="font-semibold opacity-70">Total Tools</td><td>{getTools().filter(t => t.id !== 'settings').length} developer tools</td></tr>
                <tr><td className="font-semibold opacity-70">Available Themes</td><td>{themes.length} themes</td></tr>
                <tr><td className="font-semibold opacity-70">Privacy</td><td>100% client-side — no data sent to any server</td></tr>
                <tr><td className="font-semibold opacity-70">Storage</td><td>Browser LocalStorage only</td></tr>
              </tbody>
            </table>
          </div>

          {/* Footer attribution */}
          <div className="mt-5 pt-4 border-t border-base-200">
            <p className="text-xs opacity-40 flex items-center justify-center gap-1.5 flex-wrap">
              Made with <Heart size={12} className="text-error" /> by
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                {AUTHOR.name}
              </a>
              <span className="opacity-50">·</span>
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <GithubIcon size={12} />
              </a>
              <a
                href={AUTHOR.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <Globe size={12} />
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
