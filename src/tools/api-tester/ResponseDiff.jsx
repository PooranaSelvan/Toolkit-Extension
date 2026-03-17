import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, X, ArrowDown, RotateCcw } from 'lucide-react';
import { METHOD_COLORS, formatDuration, getStatusBadge, prettyJSON, truncate } from '../../utils/helpers';

function diffLines(textA, textB) {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const maxLen = Math.max(linesA.length, linesB.length);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];
    if (a === b) {
      result.push({ type: 'same', lineA: i + 1, lineB: i + 1, textA: a, textB: b });
    } else if (a !== undefined && b !== undefined) {
      result.push({ type: 'changed', lineA: i + 1, lineB: i + 1, textA: a, textB: b });
    } else if (a !== undefined) {
      result.push({ type: 'removed', lineA: i + 1, lineB: null, textA: a, textB: '' });
    } else {
      result.push({ type: 'added', lineA: null, lineB: i + 1, textA: '', textB: b });
    }
  }
  return result;
}

export default function ResponseDiff({ history, onClose }) {
  const [leftId, setLeftId] = useState(null);
  const [rightId, setRightId] = useState(null);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'unified'
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  const leftEntry = history.find((h) => h.id === leftId);
  const rightEntry = history.find((h) => h.id === rightId);

  const leftBody = useMemo(() => {
    if (!leftEntry) return '';
    try {
      if (typeof leftEntry.responseData === 'object') return prettyJSON(leftEntry.responseData);
      return String(leftEntry.responseData || leftEntry.body || '');
    } catch { return ''; }
  }, [leftEntry]);

  const rightBody = useMemo(() => {
    if (!rightEntry) return '';
    try {
      if (typeof rightEntry.responseData === 'object') return prettyJSON(rightEntry.responseData);
      return String(rightEntry.responseData || rightEntry.body || '');
    } catch { return ''; }
  }, [rightEntry]);

  const diffResult = useMemo(() => {
    if (!leftBody || !rightBody) return [];
    return diffLines(leftBody, rightBody);
  }, [leftBody, rightBody]);

  const filteredDiff = showOnlyDiffs ? diffResult.filter((d) => d.type !== 'same') : diffResult;
  const changeCount = diffResult.filter((d) => d.type !== 'same').length;
  const addedCount = diffResult.filter((d) => d.type === 'added').length;
  const removedCount = diffResult.filter((d) => d.type === 'removed').length;
  const changedCount = diffResult.filter((d) => d.type === 'changed').length;

  const renderSelector = (label, value, onChange) => (
    <div className="flex-1 min-w-0">
      <label className="text-[10px] font-bold uppercase tracking-widest opacity-35 mb-1.5 block">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="select select-xs w-full rounded-lg text-xs"
      >
        <option value="">Select a response...</option>
        {history.map((entry) => (
          <option key={entry.id} value={entry.id}>
            [{entry.method}] {truncate(entry.url, 30)} — {entry.status} ({new Date(entry.timestamp).toLocaleTimeString()})
          </option>
        ))}
      </select>
      {value && (() => {
        const entry = history.find((h) => h.id === value);
        if (!entry) return null;
        return (
          <div className="flex items-center gap-2 mt-1.5 text-[10px]">
            <span className={`badge badge-xs ${METHOD_COLORS[entry.method] || 'badge-ghost'}`}>{entry.method}</span>
            <span className={`badge ${getStatusBadge(entry.status)} badge-xs`}>{entry.status}</span>
            <span className="opacity-40">{formatDuration(entry.duration)}</span>
          </div>
        );
      })()}
    </div>
  );

  const getLineStyle = (type) => {
    switch (type) {
      case 'added': return 'bg-success/15 border-l-2 border-success';
      case 'removed': return 'bg-error/15 border-l-2 border-error';
      case 'changed': return 'bg-warning/10 border-l-2 border-warning';
      default: return '';
    }
  };

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
            <GitCompareArrows size={16} className="text-primary" />
            Response Diff
          </h3>
          <div className="flex items-center gap-1.5">
            {leftId && rightId && (
              <motion.button onClick={() => { setLeftId(null); setRightId(null); }} className="btn btn-ghost btn-xs rounded-xl gap-1">
                <RotateCcw size={11} /> Reset
              </motion.button>
            )}
            <motion.button onClick={onClose} className="btn btn-ghost btn-xs rounded-lg">
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {history.length < 2 ? (
          <div className="text-center py-10">
            <GitCompareArrows size={28} className="mx-auto opacity-15 mb-3" />
            <p className="text-sm opacity-50">Need at least 2 responses to compare.</p>
            <p className="text-xs opacity-30 mt-1">Send multiple requests, then compare their responses here.</p>
          </div>
        ) : (
          <>
            {/* Selectors */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {renderSelector('Left (Original)', leftId, setLeftId)}
              <div className="flex items-end pb-1">
                <ArrowDown size={14} className="opacity-20 rotate-[-90deg] hidden sm:block" />
              </div>
              {renderSelector('Right (New)', rightId, setRightId)}
            </div>

            {/* Options */}
            {leftId && rightId && (
              <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-base-200/50 border border-base-300/50 flex-wrap">
                <div className="flex items-center gap-1 bg-base-200/60 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`btn btn-xs rounded-md ${viewMode === 'side-by-side' ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    Side by Side
                  </button>
                  <button
                    onClick={() => setViewMode('unified')}
                    className={`btn btn-xs rounded-md ${viewMode === 'unified' ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    Unified
                  </button>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input type="checkbox" checked={showOnlyDiffs} onChange={(e) => setShowOnlyDiffs(e.target.checked)} className="checkbox checkbox-xs checkbox-primary" />
                  <span className="opacity-60">Show only changes</span>
                </label>
                <div className="ml-auto flex items-center gap-2 text-[10px]">
                  {changeCount > 0 ? (
                    <>
                      <span className="text-warning">~{changedCount} changed</span>
                      <span className="text-success">+{addedCount} added</span>
                      <span className="text-error">-{removedCount} removed</span>
                    </>
                  ) : (
                    <span className="text-success font-semibold">Identical responses</span>
                  )}
                </div>
              </div>
            )}

            {/* Diff view */}
            {leftId && rightId && (
              <div className="max-h-[450px] overflow-auto scrollbar-thin rounded-xl border border-base-300">
                {viewMode === 'side-by-side' ? (
                  <div className="grid grid-cols-2 divide-x divide-base-300">
                    {/* Left column */}
                    <div className="overflow-x-auto">
                      {filteredDiff.map((line, i) => (
                        <div key={i} className={`flex items-start text-[10px] font-mono ${getLineStyle(line.type === 'added' ? 'same' : line.type)} ${line.type === 'added' ? 'opacity-30' : ''}`}>
                          <span className="w-8 text-right pr-2 select-none opacity-30 shrink-0 py-0.5">{line.lineA || ''}</span>
                          <span className="whitespace-pre-wrap break-all flex-1 py-0.5 px-1">{line.textA}</span>
                        </div>
                      ))}
                    </div>
                    {/* Right column */}
                    <div className="overflow-x-auto">
                      {filteredDiff.map((line, i) => (
                        <div key={i} className={`flex items-start text-[10px] font-mono ${getLineStyle(line.type === 'removed' ? 'same' : line.type)} ${line.type === 'removed' ? 'opacity-30' : ''}`}>
                          <span className="w-8 text-right pr-2 select-none opacity-30 shrink-0 py-0.5">{line.lineB || ''}</span>
                          <span className="whitespace-pre-wrap break-all flex-1 py-0.5 px-1">{line.textB}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Unified view */
                  <div>
                    {filteredDiff.map((line, i) => (
                      <div key={i} className={`flex items-start text-[10px] font-mono ${getLineStyle(line.type)}`}>
                        <span className="w-8 text-right pr-1 select-none opacity-30 shrink-0 py-0.5">{line.lineA || ''}</span>
                        <span className="w-8 text-right pr-1 select-none opacity-30 shrink-0 py-0.5">{line.lineB || ''}</span>
                        <span className="w-4 text-center select-none shrink-0 py-0.5 font-bold opacity-50">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : line.type === 'changed' ? '~' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap break-all flex-1 py-0.5 px-1">
                          {line.type === 'removed' ? line.textA : line.textB}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
