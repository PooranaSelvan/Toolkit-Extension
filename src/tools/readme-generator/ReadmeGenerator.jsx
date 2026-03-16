import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Copy, Download, Check, RefreshCw, Save, FolderOpen,
  Trash2, FileCode, Maximize2, Minimize2, Clock, FileText,
  ChevronDown, Share2, Wand2, FileStack
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useDownloadFile from '../../hooks/useDownloadFile';
import useLocalStorage from '../../hooks/useLocalStorage';
import { TEMPLATES } from '../../utils/readmeTemplates';
import { parseGitHubUrl, deepAnalyzeRepo } from '../../services/githubService';
import GitHubImport from './GitHubImport';
import ReadmeForm from './ReadmeForm';
import ReadmePreview from './ReadmePreview';
import TemplateSelector from './TemplateSelector';
import BadgeBuilder from './BadgeBuilder';
import CustomSections from './CustomSections';
import WidgetInserter from './WidgetInserter';
import ReadmeScore from './ReadmeScore';
import SectionTemplates from './SectionTemplates';

const INITIAL_FORM = {
  projectName: '',
  description: '',
  installation: '',
  usage: '',
  features: '',
  techStack: '',
  screenshots: '',
  contributing: '',
  license: '',
  author: '',
  authorTwitter: '',
  authorWebsite: '',
  badges: [],
  demoUrl: '',
  prerequisites: '',
  envVars: '',
  apiReference: '',
  roadmap: '',
  faq: '',
  changelog: '',
  acknowledgments: '',
  customSections: [],
};

const STORAGE_KEY = 'readme-generator-drafts';

// Load autosave from localStorage (called once during init)
const _autosaveCache = (() => {
  try {
    const saved = localStorage.getItem('readme-generator-autosave');
    if (saved) {
      const parsed = JSON.parse(saved);
      const timeDiff = Date.now() - parsed.savedAt;
      if (timeDiff < 86400000 && parsed.formData) {
        return {
          formData: { ...INITIAL_FORM, ...parsed.formData },
          template: parsed.template && TEMPLATES[parsed.template] ? parsed.template : 'openSource',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load README autosave:', err?.message || 'Unknown error');
  }
  return null;
})();
export default function ReadmeGenerator() {
  const [formData, setFormData] = useState(() => _autosaveCache ? _autosaveCache.formData : INITIAL_FORM);
  const [template, setTemplate] = useState(() => _autosaveCache ? _autosaveCache.template : 'openSource');
  const [activeTab, setActiveTab] = useState('edit');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [githubSuccess, setGithubSuccess] = useState('');
  const [githubProgress, setGithubProgress] = useState(0);
  const [githubMeta, setGithubMeta] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useLocalStorage(STORAGE_KEY, []);
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [showSectionTemplates, setShowSectionTemplates] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { copied, copyToClipboard } = useCopyToClipboard();
  const { downloadFile } = useDownloadFile();

  const generatedMarkdown = useMemo(() => {
    const templateFn = TEMPLATES[template]?.fn;
    return templateFn ? templateFn(formData) : '';
  }, [formData, template]);

  // Stats
  const stats = useMemo(() => {
    const words = generatedMarkdown.split(/\s+/).filter(Boolean).length;
    const chars = generatedMarkdown.length;
    const lines = generatedMarkdown.split('\n').length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const sections = (generatedMarkdown.match(/^## /gm) || []).length;
    return { words, chars, lines, readingTime, sections };
  }, [generatedMarkdown]);

  // Autosave to localStorage every 30 seconds
  useEffect(() => {
    const hasContent = Object.entries(formData).some(([key, val]) => {
      if (key === 'badges' || key === 'customSections') return Array.isArray(val) && val.length > 0;
      return typeof val === 'string' && val.trim() !== '';
    });
    if (!hasContent) return;

const timer = setTimeout(() => {
      try {
        localStorage.setItem('readme-generator-autosave', JSON.stringify({
          formData,
          template,
          savedAt: Date.now(),
        }));
      } catch (err) {
        console.warn('Failed to autosave README draft:', err?.message || 'Storage quota exceeded');
      }
    }, 30000);    return () => clearTimeout(timer);
  }, [formData, template]);

  

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGitHubImport = async (url) => {
    setGithubError('');
    setGithubSuccess('');
    setGithubProgress(0);
    setGithubMeta(null);
    const parsed = parseGitHubUrl(url);

    if (!parsed) {
      setGithubError('Invalid GitHub URL. Use format: https://github.com/owner/repo');
      return;
    }

    setGithubLoading(true);

    let result;
    try {
      result = await deepAnalyzeRepo(parsed.owner, parsed.repo, (step) => {
        setGithubProgress(step);
      });
    } catch (err) {
      setGithubLoading(false);
      setGithubProgress(0);
      setGithubError(`Unexpected error during analysis: ${err?.message || 'Unknown error'}`);
      return;
    }

    setGithubLoading(false);
    setGithubProgress(0);

    if (!result || !result.success) {
      setGithubError(result?.error || 'Analysis failed with an unknown error.');
      return;
    }

    const { data: analyzedData, meta } = result;

    // Merge analyzed data into form — only overwrite empty/blank fields,
    // or always overwrite if the form is still at initial state
    setFormData((prev) => {
      const isInitial = !prev.projectName && !prev.description;
      const merged = { ...prev };

      Object.entries(analyzedData).forEach(([key, val]) => {
        if (val === undefined || val === null) return;
        if (Array.isArray(val)) {
          // For arrays (badges, customSections), merge only if not empty
          if (val.length > 0 && (isInitial || !prev[key] || prev[key].length === 0)) {
            merged[key] = val;
          }
        } else if (typeof val === 'string' && val.trim()) {
          // For strings, overwrite if initial or prev is empty
          if (isInitial || !prev[key] || !prev[key].trim()) {
            merged[key] = val;
          }
        }
      });

      return merged;
    });

    setGithubMeta(meta);
    setGithubSuccess(
      `✨ Complete README generated from ${meta.fullName} — ⭐ ${meta.stars} stars, 🍴 ${meta.forks} forks`
    );
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setFormData(INITIAL_FORM);
    setGithubError('');
    setGithubSuccess('');
    setGithubMeta(null);
    setGithubProgress(0);
    localStorage.removeItem('readme-generator-autosave');
    setShowResetConfirm(false);
  };

  // Draft management
  const handleSaveDraft = () => {
    if (!draftName.trim()) return;
    const newDraft = {
      id: Date.now().toString(),
      name: draftName.trim(),
      formData,
      template,
      savedAt: Date.now(),
    };
    setSavedDrafts((prev) => [newDraft, ...prev.slice(0, 19)]);
    setDraftName('');
    setShowSaveInput(false);
  };

  const handleLoadDraft = (draft) => {
    setFormData({ ...INITIAL_FORM, ...draft.formData });
    if (draft.template && TEMPLATES[draft.template]) {
      setTemplate(draft.template);
    }
    setShowDrafts(false);
  };

  const handleDeleteDraft = (id) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleExportHtml = () => {
    try {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.projectName || 'README'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css">
  <style>
    body { max-width: 980px; margin: 0 auto; padding: 40px 20px; }
    .markdown-body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  </style>
</head>
<body class="markdown-body">
${generatedMarkdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></` + `script>
<script>document.body.innerHTML = '<div class="markdown-body">' + marked.parse(document.body.innerText) + '</div>';</` + `script>
</body>
</html>`;
    downloadFile(html, 'README.html', 'text/html');
    } catch (err) {
      console.error('HTML export failed:', err);
    }
  };

  // Insert widget markdown into custom sections
  const handleWidgetInsert = useCallback((markdown) => {
    setFormData((prev) => {
      const currentSections = prev.customSections || [];
      // Check if there's an existing "Widgets" custom section
      const widgetIdx = currentSections.findIndex((s) => s.title === 'Widgets' || s.title === '');
      if (widgetIdx >= 0 && !currentSections[widgetIdx].title) {
        // Append to an existing untitled section
        const updated = [...currentSections];
        updated[widgetIdx] = {
          ...updated[widgetIdx],
          content: (updated[widgetIdx].content ? updated[widgetIdx].content + '\n\n' : '') + markdown,
        };
        return { ...prev, customSections: updated };
      }
      // Otherwise insert into the description or features depending on context
      // For simplicity, append to description
      const newDesc = prev.description ? prev.description + '\n\n' + markdown : markdown;
      return { ...prev, description: newDesc };
    });
  }, []);

  // Share as URL
  const handleShareUrl = useCallback(async () => {
    try {
      const shareData = { formData, template };
      const jsonStr = JSON.stringify(shareData);
      const bytes = new TextEncoder().encode(jsonStr);
      const encoded = btoa(String.fromCharCode(...bytes));
      const url = `${window.location.origin}${window.location.pathname}#readme=${encoded}`;
      // Use the VS Code-compatible clipboard bridge instead of navigator.clipboard directly
      await copyToClipboard(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      console.error('Share URL creation failed:', err);
    }
  }, [formData, template, copyToClipboard]);

  // Load from URL hash on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#readme=')) {
        const encoded = hash.slice(8);
        const binaryStr = atob(encoded);
        const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
        const decoded = JSON.parse(new TextDecoder().decode(bytes));
        if (decoded.formData) {
          setFormData({ ...INITIAL_FORM, ...decoded.formData });
        }
        if (decoded.template && TEMPLATES[decoded.template]) {
          setTemplate(decoded.template);
        }
        // Clean the hash after loading
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // Silently ignore invalid hash data
    }
  }, []);

  // Handle section template apply
  const handleSectionTemplateApply = useCallback((field, value) => {
    handleFieldChange(field, value);
  }, [handleFieldChange]);

  return (
    <div className={`max-w-7xl mx-auto space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-base-100 p-4 sm:p-6 overflow-auto max-w-none' : ''}`}>
      {/* GitHub Import */}
      <GitHubImport
        onImport={handleGitHubImport}
        loading={githubLoading}
        error={githubError}
        success={githubSuccess}
        progressStep={githubProgress}
        successMeta={githubMeta}
      />

      {/* Toolbar */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Template Selector */}
            <TemplateSelector selected={template} onSelect={setTemplate} />

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stats pill */}
              <div className="hidden md:flex items-center gap-3 text-[11px] text-base-content/70 mr-2 select-none bg-base-200/60 rounded-lg px-3 py-1.5">
                <span className="flex items-center gap-1">
                  <FileText size={10} />
                  <span className="font-semibold">{stats.words}</span> words
                </span>
                <span className="text-base-content/30">•</span>
                <span><span className="font-semibold">{stats.sections}</span> sections</span>
                <span className="text-base-content/30">•</span>
                <span className="flex items-center gap-1"><Clock size={10} /><span className="font-semibold">{stats.readingTime}</span> min</span>
              </div>

              {/* Drafts */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowDrafts(!showDrafts)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-200 ${showDrafts ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
                  title="Saved drafts"
                >
                  <FolderOpen size={14} />
                  <span className="hidden sm:inline">Drafts</span>
                  {savedDrafts.length > 0 && (
                    <span className="badge badge-xs badge-primary shadow-sm shadow-primary/20">{savedDrafts.length}</span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showDrafts && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDrafts(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-80 bg-base-100 rounded-xl border border-base-300 shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-base-200 flex items-center justify-between">
                          <span className="text-xs font-semibold">Saved Drafts</span>
                          <span className="text-[11px] text-base-content/50">{savedDrafts.length}/20</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {savedDrafts.length === 0 ? (
                            <div className="p-6 text-center text-xs text-base-content/50">No saved drafts yet</div>
                          ) : (
                            savedDrafts.map((draft, idx) => (
                              <motion.div
                                key={draft.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-2 px-3 py-2.5 hover:bg-base-200 transition-colors group"
                              >
                                <button
                                  onClick={() => handleLoadDraft(draft)}
                                  className="flex-1 text-left"
                                >
                                  <div className="text-xs font-medium truncate">{draft.name}</div>
                                  <div className="text-[10px] text-base-content/50 mt-0.5">
                                    {TEMPLATES[draft.template]?.emoji} {TEMPLATES[draft.template]?.name} • {new Date(draft.savedAt).toLocaleDateString()}
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:text-error"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Save Draft */}
              <AnimatePresence mode="wait">
                {showSaveInput ? (
                  <motion.div
                    key="save-input"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-1.5 overflow-hidden bg-base-200/60 rounded-xl px-2 py-1 border border-base-300/50"
                  >
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Draft name..."
                      className="input input-xs w-28 sm:w-36 rounded-lg"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDraft();
                        if (e.key === 'Escape') setShowSaveInput(false);
                      }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSaveDraft}
                      disabled={!draftName.trim()}
                      className="btn btn-primary btn-xs rounded-lg shadow-sm shadow-primary/20"
                    >
                      Save
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSaveInput(false)} className="btn btn-ghost btn-xs rounded-lg">✕</motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="save-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowSaveInput(true)}
                    className="btn btn-ghost btn-sm gap-1.5 rounded-xl hover:bg-base-200/80"
                    title="Save as draft"
                  >
                    <Save size={14} />
                    <span className="hidden sm:inline">Save</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="w-px h-5 bg-gradient-to-b from-transparent via-base-300 to-transparent hidden sm:block" />

              {/* Widget Library toggle */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setShowWidgets(!showWidgets); setShowSectionTemplates(false); }}
                className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-200 ${showWidgets ? 'btn-primary shadow-md shadow-primary/20' : 'btn-ghost hover:bg-base-200/80'}`}
                title="Widget Library — insert stats, badges, typing SVGs"
              >
                <Wand2 size={14} />
                <span className="hidden sm:inline">Widgets</span>
              </motion.button>

              {/* Section Templates toggle */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setShowSectionTemplates(!showSectionTemplates); setShowWidgets(false); }}
                className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-200 ${showSectionTemplates ? 'btn-secondary shadow-md shadow-secondary/20' : 'btn-ghost hover:bg-base-200/80'}`}
                title="Section Templates — pre-written content blocks"
              >
                <FileStack size={14} />
                <span className="hidden sm:inline">Sections</span>
              </motion.button>

              <div className="w-px h-5 bg-gradient-to-b from-transparent via-base-300 to-transparent hidden sm:block" />

              {/* Share URL */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleShareUrl}
                className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-300 ${
                  shareSuccess ? 'btn-success shadow-md shadow-success/20' : 'btn-ghost hover:bg-base-200/80'
                }`}
                title="Share README via URL"
              >
                {shareSuccess ? <Check size={14} /> : <Share2 size={14} />}
                <span className="hidden sm:inline">{shareSuccess ? 'Copied!' : 'Share'}</span>
              </motion.button>

              <div className="w-px h-5 bg-gradient-to-b from-transparent via-base-300 to-transparent hidden sm:block" />

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.04, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReset}
                  className="btn btn-ghost btn-sm gap-1.5 rounded-xl hover:bg-error/10 hover:text-error transition-colors"
                  title="Reset all fields"
                >
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Reset</span>
                </motion.button>
                <AnimatePresence>
                  {showResetConfirm && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowResetConfirm(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-base-100 rounded-xl border border-error/20 shadow-2xl z-50 p-4"
                      >
                        <p className="text-sm font-semibold mb-1">Reset all fields?</p>
                        <p className="text-xs opacity-60 mb-3">This cannot be undone.</p>
                        <div className="flex gap-2">
                          <button onClick={confirmReset} className="btn btn-error btn-xs gap-1.5 rounded-lg">
                            <RefreshCw size={12} /> Yes, Reset
                          </button>
                          <button onClick={() => setShowResetConfirm(false)} className="btn btn-ghost btn-xs rounded-lg">Cancel</button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="btn btn-ghost btn-sm gap-1.5 rounded-xl hover:bg-base-200/80"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </motion.button>

              <div className="w-px h-5 bg-gradient-to-b from-transparent via-base-300 to-transparent hidden sm:block" />

              {/* Copy button — enhanced */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(generatedMarkdown)}
                className={`btn btn-sm gap-1.5 rounded-xl transition-all duration-300 ${
                  copied
                    ? 'btn-success shadow-md shadow-success/20'
                    : 'btn-outline hover:shadow-md border-base-300'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>

              {/* Export dropdown */}
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-primary btn-sm gap-1.5 rounded-xl">
                  <Download size={14} />
                  Export
                  <ChevronDown size={12} />
                </button>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100/95 backdrop-blur-xl rounded-xl border border-base-300/50 shadow-2xl z-50 w-56 p-2 mt-2">
                  <li>
                    <button onClick={() => downloadFile(generatedMarkdown, 'README.md')} className="flex items-center gap-2.5 text-xs rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <FileText size={14} />
                      Download README.md
                    </button>
                  </li>
                  <li>
                    <button onClick={handleExportHtml} className="flex items-center gap-2.5 text-xs rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <FileCode size={14} />
                      Export as HTML
                    </button>
                  </li>
                  <li>
                    <button onClick={() => copyToClipboard(generatedMarkdown)} className="flex items-center gap-2.5 text-xs rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <Copy size={14} />
                      Copy to Clipboard
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </div>

      {/* Mobile stats */}
      <div className="flex md:hidden items-center gap-3 text-[11px] text-base-content/60 px-1 select-none">
        <span>{stats.words} words</span>
        <span>•</span>
        <span>{stats.lines} lines</span>
        <span>•</span>
        <span>{stats.sections} sections</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Clock size={10} />{stats.readingTime} min read</span>
      </div>

      {/* Widget Library Panel — expandable above the editor */}
      <AnimatePresence>
        {showWidgets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <WidgetInserter
              username={formData.author}
              onInsert={handleWidgetInsert}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Templates Panel */}
      <AnimatePresence>
        {showSectionTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <SectionTemplates
              onApply={handleSectionTemplateApply}
              formData={formData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tabs — animated indicator */}
      <div className="tabs tabs-border lg:hidden">
        {['edit', 'badges', 'score', 'preview'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active font-semibold' : ''}`}
          >
            {tab === 'score' ? 'Score' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main editor grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column — Form */}
        <div className={`space-y-5 ${activeTab === 'preview' ? 'hidden lg:block' : ''} ${activeTab === 'badges' ? 'hidden lg:block' : ''} ${activeTab === 'score' ? 'hidden lg:block' : ''}`}>
          <ReadmeForm formData={formData} onChange={handleFieldChange} />

          {/* Badge Builder (visible on desktop) */}
          <div className="hidden lg:block">
            <BadgeBuilder
              badges={formData.badges}
              onChange={(badges) => handleFieldChange('badges', badges)}
            />
          </div>

          {/* Custom Sections */}
          <CustomSections
            sections={formData.customSections}
            onChange={(sections) => handleFieldChange('customSections', sections)}
          />

          {/* README Score (visible on desktop) */}
          <div className="hidden lg:block">
            <ReadmeScore markdown={generatedMarkdown} formData={formData} />
          </div>
        </div>

        {/* Mobile Badge Tab */}
        <div className={`lg:hidden ${activeTab !== 'badges' ? 'hidden' : ''}`}>
          <BadgeBuilder
            badges={formData.badges}
            onChange={(badges) => handleFieldChange('badges', badges)}
          />
        </div>

        {/* Mobile Score Tab */}
        <div className={`lg:hidden ${activeTab !== 'score' ? 'hidden' : ''}`}>
          <ReadmeScore markdown={generatedMarkdown} formData={formData} />
        </div>

        {/* Right column — Preview */}
        <div className={`${activeTab === 'edit' || activeTab === 'badges' || activeTab === 'score' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-4">
            <ReadmePreview markdown={generatedMarkdown} stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
