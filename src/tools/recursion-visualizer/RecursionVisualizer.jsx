import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Play, Pause, RotateCcw, ChevronRight,
  BookOpen, Zap, Info, Gauge, GitBranch, Layers,
  SkipForward, SkipBack, TreePine, Code2, ArrowUpDown, Volume2, VolumeX,
  Clock, Hash, TrendingUp, Activity, Footprints, FastForward,
} from 'lucide-react';
import SEO from '../../components/SEO';

// ── Recursion function metadata ──────────────────────────────────────
const FUNCTIONS = {
  fibonacci: {
    name: 'Fibonacci',
    icon: '🌀',
    desc: 'Computes the nth Fibonacci number using naive recursion. Each call branches into two sub-calls, creating an exponential call tree.',
    complexity: { time: 'O(2ⁿ)', space: 'O(n)', calls: 'Exponential' },
    code: `function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}`,
    codeLines: [
      { text: 'function fib(n) {', indent: 0 },
      { text: '  if (n <= 1) return n;', indent: 1, type: 'base' },
      { text: '  return fib(n - 1) + fib(n - 2);', indent: 1, type: 'recurse' },
      { text: '}', indent: 0 },
    ],
    steps: [
      'If n ≤ 1, return n (base case)',
      'Recursively compute fib(n-1)',
      'Recursively compute fib(n-2)',
      'Return the sum of both results',
    ],
    tips: [
      'Classic example of overlapping subproblems',
      'Can be optimized with memoization → O(n)',
      'Iterative approach uses O(1) space',
      'Used to teach dynamic programming concepts',
    ],
    defaultInput: 5,
    maxInput: 8,
    inputLabel: 'n',
  },
  factorial: {
    name: 'Factorial',
    icon: '🔢',
    desc: 'Computes n! by multiplying n with the factorial of (n-1). A classic example of linear recursion with a single recursive call per level.',
    complexity: { time: 'O(n)', space: 'O(n)', calls: 'Linear' },
    code: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}`,
    codeLines: [
      { text: 'function factorial(n) {', indent: 0 },
      { text: '  if (n <= 1) return 1;', indent: 1, type: 'base' },
      { text: '  return n * factorial(n - 1);', indent: 1, type: 'recurse' },
      { text: '}', indent: 0 },
    ],
    steps: [
      'If n ≤ 1, return 1 (base case)',
      'Recursively compute factorial(n-1)',
      'Multiply n by the result',
      'Return the product',
    ],
    tips: [
      'Simple linear recursion — one branch per level',
      'Easy to convert to tail recursion',
      'Iterative version uses O(1) space',
      'Good introductory recursion example',
    ],
    defaultInput: 5,
    maxInput: 10,
    inputLabel: 'n',
  },
  power: {
    name: 'Power (Fast Exp)',
    icon: '⚡',
    desc: 'Computes base^exp using recursive divide-and-conquer. Splits the exponent in half at each step, demonstrating logarithmic recursion depth.',
    complexity: { time: 'O(log n)', space: 'O(log n)', calls: 'Logarithmic' },
    code: `function power(base, exp) {\n  if (exp === 0) return 1;\n  if (exp % 2 === 0) {\n    const half = power(base, exp / 2);\n    return half * half;\n  }\n  return base * power(base, exp - 1);\n}`,
    codeLines: [
      { text: 'function power(base, exp) {', indent: 0 },
      { text: '  if (exp === 0) return 1;', indent: 1, type: 'base' },
      { text: '  if (exp % 2 === 0) {', indent: 1 },
      { text: '    const half = power(base, exp/2);', indent: 2, type: 'recurse' },
      { text: '    return half * half;', indent: 2, type: 'return' },
      { text: '  }', indent: 1 },
      { text: '  return base * power(base, exp-1);', indent: 1, type: 'recurse' },
      { text: '}', indent: 0 },
    ],
    steps: [
      'If exp = 0, return 1 (base case)',
      'If exp is even, compute power(base, exp/2) once',
      'Return half × half (squaring trick)',
      'If exp is odd, return base × power(base, exp-1)',
    ],
    tips: [
      'Also known as fast exponentiation',
      'Reduces O(n) multiplications to O(log n)',
      'Core idea behind modular exponentiation in cryptography',
      'Demonstrates divide-and-conquer optimization',
    ],
    defaultInput: 6,
    maxInput: 10,
    inputLabel: 'exponent (base=2)',
  },
  sum: {
    name: 'Sum of Array',
    icon: '➕',
    desc: 'Recursively sums array elements by adding the first element to the sum of the rest. Demonstrates how recursion processes list structures.',
    complexity: { time: 'O(n)', space: 'O(n)', calls: 'Linear' },
    code: `function sum(arr, i = 0) {\n  if (i >= arr.length) return 0;\n  return arr[i] + sum(arr, i + 1);\n}`,
    codeLines: [
      { text: 'function sum(arr, i = 0) {', indent: 0 },
      { text: '  if (i >= arr.length) return 0;', indent: 1, type: 'base' },
      { text: '  return arr[i] + sum(arr, i + 1);', indent: 1, type: 'recurse' },
      { text: '}', indent: 0 },
    ],
    steps: [
      'If index is past the end, return 0 (base case)',
      'Take the element at current index',
      'Recursively sum the rest of the array',
      'Return current element + recursive result',
    ],
    tips: [
      'Shows how recursion replaces iteration over arrays',
      'Easy to adapt for product, max, min, etc.',
      'Tail-call optimization can make this O(1) space',
      'Functional programming uses this pattern extensively',
    ],
    defaultInput: 5,
    maxInput: 8,
    inputLabel: 'array size',
  },
};

// ── Colors ───────────────────────────────────────────────────────────
const COLORS = {
  active:    '#3b82f6',
  computing: '#f59e0b',
  returning: '#8b5cf6',
  baseCase:  '#22c55e',
  completed: '#6b7280',
  waiting:   '#818cf8',
};

// ── Sound ────────────────────────────────────────────────────────────
const audioCtxRef = { current: null };
function playTone(freq, dur = 0.06) {
  try {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.value = 0.04;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch { /* silent */ }
}
function playSoundForStep(step) {
  if (!step) return;
  if (step.type === 'call') playTone(300 + step.depth * 100, 0.06);
  else if (step.type === 'base') playTone(800, 0.1);
  else if (step.type === 'return') playTone(500 - step.depth * 30, 0.08);
}

// ── Tree node builder ────────────────────────────────────────────────
function buildCallTree(funcKey, input) {
  let nodeId = 0;
  const steps = [];

  function buildFibTree(n, depth, parentId) {
    const id = nodeId++;
    const node = { id, label: `fib(${n})`, value: null, children: [], depth, parentId };
    steps.push({ type: 'call', nodeId: id, label: node.label, depth, detail: `Calling fib(${n})`, codeLine: 2 });
    if (n <= 1) {
      node.value = n;
      steps.push({ type: 'base', nodeId: id, label: node.label, value: n, depth, detail: `Base case: fib(${n}) = ${n}`, codeLine: 1 });
      return node;
    }
    const left = buildFibTree(n - 1, depth + 1, id);
    node.children.push(left);
    const right = buildFibTree(n - 2, depth + 1, id);
    node.children.push(right);
    node.value = left.value + right.value;
    steps.push({ type: 'return', nodeId: id, label: node.label, value: node.value, depth, detail: `fib(${n}) = fib(${n - 1}) + fib(${n - 2}) = ${left.value} + ${right.value} = ${node.value}`, codeLine: 2 });
    return node;
  }

  function buildFactTree(n, depth, parentId) {
    const id = nodeId++;
    const node = { id, label: `fact(${n})`, value: null, children: [], depth, parentId };
    steps.push({ type: 'call', nodeId: id, label: node.label, depth, detail: `Calling factorial(${n})`, codeLine: 2 });
    if (n <= 1) {
      node.value = 1;
      steps.push({ type: 'base', nodeId: id, label: node.label, value: 1, depth, detail: `Base case: factorial(${n}) = 1`, codeLine: 1 });
      return node;
    }
    const child = buildFactTree(n - 1, depth + 1, id);
    node.children.push(child);
    node.value = n * child.value;
    steps.push({ type: 'return', nodeId: id, label: node.label, value: node.value, depth, detail: `factorial(${n}) = ${n} × ${child.value} = ${node.value}`, codeLine: 2 });
    return node;
  }

  function buildPowerTree(base, exp, depth, parentId) {
    const id = nodeId++;
    const node = { id, label: `pow(${base},${exp})`, value: null, children: [], depth, parentId };
    steps.push({ type: 'call', nodeId: id, label: node.label, depth, detail: `Calling power(${base}, ${exp})`, codeLine: exp % 2 === 0 ? 3 : 6 });
    if (exp === 0) {
      node.value = 1;
      steps.push({ type: 'base', nodeId: id, label: node.label, value: 1, depth, detail: `Base case: power(${base}, 0) = 1`, codeLine: 1 });
      return node;
    }
    if (exp % 2 === 0) {
      const child = buildPowerTree(base, exp / 2, depth + 1, id);
      node.children.push(child);
      node.value = child.value * child.value;
      steps.push({ type: 'return', nodeId: id, label: node.label, value: node.value, depth, detail: `power(${base},${exp}) = half² = ${child.value}² = ${node.value}`, codeLine: 4 });
    } else {
      const child = buildPowerTree(base, exp - 1, depth + 1, id);
      node.children.push(child);
      node.value = base * child.value;
      steps.push({ type: 'return', nodeId: id, label: node.label, value: node.value, depth, detail: `power(${base},${exp}) = ${base} × ${child.value} = ${node.value}`, codeLine: 6 });
    }
    return node;
  }

  function buildSumTree(arr, i, depth, parentId) {
    const id = nodeId++;
    const node = { id, label: `sum(${i})`, value: null, children: [], depth, parentId };
    steps.push({ type: 'call', nodeId: id, label: node.label, depth, detail: `Calling sum(arr, i=${i})${i < arr.length ? ` → arr[${i}] = ${arr[i]}` : ''}`, codeLine: 2 });
    if (i >= arr.length) {
      node.value = 0;
      steps.push({ type: 'base', nodeId: id, label: node.label, value: 0, depth, detail: `Base case: index ${i} ≥ length, return 0`, codeLine: 1 });
      return node;
    }
    const child = buildSumTree(arr, i + 1, depth + 1, id);
    node.children.push(child);
    node.value = arr[i] + child.value;
    steps.push({ type: 'return', nodeId: id, label: node.label, value: node.value, depth, detail: `sum(${i}) = arr[${i}] + sum(${i + 1}) = ${arr[i]} + ${child.value} = ${node.value}`, codeLine: 2 });
    return node;
  }

  let tree;
  switch (funcKey) {
    case 'fibonacci': tree = buildFibTree(input, 0, null); break;
    case 'factorial': tree = buildFactTree(input, 0, null); break;
    case 'power': tree = buildPowerTree(2, input, 0, null); break;
    case 'sum': {
      const arr = Array.from({ length: input }, (_, i) => i + 1);
      tree = buildSumTree(arr, 0, 0, null); break;
    }
    default: tree = buildFibTree(input, 0, null);
  }
  return { tree, steps };
}

// ── Tree helpers ─────────────────────────────────────────────────────
function flattenTree(node) {
  const nodes = [];
  (function walk(n) { nodes.push(n); n.children.forEach(walk); })(node);
  return nodes;
}

function assignPositions(root) {
  let nextX = 0;
  (function walk(node) {
    if (node.children.length === 0) { node.x = nextX++; node.y = node.depth; return; }
    node.children.forEach(walk);
    const xs = node.children.map(c => c.x);
    node.x = (Math.min(...xs) + Math.max(...xs)) / 2;
    node.y = node.depth;
  })(root);
  return nextX;
}

function buildCallStack(steps, currentStep) {
  const stack = [];
  for (let i = 0; i <= currentStep; i++) {
    const s = steps[i];
    if (s.type === 'call') {
      stack.push({ label: s.label, nodeId: s.nodeId, status: 'waiting', depth: s.depth });
    } else if (s.type === 'base' || s.type === 'return') {
      const idx = stack.findLastIndex(f => f.nodeId === s.nodeId);
      if (idx !== -1) { stack[idx].status = 'resolved'; stack[idx].value = s.value; }
    }
  }
  return stack;
}

function phaseBadge(type) {
  switch (type) {
    case 'call':   return { bg: COLORS.active, label: 'Calling', icon: '📞' };
    case 'base':   return { bg: COLORS.baseCase, label: 'Base Case', icon: '🎯' };
    case 'return': return { bg: COLORS.returning, label: 'Returning', icon: '↩️' };
    default:       return { bg: '#6b7280', label: 'Idle', icon: '⏸️' };
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function RecursionVisualizer() {
  const [funcKey, setFuncKey]     = useState('fibonacci');
  const [inputVal, setInputVal]   = useState(FUNCTIONS.fibonacci.defaultInput);
  const [speed, setSpeed]         = useState(50);
  const [tab, setTab]             = useState('visualize');
  const [playing, setPlaying]     = useState(false);
  const [stepNo, setStepNo]       = useState(-1);
  const [done, setDone]           = useState(false);
  const [showCode, setShowCode]   = useState(false);
  const [sound, setSound]         = useState(false);
  const [mode, setMode]           = useState('auto'); // 'auto' or 'step'

  const timerRef   = useRef(null);
  const treeRef    = useRef(null);
  const stepsRef   = useRef([]);
  const allNodes   = useRef([]);

  const info = FUNCTIONS[funcKey];

  // ── Build / Reset ──────────────────────────────────────────────────
  const build = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const { tree, steps } = buildCallTree(funcKey, inputVal);
    assignPositions(tree);
    treeRef.current = tree;
    stepsRef.current = steps;
    allNodes.current = flattenTree(tree);
    setStepNo(-1);
    setPlaying(false);
    setDone(false);
  }, [funcKey, inputVal]);

  useEffect(() => { build(); }, [build]);

  // ── Tick ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setStepNo(prev => {
      const next = prev + 1;
      if (next >= stepsRef.current.length) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setPlaying(false); setDone(true);
        return stepsRef.current.length - 1;
      }
      return next;
    });
  }, []);

  const startTimer = useCallback((spd) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, Math.max(100, 1200 - spd * 10));
  }, [tick]);

  const togglePlay = useCallback(() => {
    if (done) return;
    if (playing) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setPlaying(false); return;
    }
    setPlaying(true); startTimer(speed);
  }, [playing, done, speed, startTimer]);

  const forward = useCallback(() => {
    if (done) return;
    setStepNo(prev => {
      const next = prev + 1;
      if (next >= stepsRef.current.length) { setDone(true); return stepsRef.current.length - 1; }
      return next;
    });
  }, [done]);

  const backward = useCallback(() => {
    if (stepNo <= 0) return;
    setDone(false);
    setStepNo(prev => Math.max(-1, prev - 1));
  }, [stepNo]);

  // Sound on step change
  useEffect(() => {
    if (sound && stepNo >= 0 && stepNo < stepsRef.current.length) {
      playSoundForStep(stepsRef.current[stepNo]);
    }
  }, [stepNo, sound]);

  useEffect(() => { if (playing) startTimer(speed); }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Derive node states ─────────────────────────────────────────────
  const nodeStates = useMemo(() => {
    const states = {};
    if (stepNo < 0) return states;
    for (let i = 0; i <= stepNo && i < stepsRef.current.length; i++) {
      const s = stepsRef.current[i];
      states[s.nodeId] = s.type;
    }
    return states;
  }, [stepNo]);

  const currentStep = stepNo >= 0 && stepNo < stepsRef.current.length ? stepsRef.current[stepNo] : null;
  const totalSteps = stepsRef.current.length;

  const callStack = useMemo(() => {
    if (stepNo < 0) return [];
    return buildCallStack(stepsRef.current, stepNo);
  }, [stepNo]);

  // ── Execution history ──────────────────────────────────────────────
  const executionHistory = useMemo(() => {
    if (stepNo < 0) return [];
    return stepsRef.current.slice(0, stepNo + 1).map((s, i) => ({ ...s, stepIndex: i }));
  }, [stepNo]);

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (stepNo < 0) return { calls: 0, baseCases: 0, returns: 0, maxDepth: 0, activeFrames: 0 };
    let calls = 0, baseCases = 0, returns = 0, maxD = 0;
    for (let i = 0; i <= stepNo && i < stepsRef.current.length; i++) {
      const s = stepsRef.current[i];
      if (s.type === 'call') { calls++; maxD = Math.max(maxD, s.depth); }
      else if (s.type === 'base') baseCases++;
      else if (s.type === 'return') returns++;
    }
    return { calls, baseCases, returns, maxDepth: maxD + 1, activeFrames: callStack.filter(f => f.status === 'waiting').length };
  }, [stepNo, callStack]);

  const treeWidth = useMemo(() => {
    if (!treeRef.current) return 1;
    return assignPositions(treeRef.current);
  }, [funcKey, inputVal]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxDepth = useMemo(() => {
    return Math.max(...allNodes.current.map(n => n.depth), 0);
  }, [funcKey, inputVal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Node visuals ───────────────────────────────────────────────────
  function nodeColor(nodeId) {
    const state = nodeStates[nodeId];
    if (!state) return 'color-mix(in oklch, var(--color-base-content) 12%, transparent)';
    if (currentStep && currentStep.nodeId === nodeId) return phaseBadge(currentStep.type).bg;
    switch (state) {
      case 'call':   return COLORS.waiting;
      case 'base':   return COLORS.baseCase;
      case 'return': return COLORS.completed;
      default:       return 'color-mix(in oklch, var(--color-base-content) 12%, transparent)';
    }
  }

  function nodeOpacity(nodeId) {
    const state = nodeStates[nodeId];
    if (!state) return 0.2;
    if (currentStep && currentStep.nodeId === nodeId) return 1;
    if (state === 'return' || state === 'base') return 0.55;
    return 0.8;
  }

  function getNodeDisplayValue(node) {
    const state = nodeStates[node.id];
    if (state === 'base' || state === 'return') return node.value;
    return null;
  }

  const nodeSize = treeWidth > 12 ? 34 : treeWidth > 8 ? 40 : 48;
  const gapX = treeWidth > 12 ? 42 : treeWidth > 8 ? 54 : 66;
  const gapY = maxDepth > 5 ? 58 : 70;
  const svgW = treeWidth * gapX + 40;
  const svgH = (maxDepth + 1) * gapY + 40;

  const TABS = [
    { id: 'visualize', label: 'Visualize', Icon: TreePine },
    { id: 'learn',     label: 'Learn',     Icon: BookOpen },
    { id: 'compare',   label: 'Compare',   Icon: ArrowUpDown },
  ];

  const cxColors = { time: '#ef4444', space: '#3b82f6', calls: '#f59e0b' };

  // ══════════════════════════════════════════════════════════════════
  return (
    <>
      <SEO
        title="Recursion Visualizer | Developer Toolbox"
        description="Visualize recursive function calls with animated call trees and stack frames"
        keywords="recursion, call stack, visualization, fibonacci, factorial, learning, dsa"
      />

      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Recursion Visualizer</h1>
              <p className="text-xs opacity-50 mt-0.5">Visualize recursive calls with animated call trees & stack frames</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSound(!sound)}
              className={`btn btn-sm btn-ghost gap-1.5 ${sound ? 'text-primary' : ''}`}
            >
              {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button onClick={build} className="btn btn-sm btn-primary gap-1.5" disabled={playing}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </motion.div>

        {/* ── Function Selector ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {Object.entries(FUNCTIONS).map(([key, f]) => (
            <button
              key={key}
              onClick={() => { if (!playing) { setFuncKey(key); setInputVal(f.defaultInput); } }}
              disabled={playing}
              className={`section-card p-4 text-left transition-all duration-200 ${
                playing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${funcKey === key ? 'border-primary/40 shadow-sm' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg">{f.icon}</span>
                <span className={`text-[13px] font-bold ${funcKey === key ? 'text-primary' : ''}`}>{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-40">Time: {f.complexity.time}</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  {f.complexity.calls}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold opacity-50">{info.inputLabel}</label>
                <span className="text-[13px] font-mono font-bold text-primary">{inputVal}</span>
              </div>
              <input type="range" min={1} max={info.maxInput} value={inputVal}
                onChange={(e) => setInputVal(+e.target.value)}
                className="range range-primary range-xs w-full" disabled={playing} />
              <div className="flex justify-between text-[9px] opacity-25 mt-0.5 px-0.5">
                <span>1</span><span>{Math.floor(info.maxInput / 2)}</span><span>{info.maxInput}</span>
              </div>
            </div>
            {/* Speed */}
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
            {/* Live Stats */}
            <div>
              <label className="text-[11px] font-semibold opacity-50 block mb-1.5">Live Stats</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Calls', val: stats.calls, color: '#3b82f6', Icon: Hash },
                  { label: 'Depth', val: stats.maxDepth, color: '#8b5cf6', Icon: TrendingUp },
                  { label: 'Active', val: stats.activeFrames, color: '#f59e0b', Icon: Activity },
                ].map(({ label, val, color, Icon }) => (
                  <div key={label} className="flex flex-col items-center p-1.5 rounded-lg bg-base-200/50 border border-base-300/30">
                    <Icon size={10} className="opacity-30 mb-0.5" />
                    <span className="text-[9px] opacity-40 font-semibold uppercase">{label}</span>
                    <span className="text-xs font-bold font-mono" style={{ color }}>{val}</span>
                  </div>
                ))}
              </div>
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
                    {done ? (
                      <button className="btn btn-sm gap-1.5 min-w-[120px] pointer-events-none"
                        style={{ backgroundColor: '#22c55e', color: '#fff', borderColor: '#22c55e' }}>
                        ✓ Complete!
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
                        disabled={stepNo <= 0}
                        title="Step Backward"
                      >
                        <SkipBack size={14} />
                      </button>
                      <div className="w-px h-5 bg-base-300/40" />
                      <button
                        onClick={forward}
                        className="btn btn-sm btn-ghost btn-square !rounded-md"
                        disabled={done}
                        title="Step Forward"
                      >
                        <SkipForward size={14} />
                      </button>
                    </div>
                    <span className="text-[10px] opacity-40 font-medium">
                      {done ? '✓ Complete' : stepNo < 0 ? 'Press → to begin' : 'Navigate with arrows'}
                    </span>
                  </>
                )}
                <div className="w-px h-6 bg-base-300/30 mx-1 hidden sm:block" />
                <button onClick={build} className="btn btn-sm btn-ghost gap-1.5" disabled={playing}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                {stepNo >= 0 && <span className="font-mono opacity-40">Step {stepNo + 1}/{totalSteps}</span>}
                {currentStep && (
                  <span className="badge badge-sm text-white"
                    style={{ backgroundColor: phaseBadge(currentStep.type).bg }}>
                    {phaseBadge(currentStep.type).icon} {phaseBadge(currentStep.type).label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {totalSteps > 0 && stepNo >= 0 && (
            <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: done ? '#22c55e' : 'var(--color-primary)' }}
                initial={false}
                animate={{ width: `${((stepNo + 1) / totalSteps) * 100}%` }}
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

              {/* Legend */}
              <div className="section-card px-5 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {[
                    { c: COLORS.active,    l: 'Calling' },
                    { c: COLORS.waiting,   l: 'Waiting' },
                    { c: COLORS.baseCase,  l: 'Base Case' },
                    { c: COLORS.returning, l: 'Returning' },
                    { c: COLORS.completed, l: 'Completed' },
                  ].map(({ c, l }) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}44` }} />
                      <span className="text-[10px] opacity-50 font-medium">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main layout: Tree + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Tree Visualization — spans 2 cols */}
                <div className="lg:col-span-2 section-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                    <TreePine size={14} className="text-primary" />
                    <span className="text-xs font-bold">Call Tree</span>
                    {stepNo < 0 && !done && (
                      <span className="text-[10px] opacity-30 ml-1">— Press Start or Step Forward</span>
                    )}
                    {currentStep && (
                      <span className="ml-auto text-[10px] font-mono opacity-30">
                        Node: {currentStep.label}
                      </span>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <div className="rounded-xl overflow-auto border border-base-300/40 scrollbar-thin"
                      style={{
                        background: 'linear-gradient(135deg, color-mix(in oklch, var(--color-base-200) 60%, transparent), color-mix(in oklch, var(--color-base-200) 40%, transparent))',
                        padding: '20px 12px',
                        maxHeight: 440,
                      }}>
                      <svg
                        width={svgW}
                        height={svgH}
                        viewBox={`0 0 ${svgW} ${svgH}`}
                        style={{ display: 'block', margin: '0 auto', minWidth: svgW }}
                      >
                        <defs>
                          {/* Gradient for edges */}
                          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.08" />
                          </linearGradient>
                          <linearGradient id="edge-active" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                          </linearGradient>
                          {/* Drop shadow */}
                          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                          </filter>
                          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                          <style>{`
                            @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
                            @keyframes dash { to { stroke-dashoffset: -10; } }
                          `}</style>
                        </defs>

                        {/* Edges */}
                        {allNodes.current.map(node =>
                          node.children.map(child => {
                            const x1 = node.x * gapX + 20 + nodeSize / 2;
                            const y1 = node.y * gapY + 20 + nodeSize / 2;
                            const x2 = child.x * gapX + 20 + nodeSize / 2;
                            const y2 = child.y * gapY + 20 + nodeSize / 2;
                            const parentState = nodeStates[node.id];
                            const childState = nodeStates[child.id];
                            const edgeActive = parentState && childState;
                            const isCurrentEdge = currentStep && (currentStep.nodeId === child.id || currentStep.nodeId === node.id);

                            // Curved path
                            const midY = (y1 + y2) / 2;
                            const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                            return (
                              <g key={`${node.id}-${child.id}`}>
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke={edgeActive ? 'url(#edge-active)' : 'color-mix(in oklch, var(--color-base-content) 8%, transparent)'}
                                  strokeWidth={isCurrentEdge ? 2.5 : edgeActive ? 2 : 1}
                                  strokeDasharray={edgeActive ? 'none' : '4 4'}
                                  style={{
                                    transition: 'all 0.3s ease',
                                    ...(isCurrentEdge && !edgeActive ? { animation: 'dash 0.5s linear infinite' } : {}),
                                  }}
                                />
                                {/* Arrow tip */}
                                {edgeActive && (
                                  <circle
                                    cx={x2}
                                    cy={y2 - nodeSize / 2 - 3}
                                    r={2.5}
                                    fill={isCurrentEdge ? 'var(--color-primary)' : 'color-mix(in oklch, var(--color-primary) 40%, transparent)'}
                                    style={{ transition: 'fill 0.3s ease' }}
                                  />
                                )}
                              </g>
                            );
                          })
                        )}

                        {/* Nodes */}
                        {allNodes.current.map(node => {
                          const cx = node.x * gapX + 20 + nodeSize / 2;
                          const cy = node.y * gapY + 20 + nodeSize / 2;
                          const color = nodeColor(node.id);
                          const opacity = nodeOpacity(node.id);
                          const isActive = currentStep && currentStep.nodeId === node.id;
                          const displayVal = getNodeDisplayValue(node);
                          const r = nodeSize / 2;

                          return (
                            <g key={node.id} style={{ transition: 'opacity 0.3s ease' }} opacity={opacity}
                              filter={isActive ? 'url(#node-glow)' : 'url(#node-shadow)'}>
                              {/* Pulse ring */}
                              {isActive && (
                                <circle cx={cx} cy={cy} r={r + 8}
                                  fill="none" stroke={color} strokeWidth={2}
                                  opacity={0.4}
                                  style={{ animation: 'pulse 1.2s ease-in-out infinite' }}
                                />
                              )}
                              {/* Background circle */}
                              <circle cx={cx} cy={cy} r={r}
                                fill={color}
                                stroke={isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}
                                strokeWidth={isActive ? 2.5 : 1}
                                style={{ transition: 'fill 0.3s ease, stroke 0.3s ease' }}
                              />
                              {/* Label */}
                              <text x={cx} y={cy - (displayVal !== null ? 3.5 : 0)} textAnchor="middle" dominantBaseline="central"
                                fill="#fff" fontSize={nodeSize > 40 ? 9 : 7} fontWeight={700}
                                fontFamily="'JetBrains Mono', monospace"
                                style={{ userSelect: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                {node.label}
                              </text>
                              {/* Value */}
                              {displayVal !== null && (
                                <text x={cx} y={cy + (nodeSize > 40 ? 11 : 9)} textAnchor="middle" dominantBaseline="central"
                                  fill="#fff" fontSize={nodeSize > 40 ? 11 : 8.5} fontWeight={800}
                                  fontFamily="'JetBrains Mono', monospace"
                                  style={{ userSelect: 'none' }}>
                                  = {displayVal}
                                </text>
                              )}
                              {/* Depth indicator */}
                              {isActive && (
                                <text x={cx + r + 6} y={cy - r + 4} textAnchor="start" dominantBaseline="central"
                                  fill="var(--color-primary)" fontSize={8} fontWeight={600} opacity={0.6}
                                  fontFamily="'JetBrains Mono', monospace">
                                  d={node.depth}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar: Call Stack + Code */}
                <div className="space-y-4">

                  {/* Call Stack */}
                  <div className="section-card p-4">
                    <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                      <Layers size={13} className="text-primary" /> Call Stack
                      {callStack.length > 0 && (
                        <span className="ml-auto text-[9px] font-mono opacity-30 px-1.5 py-0.5 rounded-full bg-base-200/60">
                          {callStack.filter(f => f.status === 'waiting').length} frames
                        </span>
                      )}
                    </h4>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
                      {callStack.length === 0 && (
                        <p className="text-[11px] opacity-30 text-center py-4">Stack is empty</p>
                      )}
                      {[...callStack].reverse().map((frame, i) => (
                        <motion.div
                          key={`${frame.nodeId}-${i}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono"
                          style={{
                            borderColor: frame.status === 'resolved'
                              ? 'color-mix(in oklch, #22c55e 30%, transparent)'
                              : i === 0
                                ? 'color-mix(in oklch, var(--color-primary) 30%, transparent)'
                                : 'color-mix(in oklch, var(--color-base-content) 10%, transparent)',
                            backgroundColor: frame.status === 'resolved'
                              ? 'color-mix(in oklch, #22c55e 6%, transparent)'
                              : i === 0
                                ? 'color-mix(in oklch, var(--color-primary) 6%, transparent)'
                                : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[8px] opacity-25 font-bold shrink-0 w-3 text-right">{callStack.length - i}</span>
                            <span className="font-semibold truncate">{frame.label}</span>
                          </div>
                          {frame.status === 'resolved' && (
                            <span className="text-[10px] font-bold shrink-0 ml-1" style={{ color: '#22c55e' }}>→ {frame.value}</span>
                          )}
                          {frame.status === 'waiting' && i === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0 ml-1" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Live Code Highlight */}
                  <div className="section-card p-4">
                    <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                      <Code2 size={13} className="text-primary" /> Code Execution
                    </h4>
                    <div className="rounded-lg bg-neutral p-3 space-y-0 overflow-x-auto">
                      {info.codeLines.map((line, i) => {
                        const isHighlighted = currentStep && currentStep.codeLine === i;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 font-mono text-[10px] leading-[1.7] transition-all duration-200"
                            style={{
                              backgroundColor: isHighlighted ? 'rgba(59,130,246,0.15)' : 'transparent',
                              borderLeft: isHighlighted ? '2px solid #3b82f6' : '2px solid transparent',
                              paddingLeft: 6,
                              borderRadius: isHighlighted ? '0 4px 4px 0' : 0,
                            }}
                          >
                            <span className="w-3 text-right opacity-20 shrink-0 text-neutral-content select-none">{i + 1}</span>
                            <span className={`whitespace-pre ${isHighlighted ? 'text-blue-300 font-semibold' : 'text-neutral-content opacity-70'}`}>
                              {line.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Detail */}
                  <div className="section-card p-4">
                    <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                      <GitBranch size={13} className="text-primary" /> Step Detail
                    </h4>
                    {currentStep ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-sm text-white"
                            style={{ backgroundColor: phaseBadge(currentStep.type).bg }}>
                            {phaseBadge(currentStep.type).icon} {phaseBadge(currentStep.type).label}
                          </span>
                          <span className="text-[10px] opacity-30 font-mono">Step {stepNo + 1}</span>
                        </div>
                        <p className="text-[11px] opacity-60 leading-relaxed">{currentStep.detail}</p>
                        {currentStep.value !== undefined && (
                          <div className="flex items-center gap-2 pt-0.5 border-t border-base-300/20">
                            <span className="text-[10px] opacity-40">Result:</span>
                            <span className="text-sm font-bold font-mono text-primary">{currentStep.value}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] opacity-30 text-center py-6">Press Start to begin</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Execution Timeline */}
              {executionHistory.length > 0 && (
                <div className="section-card p-4">
                  <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                    <Clock size={13} className="text-primary" /> Execution Timeline
                    <span className="ml-auto text-[9px] font-mono opacity-30">{executionHistory.length} steps</span>
                  </h4>
                  <div className="flex gap-1 flex-wrap max-h-[80px] overflow-y-auto scrollbar-thin">
                    {executionHistory.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setStepNo(i); setDone(false); if (playing) { clearInterval(timerRef.current); timerRef.current = null; setPlaying(false); } }}
                        className="group relative flex items-center justify-center rounded-md transition-all duration-100"
                        style={{
                          width: 24, height: 24,
                          backgroundColor: i === stepNo ? phaseBadge(s.type).bg : 'color-mix(in oklch, var(--color-base-content) 6%, transparent)',
                          border: i === stepNo ? '2px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                        }}
                        title={`Step ${i + 1}: ${s.detail}`}
                      >
                        <span className="text-[7px] font-bold font-mono"
                          style={{ color: i === stepNo ? '#fff' : 'color-mix(in oklch, var(--color-base-content) 40%, transparent)' }}>
                          {i + 1}
                        </span>
                      </button>
                    ))}
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{info.name}</h3>
                    <p className="text-xs opacity-50 mt-1 leading-relaxed">{info.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(info.complexity).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center p-3 rounded-lg bg-base-200/50 border border-base-300/30">
                      <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-sm font-bold font-mono mt-0.5" style={{ color: cxColors[key] }}>
                        {val}
                      </span>
                    </div>
                  ))}
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

              {/* Code */}
              <div className="section-card p-5">
                <button onClick={() => setShowCode(!showCode)}
                  className="w-full flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Code2 size={13} className="text-primary" /> Source Code
                  </span>
                  <ChevronRight size={14}
                    className={`transition-transform duration-200 opacity-40 ${showCode ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <pre className="mt-3 p-4 rounded-xl bg-neutral text-neutral-content font-mono text-[11px] leading-relaxed overflow-x-auto">
                        {info.code}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Key Insights */}
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-primary" /> Key Insights
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

              {/* Recursion vs Iteration */}
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3">
                  <Info size={13} className="text-primary" /> Recursion vs Iteration
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-base-200/30">
                        {['Aspect', 'Recursion', 'Iteration'].map(h => (
                          <th key={h} className="px-3 py-2 text-center font-bold first:text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { aspect: 'Code Clarity', rec: 'Often more elegant', iter: 'Can be verbose' },
                        { aspect: 'Memory', rec: 'Uses call stack', iter: 'Uses variables' },
                        { aspect: 'Stack Overflow', rec: 'Possible with deep recursion', iter: 'Not a concern' },
                        { aspect: 'Performance', rec: 'Function call overhead', iter: 'Generally faster' },
                        { aspect: 'Best For', rec: 'Trees, graphs, D&C', iter: 'Simple loops, counting' },
                      ].map(({ aspect, rec, iter }, i) => (
                        <tr key={i} className="border-t border-base-300/20">
                          <td className="px-3 py-2 font-semibold">{aspect}</td>
                          <td className="px-3 py-2 text-center opacity-60" style={{ color: '#8b5cf6' }}>{rec}</td>
                          <td className="px-3 py-2 text-center opacity-60" style={{ color: '#3b82f6' }}>{iter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── COMPARE ────────────────────────────────────────── */}
          {tab === 'compare' && (
            <motion.div key="cmp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="section-card overflow-hidden">
                <div className="p-4 border-b border-base-300/30">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-primary" /> Function Comparison
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-base-200/30">
                        {['Function', 'Time', 'Space', 'Call Pattern', 'Branching', 'Optimization'].map((h) => (
                          <th key={h} className="px-4 py-3 text-center font-bold first:text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(FUNCTIONS).map(([key, f]) => (
                        <tr key={key}
                          className={`border-t border-base-300/20 transition-colors ${
                            funcKey === key ? 'bg-primary/[0.04]' : 'hover:bg-primary/[0.02]'
                          }`}>
                          <td className="px-4 py-3 font-semibold">
                            <span className="inline-flex items-center gap-2">
                              <span>{f.icon}</span> {f.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.time }}>{f.complexity.time}</td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.space }}>{f.complexity.space}</td>
                          <td className="px-4 py-3 text-center font-mono" style={{ color: cxColors.calls }}>{f.complexity.calls}</td>
                          <td className="px-4 py-3 text-center">
                            {key === 'fibonacci'
                              ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>Binary (2)</span>
                              : <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>Single (1)</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-[10px] opacity-50">
                            {key === 'fibonacci' ? 'Memoization / DP' :
                             key === 'factorial' ? 'Tail Recursion' :
                             key === 'power' ? 'Already Optimal' : 'Tail Recursion'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual complexity comparison */}
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-4">
                  <TrendingUp size={13} className="text-primary" /> Call Count for n=5
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Fibonacci', calls: 15, max: 15, color: '#ef4444' },
                    { name: 'Factorial', calls: 5, max: 15, color: '#3b82f6' },
                    { name: 'Power (2^5)', calls: 4, max: 15, color: '#f59e0b' },
                    { name: 'Sum [1..5]', calls: 6, max: 15, color: '#8b5cf6' },
                  ].map(({ name, calls, max, color }) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{name}</span>
                        <span className="text-[11px] font-mono font-bold" style={{ color }}>{calls} calls</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-base-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(calls / max) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
