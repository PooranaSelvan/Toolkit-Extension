import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Info, Terminal, Play, Sparkles, Layers,
  Image, GitPullRequest, Scale, User, ChevronLeft,
  Globe, Server, MapPin, HelpCircle,
  History, Heart, Twitter, Link as LinkIcon,
  Bold, Italic, Code, Link, List, ListOrdered, Quote, Minus,
  CheckCircle2, Rocket, Zap, ArrowRight,
} from 'lucide-react';


/* ────────────────────────────────────────
   Markdown Toolbar — inline formatting helper
   ──────────────────────────────────────── */
function MarkdownToolbar({ textareaId, value, onChange }) {
  const applyFormat = useCallback((before, after, placeholder) => {
    const el = document.getElementById(textareaId);
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const text = selected || placeholder;

    const newValue = value.substring(0, start) + before + text + after + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      const newPos = start + before.length + text.length;
      el.setSelectionRange(
        selected ? start + before.length : start + before.length,
        selected ? start + before.length + selected.length : newPos
      );
    }, 10);
  }, [textareaId, value, onChange]);

  const tools = [
    { icon: Bold, title: 'Bold', action: () => applyFormat('**', '**', 'bold text') },
    { icon: Italic, title: 'Italic', action: () => applyFormat('_', '_', 'italic text') },
    { icon: Code, title: 'Code', action: () => applyFormat('`', '`', 'code') },
    { icon: Link, title: 'Link', action: () => applyFormat('[', '](url)', 'link text') },
    { icon: List, title: 'Bullet List', action: () => applyFormat('- ', '', 'item') },
    { icon: ListOrdered, title: 'Numbered List', action: () => applyFormat('1. ', '', 'item') },
    { icon: Quote, title: 'Quote', action: () => applyFormat('> ', '', 'quote') },
    { icon: Minus, title: 'Horizontal Rule', action: () => applyFormat('\n---\n', '', '') },
  ];

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {tools.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <motion.button
            key={i}
            type="button"
            onClick={tool.action}
            title={tool.title}
            className="btn btn-ghost btn-xs h-7 w-7 p-0 min-h-0 text-base-content/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Icon size={13} />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────
   Modern Input Field — Glassmorphic Style
   ──────────────────────────────────────── */
function FieldInput({ label, value, onChange, placeholder, helpText, mono = false, icon: Icon }) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.trim();

  return (
    <motion.div
      className="space-y-2 group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className={`flex items-center gap-2 text-xs font-bold tracking-wide transition-all duration-300 ${isFocused ? 'text-primary translate-x-0.5' : 'text-base-content/70'}`}>
          {Icon && (
            <motion.span
              animate={isFocused ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 ${isFocused ? 'bg-primary/20 text-primary shadow-sm shadow-primary/20' : 'bg-base-200 text-base-content/60'}`}
            >
              <Icon size={12} />
            </motion.span>
          )}
          {label}
          {hasValue && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-2 h-2 rounded-full bg-success ml-auto shadow-md shadow-success/40 ring-2 ring-success/20"
            />
          )}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`input input-sm w-full transition-all duration-300 rounded-xl backdrop-blur-sm ${
            mono ? 'font-mono text-xs' : ''
          } ${
            hasValue ? 'border-success/30 bg-success/[0.04]' : 'bg-base-100/80'
          } ${
            isFocused ? '!border-primary/50 !shadow-[0_0_0_4px] !shadow-primary/10 !bg-base-100 ring-1 ring-primary/5' : ''
          }`}
        />
        {/* Animated underline glow */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full"
          initial={{ width: '0%', x: '-50%' }}
          animate={isFocused ? { width: '90%', x: '-50%' } : { width: '0%', x: '-50%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {helpText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-base-content/60 flex items-center gap-1.5 pl-0.5"
        >
          <Info size={9} className="shrink-0 text-primary/70" />
          {helpText}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────
   Modern Textarea Field — Glassmorphic Style
   ──────────────────────────────────────── */
function FieldTextarea({ id, label, value, onChange, placeholder, rows = 3, mono = false, showToolbar = false, icon: Icon, helpText }) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const hasValue = value && value.trim();
  const lineCount = (value || '').split('\n').filter(Boolean).length;

  return (
    <motion.div
      className="space-y-2 group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className={`flex items-center gap-2 text-xs font-bold tracking-wide transition-all duration-300 ${isFocused ? 'text-primary translate-x-0.5' : 'text-base-content/70'}`}>
            {Icon && (
              <motion.span
                animate={isFocused ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 ${isFocused ? 'bg-primary/20 text-primary shadow-sm shadow-primary/20' : 'bg-base-200 text-base-content/60'}`}
              >
                <Icon size={12} />
              </motion.span>
            )}
            {label}
            {hasValue && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="badge badge-xs font-mono font-normal text-primary bg-primary/10 border-primary/20 ml-1 gap-0.5"
              >
                {lineCount} {lineCount === 1 ? 'line' : 'lines'}
              </motion.span>
            )}
          </label>
        )}
        {showToolbar && (
          <motion.div
            initial={false}
            animate={{ opacity: isFocused ? 1 : 0.5, y: isFocused ? 0 : 3, scale: isFocused ? 1 : 0.95 }}
            transition={{ duration: 0.25 }}
            className="bg-base-200/60 rounded-lg px-1 py-0.5 backdrop-blur-sm"
          >
            <MarkdownToolbar
              textareaId={textareaId}
              value={value || ''}
              onChange={onChange}
            />
          </motion.div>
        )}
      </div>
      <div className="relative">
        <textarea
          id={textareaId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={rows}
          className={`textarea text-sm w-full transition-all duration-300 rounded-xl backdrop-blur-sm ${
            mono ? 'font-mono text-xs' : ''
          } ${
            hasValue ? 'border-success/30 bg-success/[0.04]' : 'bg-base-100/80'
          } ${
            isFocused ? '!border-primary/50 !shadow-[0_0_0_4px] !shadow-primary/10 !bg-base-100 ring-1 ring-primary/5' : ''
          }`}
        />
        {/* Animated corner glow */}
        <motion.div
          className="absolute -top-px -right-px w-8 h-8 bg-gradient-to-bl from-primary/20 to-transparent rounded-tr-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {helpText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-base-content/60 flex items-center gap-1.5 pl-0.5"
        >
          <Info size={9} className="shrink-0 text-primary/70" />
          {helpText}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────
   Modern Select Field — Glassmorphic Style
   ──────────────────────────────────────── */
function FieldSelect({ label, value, onChange, options, placeholder, icon: Icon }) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.trim();

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className={`flex items-center gap-2 text-xs font-bold tracking-wide transition-all duration-300 ${isFocused ? 'text-primary translate-x-0.5' : 'text-base-content/70'}`}>
          {Icon && (
            <motion.span
              animate={isFocused ? { scale: 1.15 } : { scale: 1 }}
              className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 ${isFocused ? 'bg-primary/20 text-primary shadow-sm shadow-primary/20' : 'bg-base-200 text-base-content/60'}`}
            >
              <Icon size={12} />
            </motion.span>
          )}
          {label}
          {hasValue && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-2 h-2 rounded-full bg-success ml-auto shadow-md shadow-success/40 ring-2 ring-success/20"
            />
          )}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`select select-sm w-full transition-all duration-300 rounded-xl backdrop-blur-sm ${
          hasValue ? 'border-success/30 bg-success/[0.04]' : 'bg-base-100/80'
        } ${
          isFocused ? '!border-primary/50 !shadow-[0_0_0_4px] !shadow-primary/10 ring-1 ring-primary/5' : ''
        }`}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.filter(Boolean).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </motion.div>
  );
}

/* ────────────────────────────────────────
   Step Definitions
   ──────────────────────────────────────── */
const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'GPL-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'MPL-2.0', 'LGPL-3.0', 'AGPL-3.0', 'Unlicense', 'CC0-1.0'];

const STEPS = [
  {
    id: 'essentials',
    label: 'Essentials',
    icon: FileText,
    fields: ['projectName', 'description', 'features', 'techStack'],
    description: 'Core project information',
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: Terminal,
    fields: ['prerequisites', 'installation', 'usage', 'envVars'],
    description: 'Installation & usage guides',
  },
  {
    id: 'details',
    label: 'Details',
    icon: Globe,
    fields: ['apiReference', 'demoUrl', 'screenshots', 'roadmap'],
    description: 'API, demos & roadmap',
  },
  {
    id: 'community',
    label: 'Community',
    icon: Heart,
    fields: ['faq', 'contributing', 'changelog', 'acknowledgments'],
    description: 'Docs & community',
  },
  {
    id: 'author',
    label: 'Author',
    icon: User,
    fields: ['license', 'author', 'authorTwitter', 'authorWebsite'],
    description: 'License & credits',
  },
];

/* ────────────────────────────────────────
   Step Navigation Pills — Glassmorphic Tabs
   ──────────────────────────────────────── */
function StepNav({ steps, activeStep, onStepChange, filledMap }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin bg-base-200/40 rounded-2xl p-1.5 border border-base-200/60">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = activeStep === idx;
        const filledCount = step.fields.filter((f) => filledMap[f]).length;
        const allFilled = filledCount === step.fields.length;
        const hasSome = filledCount > 0;

        return (
          <motion.button
            key={step.id}
            type="button"
            onClick={() => onStepChange(idx)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden ${
              isActive
                ? 'bg-primary text-primary-content shadow-lg shadow-primary/30'
                : allFilled
                  ? 'bg-success/10 text-success hover:bg-success/20 border border-success/25 shadow-sm shadow-success/5'
                  : hasSome
                    ? 'bg-base-100/80 text-base-content/80 hover:bg-base-100 border border-base-300/50 shadow-sm'
                    : 'bg-base-100/50 text-base-content/60 hover:bg-base-100/80 hover:text-base-content/80'
            }`}
          >
            {/* Background glow for active */}
            {isActive && (
              <motion.div
                layoutId="step-glow"
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <motion.div animate={isActive ? { rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.5 }}>
              <Icon size={14} />
            </motion.div>
            <span className="hidden sm:inline">{step.label}</span>

            {/* filled indicator */}
            {!isActive && allFilled && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <CheckCircle2 size={12} className="text-success" />
              </motion.div>
            )}
            {!isActive && hasSome && !allFilled && (
              <span className="text-[10px] font-mono text-base-content/60 tabular-nums bg-base-200/80 px-1.5 py-0.5 rounded-md">{filledCount}/{step.fields.length}</span>
            )}

            
          </motion.button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────
   Individual Step Panels
   ──────────────────────────────────────── */
function StepEssentials({ formData, onChange }) {
  const filledCount = ['projectName', 'description', 'features', 'techStack'].filter(
    (f) => formData[f] && formData[f].trim()
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
          <FileText size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
            Project Essentials
            {filledCount === 4 && (
              <motion.span
                initial={{ opacity: 0, scale: 0, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="text-[10px] font-bold text-success bg-success/15 border border-success/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-success/10"
              >
                <Zap size={9} /> Complete!
              </motion.span>
            )}
          </h3>
          <p className="text-[11px] text-base-content/60">The core identity of your project</p>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i < filledCount
                  ? 'bg-primary shadow-md shadow-primary/40 ring-2 ring-primary/20 scale-110'
                  : 'bg-base-300/60 ring-1 ring-base-300'
              }`}
            />
          ))}
        </div>
      </div>

      <FieldInput
        label="Project Name"
        icon={FileText}
        value={formData.projectName}
        onChange={(v) => onChange('projectName', v)}
        placeholder="My Awesome Project"
      />

      <FieldTextarea
        id="field-description"
        label="Description"
        icon={Info}
        value={formData.description}
        onChange={(v) => onChange('description', v)}
        placeholder="A brief description of what your project does and why it exists..."
        rows={3}
        showToolbar
      />

      <FieldTextarea
        id="field-features"
        label="Features"
        icon={Sparkles}
        value={formData.features}
        onChange={(v) => onChange('features', v)}
        placeholder={"Fast and lightweight\nEasy to configure\nWell documented\nResponsive design"}
        rows={4}
        showToolbar
      />

      <FieldInput
        label="Tech Stack"
        icon={Layers}
        value={formData.techStack}
        onChange={(v) => onChange('techStack', v)}
        placeholder="React, Node.js, MongoDB, TailwindCSS"
        helpText="Comma-separated list — used for badges & tech section"
      />
    </div>
  );
}

function StepSetup({ formData, onChange }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/25 to-secondary/10 flex items-center justify-center shadow-md shadow-secondary/10 border border-secondary/15 overflow-hidden">
          <Terminal size={18} className="text-secondary relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-secondary/5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold tracking-tight">Installation & Usage</h3>
          <p className="text-[11px] text-base-content/60">Help others get started with your project</p>
        </div>
      </div>

      <FieldTextarea
        id="field-prerequisites"
        label="Prerequisites"
        icon={Server}
        value={formData.prerequisites}
        onChange={(v) => onChange('prerequisites', v)}
        placeholder={"- Node.js >= 16.x\n- npm >= 8.x or yarn\n- MongoDB running locally"}
        rows={3}
      />

      <FieldTextarea
        id="field-installation"
        label="Installation Steps"
        icon={Terminal}
        value={formData.installation}
        onChange={(v) => onChange('installation', v)}
        placeholder={"npm install\n# or\nyarn install"}
        rows={3}
        mono
      />

      <FieldTextarea
        id="field-usage"
        label="Usage / Run Commands"
        icon={Play}
        value={formData.usage}
        onChange={(v) => onChange('usage', v)}
        placeholder={"npm start\n# or\nnpm run dev"}
        rows={3}
        mono
      />

      <FieldTextarea
        id="field-envVars"
        label="Environment Variables"
        icon={Server}
        value={formData.envVars}
        onChange={(v) => onChange('envVars', v)}
        placeholder={"DATABASE_URL=mongodb://localhost:27017/mydb\nAPI_KEY=your_api_key_here\nPORT=3000"}
        rows={4}
        mono
        helpText="Format: KEY=description — each line becomes a table row"
      />
    </div>
  );
}

function StepDetails({ formData, onChange }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 flex items-center justify-center shadow-md shadow-accent/10 border border-accent/15 overflow-hidden">
          <Globe size={18} className="text-accent relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-accent/5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold tracking-tight">API, Demos & Roadmap</h3>
          <p className="text-[11px] text-base-content/60">Showcase your project's capabilities</p>
        </div>
      </div>

      <FieldTextarea
        id="field-apiReference"
        label="API Endpoints"
        icon={Globe}
        value={formData.apiReference}
        onChange={(v) => onChange('apiReference', v)}
        placeholder={"GET /api/users List all users\nPOST /api/users Create a new user\nGET /api/users/:id Get user by ID"}
        rows={4}
        mono
        helpText="Format: METHOD /endpoint Description — one per line"
      />

      <FieldInput
        label="Live Demo URL"
        icon={Globe}
        value={formData.demoUrl}
        onChange={(v) => onChange('demoUrl', v)}
        placeholder="https://my-project.vercel.app"
      />

      <FieldTextarea
        id="field-screenshots"
        label="Screenshots"
        icon={Image}
        value={formData.screenshots}
        onChange={(v) => onChange('screenshots', v)}
        placeholder={"![Home Page](https://example.com/screenshot-home.png)\n![Dashboard](https://example.com/screenshot-dashboard.png)"}
        rows={3}
        showToolbar
        helpText="Use markdown image syntax: ![alt](url)"
      />

      <FieldTextarea
        id="field-roadmap"
        label="Planned Features"
        icon={MapPin}
        value={formData.roadmap}
        onChange={(v) => onChange('roadmap', v)}
        placeholder={"Add dark mode support\nImplement real-time collaboration\nAdd mobile app\nInternationalization (i18n)"}
        rows={4}
        helpText="One item per line — rendered as checkboxes in the README"
      />
    </div>
  );
}

function StepCommunity({ formData, onChange }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-error/25 to-error/10 flex items-center justify-center shadow-md shadow-error/10 border border-error/15 overflow-hidden">
          <Heart size={18} className="text-error relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-error/5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold tracking-tight">Community & Docs</h3>
          <p className="text-[11px] text-base-content/60">FAQ, contributions & changelog</p>
        </div>
      </div>

      <FieldTextarea
        id="field-faq"
        label="Frequently Asked Questions"
        icon={HelpCircle}
        value={formData.faq}
        onChange={(v) => onChange('faq', v)}
        placeholder={"Q: How do I install this?\nA: Run npm install and follow the setup guide.\nQ: Is this free to use?\nA: Yes, it's open source under the MIT license."}
        rows={5}
        showToolbar
        helpText="Format: Q: Question on one line, A: Answer on the next"
      />

      <FieldTextarea
        id="field-contributing"
        label="Contribution Guidelines"
        icon={GitPullRequest}
        value={formData.contributing}
        onChange={(v) => onChange('contributing', v)}
        placeholder="Please read our contributing guidelines before submitting a pull request..."
        rows={4}
        showToolbar
      />

      <FieldTextarea
        id="field-changelog"
        label="Version History"
        icon={History}
        value={formData.changelog}
        onChange={(v) => onChange('changelog', v)}
        placeholder={"### v1.0.0 (2024-01-15)\n- Initial release\n- Added core features\n\n### v0.9.0 (2024-01-01)\n- Beta release"}
        rows={5}
        mono
        showToolbar
      />

      <FieldTextarea
        id="field-acknowledgments"
        label="Credits & Thanks"
        icon={Heart}
        value={formData.acknowledgments}
        onChange={(v) => onChange('acknowledgments', v)}
        placeholder={"React team for an amazing framework\nTailwind CSS for utility-first styling\nOpen source community for inspiration"}
        rows={3}
        helpText="One acknowledgment per line — rendered as bullet points"
      />
    </div>
  );
}

function StepAuthor({ formData, onChange }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-warning/25 to-warning/10 flex items-center justify-center shadow-md shadow-warning/10 border border-warning/15 overflow-hidden">
          <User size={18} className="text-warning relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-warning/5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold tracking-tight">License & Author</h3>
          <p className="text-[11px] text-base-content/60">Legal info and your personal details</p>
        </div>
      </div>

      <FieldSelect
        label="License"
        icon={Scale}
        value={formData.license}
        onChange={(v) => onChange('license', v)}
        options={LICENSES}
        placeholder="Select a license..."
      />

      <FieldInput
        label="Author / GitHub Username"
        icon={User}
        value={formData.author}
        onChange={(v) => onChange('author', v)}
        placeholder="your-username"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldInput
          label="Twitter Handle"
          icon={Twitter}
          value={formData.authorTwitter}
          onChange={(v) => onChange('authorTwitter', v)}
          placeholder="your_twitter"
        />
        <FieldInput
          label="Website URL"
          icon={LinkIcon}
          value={formData.authorWebsite}
          onChange={(v) => onChange('authorWebsite', v)}
          placeholder="https://yoursite.com"
        />
      </div>
    </div>
  );
}

const STEP_COMPONENTS = [StepEssentials, StepSetup, StepDetails, StepCommunity, StepAuthor];

/* ────────────────────────────────────────
   Main Form Component — Wizard Layout
   ──────────────────────────────────────── */
export default function ReadmeForm({ formData, onChange }) {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const hasContent = useCallback((field) => {
    const val = formData[field];
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === 'string' && val.trim() !== '';
  }, [formData]);

  const filledMap = useMemo(() => {
    const map = {};
    const allFields = STEPS.flatMap((s) => s.fields);
    allFields.forEach((f) => { map[f] = hasContent(f); });
    return map;
  }, [hasContent]);

  const allFields = STEPS.flatMap((s) => s.fields);
  const filledCount = allFields.filter((f) => filledMap[f]).length;
  const completionPercent = Math.round((filledCount / allFields.length) * 100);

  const goToStep = (idx) => {
    setDirection(idx > activeStep ? 1 : -1);
    setActiveStep(idx);
  };

  const goNext = () => {
    if (activeStep < STEPS.length - 1) {
      setDirection(1);
      setActiveStep((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (activeStep > 0) {
      setDirection(-1);
      setActiveStep((p) => p - 1);
    }
  };

  const StepComponent = STEP_COMPONENTS[activeStep];

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="space-y-4">
      {/* ═══ COMPLETION PROGRESS BAR ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-1"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
              <Rocket size={11} className="text-primary" />
              README Completeness
            </span>
            <span className={`text-[11px] font-bold tabular-nums ${completionPercent === 100 ? 'text-success' : completionPercent > 50 ? 'text-primary' : 'text-base-content/60'}`}>
              {completionPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-500 ${
                completionPercent === 100
                  ? 'bg-gradient-to-r from-success to-success/80'
                  : completionPercent > 50
                    ? 'bg-gradient-to-r from-primary to-primary/70'
                    : 'bg-gradient-to-r from-base-content/30 to-base-content/20'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
        <span className="text-[10px] text-base-content/60 tabular-nums whitespace-nowrap">
          {filledCount}/{allFields.length} fields
        </span>
      </motion.div>

      {/* ═══ STEP NAVIGATION ═══ */}
      <StepNav
        steps={STEPS}
        activeStep={activeStep}
        onStepChange={goToStep}
        filledMap={filledMap}
      />

      {/* ═══ STEP CONTENT ═══ */}
      <div className="rounded-2xl border border-base-300 bg-base-100">
        <div className="relative p-4 sm:p-6 overflow-hidden min-h-[380px]">

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <StepComponent formData={formData} onChange={onChange} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══ STEP FOOTER — Navigation Buttons ═══ */}
        <div className="px-6 pb-5">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-base-300/50 to-transparent mb-5" />
          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              onClick={goPrev}
              disabled={activeStep === 0}
              className="btn btn-ghost btn-sm gap-1.5 disabled:opacity-30 rounded-xl hover:bg-base-200/80"
            >
              <ChevronLeft size={14} />
              <span className="text-base-content/80">Back</span>
            </motion.button>

            {/* Step dots — enhanced pill indicator */}
            <div className="flex items-center gap-2 bg-base-200/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
              {STEPS.map((_, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`transition-all duration-400 rounded-full ${
                    idx === activeStep
                      ? 'w-7 h-2.5 bg-primary shadow-md shadow-primary/30'
                      : 'w-2.5 h-2.5 bg-base-300/80 hover:bg-primary/40'
                  }`}
                />
              ))}
            </div>

            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="btn btn-primary btn-sm gap-1.5 rounded-xl"
              >
                Next
                <ArrowRight size={14} />
              </button>
            ) : (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 border border-success/20 px-4 py-2 rounded-xl shadow-sm shadow-success/10"
              >
                <CheckCircle2 size={14} />
                All Done
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}