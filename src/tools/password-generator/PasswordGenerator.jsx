import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, Copy, Check, RefreshCw, Sparkles, Shield, Eye, EyeOff,
  Trash2, Layers, Download, X, Zap, Lock, AlertTriangle,
  Hash, Plus, Minus, Settings,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

// ─── Character Pools ───
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = 'Il1O0';
const SIMILAR_CHARS = 'Il1O0oS5Z2';

// ─── Word list for passphrases ───
const WORDS = [
  'apple','brave','calm','dance','eager','flame','grape','happy','ivory','jolly',
  'keen','lemon','magic','noble','ocean','peace','quest','river','stone','tiger',
  'ultra','vivid','whale','xenon','yacht','zephyr','amber','bloom','crisp','dream',
  'ember','frost','glow','heart','island','jewel','knight','lunar','mystic','north',
  'orbit','pixel','quartz','royal','solar','trail','unity','vault','wander','xray',
  'yield','zenith','arrow','blaze','cloud','delta','echo','forge','glide','haze',
  'iron','jade','karma','lotus','mango','nebula','onyx','prism','rebel','spark',
  'torch','umbra','venom','wisp','abyss','bolt','charm','drift','fable','ghost',
  'honey','ignite','jolt','kite','lyric','maple','neon','opal','plume','raven',
  'silk','thorn','urge','vibe','wren','axiom','byte','cipher','dawn','flux',
];

// ─── Password Strength Calculator ───
function calcStrength(password) {
  if (!password) return { score: 0, label: 'None', color: 'bg-base-300', textColor: 'opacity-30', entropy: 0 };

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  const entropy = password.length * Math.log2(poolSize || 1);
  const uniqueChars = new Set(password).size;
  const hasSequential = /(.)\1{2,}/.test(password);
  const hasCommonPatterns = /^(123|abc|qwerty|password|admin)/i.test(password);

  let score = entropy;
  if (uniqueChars < password.length * 0.5) score *= 0.7;
  if (hasSequential) score *= 0.6;
  if (hasCommonPatterns) score *= 0.3;

  if (score < 25) return { score, label: 'Very Weak', color: 'bg-error', textColor: 'text-error', entropy, crackTime: 'Instant', percent: 10 };
  if (score < 40) return { score, label: 'Weak', color: 'bg-warning', textColor: 'text-warning', entropy, crackTime: 'Minutes', percent: 25 };
  if (score < 60) return { score, label: 'Fair', color: 'bg-warning', textColor: 'text-warning', entropy, crackTime: 'Hours', percent: 45 };
  if (score < 80) return { score, label: 'Strong', color: 'bg-info', textColor: 'text-info', entropy, crackTime: 'Years', percent: 70 };
  if (score < 100) return { score, label: 'Very Strong', color: 'bg-success', textColor: 'text-success', entropy, crackTime: 'Centuries', percent: 85 };
  return { score, label: 'Unbreakable', color: 'bg-success', textColor: 'text-success', entropy, crackTime: '10,000+ Years', percent: 100 };
}

// ─── Estimate crack time ───
function estimateCrackTime(entropy) {
  const guessesPerSec = 1e10; // 10 billion guesses/sec
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSec / 2;
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1000)}K years`;
  return `${(seconds / 31536000 / 1e6).toFixed(0)}M+ years`;
}
function generatePassword(options) {
  try {
    const { length, lowercase, uppercase, digits, symbols, excludeAmbiguous, excludeSimilar, customChars, mustInclude } = options;

    let pool = '';
    if (lowercase) pool += LOWERCASE;
    if (uppercase) pool += UPPERCASE;
    if (digits) pool += DIGITS;
    if (symbols) pool += SYMBOLS;
    if (customChars) pool += customChars;

    if (excludeAmbiguous) pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    if (excludeSimilar) pool = pool.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');

    if (!pool) return '';

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let password = Array.from(arr).map(n => pool[n % pool.length]).join('');

    const required = [];
    if (lowercase && mustInclude) required.push(LOWERCASE);
    if (uppercase && mustInclude) required.push(UPPERCASE);
    if (digits && mustInclude) required.push(DIGITS);
    if (symbols && mustInclude) required.push(SYMBOLS);

    if (required.length > 0 && password.length >= required.length) {
      const chars = password.split('');
      const positions = Array.from({ length: password.length }, (_, i) => i);

      for (let i = positions.length - 1; i > 0; i--) {
        const randArr = new Uint32Array(1);
        crypto.getRandomValues(randArr);
        const j = randArr[0] % (i + 1);
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
      required.forEach((pool, idx) => {
        const randArr = new Uint32Array(1);
        crypto.getRandomValues(randArr);
        chars[positions[idx]] = pool[randArr[0] % pool.length];
      });
      password = chars.join('');
    }

    return password;
  } catch (err) {
    console.error('Password generation failed:', err);
    // Fallback using Math.random if crypto API fails
    const { length, lowercase, uppercase, digits, symbols, customChars } = options;
    let pool = '';
    if (lowercase) pool += LOWERCASE;
    if (uppercase) pool += UPPERCASE;
    if (digits) pool += DIGITS;
    if (symbols) pool += SYMBOLS;
    if (customChars) pool += customChars;
    if (!pool) return '';
    return Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]).join('');
  }
}

function generatePassphrase(options) {
  try {
    const { wordCount, separator, capitalize, includeNumber } = options;
    const arr = new Uint32Array(wordCount);
    crypto.getRandomValues(arr);
    let words = Array.from(arr).map(n => WORDS[n % WORDS.length]);
    if (capitalize) words = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    let phrase = words.join(separator);
    if (includeNumber) {
      const numArr = new Uint32Array(1);
      crypto.getRandomValues(numArr);
      phrase += separator + (numArr[0] % 1000);
    }
    return phrase;
  } catch (err) {
    console.error('Passphrase generation failed:', err);
    const { wordCount, separator, capitalize, includeNumber } = options;
    let words = Array.from({ length: wordCount }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
    if (capitalize) words = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    let phrase = words.join(separator);
    if (includeNumber) phrase += separator + Math.floor(Math.random() * 1000);
    return phrase;
  }
}

function generatePin(length) {
  try {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n % 10).join('');
  } catch (err) {
    console.error('PIN generation failed:', err);
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }
}

export default function PasswordGenerator() {
  const [mode, setMode] = useState('password'); // password, passphrase, pin, checker
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPasswords, setBulkPasswords] = useState([]);
  const [checkerInput, setCheckerInput] = useState('');
  const [history, setHistory] = useLocalStorage('password-gen-history', []);
  const { copied, copyToClipboard } = useCopyToClipboard();

  // Password options
  const [options, setOptions] = useState({
    length: 16,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
    excludeSimilar: false,
    customChars: '',
    mustInclude: true,
  });

  // Passphrase options
  const [phraseOptions, setPhraseOptions] = useState({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
  });

  const [pinLength, setPinLength] = useState(6);

  const strength = useMemo(() => calcStrength(password), [password]);
  const checkerStrength = useMemo(() => calcStrength(checkerInput), [checkerInput]);

  const generate = useCallback(() => {
    let pw;
    switch (mode) {
      case 'password':
        pw = generatePassword(options);
        break;
      case 'passphrase':
        pw = generatePassphrase(phraseOptions);
        break;
      case 'pin':
        pw = generatePin(pinLength);
        break;
      default:
        return;
    }
    setPassword(pw);
    if (pw) {
      setHistory(prev => [
        { id: Date.now(), password: pw, mode, strength: calcStrength(pw).label, timestamp: new Date().toLocaleString() },
        ...prev
      ].slice(0, 50));
    }
  }, [mode, options, phraseOptions, pinLength, setHistory]);

  const generateBulk = useCallback(() => {
    const passwords = Array.from({ length: bulkCount }, () => {
      if (mode === 'passphrase') return generatePassphrase(phraseOptions);
      if (mode === 'pin') return generatePin(pinLength);
      return generatePassword(options);
    });
    setBulkPasswords(passwords);
  }, [bulkCount, mode, options, phraseOptions, pinLength]);

  const updateOption = useCallback((key, value) => setOptions(prev => ({ ...prev, [key]: value })), []);

  const MODES = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'passphrase', label: 'Passphrase', icon: Hash },
    { id: 'pin', label: 'PIN Code', icon: KeyRound },
    { id: 'checker', label: 'Strength Check', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Lock size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Password Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Generate secure passwords, passphrases & PINs</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={() => setHistory([])} className="btn btn-sm btn-ghost btn-error gap-1.5">
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </motion.div>

      {/* Mode Selector */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="tabs tabs-box tabs-sm">
          {MODES.map(m => (
            <button key={m.id} className={`tab gap-1.5 ${mode === m.id ? 'tab-active' : ''}`}
              onClick={() => setMode(m.id)}>
              <m.icon size={13} /> {m.label}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Password / Passphrase / PIN Modes ── */}
        {mode !== 'checker' && (
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Generated Password Display */}
            <div className="section-card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="field-label mb-0">Generated {mode === 'passphrase' ? 'Passphrase' : mode === 'pin' ? 'PIN' : 'Password'}</label>
                <button onClick={() => setShowPassword(s => !s)} className="btn btn-ghost btn-xs gap-1">
                  {showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="relative group">
                <div className={`p-4 rounded-xl bg-base-200/60 border border-base-300/50 min-h-[60px] flex items-center font-mono text-lg break-all leading-relaxed transition-all ${
                  password ? 'text-base-content' : 'text-base-content/20'
                }`}>
                  {password ? (showPassword ? (
                    <span>
                      {password.split('').map((char, i) => {
                        let colorClass = 'text-base-content/80';
                        if (/[A-Z]/.test(char)) colorClass = 'text-primary font-bold';
                        else if (/[0-9]/.test(char)) colorClass = 'text-warning';
                        else if (/[^a-zA-Z0-9]/.test(char)) colorClass = 'text-error font-bold';
                        else colorClass = 'text-success';
                        return <span key={i} className={colorClass}>{char}</span>;
                      })}
                    </span>
                  ) : (
                    <span className="tracking-widest">{'•'.repeat(password.length)}</span>
                  )) : 'Click Generate to create a password'}
                </div>
                {password && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyToClipboard(password)} className="btn btn-xs btn-primary gap-1">
                      {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              {/* Strength Bar */}
              {password && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={12} className={strength.textColor} />
                      <span className={`text-xs font-bold ${strength.textColor}`}>{strength.label}</span>
                    </div>
                    <span className="text-[10px] opacity-40 font-mono">{strength.entropy.toFixed(1)} bits entropy</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-base-200 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${strength.percent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${strength.color}`} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-40">
                    <span>Crack time: {estimateCrackTime(strength.entropy)}</span>
                    <span>{password.length} characters</span>
                  </div>
                </motion.div>
              )}

              <div className="mt-4 flex items-center gap-2.5 flex-wrap">
                <button onClick={generate} className="btn btn-primary gap-2.5 btn-shimmer">
                  <Sparkles size={16} /> Generate
                </button>
                <button onClick={generate} className="btn btn-ghost gap-2">
                  <RefreshCw size={14} /> Regenerate
                </button>
                {password && (
                  <button onClick={() => copyToClipboard(password)} className="btn btn-ghost gap-2">
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            {/* ── Password Options ── */}
            {mode === 'password' && (
              <div className="section-card p-5 space-y-5">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Settings size={14} className="text-primary" /> Password Options</h3>

                {/* Length */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">Length</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateOption('length', Math.max(4, options.length - 1))} className="btn btn-xs btn-ghost"><Minus size={12} /></button>
                      <span className="text-sm font-mono font-bold text-primary w-8 text-center">{options.length}</span>
                      <button onClick={() => updateOption('length', Math.min(128, options.length + 1))} className="btn btn-xs btn-ghost"><Plus size={12} /></button>
                    </div>
                  </div>
                  <input type="range" min="4" max="128" value={options.length} onChange={(e) => updateOption('length', parseInt(e.target.value))} className="range range-xs range-primary w-full mt-1" />
                  <div className="flex justify-between text-[10px] opacity-30 mt-0.5">
                    <span>4</span><span>32</span><span>64</span><span>128</span>
                  </div>
                </div>

                {/* Character Types */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'lowercase', label: 'Lowercase (a-z)', sample: 'abcdef' },
                    { key: 'uppercase', label: 'Uppercase (A-Z)', sample: 'ABCDEF' },
                    { key: 'digits', label: 'Digits (0-9)', sample: '012345' },
                    { key: 'symbols', label: 'Symbols (!@#$)', sample: '!@#$%^' },
                  ].map(opt => (
                    <label key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      options[opt.key] ? 'border-primary/30 bg-primary/[0.04]' : 'border-base-300/50'
                    }`}>
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={options[opt.key]} onChange={(e) => updateOption(opt.key, e.target.checked)} />
                      <div>
                        <p className="text-xs font-semibold">{opt.label}</p>
                        <p className="text-[10px] font-mono opacity-30">{opt.sample}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Advanced Options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={options.excludeAmbiguous} onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)} />
                    <span className="text-xs">Exclude ambiguous characters <span className="font-mono opacity-40">(I, l, 1, O, 0)</span></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={options.mustInclude} onChange={(e) => updateOption('mustInclude', e.target.checked)} />
                    <span className="text-xs">Must include at least one from each selected type</span>
                  </label>
                </div>

                {/* Custom Characters */}
                <div>
                  <label className="field-label">Custom Characters (optional)</label>
                  <input type="text" value={options.customChars} onChange={(e) => updateOption('customChars', e.target.value)}
                    placeholder="Add extra characters to the pool..." className="input input-sm w-full font-mono text-xs" />
                </div>
              </div>
            )}

            {/* ── Passphrase Options ── */}
            {mode === 'passphrase' && (
              <div className="section-card p-5 space-y-5">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Settings size={14} className="text-primary" /> Passphrase Options</h3>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">Word Count</label>
                    <span className="text-sm font-mono font-bold text-primary">{phraseOptions.wordCount}</span>
                  </div>
                  <input type="range" min="3" max="10" value={phraseOptions.wordCount}
                    onChange={(e) => setPhraseOptions(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                    className="range range-xs range-primary w-full mt-1" />
                </div>

                <div>
                  <label className="field-label">Separator</label>
                  <div className="flex gap-2 flex-wrap">
                    {['-', '.', '_', ' ', '/', '+'].map(sep => (
                      <button key={sep} onClick={() => setPhraseOptions(prev => ({ ...prev, separator: sep }))}
                        className={`btn btn-sm font-mono min-w-[2.5rem] ${phraseOptions.separator === sep ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                        {sep === ' ' ? '⎵' : sep}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={phraseOptions.capitalize}
                      onChange={(e) => setPhraseOptions(prev => ({ ...prev, capitalize: e.target.checked }))} />
                    <span className="text-xs">Capitalize words</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={phraseOptions.includeNumber}
                      onChange={(e) => setPhraseOptions(prev => ({ ...prev, includeNumber: e.target.checked }))} />
                    <span className="text-xs">Append a number</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── PIN Options ── */}
            {mode === 'pin' && (
              <div className="section-card p-5 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Settings size={14} className="text-primary" /> PIN Options</h3>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0">PIN Length</label>
                    <span className="text-sm font-mono font-bold text-primary">{pinLength}</span>
                  </div>
                  <input type="range" min="4" max="12" value={pinLength}
                    onChange={(e) => setPinLength(parseInt(e.target.value))}
                    className="range range-xs range-primary w-full mt-1" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[4, 6, 8].map(n => (
                    <button key={n} onClick={() => setPinLength(n)}
                      className={`btn btn-sm gap-1 ${pinLength === n ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                      {n}-digit
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bulk Generator ── */}
            <div className="section-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Layers size={14} className="text-primary" /> Bulk Generate
                </h3>
                <div className="flex items-center gap-2">
                  <input type="number" min="2" max="50" value={bulkCount}
                    onChange={(e) => setBulkCount(Math.max(2, Math.min(50, parseInt(e.target.value) || 2)))}
                    className="input input-xs w-16 font-mono text-center" />
                  <button onClick={generateBulk} className="btn btn-sm btn-primary gap-2">
                    <Zap size={14} /> Generate {bulkCount}
                  </button>
                </div>
              </div>
              {bulkPasswords.length > 0 && (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {bulkPasswords.map((pw, i) => {
                    const s = calcStrength(pw);
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-base-200/40 hover:bg-base-200/60 transition-colors group">
                        <span className="text-[10px] font-mono opacity-30 w-5 text-right">{i + 1}</span>
                        <code className="text-xs font-mono flex-1 truncate">{showPassword ? pw : '•'.repeat(pw.length)}</code>
                        <span className={`badge badge-xs ${s.textColor === 'text-success' ? 'badge-success' : s.textColor === 'text-info' ? 'badge-info' : s.textColor === 'text-warning' ? 'badge-warning' : 'badge-error'}`}>
                          {s.label}
                        </span>
                        <button onClick={() => copyToClipboard(pw)} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60">
                          <Copy size={11} />
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => copyToClipboard(bulkPasswords.join('\n'))} className="btn btn-sm btn-ghost gap-1.5 mt-2">
                    <Copy size={14} /> Copy All
                  </button>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="section-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Layers size={14} className="text-primary" /> Recent ({history.length})
                  </h3>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                  {history.slice(0, 10).map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/40 transition-colors group cursor-pointer"
                      onClick={() => { setPassword(h.password); copyToClipboard(h.password); }}>
                      <code className="text-xs font-mono flex-1 truncate opacity-60">{showPassword ? h.password : '•'.repeat(h.password.length)}</code>
                      <span className="badge badge-xs badge-ghost">{h.mode}</span>
                      <span className="text-[10px] opacity-20">{h.timestamp}</span>
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(h.password); }} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60">
                        <Copy size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Password Strength Checker ── */}
        {mode === 'checker' && (
          <motion.div key="checker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="section-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Shield size={14} className="text-primary" /> Password Strength Checker
              </h3>
              <p className="text-xs opacity-40">Paste any password to check its strength — nothing is sent anywhere, everything runs locally.</p>

              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={checkerInput}
                  onChange={(e) => setCheckerInput(e.target.value)}
                  placeholder="Enter a password to check..."
                  className="input w-full font-mono text-sm pr-10" spellCheck={false} />
                <button onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60">
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {checkerInput && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Strength Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold ${checkerStrength.textColor}`}>{checkerStrength.label}</span>
                      <span className="text-xs opacity-40 font-mono">{checkerStrength.entropy.toFixed(1)} bits</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-base-200 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${checkerStrength.percent}%` }}
                        className={`h-full rounded-full ${checkerStrength.color}`} />
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="section-card p-2.5 sm:p-3 text-center">
                      <p className="text-base sm:text-lg font-bold text-primary">{checkerInput.length}</p>
                      <p className="text-[10px] opacity-50">Length</p>
                    </div>
                    <div className="section-card p-2.5 sm:p-3 text-center">
                      <p className="text-base sm:text-lg font-bold text-secondary">{new Set(checkerInput).size}</p>
                      <p className="text-[10px] opacity-50">Unique Chars</p>
                    </div>
                    <div className="section-card p-2.5 sm:p-3 text-center">
                      <p className="text-sm sm:text-lg font-bold truncate">{estimateCrackTime(checkerStrength.entropy)}</p>
                      <p className="text-[10px] opacity-50">Crack Time</p>
                    </div>
                    <div className="section-card p-2.5 sm:p-3 text-center">
                      <p className="text-base sm:text-lg font-bold">{checkerStrength.entropy.toFixed(0)}</p>
                      <p className="text-[10px] opacity-50">Entropy Bits</p>
                    </div>
                  </div>

                  {/* Character Breakdown */}
                  <div className="section-card p-4 space-y-2">
                    <h4 className="text-xs font-bold opacity-60">Character Breakdown</h4>
                    {[
                      { label: 'Lowercase', test: /[a-z]/, color: 'text-success' },
                      { label: 'Uppercase', test: /[A-Z]/, color: 'text-primary' },
                      { label: 'Digits', test: /[0-9]/, color: 'text-warning' },
                      { label: 'Symbols', test: /[^a-zA-Z0-9]/, color: 'text-error' },
                    ].map(item => {
                      const found = item.test.test(checkerInput);
                      const count = (checkerInput.match(new RegExp(item.test.source, 'g')) || []).length;
                      return (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {found ? <Check size={12} className="text-success" /> : <X size={12} className="text-error" />}
                            <span className="text-xs">{item.label}</span>
                          </div>
                          <span className={`text-xs font-mono ${found ? item.color : 'opacity-30'}`}>{count} chars</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warnings */}
                  {checkerStrength.score < 60 && (
                    <div className="alert alert-warning">
                      <AlertTriangle size={16} />
                      <div>
                        <h3 className="text-sm font-bold">Suggestions</h3>
                        <ul className="text-xs mt-1 space-y-0.5 list-disc list-inside opacity-80">
                          {checkerInput.length < 12 && <li>Use at least 12 characters</li>}
                          {!/[A-Z]/.test(checkerInput) && <li>Add uppercase letters</li>}
                          {!/[0-9]/.test(checkerInput) && <li>Include digits</li>}
                          {!/[^a-zA-Z0-9]/.test(checkerInput) && <li>Add special characters</li>}
                          {/(.)\1{2,}/.test(checkerInput) && <li>Avoid repeating characters</li>}
                          {new Set(checkerInput).size < checkerInput.length * 0.5 && <li>Use more unique characters</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
