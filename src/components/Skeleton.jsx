import { motion } from 'framer-motion';

/**
 * Reusable Skeleton Components for professional loading states
 * across the entire Developer Toolbox application.
 */

// ─── Base Skeleton Element ───
export function SkeletonPulse({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton rounded-lg ${className}`}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  );
}

// ─── Text Line Skeleton ───
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} role="presentation" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-md"
          style={{ width: i === lines - 1 ? '60%' : `${85 + Math.random() * 15}%` }}
        />
      ))}
    </div>
  );
}

// ─── Circle Skeleton (Avatars) ───
export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div
      className={`skeleton rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="presentation"
      aria-hidden="true"
    />
  );
}

// ─── Tool Card Skeleton (Dashboard & HomePage) ───
export function SkeletonToolCard({ variant = 'default' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-base-300/40 bg-base-100/80 animate-pulse">
        <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-2 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-base-300/40 bg-base-100 p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
        <div className="flex-1 min-w-0 pt-0.5 space-y-2.5">
          <div className="skeleton h-4 w-32 rounded-md" />
          <div className="space-y-1.5">
            <div className="skeleton h-2.5 w-full rounded-md" />
            <div className="skeleton h-2.5 w-3/4 rounded-md" />
          </div>
          <div className="skeleton h-4 w-20 rounded-full mt-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page Skeleton ───
export function SkeletonDashboard() {
  return (
    <div className="max-w-6xl mx-auto" role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard...</span>

      {/* Hero Section */}
      <div className="text-center mb-12 pt-4 pb-8">
        <div className="w-20 h-20 rounded-2xl skeleton mx-auto mb-6" />
        <div className="skeleton h-10 w-72 mx-auto rounded-lg mb-3" />
        <div className="skeleton h-4 w-96 max-w-full mx-auto rounded-md" />
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="skeleton h-12 w-full rounded-2xl" />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-base-300/40 bg-base-100/80 p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl skeleton shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="skeleton h-3.5 w-24 rounded-md" />
              <div className="skeleton h-2.5 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[80, 100, 90, 95].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-xl" style={{ width: w }} />
        ))}
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <SkeletonToolCard />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Home Page Skeleton ───
export function SkeletonHomePage() {
  return (
    <div className="max-w-6xl mx-auto" role="status" aria-label="Loading home page">
      <span className="sr-only">Loading home page...</span>

      {/* Hero */}
      <section className="text-center pt-6 sm:pt-10 pb-16 sm:pb-20">
        <div className="skeleton h-6 w-40 rounded-full mx-auto mb-8" />
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl skeleton mx-auto mb-8" />
        <div className="skeleton h-12 w-80 max-w-full mx-auto rounded-lg mb-3" />
        <div className="skeleton h-12 w-64 max-w-full mx-auto rounded-lg mb-5" />
        <div className="skeleton h-5 w-96 max-w-full mx-auto rounded-md mb-10" />
        <div className="flex justify-center gap-4">
          <div className="skeleton h-12 w-44 rounded-full" />
          <div className="skeleton h-12 w-36 rounded-full" />
        </div>
      </section>

      {/* Feature Cards */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <div className="skeleton h-5 w-44 rounded-full mx-auto mb-3" />
          <div className="skeleton h-8 w-64 mx-auto rounded-lg mb-2" />
          <div className="skeleton h-4 w-80 max-w-full mx-auto rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-base-300/40 bg-base-100 p-6 h-full">
              <div className="w-12 h-12 rounded-xl skeleton mb-4" />
              <div className="skeleton h-4 w-28 rounded-md mb-2" />
              <div className="space-y-1.5">
                <div className="skeleton h-2.5 w-full rounded-md" />
                <div className="skeleton h-2.5 w-5/6 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Showcase */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-7 w-40 rounded-lg" />
          </div>
          <div className="skeleton h-8 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <SkeletonToolCard />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tool Page Skeleton (Generic for any tool) ───
export function SkeletonToolPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6" role="status" aria-label="Loading tool">
      <span className="sr-only">Loading tool...</span>

      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl skeleton" />
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-40 rounded-md" />
            <div className="skeleton h-3 w-56 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-8 w-20 rounded-xl" />
          <div className="skeleton h-8 w-24 rounded-xl" />
          <div className="skeleton h-8 w-20 rounded-xl" />
        </div>
      </div>

      {/* Main Input Area */}
      <div className="section-card p-5">
        <div className="skeleton h-3 w-20 rounded-md mb-3" />
        <div className="skeleton h-36 w-full rounded-lg" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {[88, 76, 96, 72, 84].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-xl" style={{ width: w }} />
        ))}
      </div>

      {/* Tabs */}
      <div className="skeleton h-10 w-full max-w-lg rounded-xl" />

      {/* Content Area */}
      <div className="section-card p-5 space-y-3">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-4 w-32 rounded-md" />
          <div className="skeleton h-7 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Settings Page Skeleton ───
export function SkeletonSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8" role="status" aria-label="Loading settings">
      <span className="sr-only">Loading settings...</span>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="space-y-1.5">
          <div className="skeleton h-6 w-24 rounded-md" />
          <div className="skeleton h-3 w-56 rounded-md" />
        </div>
      </div>

      {/* Theme Section */}
      <div className="rounded-xl border border-base-300/40 bg-base-100/80 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg skeleton" />
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-28 rounded-md" />
            <div className="skeleton h-3 w-48 rounded-md" />
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-6">
          {[60, 60, 60].map((w, i) => (
            <div key={i} className="skeleton h-9 rounded-lg" style={{ width: w }} />
          ))}
        </div>
        {/* Theme Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="rounded-xl overflow-hidden border border-base-300/40"
            >
              <div className="skeleton h-24 w-full rounded-none" />
              <div className="p-2.5 flex items-center gap-2">
                <div className="skeleton w-4 h-4 rounded-full" />
                <div className="skeleton h-3 w-16 rounded-md" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="rounded-xl border border-base-300/40 bg-base-100/80 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg skeleton" />
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-32 rounded-md" />
            <div className="skeleton h-3 w-44 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-base-300/20 p-4 space-y-2">
              <div className="skeleton h-3 w-20 rounded-md" />
              <div className="skeleton h-8 w-16 rounded-md" />
              <div className="skeleton h-1.5 w-full rounded-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Skeleton ───
export function SkeletonSidebar() {
  return (
    <div className="space-y-1 px-3 py-2" role="presentation" aria-hidden="true">
      {/* Nav items */}
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg skeleton" />
          <div className="skeleton h-3 w-24 rounded-md" />
        </div>
      ))}
      <div className="h-px bg-base-300/20 mx-3 my-2" />
      {/* Category */}
      {[1, 2].map((cat) => (
        <div key={cat} className="mb-2">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="skeleton w-4 h-4 rounded" />
            <div className="skeleton h-2.5 w-24 rounded-md" />
          </div>
          <div className="pl-4 space-y-0.5 pt-1">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
                <div className="w-7 h-7 rounded-lg skeleton" />
                <div className="skeleton h-3 rounded-md" style={{ width: 60 + Math.random() * 40 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Inline Content Skeleton (for within-tool lazy sections) ───
export function SkeletonInlineContent({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg skeleton shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3 rounded-md" style={{ width: `${70 + Math.random() * 30}%` }} />
            <div className="skeleton h-2 rounded-md" style={{ width: `${50 + Math.random() * 30}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Card Grid Skeleton ───
export function SkeletonCardGrid({ count = 6, cols = 3 }) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[3]} gap-4`} role="status" aria-label="Loading cards">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <SkeletonToolCard />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Stats Card Skeleton ───
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="status" aria-label="Loading statistics">
      <span className="sr-only">Loading stats...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="section-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded skeleton" />
            <div className="skeleton h-2 w-16 rounded-md" />
          </div>
          <div className="skeleton h-7 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonPulse,
  SkeletonText,
  SkeletonCircle,
  SkeletonToolCard,
  SkeletonDashboard,
  SkeletonHomePage,
  SkeletonToolPage,
  SkeletonSettings,
  SkeletonSidebar,
  SkeletonInlineContent,
  SkeletonCardGrid,
  SkeletonStats,
};
