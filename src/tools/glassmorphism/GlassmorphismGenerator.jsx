import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gem, Copy, Check, RefreshCw, Download, Trash2,
  Sparkles, Eye, Layers, Settings, Image,
  X, Sun, Moon, Palette,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ══════════════════════════════════════════ */
/*           PRESETS                          */
/* ══════════════════════════════════════════ */
const GLASS_PRESETS = [
  { name: 'Subtle Glass', bg: 'rgba(255,255,255,0.10)', blur: 8, saturation: 120, border: 'rgba(255,255,255,0.15)', borderWidth: 1, opacity: 10, shadow: '0 4px 16px rgba(0,0,0,0.1)' },
  { name: 'Frosted', bg: 'rgba(255,255,255,0.20)', blur: 16, saturation: 150, border: 'rgba(255,255,255,0.25)', borderWidth: 1, opacity: 20, shadow: '0 8px 32px rgba(0,0,0,0.12)' },
  { name: 'Heavy Frost', bg: 'rgba(255,255,255,0.35)', blur: 24, saturation: 180, border: 'rgba(255,255,255,0.30)', borderWidth: 1.5, opacity: 35, shadow: '0 8px 32px rgba(0,0,0,0.1)' },
  { name: 'Dark Glass', bg: 'rgba(0,0,0,0.25)', blur: 16, saturation: 150, border: 'rgba(255,255,255,0.10)', borderWidth: 1, opacity: 25, shadow: '0 8px 32px rgba(0,0,0,0.2)' },
  { name: 'Translucent', bg: 'rgba(255,255,255,0.05)', blur: 4, saturation: 100, border: 'rgba(255,255,255,0.08)', borderWidth: 1, opacity: 5, shadow: '0 2px 8px rgba(0,0,0,0.08)' },
  { name: 'Apple Style', bg: 'rgba(255,255,255,0.72)', blur: 20, saturation: 200, border: 'rgba(255,255,255,0.50)', borderWidth: 0.5, opacity: 72, shadow: '0 4px 24px rgba(0,0,0,0.08)' },
  { name: 'Windows 11', bg: 'rgba(255,255,255,0.60)', blur: 40, saturation: 120, border: 'rgba(255,255,255,0.40)', borderWidth: 1, opacity: 60, shadow: '0 8px 32px rgba(0,0,0,0.1)' },
  { name: 'Neon Glass', bg: 'rgba(100,50,255,0.15)', blur: 12, saturation: 180, border: 'rgba(100,50,255,0.30)', borderWidth: 1, opacity: 15, shadow: '0 0 30px rgba(100,50,255,0.15)' },
  { name: 'Warm Glass', bg: 'rgba(255,150,50,0.12)', blur: 16, saturation: 150, border: 'rgba(255,150,50,0.20)', borderWidth: 1, opacity: 12, shadow: '0 8px 32px rgba(0,0,0,0.1)' },
  { name: 'Minimal', bg: 'rgba(255,255,255,0.08)', blur: 2, saturation: 100, border: 'rgba(255,255,255,0.06)', borderWidth: 1, opacity: 8, shadow: 'none' },
];

const BACKGROUND_IMAGES = [
  { name: 'Gradient 1', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Gradient 2', css: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { name: 'Gradient 3', css: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  { name: 'Gradient 4', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Gradient 5', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Gradient 6', css: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Mesh 1', css: 'linear-gradient(135deg, #667eea 25%, transparent 25%), linear-gradient(225deg, #764ba2 25%, transparent 25%), linear-gradient(45deg, #f093fb 25%, transparent 25%), linear-gradient(315deg, #43cea2 25%, #4facfe 25%)' },
  { name: 'Solid Dark', css: '#1a1a2e' },
  { name: 'Solid Light', css: '#f0f0f0' },
];

/* ══════════════════════════════════════════ */
/*           HELPERS                         */
/* ══════════════════════════════════════════ */
function buildGlassCSS(settings) {
  const { bgWhite, opacity, blur, saturation, borderColor, borderOpacity, borderWidth, radius, shadow } = settings;
  const bg = bgWhite
    ? `rgba(255, 255, 255, ${(opacity / 100).toFixed(2)})`
    : `rgba(0, 0, 0, ${(opacity / 100).toFixed(2)})`;
  const border = bgWhite
    ? `rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)})`
    : `rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)})`;

  return {
    background: bg,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `${borderWidth}px solid ${border}`,
    borderRadius: `${radius}px`,
    boxShadow: shadow ? `0 8px 32px rgba(0, 0, 0, ${(shadow / 100).toFixed(2)})` : 'none',
  };
}

function generateCSS(settings) {
  const style = buildGlassCSS(settings);
  return `/* Glassmorphism */
background: ${style.background};
backdrop-filter: ${style.backdropFilter};
-webkit-backdrop-filter: ${style.WebkitBackdropFilter};
border: ${style.border};
border-radius: ${style.borderRadius};
box-shadow: ${style.boxShadow};`;
}

/* ══════════════════════════════════════════ */
/*         PREVIEW CARD                      */
/* ══════════════════════════════════════════ */
function GlassPreviewCard({ style }) {
  return (
    <div className="p-6 space-y-4" style={style}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
          <Gem size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white drop-shadow-sm">Glass Card</p>
          <p className="text-xs text-white/70">Glassmorphism preview</p>
        </div>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        This is a preview of your glassmorphism effect with sample content to see how text looks on the glass surface.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs text-white/80 font-medium">Button</div>
        <div className="flex-1 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs text-white/80 font-medium">Cancel</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
/*           MAIN COMPONENT                  */
/* ══════════════════════════════════════════ */
export default function GlassmorphismGenerator() {
  const [settings, setSettings] = useState({
    bgWhite: true,
    opacity: 20,
    blur: 16,
    saturation: 150,
    borderOpacity: 25,
    borderWidth: 1,
    radius: 16,
    shadow: 12,
  });
  const [bgImage, setBgImage] = useState(0);
  const [activeTab, setActiveTab] = useState('editor');
  const [showShapes, setShowShapes] = useState(true);
  const [savedGlasses, setSavedGlasses] = useLocalStorage('glassmorphism-saved', []);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const glassStyle = useMemo(() => buildGlassCSS(settings), [settings]);
  const cssCode = useMemo(() => generateCSS(settings), [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadPreset = useCallback((preset) => {
    const borderMatch = preset.border.match(/[\d.]+(?=\))/);
    const borderOpacityVal = borderMatch ? Math.round(parseFloat(borderMatch[0]) * 100) : 20;
    setSettings({
      bgWhite: !preset.bg.startsWith('rgba(0'),
      opacity: preset.opacity,
      blur: preset.blur,
      saturation: preset.saturation,
      borderOpacity: borderOpacityVal,
      borderWidth: preset.borderWidth,
      radius: 16,
      shadow: 12,
    });
    setActiveTab('editor');
  }, []);

  const handleReset = useCallback(() => {
    setSettings({ bgWhite: true, opacity: 20, blur: 16, saturation: 150, borderOpacity: 25, borderWidth: 1, radius: 16, shadow: 12 });
  }, []);

  const saveGlass = useCallback(() => {
    const entry = { id: Date.now(), settings: { ...settings }, css: cssCode, createdAt: new Date().toLocaleString() };
    setSavedGlasses(prev => [entry, ...prev].slice(0, 30));
  }, [settings, cssCode, setSavedGlasses]);

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
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Gem size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">Glassmorphism Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Create stunning frosted glass UI effects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveGlass} className="btn btn-sm btn-ghost gap-1.5"><Download size={14} /> Save</button>
          <button onClick={handleReset} className="btn btn-sm btn-ghost btn-error gap-1.5"><RefreshCw size={14} /> Reset</button>
        </div>
      </motion.div>

      {/* ── Preview ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-card overflow-hidden">
          <div
            className="relative min-h-[320px] flex items-center justify-center p-8 overflow-hidden"
            style={{ background: BACKGROUND_IMAGES[bgImage].css }}
          >
            {/* Floating shapes */}
            {showShapes && (
              <>
                <div className="absolute w-40 h-40 rounded-full bg-white/20 -top-10 -left-10 animate-float-slow" />
                <div className="absolute w-32 h-32 rounded-full bg-white/15 bottom-10 right-10 animate-float" />
                <div className="absolute w-24 h-24 rounded-full bg-white/10 top-20 right-20" />
                <div className="absolute w-16 h-16 rounded-2xl bg-white/10 bottom-20 left-20 rotate-45 animate-float-slow" />
              </>
            )}

            {/* Glass card */}
            <div className="relative z-10 w-full max-w-sm">
              <GlassPreviewCard style={glassStyle} />
            </div>
          </div>

          {/* Background selector */}
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <Image size={12} className="opacity-40" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Background</span>
              <div className="flex-1" />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[10px] opacity-40">Shapes</span>
                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={showShapes} onChange={(e) => setShowShapes(e.target.checked)} />
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {BACKGROUND_IMAGES.map((bg, i) => (
                <button
                  key={i}
                  onClick={() => setBgImage(i)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${bgImage === i ? 'border-primary ring-2 ring-primary/30' : 'border-base-300'}`}
                  style={{ background: bg.css }}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="tabs tabs-box tabs-sm">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={13} /> {tab.label}
              {tab.id === 'saved' && savedGlasses.length > 0 && <span className="badge badge-xs badge-primary">{savedGlasses.length}</span>}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Editor Tab ── */}
        {activeTab === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="section-card p-5 space-y-5">
              {/* Mode Toggle */}
              <div>
                <label className="field-label">Glass Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => updateSetting('bgWhite', true)} className={`btn btn-sm flex-1 gap-1.5 ${settings.bgWhite ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                    <Sun size={14} /> Light Glass
                  </button>
                  <button onClick={() => updateSetting('bgWhite', false)} className={`btn btn-sm flex-1 gap-1.5 ${!settings.bgWhite ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                    <Moon size={14} /> Dark Glass
                  </button>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Background Opacity</label>
                  <span className="text-xs font-mono opacity-50">{settings.opacity}%</span>
                </div>
                <input type="range" min="0" max="80" value={settings.opacity} onChange={(e) => updateSetting('opacity', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Blur */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Blur</label>
                  <span className="text-xs font-mono opacity-50">{settings.blur}px</span>
                </div>
                <input type="range" min="0" max="50" value={settings.blur} onChange={(e) => updateSetting('blur', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Saturation</label>
                  <span className="text-xs font-mono opacity-50">{settings.saturation}%</span>
                </div>
                <input type="range" min="100" max="300" value={settings.saturation} onChange={(e) => updateSetting('saturation', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Border Opacity */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Border Opacity</label>
                  <span className="text-xs font-mono opacity-50">{settings.borderOpacity}%</span>
                </div>
                <input type="range" min="0" max="60" value={settings.borderOpacity} onChange={(e) => updateSetting('borderOpacity', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Border Width */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Border Width</label>
                  <span className="text-xs font-mono opacity-50">{settings.borderWidth}px</span>
                </div>
                <input type="range" min="0" max="4" step="0.5" value={settings.borderWidth} onChange={(e) => updateSetting('borderWidth', parseFloat(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Border Radius</label>
                  <span className="text-xs font-mono opacity-50">{settings.radius}px</span>
                </div>
                <input type="range" min="0" max="40" value={settings.radius} onChange={(e) => updateSetting('radius', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>

              {/* Shadow */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0">Shadow Intensity</label>
                  <span className="text-xs font-mono opacity-50">{settings.shadow}%</span>
                </div>
                <input type="range" min="0" max="40" value={settings.shadow} onChange={(e) => updateSetting('shadow', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
              </div>
            </div>

            {/* ── Code Output ── */}
            <div className="section-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Generated CSS</h3>
                <button onClick={() => copyToClipboard(cssCode)} className="btn btn-sm btn-primary gap-1.5">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy CSS'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">{cssCode}</pre>
            </div>

            {/* ── Browser Support ── */}
            <div className="section-card p-4">
              <h3 className="text-xs font-semibold flex items-center gap-2 mb-2"><Eye size={12} className="text-primary" /> Browser Support Notes</h3>
              <ul className="space-y-1.5 text-xs opacity-60">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Chrome, Edge, Opera — Full support for <code className="text-primary bg-primary/10 px-1 rounded">backdrop-filter</code>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Safari — Requires <code className="text-primary bg-primary/10 px-1 rounded">-webkit-backdrop-filter</code> prefix (included)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Firefox 103+ — Full support
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* ── Presets Tab ── */}
        {activeTab === 'presets' && (
          <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GLASS_PRESETS.map(preset => (
                <button key={preset.name} onClick={() => loadPreset(preset)} className="section-card overflow-hidden text-left group hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="h-28 relative overflow-hidden" style={{ background: BACKGROUND_IMAGES[0].css }}>
                    <div className="absolute w-16 h-16 rounded-full bg-white/20 -top-4 -left-4" />
                    <div className="absolute w-12 h-12 rounded-full bg-white/15 bottom-2 right-4" />
                    <div className="absolute inset-4 rounded-lg flex items-center justify-center" style={{
                      background: preset.bg,
                      backdropFilter: `blur(${preset.blur}px) saturate(${preset.saturation}%)`,
                      WebkitBackdropFilter: `blur(${preset.blur}px) saturate(${preset.saturation}%)`,
                      border: `${preset.borderWidth}px solid ${preset.border}`,
                      boxShadow: preset.shadow,
                    }}>
                      <span className="text-white text-xs font-bold drop-shadow-sm">Aa</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">{preset.name}</p>
                    <p className="text-[10px] opacity-30">blur: {preset.blur}px • opacity: {preset.opacity}%</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {savedGlasses.length === 0 ? (
              <div className="text-center py-16">
                <Gem size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No saved glass effects yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{savedGlasses.length} Saved Effect{savedGlasses.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => setSavedGlasses([])} className="btn btn-xs btn-ghost btn-error gap-1"><Trash2 size={12} /> Clear All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedGlasses.map(sg => (
                    <div key={sg.id} className="section-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all" onClick={() => { setSettings(sg.settings); setActiveTab('editor'); }}>
                      <div className="h-24 relative overflow-hidden" style={{ background: BACKGROUND_IMAGES[0].css }}>
                        <div className="absolute w-14 h-14 rounded-full bg-white/20 -top-4 -left-4" />
                        <div className="absolute inset-3 rounded-lg" style={buildGlassCSS(sg.settings)} />
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-[10px] opacity-30">{sg.createdAt}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSavedGlasses(prev => prev.filter(g => g.id !== sg.id)); }} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
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
