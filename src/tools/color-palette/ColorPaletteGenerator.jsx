import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Copy, Check, Trash2, Download, RefreshCw,
  Lock, Unlock, Sparkles, Plus, X, Eye, Shuffle,
  Pipette, Sun, Moon, Droplets, BookOpen,
  ChevronDown, ChevronUp, Heart, Grid3X3, Layers,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ══════════════════════════════════════════ */
/*           COLOR HELPERS                   */
/* ══════════════════════════════════════════ */
function hexToHSL(hex) {
  if (!hex || typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { h: 0, s: 0, l: 0 };
  }
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRGB(hex) {
  if (!hex || typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { r: 0, g: 0, b: 0 };
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getLuminance(hex) {
  const { r, g, b } = hexToRGB(hex);
  const [rs, gs, bs] = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function getTextColor(hex) {
  return getLuminance(hex) > 0.5 ? '#000000' : '#ffffff';
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function generateRandomPalette(count = 5) {
  const baseHue = Math.random() * 360;
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + i * (360 / count) + (Math.random() * 30 - 15)) % 360;
    const sat = 50 + Math.random() * 40;
    const lit = 35 + Math.random() * 35;
    return { hex: hslToHex(hue, sat, lit), locked: false };
  });
}

/* ── Harmony generators ── */
function generateHarmony(baseHex, type) {
  const { h, s, l } = hexToHSL(baseHex);
  switch (type) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'analogous':
      return [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)];
    case 'triadic':
      return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case 'split-complementary':
      return [baseHex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    case 'tetradic':
      return [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case 'monochromatic':
      return [hslToHex(h, s, 20), hslToHex(h, s, 35), baseHex, hslToHex(h, s, 65), hslToHex(h, s, 80)];
    default:
      return [baseHex];
  }
}

/* ── Shade generator ── */
function generateShades(hex, count = 10) {
  const { h, s } = hexToHSL(hex);
  return Array.from({ length: count }, (_, i) => {
    const l = Math.round(95 - (i * (90 / (count - 1))));
    return { hex: hslToHex(h, s, l), weight: (i + 1) * 100 };
  });
}

/* ── Curated palettes ── */
const CURATED_PALETTES = [
  { name: 'Ocean Breeze', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'], tags: ['cool', 'blue'] },
  { name: 'Sunset Glow', colors: ['#FF6B6B', '#FFA06B', '#FFD93D', '#6BCB77', '#4D96FF'], tags: ['warm', 'vibrant'] },
  { name: 'Deep Blue', colors: ['#1E3A5F', '#2D79FF', '#5B9BFF', '#8CB8FF', '#BDD7FF'], tags: ['blue', 'nature'] },
  { name: 'Lavender Dream', colors: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#E0AAFF', '#F3D5FF'], tags: ['purple', 'soft'] },
  { name: 'Warm Earth', colors: ['#6B4226', '#A0522D', '#D2691E', '#DEB887', '#FAEBD7'], tags: ['brown', 'warm'] },
  { name: 'Neon Night', colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'], tags: ['neon', 'vibrant'] },
  { name: 'Pastel Dream', colors: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A'], tags: ['pastel', 'soft'] },
  { name: 'Midnight', colors: ['#10002B', '#240046', '#3C096C', '#5A189A', '#7B2CBF'], tags: ['dark', 'purple'] },
  { name: 'Cherry Blossom', colors: ['#FFB7C5', '#FF87AB', '#FF5C8A', '#E8365D', '#C81D4E'], tags: ['pink', 'warm'] },
  { name: 'Arctic', colors: ['#CAF0F8', '#ADE8F4', '#90E0EF', '#48CAE4', '#0096C7'], tags: ['cool', 'blue'] },
  { name: 'Slate Modern', colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8'], tags: ['gray', 'modern'] },
  { name: 'Royal Blue', colors: ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA'], tags: ['blue', 'vibrant'] },
];

const HARMONY_TYPES = [
  { id: 'complementary', name: 'Complementary', desc: 'Opposite on color wheel' },
  { id: 'analogous', name: 'Analogous', desc: 'Adjacent colors' },
  { id: 'triadic', name: 'Triadic', desc: '3 evenly spaced' },
  { id: 'split-complementary', name: 'Split Comp.', desc: 'Complement + adjacent' },
  { id: 'tetradic', name: 'Tetradic', desc: '4 evenly spaced' },
  { id: 'monochromatic', name: 'Monochromatic', desc: 'Single hue shades' },
];

const EXPORT_FORMATS = ['CSS Variables', 'Tailwind Config', 'SCSS Variables', 'JSON', 'Array'];

/* ══════════════════════════════════════════ */
/*       COLOR SWATCH COMPONENT              */
/* ══════════════════════════════════════════ */
function ColorSwatch({ color, index, onColorChange, onToggleLock, onRemove, canRemove }) {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const hsl = hexToHSL(color.hex);
  const rgb = hexToRGB(color.hex);
  const textCol = getTextColor(color.hex);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex-1 min-w-[100px] sm:min-w-[120px]">
      <div
        className="relative rounded-xl overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        style={{ backgroundColor: color.hex }}
      >
        {/* Color area */}
        <div className="h-32 sm:h-40 flex items-end p-3 relative">
          {/* Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onToggleLock(index)} className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer" style={{ color: textCol, backgroundColor: `${textCol}20` }}>
              {color.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
            {canRemove && (
              <button onClick={() => onRemove(index)} className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer" style={{ color: textCol, backgroundColor: `${textCol}20` }}>
                <X size={11} />
              </button>
            )}
          </div>
          {/* Color input */}
          <input
            type="color" value={color.hex}
            onChange={(e) => onColorChange(index, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {color.locked && <Lock size={14} className="absolute top-2.5 left-2.5" style={{ color: `${textCol}80` }} />}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5" style={{ color: textCol }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold font-mono uppercase">{color.hex}</span>
            <button onClick={() => copyToClipboard(color.hex)} className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer" style={{ color: textCol, backgroundColor: `${textCol}15` }}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </div>
          <p className="text-[10px] font-mono opacity-70">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
          <p className="text-[10px] font-mono opacity-70">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════ */
/*           MAIN COMPONENT                  */
/* ══════════════════════════════════════════ */
export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState(() => generateRandomPalette(5));
  const [activeTab, setActiveTab] = useState('palette');
  const [harmonyType, setHarmonyType] = useState('complementary');
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [exportFormat, setExportFormat] = useState('CSS Variables');
  const [savedPalettes, setSavedPalettes] = useLocalStorage('color-palettes-saved', []);
  const [paletteName, setPaletteName] = useState('');
  const { copied, copyToClipboard } = useCopyToClipboard();

  /* ── Palette manipulation ── */
  const shufflePalette = useCallback(() => {
    setColors(prev => {
      const newColors = [...prev];
      const unlocked = newColors.map((c, i) => ({ ...c, i })).filter(c => !c.locked);
      const newRandom = generateRandomPalette(unlocked.length);
      unlocked.forEach((c, idx) => {
        newColors[c.i] = { ...newRandom[idx], locked: false };
      });
      return newColors;
    });
  }, []);

  const handleColorChange = useCallback((index, hex) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, hex } : c));
  }, []);

  const toggleLock = useCallback((index) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  }, []);

  const removeColor = useCallback((index) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addColor = useCallback(() => {
    if (colors.length >= 10) return;
    setColors(prev => [...prev, { hex: randomHex(), locked: false }]);
  }, [colors.length]);

  /* ── Harmony palette ── */
  const harmonyColors = useMemo(() => generateHarmony(baseColor, harmonyType), [baseColor, harmonyType]);

  /* ── Shades ── */
  const shades = useMemo(() => generateShades(baseColor), [baseColor]);

  /* ── Export ── */
  const exportCode = useMemo(() => {
    const hexes = colors.map(c => c.hex);
    switch (exportFormat) {
      case 'CSS Variables':
        return `:root {\n${hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join('\n')}\n}`;
      case 'Tailwind Config':
        return `// tailwind.config.js\ncolors: {\n  palette: {\n${hexes.map((h, i) => `    '${(i + 1) * 100}': '${h}',`).join('\n')}\n  }\n}`;
      case 'SCSS Variables':
        return hexes.map((h, i) => `$color-${i + 1}: ${h};`).join('\n');
      case 'JSON':
        return JSON.stringify(hexes, null, 2);
      case 'Array':
        return `[${hexes.map(h => `'${h}'`).join(', ')}]`;
      default:
        return '';
    }
  }, [colors, exportFormat]);

  /* ── Save palette ── */
  const savePalette = useCallback(() => {
    const entry = {
      id: Date.now(),
      name: paletteName || `Palette ${savedPalettes.length + 1}`,
      colors: colors.map(c => c.hex),
      createdAt: new Date().toLocaleString(),
    };
    setSavedPalettes(prev => [entry, ...prev].slice(0, 30));
    setPaletteName('');
  }, [colors, paletteName, savedPalettes, setSavedPalettes]);

  const loadPalette = useCallback((hexes) => {
    setColors(hexes.map(hex => ({ hex, locked: false })));
    setActiveTab('palette');
  }, []);

  const TABS = [
    { id: 'palette', label: 'Palette', icon: Palette },
    { id: 'harmony', label: 'Harmony', icon: Droplets },
    { id: 'explore', label: 'Explore', icon: Grid3X3 },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'saved', label: 'Saved', icon: Heart },
  ];

  /* ── Keyboard shortcut ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        shufflePalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shufflePalette]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Palette size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">Color Palette Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Generate, explore & export beautiful color palettes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={shufflePalette} className="btn btn-sm btn-primary gap-1.5"><Shuffle size={14} /> Generate</button>
          {colors.length < 10 && <button onClick={addColor} className="btn btn-sm btn-outline gap-1.5"><Plus size={14} /> Add Color</button>}
          <span className="text-[10px] opacity-30 hidden sm:inline">Press Space to shuffle</span>
        </div>
      </motion.div>

      {/* ── Main Palette ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-3 flex-wrap">
          <AnimatePresence>
            {colors.map((color, i) => (
              <ColorSwatch
                key={`${i}-${color.hex}`}
                color={color} index={i}
                onColorChange={handleColorChange}
                onToggleLock={toggleLock}
                onRemove={removeColor}
                canRemove={colors.length > 2}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Accessibility Check ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="section-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={14} className="text-primary" />
          <span className="text-xs font-semibold">Contrast Check (vs White & Black)</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {colors.map((color, i) => {
            const vsWhite = getContrastRatio(color.hex, '#ffffff');
            const vsBlack = getContrastRatio(color.hex, '#000000');
            const passWhite = parseFloat(vsWhite) >= 4.5;
            const passBlack = parseFloat(vsBlack) >= 4.5;
            return (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-200/50">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color.hex }} />
                <span className={`text-[10px] font-mono ${passWhite ? 'text-success' : 'text-error'}`}>W:{vsWhite}</span>
                <span className={`text-[10px] font-mono ${passBlack ? 'text-success' : 'text-error'}`}>B:{vsBlack}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="tabs tabs-box tabs-sm">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={13} /> {tab.label}
              {tab.id === 'saved' && savedPalettes.length > 0 && <span className="badge badge-xs badge-primary">{savedPalettes.length}</span>}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Palette Tab (save) ── */}
        {activeTab === 'palette' && (
          <motion.div key="palette" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="section-card p-4">
              <div className="flex items-center gap-2">
                <input type="text" value={paletteName} onChange={(e) => setPaletteName(e.target.value)} placeholder="Palette name (optional)" className="input input-sm flex-1" />
                <button onClick={savePalette} className="btn btn-sm btn-primary gap-1.5"><Heart size={14} /> Save Palette</button>
              </div>
            </div>

            {/* Contrast Matrix */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Eye size={14} className="text-primary" /> Contrast Matrix</h3>
              <p className="text-xs opacity-40 mb-3">WCAG 2.1 contrast ratios between all palette colors</p>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="p-1"></th>
                      {colors.map((c, i) => (
                        <th key={i} className="p-1"><div className="w-6 h-6 rounded mx-auto" style={{ backgroundColor: c.hex }} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((rowColor, ri) => (
                      <tr key={ri}>
                        <td className="p-1"><div className="w-6 h-6 rounded" style={{ backgroundColor: rowColor.hex }} /></td>
                        {colors.map((colColor, ci) => {
                          if (ri === ci) return <td key={ci} className="p-1"><span className="text-[9px] opacity-20">—</span></td>;
                          const ratio = parseFloat(getContrastRatio(rowColor.hex, colColor.hex));
                          const passAA = ratio >= 4.5;
                          const passAAA = ratio >= 7;
                          return (
                            <td key={ci} className="p-1">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${passAAA ? 'bg-success/15 text-success' : passAA ? 'bg-warning/15 text-warning' : 'bg-error/15 text-error'}`}>
                                {ratio.toFixed(1)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-3 h-3 rounded bg-success/15 border border-success/30"></span> AAA (≥7.0)</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-3 h-3 rounded bg-warning/15 border border-warning/30"></span> AA (≥4.5)</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="w-3 h-3 rounded bg-error/15 border border-error/30"></span> Fail (&lt;4.5)</span>
              </div>
            </div>

            {/* Shades for each color */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Layers size={14} className="text-primary" /> Color Shades</h3>
              <div className="space-y-3">
                {colors.map((color, ci) => {
                  const colorShades = generateShades(color.hex, 8);
                  return (
                    <div key={ci}>
                      <div className="flex gap-1 rounded-lg overflow-hidden">
                        {colorShades.map((shade, si) => (
                          <div
                            key={si}
                            className="flex-1 h-10 cursor-pointer hover:scale-y-125 transition-transform relative group"
                            style={{ backgroundColor: shade.hex }}
                            onClick={() => copyToClipboard(shade.hex)}
                            title={shade.hex}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: getTextColor(shade.hex) }}>
                              {shade.weight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Harmony Tab ── */}
        {activeTab === 'harmony' && (
          <motion.div key="harmony" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="section-card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <label className="field-label">Base Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                    <input type="text" value={baseColor} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setBaseColor(e.target.value)} className="input input-sm font-mono w-28" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {HARMONY_TYPES.map(ht => (
                  <button key={ht.id} onClick={() => setHarmonyType(ht.id)} className={`btn btn-sm gap-1.5 ${harmonyType === ht.id ? 'btn-primary' : 'btn-outline'}`}>
                    {ht.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Harmony result */}
            <div className="flex gap-3 flex-wrap">
              {harmonyColors.map((hex, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="flex-1 min-w-[100px]">
                  <div className="rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all hover:shadow-lg" onClick={() => copyToClipboard(hex)}>
                    <div className="h-28" style={{ backgroundColor: hex }} />
                    <div className="p-2.5 bg-base-100 border border-base-300 border-t-0 rounded-b-xl">
                      <p className="text-xs font-mono font-bold text-center">{hex.toUpperCase()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button onClick={() => loadPalette(harmonyColors)} className="btn btn-sm btn-primary gap-1.5 w-fit"><Palette size={14} /> Use as Palette</button>

            {/* Shade ramp */}
            <div className="section-card p-5">
              <h3 className="text-sm font-semibold mb-3">Shade Ramp</h3>
              <div className="flex gap-1 rounded-lg overflow-hidden">
                {shades.map((s, i) => (
                  <div key={i} className="flex-1 h-16 cursor-pointer hover:scale-y-110 transition-transform relative group" style={{ backgroundColor: s.hex }} onClick={() => copyToClipboard(s.hex)}>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: getTextColor(s.hex) }}>
                      {s.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Explore Tab ── */}
        {activeTab === 'explore' && (
          <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_PALETTES.map(palette => (
                <div key={palette.name} className="section-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all" onClick={() => loadPalette(palette.colors)}>
                  <div className="flex h-16">
                    {palette.colors.map((hex, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{palette.name}</p>
                      <div className="flex gap-1 mt-1">
                        {palette.tags.map(tag => (
                          <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Palette size={14} className="opacity-0 group-hover:opacity-60 transition-opacity text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Export Tab ── */}
        {activeTab === 'export' && (
          <motion.div key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="section-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold">Export Format</h3>
                <div className="tabs tabs-box tabs-sm overflow-x-auto">
                  {EXPORT_FORMATS.map(fmt => (
                    <button key={fmt} className={`tab whitespace-nowrap px-4 py-2 ${exportFormat === fmt ? 'tab-active' : ''}`} onClick={() => setExportFormat(fmt)}>{fmt}</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">{exportCode}</pre>
                <button onClick={() => copyToClipboard(exportCode)} className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/10 transition-colors cursor-pointer">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {savedPalettes.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={28} className="opacity-20 mx-auto mb-3" />
                <p className="text-sm opacity-40">No saved palettes yet</p>
                <p className="text-xs opacity-30">Generate a palette and save it</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{savedPalettes.length} Saved Palette{savedPalettes.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => setSavedPalettes([])} className="btn btn-xs btn-outline btn-error gap-1"><Trash2 size={12} /> Clear All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedPalettes.map(sp => (
                    <div key={sp.id} className="section-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all" onClick={() => loadPalette(sp.colors)}>
                      <div className="flex h-12">
                        {sp.colors.map((hex, i) => <div key={i} className="flex-1" style={{ backgroundColor: hex }} />)}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{sp.name}</p>
                          <span className="text-[10px] opacity-30">{sp.createdAt}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSavedPalettes(prev => prev.filter(p => p.id !== sp.id)); }} className="btn btn-outline btn-xs opacity-0 group-hover:opacity-60"><X size={12} /></button>
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
