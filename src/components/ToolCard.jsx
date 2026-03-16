import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../utils/toolRegistry';
import { SkeletonToolCard } from './Skeleton';

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

/**
 * ToolCard — Professional tool card with skeleton loading support.
 * - variant: 'default' | 'compact' | 'skeleton'
 */
export default function ToolCard({ tool, showCategory = true, variant = 'default', loading = false }) {
  // Show skeleton if loading
  if (loading || variant === 'skeleton') {
    return <SkeletonToolCard variant={variant === 'compact' ? 'compact' : 'default'} />;
  }

  const Icon = tool.icon;
  const category = showCategory ? CATEGORIES.find((c) => c.id === tool.category) : null;

  const handleClick = () => {
    try {
      const recent = getRecentTools().filter((id) => id !== tool.id);
      recent.unshift(tool.id);
      localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recent.slice(0, 8)));
    } catch {}
  };

  if (variant === 'compact') {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Link
          to={tool.path}
          onClick={handleClick}
          className="group flex items-center gap-3 p-4 rounded-xl border border-base-300/40 bg-base-100/80 hover:border-primary/25 hover:bg-primary/[0.04] transition-all duration-200 h-full"
          aria-label={`Open ${tool.name} tool`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/12 group-hover:scale-105 transition-all duration-200">
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold truncate block group-hover:text-primary transition-colors duration-200">
              {tool.name}
            </span>
            <span className="text-[10px] opacity-35 truncate block">
              {tool.description.slice(0, 30)}...
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
      <Link
        to={tool.path}
        onClick={handleClick}
        className="group block h-full"
        aria-label={`Open ${tool.name} tool`}
      >
        <article className="h-full rounded-2xl border border-base-300/40 bg-base-100 p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.08] focus-within:border-primary/30 card-shine gradient-border-hover">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0 text-primary transition-all duration-300 group-hover:bg-primary/[0.12] group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10 group-hover:rotate-[-3deg]"
              aria-hidden="true"
            >
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
                  className="shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0.5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs text-base-content/50 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
              {category && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge badge-ghost badge-xs gap-1 text-base-content/35 font-medium">
                    <span aria-hidden="true">{category.emoji}</span> {category.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
