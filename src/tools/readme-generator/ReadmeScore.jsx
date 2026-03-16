import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2, Info, Lightbulb, TrendingUp, Sparkles,
} from 'lucide-react';

/* ════════════════════════════════════════════════
   README Quality Scorer & Linter
   Detailed analysis with actionable suggestions
   ════════════════════════════════════════════════ */

const CHECKS = [
  // Essential sections
  { id: 'has-title', category: 'structure', label: 'Has project title (H1)', weight: 10, test: (md) => /^#\s+.+/m.test(md) },
  { id: 'has-description', category: 'structure', label: 'Has description', weight: 8, test: (md, d) => !!d.description?.trim() },
  { id: 'has-installation', category: 'setup', label: 'Has installation instructions', weight: 8, test: (md) => /install/i.test(md) && /```/.test(md) },
  { id: 'has-usage', category: 'setup', label: 'Has usage / run instructions', weight: 7, test: (md, d) => !!d.usage?.trim() },
  { id: 'has-features', category: 'content', label: 'Lists features', weight: 6, test: (md, d) => !!d.features?.trim() },
  { id: 'has-license', category: 'community', label: 'Includes license info', weight: 7, test: (md, d) => !!d.license },
  { id: 'has-contributing', category: 'community', label: 'Has contribution guidelines', weight: 5, test: (md) => /contribut/i.test(md) },

  // Quality enhancers
  { id: 'has-badges', category: 'polish', label: 'Uses status badges', weight: 4, test: (md) => /shields\.io|badge/i.test(md) },
  { id: 'has-tech-stack', category: 'content', label: 'Lists tech stack', weight: 5, test: (md, d) => !!d.techStack?.trim() },
  { id: 'has-toc', category: 'structure', label: 'Has table of contents', weight: 4, test: (md) => /table of contents/i.test(md) || (md.match(/^- \[.+\]\(#.+\)/gm) || []).length >= 3 },
  { id: 'has-code-blocks', category: 'content', label: 'Contains code blocks', weight: 5, test: (md) => /```/.test(md) },
  { id: 'has-tables', category: 'content', label: 'Uses markdown tables', weight: 3, test: (md) => /\|.*\|.*\|/m.test(md) && /---/.test(md) },
  { id: 'has-screenshots', category: 'polish', label: 'Includes images or screenshots', weight: 4, test: (md, d) => !!d.screenshots?.trim() || /!\[.*\]\(.*\)/.test(md) },
  { id: 'has-demo-url', category: 'polish', label: 'Provides live demo link', weight: 3, test: (md, d) => !!d.demoUrl?.trim() },
  { id: 'has-author', category: 'community', label: 'Credits author', weight: 3, test: (md, d) => !!d.author?.trim() },
  { id: 'has-env-vars', category: 'setup', label: 'Documents environment variables', weight: 3, test: (md, d) => !!d.envVars?.trim() },
  { id: 'has-prerequisites', category: 'setup', label: 'Lists prerequisites', weight: 3, test: (md, d) => !!d.prerequisites?.trim() },
  { id: 'has-roadmap', category: 'content', label: 'Has roadmap / future plans', weight: 2, test: (md, d) => !!d.roadmap?.trim() },
  { id: 'has-faq', category: 'content', label: 'Includes FAQ section', weight: 2, test: (md, d) => !!d.faq?.trim() },
  { id: 'has-api', category: 'content', label: 'Documents API endpoints', weight: 2, test: (md, d) => !!d.apiReference?.trim() },

  // Word count thresholds
  { id: 'min-words-50', category: 'quality', label: 'At least 50 words', weight: 3, test: (md) => md.split(/\s+/).filter(Boolean).length >= 50 },
  { id: 'min-words-200', category: 'quality', label: 'At least 200 words (comprehensive)', weight: 4, test: (md) => md.split(/\s+/).filter(Boolean).length >= 200 },
  { id: 'min-sections-3', category: 'structure', label: 'At least 3 sections', weight: 4, test: (md) => (md.match(/^## /gm) || []).length >= 3 },
  { id: 'min-sections-6', category: 'structure', label: 'At least 6 sections (thorough)', weight: 3, test: (md) => (md.match(/^## /gm) || []).length >= 6 },
];

const CATEGORY_META = {
  structure: { label: 'Structure', icon: '🏗️', color: 'primary' },
  setup: { label: 'Setup & Install', icon: '⚙️', color: 'info' },
  content: { label: 'Content', icon: '📝', color: 'secondary' },
  community: { label: 'Community', icon: '🤝', color: 'success' },
  polish: { label: 'Polish', icon: '✨', color: 'warning' },
  quality: { label: 'Quality', icon: '📊', color: 'accent' },
};

const SUGGESTIONS = [
  { check: 'has-badges', tip: 'Add status badges — use the Badge Builder to add build, coverage, or version badges to the top of your README.' },
  { check: 'has-screenshots', tip: 'Add screenshots or a demo GIF — visuals help people quickly understand your project.' },
  { check: 'has-demo-url', tip: 'Link to a live demo — this helps reviewers and users try your project instantly.' },
  { check: 'has-contributing', tip: 'Add contributing guidelines — this encourages community participation.' },
  { check: 'has-license', tip: 'Add a license — this is critical for open source projects. Use the Author step to select one.' },
  { check: 'has-env-vars', tip: 'Document environment variables — helps users configure the project correctly.' },
  { check: 'has-roadmap', tip: 'Add a roadmap — shows the project is actively maintained and has future plans.' },
  { check: 'has-faq', tip: 'Add an FAQ section — anticipate common questions to reduce issues.' },
  { check: 'has-toc', tip: 'Your README is long enough to benefit from a Table of Contents — most templates auto-generate one.' },
  { check: 'has-tech-stack', tip: 'List your tech stack — helps potential contributors and users understand the project foundation.' },
  { check: 'has-installation', tip: 'Add installation steps with code blocks — clear setup instructions reduce friction.' },
  { check: 'has-usage', tip: 'Add usage examples — show how to run and use the project.' },
  { check: 'has-prerequisites', tip: 'List prerequisites (Node.js version, etc.) — prevents setup frustration.' },
  { check: 'has-author', tip: 'Add author info — helps users find and connect with the maintainer.' },
];

export default function ReadmeScore({ markdown, formData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const analysis = useMemo(() => {
    if (!markdown?.trim()) return { score: 0, passed: [], failed: [], suggestions: [], byCategory: {} };

    const results = CHECKS.map((check) => ({
      ...check,
      passed: check.test(markdown, formData),
    }));

    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const earnedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);

    // Build suggestions from failed checks
    const suggestions = SUGGESTIONS
      .filter(s => failed.some(f => f.id === s.check))
      .slice(0, 5);

    // Group by category
    const byCategory = {};
    Object.keys(CATEGORY_META).forEach(cat => {
      const checks = results.filter(r => r.category === cat);
      const passedCount = checks.filter(r => r.passed).length;
      byCategory[cat] = {
        total: checks.length,
        passed: passedCount,
        percent: checks.length > 0 ? Math.round((passedCount / checks.length) * 100) : 0,
        checks,
      };
    });

    return { score, passed, failed, suggestions, byCategory };
  }, [markdown, formData]);

  const getScoreLabel = (score) => {
    if (score >= 90) return { text: 'Exceptional', emoji: '🏆', color: 'text-success' };
    if (score >= 75) return { text: 'Great', emoji: '🌟', color: 'text-success' };
    if (score >= 60) return { text: 'Good', emoji: '👍', color: 'text-primary' };
    if (score >= 40) return { text: 'Fair', emoji: '📝', color: 'text-warning' };
    if (score >= 20) return { text: 'Basic', emoji: '🔨', color: 'text-warning' };
    return { text: 'Getting Started', emoji: '🚀', color: 'text-base-content/40' };
  };

  const label = getScoreLabel(analysis.score);

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center gap-3 hover:bg-base-200/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">README Score</h3>
            <span className={`text-xs font-bold ${label.color}`}>{label.emoji} {label.text}</span>
          </div>
          {/* Mini progress bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden max-w-48">
              <motion.div
                className={`h-full rounded-full ${
                  analysis.score >= 75 ? 'bg-success' : analysis.score >= 50 ? 'bg-primary' : analysis.score >= 25 ? 'bg-warning' : 'bg-base-300'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${analysis.score}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-base-content/70">{analysis.score}%</span>
            <span className="text-[10px] text-base-content/50 hidden sm:inline">
              {analysis.passed.length}/{CHECKS.length} checks passed
            </span>
          </div>
        </div>

        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-base-content/50" />
        </motion.div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-base-200">
              {/* Category breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4">
                {Object.entries(CATEGORY_META).map(([key, meta]) => {
                  const cat = analysis.byCategory[key];
                  if (!cat) return null;
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-base-200 bg-base-200/20 p-2.5 text-center"
                    >
                      <p className="text-xs mb-1">
                        <span className="mr-1">{meta.icon}</span>
                        <span className="font-semibold">{meta.label}</span>
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-10 h-1.5 bg-base-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cat.percent >= 80 ? 'bg-success' : cat.percent >= 50 ? 'bg-primary' : cat.percent >= 25 ? 'bg-warning' : 'bg-base-300'
                            }`}
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-base-content/60">{cat.passed}/{cat.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold flex items-center gap-1.5 text-warning">
                    <Lightbulb size={12} />
                    Top Suggestions
                  </p>
                  <div className="space-y-1.5">
                    {analysis.suggestions.map((s, i) => (
                      <motion.div
                        key={s.check}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-[11px] p-2 rounded-lg bg-warning/5 border border-warning/10"
                      >
                        <TrendingUp size={11} className="text-warning shrink-0 mt-0.5" />
                        <span className="text-base-content/70">{s.tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full check list */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold flex items-center gap-1.5 text-base-content/70">
                  <Sparkles size={12} />
                  All Checks ({analysis.passed.length} passed, {analysis.failed.length} remaining)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                  {CHECKS.map((check) => {
                    const passed = analysis.passed.some(p => p.id === check.id);
                    return (
                      <div
                        key={check.id}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] transition-colors ${
                          passed ? 'text-success' : 'text-base-content/60'
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 size={10} className="text-success shrink-0" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full border border-base-300 shrink-0" />
                        )}
                        <span className={passed ? 'line-through text-success/70' : ''}>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
