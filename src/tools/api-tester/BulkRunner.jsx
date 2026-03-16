import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, X, CheckCircle2, XCircle, Clock, Loader2, SkipForward, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { METHOD_COLORS, formatDuration, truncate } from '../../utils/helpers';
import { executeRequest } from '../../services/apiService';

export default function BulkRunner({ collections, resolveEnvVars, onClose, onLoadResult }) {
  const [selected, setSelected] = useState(new Set());
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [delayMs, setDelayMs] = useState(200);
  const [stopOnFail, setStopOnFail] = useState(false);
  const [expandedResult, setExpandedResult] = useState(null);
  const [aborted, setAborted] = useState(false);
  const abortRef = { current: false };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === collections.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(collections.map((c) => c.id)));
    }
  };

  const handleRun = useCallback(async () => {
    const toRun = collections.filter((c) => selected.has(c.id));
    if (toRun.length === 0) return;

    setRunning(true);
    setAborted(false);
    setResults([]);
    abortRef.current = false;

    const newResults = [];

    for (let i = 0; i < toRun.length; i++) {
      if (abortRef.current) {
        setAborted(true);
        break;
      }

      setCurrentIdx(i);
      const item = toRun[i];

      try {
        const headers = {};
        (item.headers || []).forEach(({ key, value, enabled }) => {
          if (key?.trim() && enabled !== false) headers[key.trim()] = resolveEnvVars(value);
        });

        const params = {};
        (item.params || []).forEach(({ key, value, enabled }) => {
          if (key?.trim() && enabled !== false) params[key.trim()] = resolveEnvVars(value);
        });

        // Auth
        if (item.auth?.type === 'bearer' && item.auth.token) {
          headers['Authorization'] = `Bearer ${resolveEnvVars(item.auth.token)}`;
        } else if (item.auth?.type === 'basic' && item.auth.username) {
          headers['Authorization'] = `Basic ${btoa(`${resolveEnvVars(item.auth.username)}:${resolveEnvVars(item.auth.password || '')}`)}`;
        } else if (item.auth?.type === 'apikey' && item.auth.token) {
          headers['X-API-Key'] = resolveEnvVars(item.auth.token);
        }

        const result = await executeRequest({
          method: item.method,
          url: resolveEnvVars(item.url),
          headers,
          params,
          body: item.body ? resolveEnvVars(item.body) : null,
        });

        newResults.push({ ...item, result, passed: result.status >= 200 && result.status < 300 });
        setResults([...newResults]);

        if (stopOnFail && (!result.success || result.status >= 400)) {
          break;
        }
      } catch (err) {
        newResults.push({
          ...item,
          result: { status: 0, statusText: 'Error', duration: 0, size: 0, data: err.message, success: false },
          passed: false,
        });
        setResults([...newResults]);
        if (stopOnFail) break;
      }

      // Delay between requests
      if (delayMs > 0 && i < toRun.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    setCurrentIdx(-1);
    setRunning(false);
  }, [collections, selected, delayMs, stopOnFail, resolveEnvVars]);

  const handleAbort = () => {
    abortRef.current = true;
  };

  const handleReset = () => {
    setResults([]);
    setCurrentIdx(-1);
    setAborted(false);
  };

  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.result?.duration || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="section-card animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PlayCircle size={16} className="text-primary" />
            Bulk Runner
            <span className="badge badge-ghost badge-xs">{collections.length} requests</span>
          </h3>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-ghost btn-xs rounded-lg">
            <X size={14} />
          </motion.button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-base-200/50 border border-base-300/50">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input type="checkbox" checked={selected.size === collections.length} onChange={toggleAll} className="checkbox checkbox-xs checkbox-primary" />
            <span className="opacity-60">Select All</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="opacity-40">Delay:</span>
            <input
              type="number"
              value={delayMs}
              onChange={(e) => setDelayMs(Math.max(0, Number(e.target.value)))}
              className="input input-xs w-16 rounded-lg font-mono"
              min="0"
              step="100"
            />
            <span className="opacity-40">ms</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input type="checkbox" checked={stopOnFail} onChange={(e) => setStopOnFail(e.target.checked)} className="checkbox checkbox-xs checkbox-warning" />
            <span className="opacity-60">Stop on failure</span>
          </label>
          <div className="ml-auto flex gap-1.5">
            {results.length > 0 && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReset} className="btn btn-ghost btn-xs rounded-xl gap-1">
                <RotateCcw size={11} /> Reset
              </motion.button>
            )}
            {running ? (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleAbort} className="btn btn-error btn-xs rounded-xl gap-1">
                <SkipForward size={11} /> Abort
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleRun}
                disabled={selected.size === 0}
                className="btn btn-primary btn-xs rounded-xl gap-1"
              >
                <PlayCircle size={11} /> Run {selected.size > 0 && `(${selected.size})`}
              </motion.button>
            )}
          </div>
        </div>

        {/* Selection list */}
        {collections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm opacity-50">No saved requests to run.</p>
            <p className="text-xs opacity-30 mt-1">Save requests to your collection first.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin mb-4">
            {collections.map((item, idx) => {
              const result = results.find((r) => r.id === item.id);
              const isRunning = running && currentIdx === collections.filter((c) => selected.has(c.id)).indexOf(item);
              return (
                <div key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      result
                        ? result.passed
                          ? 'bg-success/5 border-success/30'
                          : 'bg-error/5 border-error/30'
                        : isRunning
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-base-200/40 border-base-300/50 hover:border-primary/20'
                    }`}
                    onClick={() => !running && toggleSelect(item.id)}
                  >
                    {!running && (
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="checkbox checkbox-xs checkbox-primary shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    {isRunning && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
                    {result && (result.passed ? <CheckCircle2 size={14} className="text-success shrink-0" /> : <XCircle size={14} className="text-error shrink-0" />)}

                    <span className={`badge badge-xs ${METHOD_COLORS[item.method] || 'badge-ghost'} shrink-0`}>{item.method}</span>
                    <span className="text-xs font-semibold truncate">{item.name}</span>
                    <span className="text-[10px] font-mono opacity-40 truncate hidden sm:inline">{truncate(item.url, 30)}</span>

                    {result && (
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono font-semibold ${result.passed ? 'text-success' : 'text-error'}`}>{result.result.status}</span>
                        <span className="text-[10px] opacity-40 flex items-center gap-0.5"><Clock size={9} />{formatDuration(result.result.duration)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedResult(expandedResult === item.id ? null : item.id); }}
                          className="btn btn-ghost btn-xs rounded-lg"
                        >
                          {expandedResult === item.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Expanded result */}
                  <AnimatePresence>
                    {expandedResult === item.id && result && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mt-1 mb-2 p-3 rounded-xl bg-base-200/60 border border-base-300/50">
                          <pre className="text-[10px] font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto scrollbar-thin">
                            {typeof result.result.data === 'object' ? JSON.stringify(result.result.data, null, 2) : String(result.result.data)}
                          </pre>
                          <button
                            onClick={() => onLoadResult(result)}
                            className="btn btn-ghost btn-xs rounded-lg mt-2 text-primary"
                          >
                            Load in main view →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && !running && (
          <div className={`p-3 rounded-xl border text-center ${failCount === 0 && !aborted ? 'bg-success/10 border-success/30' : 'bg-base-200/50 border-base-300/50'}`}>
            <div className="flex items-center justify-center gap-3 text-sm">
              {failCount === 0 && !aborted ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <XCircle size={16} className="text-error" />
              )}
              <span className="font-semibold">
                {passCount} passed, {failCount} failed
                {aborted && ' (aborted)'}
              </span>
              <span className="opacity-40">•</span>
              <span className="text-xs opacity-50 flex items-center gap-1"><Clock size={11} />{formatDuration(totalDuration)} total</span>
            </div>
          </div>
        )}

        {/* Running progress */}
        {running && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm font-medium">Running request {currentIdx + 1} of {[...selected].length}...</span>
              <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / [...selected].length) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
