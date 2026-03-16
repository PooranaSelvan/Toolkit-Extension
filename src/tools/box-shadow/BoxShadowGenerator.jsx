import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Square, Copy, Check, Plus, X, Trash2, Download,
  RefreshCw, Sparkles, Eye, Layers, Move,
  ChevronDown, ChevronUp, Settings,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ══════════════════════════════════════════ */
/*           PRESETS                          */
/* ══════════════════════════════════════════ */
const SHADOW_PRESETS = [
  { name: 'Subtle', shadows: [{ x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 8, inset: false }] },
  { name: 'Small', shadows: [{ x: 0, y: 2, blur: 8, spread: -1, color: '#000000', opacity: 10, inset: false }] },
  { name: 'Medium', shadows: [{ x: 0, y: 4, blur: 16, spread: -2, color: '#000000', opacity: 12, inset: false }] },
  { name: 'Large', shadows: [{ x: 0, y: 8, blur: 32, spread: -4, color: '#000000', opacity: 15, inset: false }] },
  { name: 'Elevated', shadows: [{ x: 0, y: 20, blur: 40, spread: -8, color: '#000000', opacity: 15, inset: false }, { x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 5, inset: false }] },
  { name: 'Neumorphic', shadows: [{ x: 8, y: 8, blur: 16, spread: 0, color: '#000000', opacity: 10, inset: false }, { x: -8, y: -8, blur: 16, spread: 0, color: '#ffffff', opacity: 50, inset: false }] },
  { name: 'Inset Soft', shadows: [{ x: 0, y: 2, blur: 6, spread: 0, color: '#000000', opacity: 10, inset: true }] },
  { name: 'Inset Deep', shadows: [{ x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 20, inset: true }, { x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 8, inset: true }] },
  { name: 'Glow Blue', shadows: [{ x: 0, y: 0, blur: 20, spread: 0, color: '#3B82F6', opacity: 40, inset: false }] },
  { name: 'Glow Purple', shadows: [{ x: 0, y: 0, blur: 24, spread: 0, color: '#8B5CF6', opacity: 35, inset: false }, { x: 0, y: 0, blur: 48, spread: 0, color: '#8B5CF6', opacity: 15, inset: false }] },
  { name: 'Sharp', shadows: [{ x: 4, y: 4, blur: 0, spread: 0, color: '#000000', opacity: 20, inset: false }] },
  { name: 'Brutalist', shadows: [{ x: 6, y: 6, blur: 0, spread: 0, color: '#000000', opacity: 100, inset: false }] },
  { name: 'Layered', shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 5, inset: false }, { x: 0, y: 2, blur: 4, spread: 0, color: '#000000', opacity: 5, inset: false }, { x: 0, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 5, inset: false }, { x: 0, y: 8, blur: 16, spread: 0, color: '#000000', opacity: 5, inset: false }] },
  { name: 'Card Hover', shadows: [{ x: 0, y: 12, blur: 28, spread: -6, color: '#000000', opacity: 18, inset: false }, { x: 0, y: 0, blur: 0, spread: 1, color: '#000000', opacity: 4, inset: false }] },
  { name: 'Dream', shadows: [{ x: 0, y: 10, blur: 40, spread: -10, color: '#6366F1', opacity: 30, inset: false }, { x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 5, inset: false }] },
  { name: 'Neon', shadows: [{ x: 0, y: 0, blur: 10, spread: 0, color: '#00FF88', opacity: 50, inset: false }, { x: 0, y: 0, blur: 40, spread: 0, color: '#00FF88', opacity: 20, inset: false }, { x: 0, y: 0, blur: 2, spread: 0, color: '#00FF88', opacity: 80, inset: true }] },
];

/* ══════════════════════════════════════════ */
/*           HELPERS                         */
/* ══════════════════════════════════════════ */
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function buildShadowCSS(shadows) {
  return shadows.map(s =>
    `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`
  ).join(',\n    ');
}

function defaultShadow() {
  return { x: 0, y: 4, blur: 16, spread: -2, color: '#000000', opacity: 12, inset: false };
}

/* ══════════════════════════════════════════ */
/*       SHADOW LAYER EDITOR                 */
/* ══════════════════════════════════════════ */
function ShadowLayerEditor({ shadow, index, onChange, onRemove, canRemove }) {
  const update = (key, value) => onChange(index, { ...shadow, [key]: value });

  return (
    <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="section-card p-4 space-y-3 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold opacity-50">Layer {index + 1}</span>
          <button onClick={() => update('inset', !shadow.inset)} className={`btn btn-xs gap-1 ${shadow.inset ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
            {shadow.inset ? 'Inset' : 'Outset'}
          </button>
        </div>
        {canRemove && (
          <button onClick={() => onRemove(index)} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
        )}
      </div>

      {/* Color + Opacity */}
      <div className="flex items-center gap-3">
        <input type="color" value={shadow.color} onChange={(e) => update('color', e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border border-base-300" />
        <input type="text" value={shadow.color} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && update('color', e.target.value)} className="input input-sm font-mono w-24 text-xs" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] opacity-40">Opacity</span>
            <span className="text-[10px] font-mono opacity-40">{shadow.opacity}%</span>
          </div>
          <input type="range" min="0" max="100" value={shadow.opacity} onChange={(e) => update('opacity', parseInt(e.target.value))} className="range range-xs range-primary w-full" />
        </div>
      </div>

      {/* X / Y */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] opacity-40">Offset X</span>
            <span className="text-[10px] font-mono opacity-40">{shadow.x}px</span>
          </div>
          <input type="range" min="-50" max="50" value={shadow.x} onChange={(e) => update('x', parseInt(e.target.value))} className="range range-xs range-primary w-full" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] opacity-40">Offset Y</span>
            <span className="text-[10px] font-mono opacity-40">{shadow.y}px</span>
          </div>
          <input type="range" min="-50" max="50" value={shadow.y} onChange={(e) => update('y', parseInt(e.target.value))} className="range range-xs range-primary w-full" />
        </div>
      </div>

      {/* Blur / Spread */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] opacity-40">Blur</span>
            <span className="text-[10px] font-mono opacity-40">{shadow.blur}px</span>
          </div>
          <input type="range" min="0" max="100" value={shadow.blur} onChange={(e) => update('blur', parseInt(e.target.value))} className="range range-xs range-primary w-full" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] opacity-40">Spread</span>
            <span className="text-[10px] font-mono opacity-40">{shadow.spread}px</span>
          </div>
          <input type="range" min="-50" max="50" value={shadow.spread} onChange={(e) => update('spread', parseInt(e.target.value))} className="range range-xs range-primary w-full" />
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════ */
/*           MAIN COMPONENT                  */
/* ══════════════════════════════════════════ */
export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState([defaultShadow()]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState(16);
  const [boxWidth, setBoxWidth] = useState(200);
  const [boxHeight, setBoxHeight] = useState(200);
  const [activeTab, setActiveTab] = useState('editor');
  const [savedShadows, setSavedShadows] = useLocalStorage('box-shadows-saved', []);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const shadowCSS = useMemo(() => buildShadowCSS(shadows), [shadows]);
  const fullCSS = `box-shadow: ${shadowCSS};`;

  const updateShadow = useCallback((index, newShadow) => {
    setShadows(prev => prev.map((s, i) => i === index ? newShadow : s));
  }, []);

  const addShadow = useCallback(() => {
    if (shadows.length >= 6) return;
    setShadows(prev => [...prev, defaultShadow()]);
  }, [shadows.length]);

  const removeShadow = useCallback((index) => {
    setShadows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const loadPreset = useCallback((preset) => {
    setShadows(preset.shadows.map(s => ({ ...s })));
    setActiveTab('editor');
  }, []);

  const handleReset = useCallback(() => {
    setShadows([defaultShadow()]);
    setBgColor('#ffffff');
    setBoxColor('#ffffff');
    setBorderRadius(16);
  }, []);

  const saveShadow = useCallback(() => {
    const entry = { id: Date.now(), css: shadowCSS, shadows: shadows.map(s => ({ ...s })), createdAt: new Date().toLocaleString() };
    setSavedShadows(prev => [entry, ...prev].slice(0, 30));
  }, [shadowCSS, shadows, setSavedShadows]);

  const TABS = [
    { id: 'editor', label: 'Editor', icon: Settings },
    { id: 'presets', label: 'Presets', icon: Sparkles },
    { id: 'saved', label: 'Saved', icon: Layers },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Square size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">Box Shadow Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Create layered box shadows with visual editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveShadow} className="btn btn-sm btn-ghost gap-1.5"><Download size={14} /> Save</button>
          <button onClick={handleReset} className="btn btn-sm btn-ghost btn-error gap-1.5"><RefreshCw size={14} /> Reset</button>
        </div>
      </motion.div>

      {/* ── Preview ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-card overflow-hidden">
          <div className="flex items-center justify-center p-8 sm:p-12 min-h-[280px]" style={{ backgroundColor: bgColor }}>
            <motion.div
              layout
              className="transition-all duration-300"
              style={{
                width: boxWidth,
                height: boxHeight,
                backgroundColor: boxColor,
                borderRadius: `${borderRadius}px`,
                boxShadow: shadowCSS,
              }}
            />
          </div>
          <div className="p-4 flex items-center justify-between border-t border-base-300">
            <code className="text-xs font-mono opacity-70 truncate flex-1 mr-4">{fullCSS}</code>
            <button onClick={() => copyToClipboard(fullCSS)} className="btn btn-sm btn-primary gap-1.5">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="tabs tabs-box tabs-sm">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={13} /> {tab.label}
              {tab.id === 'saved' && savedShadows.length > 0 && <span className="badge badge-xs badge-primary">{savedShadows.length}</span>}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Editor Tab ── */}
        {activeTab === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Box Settings */}
            <div className="section-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Eye size={14} className="text-primary" /> Preview Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="field-label">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-base-300 shrink-0" />
                    <input type="text" value={bgColor} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setBgColor(e.target.value)} className="input input-sm font-mono text-xs flex-1 min-w-0" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Box Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-base-300 shrink-0" />
                    <input type="text" value={boxColor} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setBoxColor(e.target.value)} className="input input-sm font-mono text-xs flex-1 min-w-0" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">Radius</label>
                    <span className="text-[10px] font-mono opacity-40">{borderRadius}px</span>
                  </div>
                  <input type="range" min="0" max="100" value={borderRadius} onChange={(e) => setBorderRadius(parseInt(e.target.value))} className="range range-xs range-primary w-full mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">Size</label>
                    <span className="text-[10px] font-mono opacity-40">{boxWidth}×{boxHeight}</span>
                  </div>
                  <input type="range" min="80" max="320" value={boxWidth} onChange={(e) => { setBoxWidth(parseInt(e.target.value)); setBoxHeight(parseInt(e.target.value)); }} className="range range-xs range-primary w-full mt-2" />
                </div>
              </div>
            </div>

            {/* Shadow Layers */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{shadows.length} Shadow Layer{shadows.length !== 1 ? 's' : ''}</span>
              {shadows.length < 6 && (
                <button onClick={addShadow} className="btn btn-sm btn-primary gap-1.5"><Plus size={14} /> Add Layer</button>
              )}
            </div>
            <AnimatePresence>
              {shadows.map((shadow, i) => (
                <ShadowLayerEditor key={i} shadow={shadow} index={i} onChange={updateShadow} onRemove={removeShadow} canRemove={shadows.length > 1} />
              ))}
            </AnimatePresence>

            {/* Hover Animation Preview */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye size={14} className="text-primary" /> Hover Animation Preview</h3>
              <p className="text-xs opacity-40 mb-4">Hover over the boxes to see the shadow applied as a hover effect</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ backgroundColor: bgColor, padding: '1.5rem', borderRadius: '0.75rem' }}>
                {['Card', 'Button', 'Badge'].map((label) => (
                  <div key={label} className="group">
                    <div
                      className="transition-all duration-300 flex items-center justify-center cursor-pointer hover:translate-y-[-4px]"
                      style={{
                        backgroundColor: boxColor,
                        borderRadius: `${borderRadius}px`,
                        height: '80px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = shadowCSS}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
                    >
                      <span className="text-xs font-semibold opacity-40">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Output */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3">Generated Code</h3>
              <div className="space-y-3">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 block">CSS</label>
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">
                    {`box-shadow: ${shadowCSS};`}
                  </pre>
                  <button onClick={() => copyToClipboard(`box-shadow: ${shadowCSS};`)} className="absolute top-6 right-2 btn btn-xs btn-ghost text-neutral-content/60"><Copy size={11} /></button>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 block">Tailwind (arbitrary)</label>
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">
                    {`shadow-[${shadowCSS.replace(/\n\s*/g, '')}]`}
                  </pre>
                  <button onClick={() => copyToClipboard(`shadow-[${shadowCSS.replace(/\n\s*/g, '')}]`)} className="absolute top-6 right-2 btn btn-xs btn-ghost text-neutral-content/60"><Copy size={11} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Presets Tab ── */}
        {activeTab === 'presets' && (
          <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SHADOW_PRESETS.map(preset => (
                <button key={preset.name} onClick={() => loadPreset(preset)} className="section-card p-4 text-left group hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-center h-20 mb-3">
                    <div
                      className="w-14 h-14 bg-white rounded-xl transition-all"
                      style={{ boxShadow: buildShadowCSS(preset.shadows) }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-center group-hover:text-primary transition-colors">{preset.name}</p>
                  <p className="text-[10px] opacity-30 text-center">{preset.shadows.length} layer{preset.shadows.length !== 1 ? 's' : ''}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {savedShadows.length === 0 ? (
              <div className="text-center py-16">
                <Layers size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No saved shadows yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{savedShadows.length} Saved Shadow{savedShadows.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => setSavedShadows([])} className="btn btn-xs btn-ghost btn-error gap-1"><Trash2 size={12} /> Clear All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedShadows.map(ss => (
                    <div key={ss.id} className="section-card p-4 group cursor-pointer hover:border-primary/30 transition-all" onClick={() => loadPreset(ss)}>
                      <div className="flex items-center justify-center h-20 mb-2">
                        <div className="w-14 h-14 bg-white rounded-xl" style={{ boxShadow: ss.css }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] opacity-30">{ss.createdAt}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSavedShadows(prev => prev.filter(s => s.id !== ss.id)); }} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
