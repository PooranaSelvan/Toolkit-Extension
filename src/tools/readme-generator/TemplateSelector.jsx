import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, ChevronDown, Check, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../../utils/readmeTemplates';

export default function TemplateSelector({ selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = TEMPLATES[selected];

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Layout size={14} className="text-primary" />
      </div>
      <span className="text-xs font-medium text-base-content/60 shrink-0 hidden sm:block">Template:</span>

      {/* Desktop: pill buttons — glassmorphic selector */}
      <div className="hidden md:flex flex-wrap gap-1.5 bg-base-200/40 p-1.5 rounded-xl backdrop-blur-sm border border-base-200/60">
        {Object.entries(TEMPLATES).map(([key, tmpl]) => (
          <motion.button
            key={key}
            onClick={() => onSelect(key)}
            className={`btn btn-xs gap-1.5 rounded-lg transition-all duration-200 ${selected === key ? 'btn-primary shadow-md shadow-primary/25' : 'btn-ghost hover:bg-base-100/80'}`}
            title={tmpl.description}
          >
            <span>{tmpl.emoji}</span>
            {tmpl.name}
            {selected === key && <Check size={10} />}
          </motion.button>
        ))}
      </div>

      {/* Mobile: dropdown */}
      <div className="relative md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-sm btn-ghost gap-2"
        >
          <span>{current?.emoji}</span>
          {current?.name}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute left-0 top-full mt-1 w-72 bg-base-100 rounded-xl border border-base-300 shadow-2xl z-50 py-1.5 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-base-200/60 flex items-center gap-2">
                  <Sparkles size={11} className="text-primary" />
                  <span className="text-[11px] font-bold text-base-content/70">Choose Template Style</span>
                </div>
                {Object.entries(TEMPLATES).map(([key, tmpl], i) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { onSelect(key); setIsOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-base-200/80 transition-all duration-200 ${selected === key ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <span className="text-lg w-7 text-center">{tmpl.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">{tmpl.name}</div>
                      <div className="text-[10px] text-base-content/60 truncate">{tmpl.description}</div>
                    </div>
                    {selected === key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0"
                      >
                        <Check size={10} className="text-primary-content" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
