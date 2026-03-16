import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Eye, Code, FileText, Hash, Clock, AlignLeft, Sparkles, BarChart3 } from 'lucide-react';

export default function ReadmePreview({ markdown, stats }) {
  const [view, setView] = useState('preview');

  const qualityScore = useMemo(() => {
    if (!markdown.trim()) return 0;
    let score = 0;
    if (stats.sections >= 3) score += 20;
    else if (stats.sections >= 1) score += 10;
    if (stats.words >= 200) score += 20;
    else if (stats.words >= 50) score += 10;
    if (markdown.includes('```')) score += 15; // Has code blocks
    if (markdown.includes('|') && markdown.includes('---')) score += 10; // Has tables
    if (markdown.includes('shields.io') || markdown.includes('badge')) score += 10; // Has badges
    if (markdown.includes('## ')) score += 10; // Has sections
    if (markdown.includes('Contributing') || markdown.includes('contributing')) score += 5;
    if (markdown.includes('License') || markdown.includes('license')) score += 5;
    if (markdown.includes('Installation') || markdown.includes('install')) score += 5;
    return Math.min(100, score);
  }, [markdown, stats]);

  const qualityLabel = qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : qualityScore >= 30 ? 'Basic' : 'Getting Started';
  const qualityColor = qualityScore >= 80 ? 'text-success' : qualityScore >= 60 ? 'text-primary' : qualityScore >= 30 ? 'text-warning' : 'text-base-content/40';

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 flex flex-col h-full min-h-[400px] lg:min-h-[600px]">
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye size={14} className="text-primary" />
            </div>
            Live Preview
            {markdown.trim() && (
              <span className="badge badge-xs badge-success gap-1">
                <span className="w-1 h-1 rounded-full bg-success-content animate-pulse-soft" />
                Live
              </span>
            )}
          </h3>

          <div className="flex gap-1 bg-base-200/50 rounded-xl p-1 border border-base-200/60">
            <button
              onClick={() => setView('preview')}
              className={`btn btn-xs gap-1.5 rounded-lg transition-all duration-200 ${view === 'preview' ? 'btn-primary shadow-sm' : 'btn-ghost'}`}
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => setView('raw')}
              className={`btn btn-xs gap-1.5 rounded-lg transition-all duration-200 ${view === 'raw' ? 'btn-primary shadow-sm' : 'btn-ghost'}`}
            >
              <Code size={12} />
              <span className="hidden sm:inline">Markdown</span>
            </button>
          </div>
        </div>

        {/* Stats bar + Quality score */}
        <AnimatePresence>
          {stats && markdown.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 pb-3 border-b border-base-200/60"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  {[
                    { icon: AlignLeft, label: `${stats.lines} lines` },
                    { icon: FileText, label: `${stats.words} words` },
                    { icon: Hash, label: `${stats.chars} chars` },
                    { icon: Clock, label: `${stats.readingTime} min` },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-base-content/60">
                      <Icon size={10} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={10} className={qualityColor} />
                  <span className={`text-[11px] font-bold ${qualityColor}`}>{qualityLabel}</span>
                  <div className="w-14 h-1.5 bg-base-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${qualityScore >= 80 ? 'bg-success' : qualityScore >= 60 ? 'bg-primary' : qualityScore >= 30 ? 'bg-warning' : 'bg-base-300'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${qualityScore}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          {!markdown.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-sm text-base-content/60 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center">
                <FileText size={28} className="text-base-content/40" />
              </div>
              <p className="font-medium text-center">Fill in the fields to see your README preview</p>
              <p className="text-xs text-base-content/50 flex items-center gap-1.5">
                <Sparkles size={10} />
                Start with Project Name and Description
              </p>
            </div>
          ) : view === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="markdown-preview"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {markdown}
              </ReactMarkdown>
            </motion.div>
          ) : (
            <motion.div
              key="raw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed rounded-xl p-4 bg-base-200/80 border border-base-300 select-all overflow-auto max-h-[70vh]">
                {markdown}
              </pre>
              <div className="absolute top-2 right-2 badge badge-xs badge-ghost font-mono text-base-content/60">
                {stats.chars} chars
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
