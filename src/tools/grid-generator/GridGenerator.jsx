import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3, Copy, Check, Plus, Minus, X, Trash2,
  RotateCcw, Code, ChevronDown, ChevronUp,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

// ─── Color Palette for Grid Boxes ──────────────────────────
const BOX_COLORS = [
  '#2D79FF', '#6366F1', '#8B5CF6', '#06B6D4', '#0EA5E9',
  '#4F46E5', '#7C3AED', '#2563EB', '#3B82F6', '#1D4ED8',
  '#818CF8', '#38BDF8', '#A78BFA', '#60A5FA', '#93C5FD',
  '#5B21B6', '#1E40AF', '#0284C7', '#7E22CE', '#4338CA',
];

let nextBoxId = 1;

// ─── Code Generators ───────────────────────────────────────
function generateCSS(columns, rows, colGap, rowGap, boxes) {
  const lines = ['.parent {'];
  lines.push('  display: grid;');
  lines.push(`  grid-template-columns: repeat(${columns}, 1fr);`);
  lines.push(`  grid-template-rows: repeat(${rows}, 1fr);`);
  lines.push(`  grid-column-gap: ${colGap}px;`);
  lines.push(`  grid-row-gap: ${rowGap}px;`);
  lines.push('}');
  lines.push('');

  boxes.forEach((box) => {
    lines.push(`.div${box.id} {`);
    lines.push(`  grid-area: ${box.rowStart} / ${box.colStart} / ${box.rowEnd} / ${box.colEnd};`);
    lines.push('}');
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

function generateHTML(boxes) {
  const lines = ['<div class="parent">'];
  boxes.forEach((box) => {
    lines.push(`  <div class="div${box.id}"></div>`);
  });
  lines.push('</div>');
  return lines.join('\n');
}

// ─── Number Stepper Component ──────────────────────────────
function NumberStepper({ label, value, onChange, min = 1, max = 20 }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider opacity-50">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="btn btn-xs btn-ghost border border-base-300 btn-square disabled:opacity-20"
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="input input-sm text-center font-mono font-bold text-sm flex-1 min-w-0"
          min={min}
          max={max}
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="btn btn-xs btn-ghost border border-base-300 btn-square disabled:opacity-20"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Gap Slider Component ──────────────────────────────────
function GapSlider({ label, value, onChange, max = 100 }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider opacity-50">{label}</label>
        <span className="text-[11px] font-mono font-bold opacity-60">{value}px</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="range range-xs range-primary w-full"
      />
    </div>
  );
}

// ─── Box List Item ─────────────────────────────────────────
function BoxListItem({ box, isSelected, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(box.id)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm group
        ${isSelected
          ? 'bg-primary/15 border border-primary/30'
          : 'hover:bg-base-200 border border-transparent'
        }
      `}
    >
      <div
        className="w-4 h-4 rounded-sm shrink-0 shadow-sm"
        style={{ backgroundColor: box.color }}
      />
      <span className={`font-mono text-xs flex-1 ${isSelected ? 'font-bold text-primary' : 'opacity-70'}`}>
        .div{box.id}
      </span>
      <span className="text-[10px] font-mono opacity-30 hidden sm:inline">
        {box.rowStart}/{box.colStart} → {box.rowEnd}/{box.colEnd}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(box.id);
        }}
        className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60 btn-square"
      >
        <X size={10} />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function GridGenerator() {
  const [columns, setColumns] = useState(5);
  const [rows, setRows] = useState(5);
  const [colGap, setColGap] = useState(0);
  const [rowGap, setRowGap] = useState(0);

  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  // Drag state for creating boxes on the grid
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const [codeTab, setCodeTab] = useState('html');
  const [codeExpanded, setCodeExpanded] = useState(true);

  const { copied, copyToClipboard } = useCopyToClipboard();
  const gridRef = useRef(null);

  // ── Computed occupied cell map ──
  const occupiedCells = useMemo(() => {
    const map = new Map();
    boxes.forEach((box) => {
      for (let r = box.rowStart; r < box.rowEnd; r++) {
        for (let c = box.colStart; c < box.colEnd; c++) {
          map.set(`${r}-${c}`, box.id);
        }
      }
    });
    return map;
  }, [boxes]);

  // ── Drag preview area ──
  const dragArea = useMemo(() => {
    if (!dragStart || !dragEnd) return null;
    const r1 = Math.min(dragStart.row, dragEnd.row);
    const r2 = Math.max(dragStart.row, dragEnd.row);
    const c1 = Math.min(dragStart.col, dragEnd.col);
    const c2 = Math.max(dragStart.col, dragEnd.col);
    return { rowStart: r1, rowEnd: r2 + 1, colStart: c1, colEnd: c2 + 1 };
  }, [dragStart, dragEnd]);

  // ── Check if drag area overlaps existing boxes ──
  const dragOverlaps = useMemo(() => {
    if (!dragArea) return false;
    for (let r = dragArea.rowStart; r < dragArea.rowEnd; r++) {
      for (let c = dragArea.colStart; c < dragArea.colEnd; c++) {
        if (occupiedCells.has(`${r}-${c}`)) return true;
      }
    }
    return false;
  }, [dragArea, occupiedCells]);

  // ── Handle column/row reduction — remove boxes that go out of bounds ──
  useEffect(() => {
    setBoxes((prev) =>
      prev.filter(
        (b) => b.colStart <= columns && b.rowStart <= rows && b.colEnd <= columns + 1 && b.rowEnd <= rows + 1
      )
    );
  }, [columns, rows]);

  // ── Mouse handlers for grid cells ──
  const handleCellMouseDown = useCallback((row, col) => {
    const occupant = occupiedCells.get(`${row}-${col}`);
    if (occupant) {
      setSelectedBoxId(occupant);
      return;
    }
    setIsDragging(true);
    setDragStart({ row, col });
    setDragEnd({ row, col });
    setSelectedBoxId(null);
  }, [occupiedCells]);

  const handleCellMouseEnter = useCallback((row, col) => {
    if (isDragging) {
      setDragEnd({ row, col });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragArea && !dragOverlaps) {
      const colorIndex = nextBoxId % BOX_COLORS.length;
      const newBox = {
        id: nextBoxId++,
        rowStart: dragArea.rowStart,
        rowEnd: dragArea.rowEnd,
        colStart: dragArea.colStart,
        colEnd: dragArea.colEnd,
        color: BOX_COLORS[colorIndex],
      };
      setBoxes((prev) => [...prev, newBox]);
      setSelectedBoxId(newBox.id);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragArea, dragOverlaps]);

  // Attach mouseup to window for drag release outside the grid
  useEffect(() => {
    const handler = () => {
      if (isDragging) handleMouseUp();
    };
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, [isDragging, handleMouseUp]);

  // ── Remove a box ──
  const removeBox = useCallback((boxId) => {
    setBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (selectedBoxId === boxId) setSelectedBoxId(null);
  }, [selectedBoxId]);

  // ── Reset everything ──
  const handleReset = useCallback(() => {
    setColumns(5);
    setRows(5);
    setColGap(0);
    setRowGap(0);
    setBoxes([]);
    setSelectedBoxId(null);
    nextBoxId = 1;
  }, []);

  // ── Generated code ──
  const cssCode = useMemo(() => generateCSS(columns, rows, colGap, rowGap, boxes), [columns, rows, colGap, rowGap, boxes]);
  const htmlCode = useMemo(() => generateHTML(boxes), [boxes]);

  const activeCode = codeTab === 'html' ? htmlCode : cssCode;

  // ── Check if a cell is in the drag preview area ──
  const isCellInDragArea = useCallback((row, col) => {
    if (!dragArea) return false;
    return row >= dragArea.rowStart && row < dragArea.rowEnd && col >= dragArea.colStart && col < dragArea.colEnd;
  }, [dragArea]);

  // ── Build grid cells ──
  const gridCells = useMemo(() => {
    const cells = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        const key = `${r}-${c}`;
        const occupantId = occupiedCells.get(key);
        const box = occupantId ? boxes.find((b) => b.id === occupantId) : null;
        const isTopLeft = box && box.rowStart === r && box.colStart === c;
        const inDrag = isCellInDragArea(r, c);
        const isOccupied = !!occupantId;

        if (isOccupied && !isTopLeft) {
          continue;
        }

        if (isTopLeft && box) {
          cells.push(
            <div
              key={`box-${box.id}`}
              className={`
                rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 relative
                ${selectedBoxId === box.id ? 'ring-2 ring-white ring-offset-2 ring-offset-base-100 shadow-lg scale-[1.01]' : 'hover:brightness-110'}
              `}
              style={{
                gridRow: `${box.rowStart} / ${box.rowEnd}`,
                gridColumn: `${box.colStart} / ${box.colEnd}`,
                backgroundColor: box.color,
                minHeight: 0,
              }}
              onClick={() => setSelectedBoxId(box.id)}
            >
              <span className="text-white/90 text-xs font-mono font-bold drop-shadow-sm select-none">
                {box.colEnd - box.colStart > 1 || box.rowEnd - box.rowStart > 1
                  ? `.div${box.id}`
                  : box.id}
              </span>
            </div>
          );
        } else {
          cells.push(
            <div
              key={key}
              className={`
                rounded-md border-2 border-dashed transition-all duration-100 cursor-crosshair
                ${inDrag && !dragOverlaps
                  ? 'border-primary bg-primary/20 scale-[0.96]'
                  : inDrag && dragOverlaps
                    ? 'border-error/50 bg-error/10'
                    : 'border-base-300/40 hover:border-primary/40 hover:bg-primary/5'
                }
              `}
              style={{
                gridRow: `${r} / ${r + 1}`,
                gridColumn: `${c} / ${c + 1}`,
                minHeight: 0,
              }}
              onMouseDown={() => handleCellMouseDown(r, c)}
              onMouseEnter={() => handleCellMouseEnter(r, c)}
            />
          );
        }
      }
    }
    return cells;
  }, [rows, columns, boxes, occupiedCells, selectedBoxId, isCellInDragArea, dragOverlaps, handleCellMouseDown, handleCellMouseEnter]);

  // Copy both HTML + CSS
  const copyAll = useCallback(() => {
    copyToClipboard(`${htmlCode}\n\n${cssCode}`);
  }, [htmlCode, cssCode, copyToClipboard]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Grid3X3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">CSS Grid Generator</h1>
            <p className="text-xs opacity-50 mt-0.5">Click and drag on the grid to create boxes, then copy the code</p>
          </div>
        </div>
        <button onClick={handleReset} className="btn btn-sm btn-ghost btn-error gap-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </motion.div>

      {/* ── Main Layout: Sidebar + Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-5"
      >
        {/* ── Left Sidebar — Controls ── */}
        <div className="w-full lg:w-56 xl:w-64 shrink-0 space-y-4">
          {/* Grid Settings */}
          <div className="section-card p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
              <Grid3X3 size={12} /> Grid Settings
            </h3>
            <NumberStepper label="Columns" value={columns} onChange={setColumns} min={1} max={12} />
            <NumberStepper label="Rows" value={rows} onChange={setRows} min={1} max={12} />
            <GapSlider label="Column Gap" value={colGap} onChange={setColGap} />
            <GapSlider label="Row Gap" value={rowGap} onChange={setRowGap} />
          </div>

          {/* Box List */}
          <div className="section-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-40">
                Boxes ({boxes.length})
              </h3>
              {boxes.length > 0 && (
                <button
                  onClick={() => {
                    setBoxes([]);
                    setSelectedBoxId(null);
                    nextBoxId = 1;
                  }}
                  className="btn btn-ghost btn-xs gap-1 opacity-40 hover:opacity-100"
                >
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>

            {boxes.length === 0 ? (
              <div className="text-center py-6">
                <Grid3X3 size={20} className="mx-auto opacity-15 mb-2" />
                <p className="text-[11px] opacity-30">Click & drag on the grid</p>
                <p className="text-[11px] opacity-30">to create boxes</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                {boxes.map((box) => (
                  <BoxListItem
                    key={box.id}
                    box={box}
                    isSelected={selectedBoxId === box.id}
                    onSelect={setSelectedBoxId}
                    onRemove={removeBox}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="section-card p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-40">How to Use</h3>
            <ul className="space-y-1.5">
              {[
                'Set columns & rows count',
                'Click & drag on empty cells to create a box',
                'Boxes can span multiple cells',
                'Click a box to select it',
                'Copy the generated code below',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] opacity-50">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right Side — Grid Preview ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Grid Canvas */}
          <div className="section-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold">
                  Grid Preview
                  <span className="opacity-40 ml-1.5 font-normal">
                    {columns}×{rows}
                    {(colGap > 0 || rowGap > 0) && ` · gap: ${colGap}/${rowGap}px`}
                  </span>
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-30">
                {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div
              className="p-5 sm:p-6 select-none"
              onMouseUp={handleMouseUp}
            >
              <div
                ref={gridRef}
                className="w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  columnGap: `${colGap}px`,
                  rowGap: `${rowGap}px`,
                  aspectRatio: `${columns} / ${rows}`,
                  maxHeight: '520px',
                }}
              >
                {gridCells}
              </div>
            </div>
          </div>

          {/* ── Generated Code ── */}
          <div className="section-card overflow-hidden">
            <button
              onClick={() => setCodeExpanded(!codeExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-base-200/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code size={14} className="text-primary" />
                <span className="text-sm font-semibold">Generated Code</span>
                {boxes.length > 0 && (
                  <span className="badge badge-xs badge-primary">{boxes.length} div{boxes.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              {codeExpanded ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
            </button>

            <AnimatePresence initial={false}>
              {codeExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-base-300">
                    {/* Code Tabs + Copy Buttons */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-base-300/50">
                      <div className="tabs tabs-box tabs-sm">
                        <button
                          className={`tab px-4 py-2 ${codeTab === 'html' ? 'tab-active' : ''}`}
                          onClick={() => setCodeTab('html')}
                        >
                          HTML
                        </button>
                        <button
                          className={`tab px-4 py-2 ${codeTab === 'css' ? 'tab-active' : ''}`}
                          onClick={() => setCodeTab('css')}
                        >
                          CSS
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(activeCode)}
                          className="btn btn-xs btn-ghost gap-1"
                        >
                          {copied ? <Check size={11} /> : <Copy size={11} />}
                          <span className="text-[10px]">{copied ? 'Copied!' : `Copy ${codeTab.toUpperCase()}`}</span>
                        </button>
                        <button
                          onClick={copyAll}
                          className="btn btn-xs btn-primary gap-1"
                        >
                          <Copy size={11} />
                          <span className="text-[10px]">Copy All</span>
                        </button>
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="relative">
                      {boxes.length === 0 ? (
                        <div className="p-8 text-center">
                          <Code size={20} className="mx-auto opacity-15 mb-2" />
                          <p className="text-xs opacity-30">
                            Create boxes on the grid to generate code
                          </p>
                        </div>
                      ) : (
                        <pre className="p-4 bg-neutral text-neutral-content font-mono text-[13px] leading-relaxed overflow-x-auto max-h-72 scrollbar-thin">
                          {activeCode}
                        </pre>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Full combined code (always available for quick copy) */}
          {boxes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                <span className="text-xs font-semibold opacity-60">Combined Output (HTML + CSS)</span>
                <button
                  onClick={copyAll}
                  className="btn btn-xs btn-primary gap-1"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  <span className="text-[10px]">{copied ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>
              <pre className="p-4 bg-neutral text-neutral-content font-mono text-[12px] leading-relaxed overflow-x-auto max-h-64 scrollbar-thin">
                {htmlCode}{'\n\n'}{cssCode}
              </pre>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
