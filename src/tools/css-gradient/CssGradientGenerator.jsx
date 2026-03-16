import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Blend, Copy, Check, Plus, X, Trash2, Download,
  RotateCcw, RefreshCw, Sparkles, Eye, Layers,
  ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ══════════════════════════════════════════ */
/*           PRESETS                          */
/* ══════════════════════════════════════════ */
const GRADIENT_PRESETS = [
  { name: 'Sunset', stops: [{ color: '#FF512F', pos: 0 }, { color: '#F09819', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Ocean', stops: [{ color: '#2193B0', pos: 0 }, { color: '#6DD5ED', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Purple Love', stops: [{ color: '#CC2B5E', pos: 0 }, { color: '#753A88', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Emerald', stops: [{ color: '#348F50', pos: 0 }, { color: '#56B4D3', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Midnight', stops: [{ color: '#0F2027', pos: 0 }, { color: '#203A43', pos: 50 }, { color: '#2C5364', pos: 100 }], type: 'linear', angle: 180 },
  { name: 'Cotton Candy', stops: [{ color: '#FF9A9E', pos: 0 }, { color: '#FECFEF', pos: 50 }, { color: '#FECFEF', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Northern Lights', stops: [{ color: '#43CEA2', pos: 0 }, { color: '#185A9D', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Flare', stops: [{ color: '#F12711', pos: 0 }, { color: '#F5AF19', pos: 100 }], type: 'linear', angle: 90 },
  { name: 'Royal', stops: [{ color: '#141E30', pos: 0 }, { color: '#243B55', pos: 100 }], type: 'linear', angle: 180 },
  { name: 'Aqua Splash', stops: [{ color: '#13547A', pos: 0 }, { color: '#80D0C7', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Rose Water', stops: [{ color: '#E55D87', pos: 0 }, { color: '#5FC3E4', pos: 100 }], type: 'linear', angle: 120 },
  { name: 'Neon Glow', stops: [{ color: '#B721FF', pos: 0 }, { color: '#21D4FD', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Peach', stops: [{ color: '#FFD89B', pos: 0 }, { color: '#19547B', pos: 100 }], type: 'linear', angle: 135 },
  { name: 'Aurora', stops: [{ color: '#7F00FF', pos: 0 }, { color: '#E100FF', pos: 50 }, { color: '#7F00FF', pos: 100 }], type: 'linear', angle: 45 },
  { name: 'Fire', stops: [{ color: '#F83600', pos: 0 }, { color: '#F9D423', pos: 100 }], type: 'linear', angle: 90 },
  { name: 'Radial Sunset', stops: [{ color: '#FFA751', pos: 0 }, { color: '#FFE259', pos: 100 }], type: 'radial', angle: 0 },
  { name: 'Radial Ocean', stops: [{ color: '#00C9FF', pos: 0 }, { color: '#92FE9D', pos: 100 }], type: 'radial', angle: 0 },
  { name: 'Conic Rainbow', stops: [{ color: '#FF0000', pos: 0 }, { color: '#FFFF00', pos: 17 }, { color: '#00FF00', pos: 33 }, { color: '#00FFFF', pos: 50 }, { color: '#0000FF', pos: 67 }, { color: '#FF00FF', pos: 83 }, { color: '#FF0000', pos: 100 }], type: 'conic', angle: 0 },
];

/* ══════════════════════════════════════════ */
/*           HELPERS                         */
/* ══════════════════════════════════════════ */
function buildGradientCSS(stops, type, angle) {
  const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);
  const stopsStr = sortedStops.map(s => `${s.color} ${s.pos}%`).join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    default:
      return `linear-gradient(${angle}deg, ${stopsStr})`;
  }
}

function randomGradient() {
  const count = 2 + Math.floor(Math.random() * 2);
  const stops = Array.from({ length: count }, (_, i) => ({
    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    pos: Math.round((i / (count - 1)) * 100),
  }));
  return { stops, type: 'linear', angle: Math.floor(Math.random() * 360) };
}

/* ══════════════════════════════════════════ */
/*         STOP EDITOR COMPONENT             */
/* ══════════════════════════════════════════ */
function StopEditor({ stops, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="field-label mb-0">Color Stops</label>
        {stops.length < 8 && (
          <button onClick={onAdd} className="btn btn-xs btn-ghost gap-1"><Plus size={12} /> Add Stop</button>
        )}
      </div>
      {stops.map((stop, i) => (
        <motion.div key={i} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 group">
          <input
            type="color" value={stop.color}
            onChange={(e) => { const updated = [...stops]; updated[i] = { ...updated[i], color: e.target.value }; onChange(updated); }}
            className="w-9 h-9 rounded-lg cursor-pointer border border-base-300"
          />
          <input
            type="text" value={stop.color}
            onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) { const updated = [...stops]; updated[i] = { ...updated[i], color: v }; onChange(updated); } }}
            className="input input-sm font-mono w-24 text-xs"
          />
          <input
            type="range" min="0" max="100" value={stop.pos}
            onChange={(e) => { const updated = [...stops]; updated[i] = { ...updated[i], pos: parseInt(e.target.value) }; onChange(updated); }}
            className="range range-xs range-primary flex-1"
          />
          <span className="text-xs font-mono opacity-50 w-10 text-right">{stop.pos}%</span>
          {stops.length > 2 && (
            <button onClick={() => onRemove(i)} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════ */
/*           MAIN COMPONENT                  */
/* ══════════════════════════════════════════ */
export default function CssGradientGenerator() {
  const [stops, setStops] = useState([
    { color: '#667eea', pos: 0 },
    { color: '#764ba2', pos: 100 },
  ]);
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [activeTab, setActiveTab] = useState('editor');
  const [savedGradients, setSavedGradients] = useLocalStorage('css-gradients-saved', []);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const gradientCSS = useMemo(() => buildGradientCSS(stops, gradientType, angle), [stops, gradientType, angle]);
  const fullCSS = `background: ${gradientCSS};`;

  const addStop = useCallback(() => {
    if (stops.length >= 8) return;
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    const midIdx = Math.floor(sorted.length / 2);
    const newPos = Math.round((sorted[midIdx - 1].pos + sorted[midIdx].pos) / 2);
    setStops(prev => [...prev, { color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), pos: newPos }]);
  }, [stops]);

  const removeStop = useCallback((index) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  }, []);

  const loadPreset = useCallback((preset) => {
    setStops(preset.stops);
    setGradientType(preset.type);
    setAngle(preset.angle);
    setActiveTab('editor');
  }, []);

  const handleRandom = useCallback(() => {
    const { stops: s, type, angle: a } = randomGradient();
    setStops(s);
    setGradientType(type);
    setAngle(a);
  }, []);

  const reverseStops = useCallback(() => {
    setStops(prev => prev.map(s => ({ ...s, pos: 100 - s.pos })));
  }, []);

  const saveGradient = useCallback(() => {
    const entry = { id: Date.now(), css: gradientCSS, stops, type: gradientType, angle, createdAt: new Date().toLocaleString() };
    setSavedGradients(prev => [entry, ...prev].slice(0, 30));
  }, [gradientCSS, stops, gradientType, angle, setSavedGradients]);

  const TABS = [
    { id: 'editor', label: 'Editor', icon: Blend },
    { id: 'presets', label: 'Presets', icon: Sparkles },
    { id: 'saved', label: 'Saved', icon: Layers },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Blend size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">CSS Gradient Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Create beautiful CSS gradients with live preview</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleRandom} className="btn btn-sm btn-primary gap-1.5"><RefreshCw size={14} /> Random</button>
          <button onClick={reverseStops} className="btn btn-sm btn-ghost gap-1.5"><RotateCcw size={14} /> Reverse</button>
          <button onClick={saveGradient} className="btn btn-sm btn-ghost gap-1.5"><Download size={14} /> Save</button>
        </div>
      </motion.div>

      {/* ── Preview ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-card overflow-hidden">
          <div className="h-56 sm:h-64 rounded-t-xl" style={{ background: gradientCSS }} />
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
              {tab.id === 'saved' && savedGradients.length > 0 && <span className="badge badge-xs badge-primary">{savedGradients.length}</span>}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Editor Tab ── */}
        {activeTab === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Gradient Type */}
            <div className="section-card p-5 space-y-5">
              <div>
                <label className="field-label">Gradient Type</label>
                <div className="flex gap-2">
                  {['linear', 'radial', 'conic'].map(type => (
                    <button key={type} onClick={() => setGradientType(type)} className={`btn btn-sm flex-1 capitalize ${gradientType === type ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle */}
              {(gradientType === 'linear' || gradientType === 'conic') && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">Angle</label>
                    <span className="text-xs font-mono opacity-50">{angle}°</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-1">
                    <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="range range-xs range-primary w-full sm:flex-1" />
                    <div className="flex flex-wrap gap-1">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                        <button key={a} onClick={() => setAngle(a)} className={`btn btn-xs ${angle === a ? 'btn-primary' : 'btn-ghost'}`}>{a}°</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Color Stops */}
              <StopEditor stops={stops} onChange={setStops} onAdd={addStop} onRemove={removeStop} />
            </div>

            {/* ── Code Output ── */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3">Generated Code</h3>
              <div className="space-y-3">
                {/* CSS */}
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 block">CSS</label>
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">
                    {`background: ${gradientCSS};`}
                  </pre>
                  <button onClick={() => copyToClipboard(`background: ${gradientCSS};`)} className="absolute top-6 right-2 btn btn-xs btn-ghost text-neutral-content/60">
                    <Copy size={11} />
                  </button>
                </div>
                {/* Tailwind */}
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 block">Tailwind (arbitrary)</label>
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">
                    {`bg-[${gradientCSS.replace(/\s/g, '_')}]`}
                  </pre>
                  <button onClick={() => copyToClipboard(`bg-[${gradientCSS.replace(/\s/g, '_')}]`)} className="absolute top-6 right-2 btn btn-xs btn-ghost text-neutral-content/60">
                    <Copy size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Preview Sizes ── */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye size={14} className="text-primary" /> Preview Sizes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl h-20 shadow-sm" style={{ background: gradientCSS }} />
                <div className="rounded-full h-20 w-20 mx-auto shadow-sm" style={{ background: gradientCSS }} />
                <div className="rounded-lg h-20 shadow-sm flex items-center justify-center" style={{ background: gradientCSS }}>
                  <span className="text-white text-xs font-bold drop-shadow-md">Button</span>
                </div>
              </div>
            </div>

            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye size={14} className="text-primary" /> Text Gradient Preview</h3>
              <div className="space-y-3 overflow-hidden">
                <p className="text-2xl sm:text-4xl font-extrabold break-words" style={{ background: gradientCSS, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Gradient Text
                </p>
                <p className="text-xl sm:text-2xl font-bold break-words" style={{ background: gradientCSS, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Beautiful Typography
                </p>
                <p className="text-base sm:text-lg font-semibold break-words" style={{ background: gradientCSS, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>              <div className="mt-3 pt-3 border-t border-base-200">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1 block">Text Gradient CSS</label>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-xs overflow-x-auto">{`background: ${gradientCSS};\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nbackground-clip: text;`}</pre>
                  <button onClick={() => copyToClipboard(`background: ${gradientCSS};\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nbackground-clip: text;`)} className="absolute top-2 right-2 btn btn-xs btn-ghost text-neutral-content/60"><Copy size={11} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Presets Tab ── */}
        {activeTab === 'presets' && (
          <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map(preset => (
                <button key={preset.name} onClick={() => loadPreset(preset)} className="section-card overflow-hidden text-left group hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="h-24 rounded-t-xl" style={{ background: buildGradientCSS(preset.stops, preset.type, preset.angle) }} />
                  <div className="p-3">
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">{preset.name}</p>
                    <p className="text-[10px] opacity-40 capitalize">{preset.type}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {savedGradients.length === 0 ? (
              <div className="text-center py-16">
                <Layers size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No saved gradients yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{savedGradients.length} Saved Gradient{savedGradients.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => setSavedGradients([])} className="btn btn-xs btn-ghost btn-error gap-1"><Trash2 size={12} /> Clear All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedGradients.map(sg => (
                    <div key={sg.id} className="section-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all" onClick={() => loadPreset(sg)}>
                      <div className="h-20 rounded-t-xl" style={{ background: sg.css }} />
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-[10px] opacity-30">{sg.createdAt}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSavedGradients(prev => prev.filter(g => g.id !== sg.id)); }} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
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
