






import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Braces, Copy, Check, Trash2, Download, Upload, Sparkles,
  Minimize2, Maximize2, ArrowLeftRight, AlertTriangle,
  ChevronDown, ChevronUp, Search, X, FileJson,
  Code, TreePine, Hash, Type, ToggleLeft,
  List, Layers, SortAsc, Diff,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';

const SAMPLE_JSON = [
  { name: 'User Object', json: '{"id":1,"name":"John Doe","email":"john@example.com","roles":["admin","editor"],"profile":{"avatar":"https://api.example.com/avatar.png","bio":"Full-stack developer","social":{"github":"johndoe","twitter":"@johndoe"}},"isActive":true,"createdAt":"2024-01-15T10:30:00Z"}' },
  { name: 'API Response', json: '{"status":"success","data":{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"pagination":{"page":1,"perPage":10,"total":42}},"meta":{"requestId":"abc-123","timestamp":1705312200}}' },
  { name: 'Config File', json: '{"database":{"host":"localhost","port":5432,"name":"myapp","ssl":true,"pool":{"min":2,"max":10}},"cache":{"driver":"redis","ttl":3600},"logging":{"level":"info","format":"json"}}' },
  { name: 'Nested Array', json: '{"matrix":[[1,2,3],[4,5,6],[7,8,9]],"tags":["javascript","react","nodejs"],"metadata":{"version":"2.0","features":["search","filter","sort"]}}' },
];

function analyzeJson(obj) {
  const stats = { strings: 0, numbers: 0, booleans: 0, nulls: 0, arrays: 0, objects: 0, totalKeys: 0, maxDepth: 0 };

  function traverse(val, depth) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    if (val === null) { stats.nulls++; return; }
    if (Array.isArray(val)) { stats.arrays++; val.forEach(v => traverse(v, depth + 1)); return; }
    if (typeof val === 'object') {
      stats.objects++;
      const keys = Object.keys(val);
      stats.totalKeys += keys.length;
      keys.forEach(k => traverse(val[k], depth + 1));
      return;
    }
    if (typeof val === 'string') stats.strings++;
    else if (typeof val === 'number') stats.numbers++;
    else if (typeof val === 'boolean') stats.booleans++;
  }

  traverse(obj, 0);
  return stats;
}

function flattenJson(obj, prefix = '', result = {}) {
  if (obj === null || typeof obj !== 'object') {
    result[prefix] = obj;
    return result;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenJson(item, prefix ? `${prefix}[${i}]` : `[${i}]`, result));
  } else {
    Object.entries(obj).forEach(([key, val]) => flattenJson(val, prefix ? `${prefix}.${key}` : key, result));
  }
  return result;
}

function sortJsonKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortJsonKeys);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortJsonKeys(obj[key]);
    return acc;
  }, {});
}

function jsonToTypeScript(obj, name = 'Root') {
  function inferType(val, indent = '  ') {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const types = [...new Set(val.map(v => inferType(v, indent)))];
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return 'Record<string, unknown>';
      const lines = entries.map(([k, v]) => `${indent}${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`}: ${inferType(v, indent + '  ')};`);
      return `{\n${lines.join('\n')}\n${indent.slice(2)}}`;
    }
    return typeof val;
  }
  return `interface ${name} ${inferType(obj)}`;
}

function TreeView({ data, level = 0, searchTerm = '' }) {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const renderValue = (key, value, path) => {
    const fullPath = path ? `${path}.${key}` : key;
    const isCollapsed = collapsed[fullPath];
    const matchesSearch = searchTerm && (String(key).toLowerCase().includes(searchTerm.toLowerCase()) || String(value).toLowerCase().includes(searchTerm.toLowerCase()));

    if (value === null) {
      return (
        <div key={fullPath} className={`flex items-center gap-1.5 py-0.5 ${matchesSearch ? 'bg-warning/10 rounded px-1' : ''}`} style={{ paddingLeft: level * 20 }}>
          <span className="text-xs font-mono font-semibold text-primary">{key}:</span>
          <span className="text-xs font-mono text-error/60 italic">null</span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={fullPath}>
          <div className={`flex items-center gap-1.5 py-0.5 cursor-pointer hover:bg-base-200/60 rounded ${matchesSearch ? 'bg-warning/10' : ''}`} style={{ paddingLeft: level * 20 }} onClick={() => toggle(fullPath)}>
            {isCollapsed ? <ChevronDown size={12} className="opacity-40" /> : <ChevronUp size={12} className="opacity-40" />}
            <span className="text-xs font-mono font-semibold text-primary">{key}</span>
            <span className="badge badge-xs badge-info">Array[{value.length}]</span>
          </div>
          {!isCollapsed && value.map((item, i) => renderValue(i, item, fullPath))}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <div key={fullPath}>
          <div className={`flex items-center gap-1.5 py-0.5 cursor-pointer hover:bg-base-200/60 rounded ${matchesSearch ? 'bg-warning/10' : ''}`} style={{ paddingLeft: level * 20 }} onClick={() => toggle(fullPath)}>
            {isCollapsed ? <ChevronDown size={12} className="opacity-40" /> : <ChevronUp size={12} className="opacity-40" />}
            <span className="text-xs font-mono font-semibold text-primary">{key}</span>
            <span className="badge badge-xs badge-secondary">Object{`{${keys.length}}`}</span>
          </div>
          {!isCollapsed && keys.map(k => renderValue(k, value[k], fullPath))}
        </div>
      );
    }

    const typeColor = typeof value === 'string' ? 'text-success' : typeof value === 'number' ? 'text-warning' : typeof value === 'boolean' ? 'text-info' : 'opacity-50';

    return (
      <div key={fullPath} className={`flex items-center gap-1.5 py-0.5 ${matchesSearch ? 'bg-warning/10 rounded px-1' : ''}`} style={{ paddingLeft: level * 20 }}>
        <span className="text-xs font-mono font-semibold text-primary">{key}:</span>
        <span className={`text-xs font-mono ${typeColor}`}>
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  };

  return <>{Object.entries(data).map(([k, v]) => renderValue(k, v, ''))}</>;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [activeTab, setActiveTab] = useState('format');
  const [searchTerm, setSearchTerm] = useState('');
  const [, setHistory] = useLocalStorage('json-formatter-history', []);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const fileInputRef = useRef(null);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { data: JSON.parse(input), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [input]);

  const formatted = useMemo(() => {
    if (!parsed?.data) return '';
    return JSON.stringify(parsed.data, null, indentSize);
  }, [parsed, indentSize]);

  const minified = useMemo(() => {
    if (!parsed?.data) return '';
    return JSON.stringify(parsed.data);
  }, [parsed]);

  const stats = useMemo(() => parsed?.data ? analyzeJson(parsed.data) : null, [parsed]);
  const flattened = useMemo(() => parsed?.data ? flattenJson(parsed.data) : null, [parsed]);
  const sorted = useMemo(() => parsed?.data ? JSON.stringify(sortJsonKeys(parsed.data), null, indentSize) : '', [parsed, indentSize]);
  const tsInterface = useMemo(() => parsed?.data ? jsonToTypeScript(parsed.data) : '', [parsed]);

  const handleFormat = useCallback(() => {
    if (formatted) {
      setInput(formatted);
      if (parsed?.data) {
        setHistory(prev => {
          const entry = { json: input.trim().slice(0, 200), timestamp: new Date().toLocaleTimeString() };
          return [entry, ...prev].slice(0, 20);
        });
      }
    }
  }, [formatted, input, parsed, setHistory]);

  const handleMinify = useCallback(() => { if (minified) setInput(minified); }, [minified]);

  const handleSort = useCallback(() => { if (sorted) setInput(sorted); }, [sorted]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          setInput(ev.target.result || '');
        } catch (err) {
          console.error('Failed to process file content:', err);
        }
      };
      reader.onerror = () => {
        console.error('Failed to read file:', reader.error?.message || 'Unknown error');
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('File upload failed:', err);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      // navigator.clipboard.readText() is not available in VS Code webview
      // due to security restrictions. Use the Clipboard API with fallback.
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text) { setInput(text); return; }
      }
    } catch {
      // Clipboard API denied — expected in VS Code webview, fall through silently
    }
    // Show a user-friendly hint when paste fails (VS Code webview or permission denied)
    console.info('[JsonFormatter] Use Ctrl+V / Cmd+V to paste from clipboard (direct clipboard access is restricted).');
  }, []);

  const handleExport = useCallback(() => {
    if (!formatted) return;
    try {
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `formatted-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [formatted]);

  const savings = useMemo(() => {
    if (!input.trim() || !minified) return null;
    const original = new TextEncoder().encode(input).length;
    const mini = new TextEncoder().encode(minified).length;
    return { original, minified: mini, saved: original - mini, percent: ((1 - mini / original) * 100).toFixed(1) };
  }, [input, minified]);

  const [compareInput, setCompareInput] = useState('');
  const compareParsed = useMemo(() => {
    if (!compareInput.trim()) return null;
    try { return { data: JSON.parse(compareInput), error: null }; }
    catch (e) { return { data: null, error: e.message }; }
  }, [compareInput]);

  const jsonDiff = useMemo(() => {
    if (!parsed?.data || !compareParsed?.data) return null;
    const diffs = [];
    function compare(a, b, path = '') {
      const aKeys = typeof a === 'object' && a !== null ? Object.keys(a) : [];
      const bKeys = typeof b === 'object' && b !== null ? Object.keys(b) : [];
      const allKeys = [...new Set([...aKeys, ...bKeys])];
      for (const key of allKeys) {
        const fullPath = path ? `${path}.${key}` : key;
        const aVal = a?.[key];
        const bVal = b?.[key];
        if (!(key in (a || {}))) { diffs.push({ path: fullPath, type: 'added', value: bVal }); }
        else if (!(key in (b || {}))) { diffs.push({ path: fullPath, type: 'removed', value: aVal }); }
        else if (typeof aVal !== typeof bVal) { diffs.push({ path: fullPath, type: 'changed', from: aVal, to: bVal }); }
        else if (typeof aVal === 'object' && aVal !== null && bVal !== null && !Array.isArray(aVal)) { compare(aVal, bVal, fullPath); }
        else if (JSON.stringify(aVal) !== JSON.stringify(bVal)) { diffs.push({ path: fullPath, type: 'changed', from: aVal, to: bVal }); }
      }
    }
    compare(parsed.data, compareParsed.data);
    return diffs;
  }, [parsed, compareParsed]);

  const TABS = [
    { id: 'format', label: 'Formatted', icon: Code },
    { id: 'tree', label: 'Tree View', icon: TreePine },
    { id: 'flatten', label: 'Flattened', icon: List },
    { id: 'typescript', label: 'TypeScript', icon: Type },
    { id: 'diff', label: 'JSON Diff', icon: Diff },
    { id: 'stats', label: 'Analysis', icon: Hash },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Braces size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">JSON Formatter</h1>
            <p className="text-xs opacity-50 mt-0.5">Format, validate, minify, and transform JSON data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handlePaste} className="btn btn-sm btn-ghost gap-2"><Upload size={14} /> Paste</button>
          <input type="file" ref={fileInputRef} accept=".json,.txt" className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-sm btn-ghost gap-2"><FileJson size={14} /> Load File</button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-2"><Sparkles size={14} /> Samples</div>
            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-300">
              {SAMPLE_JSON.map(s => (
                <li key={s.name}><button onClick={() => setInput(s.json)} className="text-xs">{s.name}</button></li>
              ))}
            </ul>
          </div>
          {input && <button onClick={() => setInput('')} className="btn btn-sm btn-ghost text-error gap-2"><Trash2 size={14} /> Clear</button>}
        </div>
      </motion.div>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">JSON Input</label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-40 font-mono">{input.length} chars</span>
            {parsed && !parsed.error && <span className="badge badge-success badge-xs gap-1"><Check size={10} /> Valid</span>}
            {parsed?.error && <span className="badge badge-error badge-xs gap-1"><X size={10} /> Invalid</span>}
          </div>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"paste": "your JSON here"}' rows={6} className="textarea w-full font-mono text-xs leading-relaxed" spellCheck={false} />
        {parsed?.error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 p-3 rounded-lg bg-error/10 border border-error/20">
            <p className="text-xs text-error flex items-center gap-1.5"><AlertTriangle size={12} /> {parsed.error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions */}
      {parsed?.data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2">
          <button onClick={handleFormat} className="btn btn-sm btn-primary gap-2"><Maximize2 size={14} /> Format</button>
          <button onClick={handleMinify} className="btn btn-sm btn-outline gap-2"><Minimize2 size={14} /> Minify</button>
          <button onClick={handleSort} className="btn btn-sm btn-outline gap-2"><SortAsc size={14} /> Sort Keys</button>
          <button onClick={() => copyToClipboard(formatted)} className="btn btn-sm btn-outline gap-2">{copied ? <Check size={14} className="text-success" /> : <Copy size={14} />} Copy</button>
          <button onClick={handleExport} className="btn btn-sm btn-outline gap-2"><Download size={14} /> Export</button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] opacity-40">Indent:</span>
            {[2, 4].map(n => (
              <button key={n} onClick={() => setIndentSize(n)} className={`btn btn-xs ${indentSize === n ? 'btn-primary' : 'btn-ghost'}`}>{n}</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Size Stats */}
      {savings && savings.saved > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="section-card px-5 py-3.5 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold opacity-60">Size:</span>
          <span className="badge badge-sm badge-ghost">{savings.original} B (input)</span>
          <ArrowLeftRight size={12} className="opacity-30" />
          <span className="badge badge-sm badge-ghost">{savings.minified} B (minified)</span>
          {savings.saved > 0 && <span className="badge badge-sm badge-success">-{savings.percent}% savings</span>}
        </motion.div>
      )}

      {/* Tabs */}
      {parsed?.data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="tabs tabs-box tabs-sm">
            {TABS.map(tab => (
              <button key={tab.id} className={`tab gap-1.5 ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {parsed?.data && activeTab === 'format' && (
          <motion.div key="format" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="section-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Formatted JSON</h3>
              <button onClick={() => copyToClipboard(formatted)} className="btn btn-sm btn-primary gap-1.5">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">{formatted}</pre>
          </motion.div>
        )}

        {parsed?.data && activeTab === 'tree' && (
          <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="section-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Tree View</h3>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search keys/values..." className="input input-xs pl-8 w-48 font-mono" />
              </div>
            </div>
            <div className="rounded-lg bg-base-200/50 p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
              <TreeView data={parsed.data} searchTerm={searchTerm} />
            </div>
          </motion.div>
        )}

        {parsed?.data && activeTab === 'flatten' && (
          <motion.div key="flatten" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="section-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Flattened (Dot Notation)</h3>
              <button onClick={() => copyToClipboard(JSON.stringify(flattened, null, 2))} className="btn btn-sm btn-primary gap-1.5">
                {copied ? <Check size={14} /> : <Copy size={14} />} Copy
              </button>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin">
              {flattened && Object.entries(flattened).map(([path, val]) => (
                <div key={path} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-base-200/60">
                  <span className="text-xs font-mono font-semibold text-primary flex-shrink-0">{path}</span>
                  <span className="text-xs opacity-20">→</span>
                  <span className={`text-xs font-mono ${typeof val === 'string' ? 'text-success' : typeof val === 'number' ? 'text-warning' : typeof val === 'boolean' ? 'text-info' : 'text-error/60'}`}>
                    {val === null ? 'null' : typeof val === 'string' ? `"${val}"` : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {parsed?.data && activeTab === 'typescript' && (
          <motion.div key="typescript" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="section-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">TypeScript Interface</h3>
              <button onClick={() => copyToClipboard(tsInterface)} className="btn btn-sm btn-primary gap-1.5">
                {copied ? <Check size={14} /> : <Copy size={14} />} Copy
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-neutral text-neutral-content font-mono text-xs leading-relaxed overflow-x-auto">{tsInterface}</pre>
          </motion.div>
        )}

        {parsed?.data && activeTab === 'diff' && (
          <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="section-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Diff size={14} className="text-primary" /> JSON Diff Comparison</h3>
            <div>
              <label className="field-label">Paste second JSON to compare</label>
              <textarea value={compareInput} onChange={(e) => setCompareInput(e.target.value)} placeholder='{"paste": "second JSON here"}' rows={4} className="textarea w-full font-mono text-xs leading-relaxed" spellCheck={false} />
              {compareParsed?.error && <p className="text-xs text-error mt-1">{compareParsed.error}</p>}
            </div>
            {jsonDiff && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-sm badge-ghost">{jsonDiff.length} difference{jsonDiff.length !== 1 ? 's' : ''}</span>
                  <span className="badge badge-xs badge-success">{jsonDiff.filter(d => d.type === 'added').length} added</span>
                  <span className="badge badge-xs badge-error">{jsonDiff.filter(d => d.type === 'removed').length} removed</span>
                  <span className="badge badge-xs badge-warning">{jsonDiff.filter(d => d.type === 'changed').length} changed</span>
                </div>
                {jsonDiff.length === 0 ? (
                  <div className="text-center py-8"><Check size={24} className="text-success mx-auto mb-2" /><p className="text-xs opacity-50">Both JSON objects are identical</p></div>
                ) : (
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-thin">
                    {jsonDiff.map((d, i) => (
                      <div key={i} className={`rounded-lg px-3 py-2.5 flex items-start gap-3 ${d.type === 'added' ? 'bg-success/8 border border-success/20' : d.type === 'removed' ? 'bg-error/8 border border-error/20' : 'bg-warning/8 border border-warning/20'}`}>
                        <span className={`badge badge-xs shrink-0 mt-0.5 ${d.type === 'added' ? 'badge-success' : d.type === 'removed' ? 'badge-error' : 'badge-warning'}`}>{d.type === 'added' ? '+' : d.type === 'removed' ? '−' : '~'}</span>
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs font-bold text-primary">{d.path}</span>
                          {d.type === 'changed' && (
                            <div className="flex gap-2 mt-1 text-[10px] font-mono">
                              <span className="text-error line-through">{JSON.stringify(d.from)}</span>
                              <span className="opacity-30">→</span>
                              <span className="text-success">{JSON.stringify(d.to)}</span>
                            </div>
                          )}
                          {d.type === 'added' && <p className="text-[10px] font-mono text-success mt-0.5">{JSON.stringify(d.value)}</p>}
                          {d.type === 'removed' && <p className="text-[10px] font-mono text-error mt-0.5">{JSON.stringify(d.value)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!compareInput.trim() && <p className="text-xs opacity-40 text-center py-4">Paste a second JSON object above to compare differences</p>}
          </motion.div>
        )}

        {parsed?.data && activeTab === 'stats' && stats && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Keys', value: stats.totalKeys, icon: Hash, color: 'text-primary' },
                { label: 'Max Depth', value: stats.maxDepth, icon: Layers, color: 'text-secondary' },
                { label: 'Objects', value: stats.objects, icon: Braces, color: 'text-warning' },
                { label: 'Arrays', value: stats.arrays, icon: List, color: 'text-info' },
                { label: 'Strings', value: stats.strings, icon: Type, color: 'text-success' },
                { label: 'Numbers', value: stats.numbers, icon: Hash, color: 'text-warning' },
                { label: 'Booleans', value: stats.booleans, icon: ToggleLeft, color: 'text-info' },
                { label: 'Nulls', value: stats.nulls, icon: X, color: 'text-error' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="section-card p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={14} className={color} />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">{label}</span>
                  </div>
                  <span className="text-xl font-bold">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!input.trim() && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
            <Braces size={28} className="opacity-30" />
          </div>
          <p className="text-sm font-medium opacity-50 mb-1">Paste JSON to format, validate & transform</p>
          <p className="text-xs opacity-30 mb-6">Supports formatting, tree view, flattening, and TypeScript generation</p>
        </motion.div>
      )}
    </div>
  );
}
