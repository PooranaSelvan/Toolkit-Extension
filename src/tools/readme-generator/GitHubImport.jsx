import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Loader2, AlertCircle, CheckCircle2, Sparkles, Zap } from 'lucide-react';

const PROGRESS_STEPS = {
  1: 'Fetching repository metadata...',
  2: 'Analyzing project structure...',
  3: 'Detecting tech stack & generating content...',
  4: 'Generating README...',
};

export default function GitHubImport({ onImport, loading, error, success, progressStep, successMeta }) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onImport(url.trim());
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={loading ? { rotate: [0, 360] } : { rotate: 0 }}
            transition={loading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 shadow-sm"
          >
            <Github size={20} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Import from GitHub
              <span className="badge badge-xs badge-primary gap-1">
                <Sparkles size={8} />
                Deep Analysis
              </span>
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Paste any public repo URL — automatically analyzes structure, dependencies, tech stack & generates a complete README
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className={`flex-1 relative rounded-xl transition-all duration-300 ${isFocused ? 'shadow-lg shadow-primary/15' : ''}`}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="https://github.com/owner/repo  or  owner/repo"
              className="input input-sm font-mono text-xs w-full rounded-xl bg-base-100/80 backdrop-blur-sm"
              disabled={loading}
            />
            {/* Animated border glow when focused */}
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-primary/20"
              />
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !url.trim()}
            className="btn btn-primary btn-sm gap-1.5 rounded-xl shrink-0"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span className="hidden sm:inline">Analyze & Generate</span>
                <span className="sm:hidden">Analyze</span>
              </>
            )}
          </button>
        </form>

        {/* Progress indicator */}
        <AnimatePresence>
          {loading && progressStep > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progressStep / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-base-content/60 tabular-nums shrink-0 font-semibold">{progressStep}/4</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <Loader2 size={11} className="animate-spin text-primary" />
                {PROGRESS_STEPS[progressStep] || 'Processing...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="alert alert-error mt-4 py-2.5 text-sm"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="alert alert-success mt-4 py-2.5 text-sm"
            >
              <CheckCircle2 size={14} />
              <div className="flex-1">
                <span className="font-medium">{success}</span>
                {successMeta && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {successMeta.sectionsPopulated > 0 && (
                      <span className="badge badge-sm badge-success badge-outline gap-1">
                        ✅ {successMeta.sectionsPopulated} sections filled
                      </span>
                    )}
                    {successMeta.totalFiles > 0 && (
                      <span className="badge badge-sm badge-ghost gap-1">
                        📂 {successMeta.totalFiles} files scanned
                      </span>
                    )}
                    {successMeta.depsCount > 0 && (
                      <span className="badge badge-sm badge-ghost gap-1">
                        📦 {successMeta.depsCount} dependencies
                      </span>
                    )}
                    {successMeta.languages?.length > 0 && (
                      <span className="badge badge-sm badge-ghost gap-1">
                        🔤 {successMeta.languages.slice(0, 3).join(', ')}
                      </span>
                    )}
                    {successMeta.contributorsCount > 0 && (
                      <span className="badge badge-sm badge-ghost gap-1">
                        👥 {successMeta.contributorsCount} contributors
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
