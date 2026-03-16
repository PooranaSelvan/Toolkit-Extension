import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Play, Pause, RotateCcw, Shuffle,
  BarChart3, ChevronRight, Zap, ArrowUpDown,
  BookOpen, SkipForward, SkipBack, Volume2, VolumeX, Info, Gauge,
  Footprints, FastForward,
} from 'lucide-react';
import SEO from '../../components/SEO';

// ── Algorithm metadata ───────────────────────────────────────────────
const ALGORITHMS = {
  selection: {
    name: 'Selection Sort',
    icon: '🔍',
    complexity: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    stable: false,
    desc: 'Repeatedly finds the minimum element from the unsorted region and moves it to the beginning.',
    steps: [
      'Start from the first element (i = 0)',
      'Find the minimum element in the unsorted part',
      'Swap the minimum with the element at position i',
      'Move the sorted boundary one step right',
      'Repeat until fully sorted',
    ],
    pseudo: `for i = 0 to n-1:
    min_idx = i
    for j = i+1 to n:
        if arr[j] < arr[min_idx]:
            min_idx = j
    swap(arr[i], arr[min_idx])`,
    tips: [
      'Small datasets where simplicity is preferred',
      'Memory is limited (in-place, O(1) extra space)',
      'When number of swaps needs to be minimized',
    ],
  },
  bubble: {
    name: 'Bubble Sort',
    icon: '🫧',
    complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    stable: true,
    desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    steps: [
      'Compare adjacent elements (arr[j] and arr[j+1])',
      'If they are in wrong order, swap them',
      'After each pass, the largest unsorted element is placed',
      'Repeat until no swaps are needed',
    ],
    pseudo: `for i = 0 to n-1:
    swapped = false
    for j = 0 to n-i-2:
        if arr[j] > arr[j+1]:
            swap(arr[j], arr[j+1])
            swapped = true
    if not swapped: break`,
    tips: [
      'Educational purposes to learn sorting concepts',
      'Nearly sorted data (best case O(n))',
      'Small datasets where simplicity matters',
    ],
  },
  insertion: {
    name: 'Insertion Sort',
    icon: '📥',
    complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    stable: true,
    desc: 'Builds the sorted array one item at a time by inserting each element into its correct position — like sorting cards in your hand.',
    steps: [
      'Start from the second element (first is "sorted")',
      'Pick the current element as the "key"',
      'Compare key with sorted portion (right to left)',
      'Shift larger elements one position right',
      'Insert the key at the correct position',
    ],
    pseudo: `for i = 1 to n-1:
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j+1] = arr[j]
        j = j - 1
    arr[j+1] = key`,
    tips: [
      'Small or nearly sorted datasets (very efficient)',
      'Online algorithms — can sort as data arrives',
      'When stability is required',
      'Used in Timsort for small subarrays',
    ],
  },
  merge: {
    name: 'Merge Sort',
    icon: '🔀',
    complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    stable: true,
    desc: 'A divide-and-conquer algorithm that divides the array in halves, recursively sorts them, and merges the sorted halves.',
    steps: [
      'Divide the array into two halves',
      'Recursively sort each half',
      'Merge the two sorted halves together',
      'Compare elements from both halves to build result',
      'Repeat until all elements are merged',
    ],
    pseudo: `mergeSort(arr, l, r):
    if l < r:
        m = (l + r) / 2
        mergeSort(arr, l, m)
        mergeSort(arr, m+1, r)
        merge(arr, l, m, r)`,
    tips: [
      'Guaranteed O(n log n) performance needed',
      'Stability is required',
      'Sorting linked lists (very efficient)',
      'External sorting for large datasets on disk',
    ],
  },
};

// ── Array generation ─────────────────────────────────────────────────
function generateArray(size, type = 'random') {
  switch (type) {
    case 'nearly-sorted': {
      const a = Array.from({ length: size }, (_, i) => Math.floor((i / size) * 85) + 10);
      for (let k = 0; k < Math.max(2, Math.floor(size * 0.1)); k++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        [a[x], a[y]] = [a[y], a[x]];
      }
      return a;
    }
    case 'reversed':
      return Array.from({ length: size }, (_, i) => Math.floor(((size - i) / size) * 85) + 10);
    case 'few-unique': {
      const vals = [15, 35, 55, 75, 95];
      return Array.from({ length: size }, () => vals[Math.floor(Math.random() * vals.length)]);
    }
    default:
      return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
  }
}

// ── Step generators ──────────────────────────────────────────────────
function* selectionSortSteps(arr) {
  const a = [...arr]; const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let mi = i;
    yield { array: [...a], comparing: [i], sorted: [...Array(i).keys()], phase: 'Scanning', detail: `Looking for minimum from index ${i}` };
    for (let j = i + 1; j < n; j++) {
      yield { array: [...a], comparing: [mi, j], sorted: [...Array(i).keys()], phase: 'Comparing', detail: `Comparing ${a[j]} with min ${a[mi]}` };
      if (a[j] < a[mi]) mi = j;
    }
    if (mi !== i) {
      yield { array: [...a], swapping: [i, mi], sorted: [...Array(i).keys()], phase: 'Swapping', detail: `Swap ${a[i]} ↔ ${a[mi]}` };
      [a[i], a[mi]] = [a[mi], a[i]];
    }
    yield { array: [...a], sorted: [...Array(i + 1).keys()], phase: 'Placed', detail: `${a[i]} in correct position` };
  }
  yield { array: [...a], sorted: [...Array(n).keys()], phase: 'Done', detail: 'Array is sorted!' };
}

function* bubbleSortSteps(arr) {
  const a = [...arr]; const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    const tail = Array.from({ length: i }, (_, k) => n - 1 - k);
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...a], comparing: [j, j + 1], sorted: tail, phase: 'Comparing', detail: `Comparing ${a[j]} and ${a[j + 1]}` };
      if (a[j] > a[j + 1]) {
        yield { array: [...a], swapping: [j, j + 1], sorted: tail, phase: 'Swapping', detail: `${a[j]} > ${a[j + 1]}, swapping` };
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true;
      }
    }
    if (!swapped) { yield { array: [...a], sorted: [...Array(n).keys()], phase: 'Done', detail: 'No swaps — sorted!' }; return; }
  }
  yield { array: [...a], sorted: [...Array(n).keys()], phase: 'Done', detail: 'Array is sorted!' };
}

function* insertionSortSteps(arr) {
  const a = [...arr]; const n = a.length;
  yield { array: [...a], sorted: [0], phase: 'Start', detail: `First element ${a[0]} is sorted` };
  for (let i = 1; i < n; i++) {
    const key = a[i];
    yield { array: [...a], comparing: [i], sorted: [...Array(i).keys()], phase: 'Pick key', detail: `Key = ${key}` };
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      yield { array: [...a], comparing: [j, j + 1], sorted: [...Array(i).keys()], phase: 'Shifting', detail: `${a[j]} > ${key}, shifting` };
      a[j + 1] = a[j];
      yield { array: [...a], swapping: [j, j + 1], sorted: [...Array(i).keys()], phase: 'Shifted', detail: `Moved ${a[j + 1]} right` };
      j--;
    }
    a[j + 1] = key;
    yield { array: [...a], sorted: [...Array(i + 1).keys()], inserted: j + 1, phase: 'Inserted', detail: `Inserted ${key} at index ${j + 1}` };
  }
  yield { array: [...a], sorted: [...Array(n).keys()], phase: 'Done', detail: 'Array is sorted!' };
}

function* mergeSortSteps(arr) {
  const a = [...arr]; const n = a.length; const done = new Set();
  function* helper(s, e) {
    if (e - s <= 1) return;
    const m = Math.floor((s + e) / 2);
    yield { array: [...a], merging: Array.from({ length: e - s }, (_, i) => s + i), sorted: [...done], phase: 'Dividing', detail: `Split [${s}..${e - 1}]` };
    yield* helper(s, m);
    yield* helper(m, e);
    const L = a.slice(s, m), R = a.slice(m, e);
    let i = 0, j = 0, k = s;
    const region = Array.from({ length: e - s }, (_, x) => s + x);
    yield { array: [...a], merging: region, sorted: [...done], phase: 'Merging', detail: `Merge [${L}] + [${R}]` };
    while (i < L.length && j < R.length) {
      yield { array: [...a], comparing: [s + i, m + j], merging: region, sorted: [...done], phase: 'Comparing', detail: `${L[i]} vs ${R[j]}` };
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      yield { array: [...a], placed: k - 1, merging: region, sorted: [...done], phase: 'Placing', detail: `Placed ${a[k - 1]}` };
    }
    while (i < L.length) { a[k++] = L[i++]; yield { array: [...a], placed: k - 1, merging: region, sorted: [...done], phase: 'Placing', detail: `Placed ${a[k - 1]}` }; }
    while (j < R.length) { a[k++] = R[j++]; yield { array: [...a], placed: k - 1, merging: region, sorted: [...done], phase: 'Placing', detail: `Placed ${a[k - 1]}` }; }
    for (let x = s; x < e; x++) done.add(x);
    yield { array: [...a], sorted: [...done], phase: 'Merged', detail: `Merged [${s}..${e - 1}]` };
  }
  yield* helper(0, n);
  yield { array: [...a], sorted: [...Array(n).keys()], phase: 'Done', detail: 'Array is sorted!' };
}

const GENERATORS = { selection: selectionSortSteps, bubble: bubbleSortSteps, insertion: insertionSortSteps, merge: mergeSortSteps };

// ── Sound (single shared AudioContext) ───────────────────────────────
const audioCtxRef = { current: null };
function playTone(value, max = 100) {
  try {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || /** @type {typeof AudioContext} */ (window).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 200 + (value / max) * 600;
    gain.gain.value = 0.03;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.stop(ctx.currentTime + 0.05);
  } catch { /* silent */ }
}

// ── Bar color resolver ───────────────────────────────────────────────
const C = {
  default:   'var(--color-primary)',
  comparing: '#3b82f6',
  swapping:  '#ef4444',
  inserted:  '#f59e0b',
  placed:    '#8b5cf6',
  merging:   '#818cf8',
  sorted:    '#22c55e',
};

function barColor(idx, step) {
  if (!step) return C.default;
  if (step.sorted?.includes(idx))   return C.sorted;
  if (step.swapping?.includes(idx)) return C.swapping;
  if (step.inserted === idx)        return C.inserted;
  if (step.placed === idx)          return C.placed;
  if (step.comparing?.includes(idx))return C.comparing;
  if (step.merging?.includes(idx))  return C.merging;
  return C.default;
}

function barIsActive(idx, step) {
  if (!step) return false;
  return step.swapping?.includes(idx) || step.comparing?.includes(idx) || step.inserted === idx || step.placed === idx;
}

// ── Phase badge color ────────────────────────────────────────────────
function phaseBadgeBg(phase) {
  if (!phase) return undefined;
  if (phase === 'Done') return C.sorted;
  if (phase.includes('Swap') || phase.includes('Shift')) return C.swapping;
  if (phase.includes('Compar')) return C.comparing;
  if (phase.includes('Merg') || phase.includes('Divid')) return C.merging;
  if (phase.includes('Insert') || phase.includes('Pick') || phase.includes('key')) return C.inserted;
  if (phase.includes('Plac') || phase.includes('Start') || phase.includes('Scan')) return C.placed;
  return undefined;
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function SortingVisualizer() {
  const [algo, setAlgo]           = useState('selection');
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed]         = useState(50);
  const [arrayType, setArrayType] = useState('random');
  const [array, setArray]         = useState(() => generateArray(20));
  const [step, setStep]           = useState(null);
  const [playing, setPlaying]     = useState(false);
  const [sorted, setSorted]       = useState(false);
  const [stepNo, setStepNo]       = useState(0);
  const [total, setTotal]         = useState(0);
  const [sound, setSound]         = useState(false);
  const [tab, setTab]             = useState('visualize');
  const [showPseudo, setShowPseudo] = useState(false);
  const [mode, setMode]           = useState('auto'); // 'auto' or 'step'

  const timerRef = useRef(null);
  const stepsRef = useRef([]);
  const idxRef   = useRef(0);

  const maxVal = useMemo(() => Math.max(...array, 100), [array]);
  const info   = ALGORITHMS[algo];

  // ── Build all steps ────────────────────────────────────────────────
  const buildSteps = useCallback((a, al) => {
    const gen = GENERATORS[al](a);
    const out = []; let r = gen.next();
    while (!r.done) { out.push(r.value); r = gen.next(); }
    return out;
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPlaying(false); setSorted(false); setStep(null); setStepNo(0); setTotal(0);
    idxRef.current = 0; stepsRef.current = [];
  }, []);

  const newArray = useCallback(() => {
    reset(); setArray(generateArray(arraySize, arrayType));
  }, [arraySize, arrayType, reset]);

  // ── Tick ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (idxRef.current >= stepsRef.current.length) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setPlaying(false); setSorted(true); return;
    }
    const s = stepsRef.current[idxRef.current];
    setStep(s); setArray(s.array); setStepNo(idxRef.current + 1);
    idxRef.current++;
  }, []);

  const startTimer = useCallback((spd) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, Math.max(8, 500 - spd * 4.9));
  }, [tick]);

  // ── Play / Pause ───────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (sorted) return;
    if (playing) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setPlaying(false); return;
    }
    if (!stepsRef.current.length || idxRef.current === 0) {
      const s = buildSteps(array, algo);
      stepsRef.current = s; idxRef.current = 0; setTotal(s.length); setStepNo(0);
    }
    setPlaying(true); startTimer(speed);
  }, [playing, sorted, buildSteps, array, algo, speed, startTimer]);

  // ── Step controls ──────────────────────────────────────────────────
  const forward = useCallback(() => {
    if (sorted) return;
    if (!stepsRef.current.length) {
      const s = buildSteps(array, algo);
      stepsRef.current = s; idxRef.current = 0; setTotal(s.length);
    }
    if (idxRef.current >= stepsRef.current.length) { setSorted(true); return; }
    const s = stepsRef.current[idxRef.current];
    setStep(s); setArray(s.array); setStepNo(idxRef.current + 1);
    if (sound && s.comparing) playTone(s.array[s.comparing[0]], maxVal);
    idxRef.current++;
    if (idxRef.current >= stepsRef.current.length) setSorted(true);
  }, [sorted, buildSteps, array, algo, sound, maxVal]);

  const backward = useCallback(() => {
    if (idxRef.current <= 1) return;
    idxRef.current--;
    const targetIdx = idxRef.current - 1;
    const s = stepsRef.current[targetIdx];
    setStep(s); setArray(s.array); setStepNo(targetIdx + 1);
    setSorted(false);
  }, []);

  // ── Effects ────────────────────────────────────────────────────────
  useEffect(() => { if (sound && playing && step?.comparing) playTone(step.array[step.comparing[0]], maxVal); }, [step, sound, playing, maxVal]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { reset(); }, [algo, reset]);
  useEffect(() => { reset(); setArray(generateArray(arraySize, arrayType)); }, [arraySize, arrayType, reset]);
  useEffect(() => { if (playing) startTimer(speed); }, [speed, playing, startTimer]);

  // ── Legend ─────────────────────────────────────────────────────────
  const legend = [
    { c: C.default, l: 'Default' }, { c: C.comparing, l: 'Comparing' },
    { c: C.swapping, l: 'Swapping' }, { c: C.inserted, l: 'Inserting' },
    { c: C.merging, l: 'Merging' }, { c: C.sorted, l: 'Sorted' },
  ];

  const TABS = [
    { id: 'visualize', label: 'Visualize', Icon: BarChart3 },
    { id: 'learn',     label: 'Learn',     Icon: BookOpen },
    { id: 'compare',   label: 'Compare',   Icon: ArrowUpDown },
  ];

  const cxColors = { best: '#22c55e', avg: '#f59e0b', worst: '#ef4444', space: '#3b82f6' };

  // ══════════════════════════════════════════════════════════════════
  return (
    <>
      <SEO
        title="Sorting Visualizer | Developer Toolbox"
        description="Interactive sorting algorithm visualizer for learning"
        keywords="sorting, algorithm, visualization, learning"
      />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sorting Visualizer</h1>
              <p className="text-xs opacity-50 mt-0.5">Learn sorting algorithms with step-by-step visual animations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={newArray} className="btn btn-sm btn-primary gap-1.5" disabled={playing}>
              <Shuffle size={14} /> New Array
            </button>
            <button
              onClick={() => setSound(!sound)}
              className={`btn btn-sm btn-ghost gap-1.5 ${sound ? 'text-primary' : ''}`}
            >
              {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </motion.div>

        {/* ── Algorithm Selector ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {Object.entries(ALGORITHMS).map(([key, a]) => (
            <button
              key={key}
              onClick={() => !playing && setAlgo(key)}
              disabled={playing}
              className={`section-card p-4 text-left transition-all duration-200 ${
                playing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${algo === key ? 'border-primary/40 shadow-sm' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg">{a.icon}</span>
                <span className={`text-[13px] font-bold ${algo === key ? 'text-primary' : ''}`}>{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-40">Avg: {a.complexity.avg}</span>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: a.stable ? '#dcfce7' : '#fef3c7',
                    color: a.stable ? '#16a34a' : '#d97706',
                  }}
                >
                  {a.stable ? 'Stable' : 'Unstable'}
                </span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* ── Controls ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="section-card p-5 space-y-5"
        >
          {/* Sliders + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold opacity-50">Array Size</label>
                <span className="text-[13px] font-mono font-bold text-primary">{arraySize}</span>
              </div>
              <input type="range" min={5} max={60} value={arraySize}
                onChange={(e) => setArraySize(+e.target.value)}
                className="range range-primary range-xs w-full" disabled={playing} />
              <div className="flex justify-between text-[9px] opacity-25 mt-0.5 px-0.5">
                <span>5</span><span>30</span><span>60</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold opacity-50 flex items-center gap-1">
                  <Gauge size={10} /> Speed
                </label>
                <span className="text-[13px] font-mono font-bold text-secondary">{speed}%</span>
              </div>
              <input type="range" min={1} max={100} value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
                className="range range-secondary range-xs w-full" />
              <div className="flex justify-between text-[9px] opacity-25 mt-0.5 px-0.5">
                <span>Slow</span><span>Medium</span><span>Fast</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold opacity-50 block mb-1.5">Array Type</label>
              <select value={arrayType} onChange={(e) => setArrayType(e.target.value)}
                className="select select-sm select-bordered text-xs w-full" disabled={playing}>
                <option value="random">🎲  Random</option>
                <option value="nearly-sorted">📊  Nearly Sorted</option>
                <option value="reversed">🔄  Reversed</option>
                <option value="few-unique">🎯  Few Unique</option>
              </select>
            </div>
          </div>

          {/* Mode Toggle + Playback */}
          <div className="flex flex-col gap-3 pt-4 border-t border-base-300/30">
            {/* Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-40">Mode</span>
              <div className="inline-flex rounded-lg border border-base-300/40 p-0.5 bg-base-200/40">
                <button
                  onClick={() => { if (!playing) setMode('auto'); }}
                  disabled={playing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                    mode === 'auto'
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'text-base-content/60 hover:text-base-content/80'
                  }`}
                >
                  <FastForward size={11} /> Auto Play
                </button>
                <button
                  onClick={() => { if (!playing) setMode('step'); }}
                  disabled={playing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                    mode === 'step'
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'text-base-content/60 hover:text-base-content/80'
                  }`}
                >
                  <Footprints size={11} /> Step-by-Step
                </button>
              </div>
              <span className="text-[9px] opacity-30 ml-1 hidden sm:inline">
                {mode === 'auto' ? 'Plays through all steps automatically' : 'Use arrows to navigate each step manually'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {mode === 'auto' ? (
                  /* ── Auto Play Controls ── */
                  <>
                    {sorted ? (
                      <button className="btn btn-sm gap-1.5 min-w-[120px] pointer-events-none"
                        style={{ backgroundColor: '#22c55e', color: '#fff', borderColor: '#22c55e' }}>
                        ✓ Sorted!
                      </button>
                    ) : playing ? (
                      <button onClick={togglePlay} className="btn btn-sm gap-1.5 min-w-[120px]"
                        style={{ backgroundColor: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }}>
                        <Pause size={14} /> Pause
                      </button>
                    ) : (
                      <button onClick={togglePlay} className="btn btn-sm btn-primary gap-1.5 min-w-[120px]">
                        <Play size={14} /> {stepNo > 0 ? 'Resume' : 'Start'}
                      </button>
                    )}
                  </>
                ) : (
                  /* ── Step-by-Step Controls ── */
                  <>
                    <div className="inline-flex items-center rounded-lg border border-base-300/40 bg-base-200/30 p-0.5 gap-0.5">
                      <button
                        onClick={backward}
                        className="btn btn-sm btn-ghost btn-square !rounded-md"
                        disabled={stepNo <= 1}
                        title="Step Backward"
                      >
                        <SkipBack size={14} />
                      </button>
                      <div className="w-px h-5 bg-base-300/40" />
                      <button
                        onClick={forward}
                        className="btn btn-sm btn-ghost btn-square !rounded-md"
                        disabled={sorted}
                        title="Step Forward"
                      >
                        <SkipForward size={14} />
                      </button>
                    </div>
                    <span className="text-[10px] opacity-40 font-medium">
                      {sorted ? '✓ Sorted' : stepNo === 0 ? 'Press → to begin' : 'Navigate with arrows'}
                    </span>
                  </>
                )}
                <div className="w-px h-6 bg-base-300/30 mx-1 hidden sm:block" />
                <button onClick={newArray} className="btn btn-sm btn-ghost gap-1.5" disabled={playing}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                {total > 0 && <span className="font-mono opacity-40">Step {stepNo}/{total}</span>}
                {step && (
                  <span className="badge badge-sm text-white"
                    style={{ backgroundColor: phaseBadgeBg(step.phase) }}>
                    {step.phase}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {total > 0 && (
            <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: sorted ? '#22c55e' : 'var(--color-primary)' }}
                initial={false}
                animate={{ width: `${(stepNo / total) * 100}%` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="tabs tabs-box tabs-sm">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id}
                className={`tab gap-1.5 ${tab === id ? 'tab-active' : ''}`}
                onClick={() => setTab(id)}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Tab Content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ─── VISUALIZE ──────────────────────────────────────── */}
          {tab === 'visualize' && (
            <motion.div key="vis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Bar Chart Card */}
              <div className="section-card overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-primary" />
                    <span className="text-xs font-bold">{info.name}</span>
                    {!step && !sorted && (
                      <span className="text-[10px] opacity-30 ml-1">— Press Start or Step Forward</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {legend.map(({ c, l }) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c }} />
                        <span className="text-[10px] opacity-40">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div
                    className="rounded-xl overflow-hidden border border-base-300/40"
                    style={{
                      background: 'color-mix(in oklch, var(--color-base-200) 60%, transparent)',
                      padding: '20px 12px 8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        height: arraySize > 40 ? 220 : arraySize > 25 ? 260 : 300,
                        gap: arraySize > 50 ? 1 : arraySize > 30 ? 2 : 3,
                        width: '100%',
                      }}
                    >
                      {array.map((val, i) => {
                        const color  = barColor(i, step);
                        const pct    = Math.max(4, (val / maxVal) * 100);
                        const active = barIsActive(i, step);
                        const isSwap = step?.swapping?.includes(i);
                        const isSorted = step?.sorted?.includes(i);

                        return (
                          <div
                            key={i}
                            style={{
                              flex: '1 1 0',
                              maxWidth: arraySize < 15 ? 44 : arraySize < 30 ? 26 : 16,
                              minWidth: 2,
                              height: `${pct}%`,
                              backgroundColor: color,
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.12s ease-out, background-color 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease',
                              transform: isSwap ? 'scaleY(1.06)' : active ? 'scaleY(1.03)' : 'scaleY(1)',
                              boxShadow: active ? `0 0 12px ${color}44` : 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              opacity: isSorted ? 1 : 0.85,
                            }}
                          >
                            {arraySize <= 25 && (
                              <span
                                style={{
                                  fontSize: arraySize <= 12 ? 10 : 8,
                                  fontWeight: 700,
                                  color: '#fff',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                  marginTop: 3,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  lineHeight: 1,
                                  userSelect: 'none',
                                }}
                              >
                                {val}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step detail */}
              <AnimatePresence>
                {step && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="section-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm"
                        style={{
                          backgroundColor: phaseBadgeBg(step.phase) || 'var(--color-primary)',
                          color: '#fff',
                        }}
                      >
                        {info.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="badge badge-sm text-white"
                            style={{ backgroundColor: phaseBadgeBg(step.phase) }}>
                            {step.phase}
                          </span>
                          <span className="text-[10px] opacity-30 font-mono">Step {stepNo}</span>
                        </div>
                        <p className="text-xs opacity-60 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Array numbers */}
              {arraySize <= 40 && (
                <div className="section-card p-4">
                  <h4 className="text-[11px] font-bold opacity-40 mb-2.5 uppercase tracking-wider">Array State</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {array.map((val, i) => {
                      const color = barColor(i, step);
                      const lit = barIsActive(i, step) || step?.sorted?.includes(i);
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center font-mono text-[10px] font-bold rounded-md transition-all duration-100"
                          style={{
                            minWidth: 28, height: 26, padding: '0 6px',
                            color: lit ? '#fff' : undefined,
                            backgroundColor: lit ? color : 'transparent',
                            border: `1.5px solid ${lit ? color : 'color-mix(in oklch, var(--color-base-content) 15%, transparent)'}`,
                          }}
                        >
                          {val}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── LEARN ──────────────────────────────────────────── */}
          {tab === 'learn' && (
            <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Overview */}
              <div className="section-card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{info.name}</h3>
                    <p className="text-xs opacity-50 mt-1 leading-relaxed">{info.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(info.complexity).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center p-2.5 rounded-lg bg-base-200/50 border border-base-300/30">
                      <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider">
                        {key === 'avg' ? 'Average' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-xs font-bold font-mono mt-0.5" style={{ color: cxColors[key] }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: info.stable ? '#dcfce7' : '#fef3c7',
                      color: info.stable ? '#16a34a' : '#d97706',
                    }}>
                    {info.stable ? '✓ Stable' : '✗ Unstable'}
                  </span>
                  <span className="badge badge-sm badge-ghost gap-1">
                    In-place: {info.complexity.space === 'O(1)' ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>

              {/* How It Works */}
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                  <BookOpen size={13} className="text-primary" /> How It Works
                </h4>
                <ol className="space-y-2">
                  {info.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        {i + 1}
                      </span>
                      <span className="opacity-60 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pseudocode */}
              <div className="section-card p-5">
                <button onClick={() => setShowPseudo(!showPseudo)}
                  className="w-full flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Info size={13} className="text-primary" /> Pseudocode
                  </span>
                  <ChevronRight size={14}
                    className={`transition-transform duration-200 opacity-40 ${showPseudo ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {showPseudo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <pre className="mt-3 p-4 rounded-xl bg-neutral text-neutral-content font-mono text-[11px] leading-relaxed overflow-x-auto">
                        {info.pseudo}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* When to Use */}
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-primary" /> When to Use
                </h4>
                <ul className="space-y-1.5">
                  {info.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs opacity-60">
                      <span className="mt-0.5" style={{ color: '#22c55e' }}>•</span>
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* ─── COMPARE ────────────────────────────────────────── */}
          {tab === 'compare' && (
            <motion.div key="cmp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="section-card overflow-hidden">
                <div className="p-4 border-b border-base-300/30">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-primary" /> Algorithm Comparison
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-base-200/30">
                        {['Algorithm', 'Best', 'Average', 'Worst', 'Space', 'Stable'].map((h) => (
                          <th key={h} className="px-4 py-3 text-center font-bold first:text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(ALGORITHMS).map(([key, a]) => (
                        <tr key={key}
                          className={`border-t border-base-300/20 transition-colors ${
                            algo === key ? 'bg-primary/[0.04]' : 'hover:bg-primary/[0.02]'
                          }`}>
                          <td className="px-4 py-3 font-semibold">
                            <span className="inline-flex items-center gap-2">
                              <span>{a.icon}</span> {a.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.best }}>{a.complexity.best}</td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.avg }}>{a.complexity.avg}</td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.worst }}>{a.complexity.worst}</td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.space }}>{a.complexity.space}</td>
                          <td className="px-4 py-3 text-center">
                            {a.stable
                              ? <span style={{ color: '#22c55e' }}>✓ Yes</span>
                              : <span style={{ color: '#ef4444' }}>✗ No</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
