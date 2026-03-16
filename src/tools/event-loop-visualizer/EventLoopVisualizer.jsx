import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Play, Pause, RotateCcw, SkipForward, SkipBack,
  BookOpen, Zap, Gauge, ChevronRight, Info,
  Code2, Layers, ArrowUpDown, RefreshCw, Timer, Inbox, CircleDot,
  Volume2, VolumeX, Clock, Hash, Activity, Footprints, FastForward,
} from 'lucide-react';
import SEO from '../../components/SEO';

// ── Colors ───────────────────────────────────────────────────────────
const COLORS = {
  callStack:  '#3b82f6',
  webApi:     '#f59e0b',
  taskQueue:  '#ef4444',
  microTask:  '#8b5cf6',
  console:    '#22c55e',
  eventLoop:  '#ec4899',
  idle:       '#6b7280',
};

// ── Sound ────────────────────────────────────────────────────────────
const audioCtxRef = { current: null };
function playTone(freq, dur = 0.06, type = 'sine') {
  try {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || /** @type {typeof AudioContext} */ (window).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = 0.035;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch { /* silent */ }
}
function playSoundForPhase(phase) {
  switch (phase) {
    case 'Call Stack': playTone(400, 0.05); break;
    case 'Web API': playTone(500, 0.06, 'triangle'); break;
    case 'Task Queue': playTone(300, 0.07); break;
    case 'Microtask Queue': playTone(600, 0.06); break;
    case 'Console': playTone(700, 0.08, 'triangle'); break;
    case 'Event Loop': playTone(450, 0.1, 'sine'); break;
    default: break;
  }
}

// ── Predefined code examples ─────────────────────────────────────────
const EXAMPLES = {
  basic: {
    name: 'setTimeout Basic',
    icon: '⏱️',
    desc: 'Shows how setTimeout defers execution, even with 0ms delay. Demonstrates that synchronous code always runs before asynchronous callbacks.',
    code: `console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout");\n}, 0);\n\nconsole.log("End");`,
    codeLines: [
      { text: 'console.log("Start");', line: 1 },
      { text: '', line: 2 },
      { text: 'setTimeout(() => {', line: 3 },
      { text: '  console.log("Timeout");', line: 4 },
      { text: '}, 0);', line: 5 },
      { text: '', line: 6 },
      { text: 'console.log("End");', line: 7 },
    ],
    expectedOutput: ['Start', 'End', 'Timeout'],
    steps: [
      { phase: 'Call Stack', action: 'push', item: 'script()', detail: 'Main script begins execution', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: -1 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Start")', detail: 'Push console.log("Start") onto the call stack', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: 0 },
      { phase: 'Console', action: 'log', item: 'Start', detail: 'Execute: logs "Start" to console', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Start")', detail: 'console.log completes, popped off stack', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'push', item: 'setTimeout(cb, 0)', detail: 'Push setTimeout onto the call stack', callStack: ['script()', 'setTimeout(cb, 0)'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Web API', action: 'register', item: 'Timer (0ms)', detail: 'setTimeout registers a timer in Web APIs — even 0ms timers must go through the queue', callStack: ['script()'], webApis: ['Timer (0ms)'], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Task Queue', action: 'enqueue', item: 'cb: log("Timeout")', detail: 'Timer fires instantly (0ms) — callback moves to the Task Queue', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("End")', detail: 'Push console.log("End") onto the call stack', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 6 },
      { phase: 'Console', action: 'log', item: 'End', detail: 'Execute: logs "End" to console', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 6 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("End")', detail: 'console.log completes, popped off stack', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 6 },
      { phase: 'Call Stack', action: 'pop', item: 'script()', detail: 'Main script finishes — stack is now empty', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'cb: log("Timeout")', detail: '🔄 Event Loop checks: stack empty + task queue has items → dequeues callback', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 3 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Timeout")', detail: 'Inside callback: push console.log("Timeout")', callStack: ['cb: log("Timeout")', 'console.log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 3 },
      { phase: 'Console', action: 'log', item: 'Timeout', detail: 'Execute: logs "Timeout" to console', callStack: ['cb: log("Timeout")', 'console.log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Timeout'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Timeout")', detail: 'console.log completes', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Timeout'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'cb: log("Timeout")', detail: 'Callback completes — all done! ✅', callStack: [], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Timeout'], codeLine: -1 },
    ],
  },
  promises: {
    name: 'Promises vs setTimeout',
    icon: '🤝',
    desc: 'Microtasks (Promises) have higher priority than macrotasks (setTimeout). Promise callbacks run before any pending setTimeout callbacks.',
    code: `console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("Promise");\n});\n\nconsole.log("End");`,
    codeLines: [
      { text: 'console.log("Start");', line: 1 },
      { text: '', line: 2 },
      { text: 'setTimeout(() => {', line: 3 },
      { text: '  console.log("Timeout");', line: 4 },
      { text: '}, 0);', line: 5 },
      { text: '', line: 6 },
      { text: 'Promise.resolve().then(() => {', line: 7 },
      { text: '  console.log("Promise");', line: 8 },
      { text: '});', line: 9 },
      { text: '', line: 10 },
      { text: 'console.log("End");', line: 11 },
    ],
    expectedOutput: ['Start', 'End', 'Promise', 'Timeout'],
    steps: [
      { phase: 'Call Stack', action: 'push', item: 'script()', detail: 'Main script begins execution', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: -1 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Start")', detail: 'Push console.log("Start")', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: 0 },
      { phase: 'Console', action: 'log', item: 'Start', detail: 'Logs "Start"', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Start")', detail: 'Popped off stack', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'push', item: 'setTimeout(cb, 0)', detail: 'Push setTimeout', callStack: ['script()', 'setTimeout(cb, 0)'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Web API', action: 'register', item: 'Timer (0ms)', detail: 'Register timer in Web APIs', callStack: ['script()'], webApis: ['Timer (0ms)'], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Task Queue', action: 'enqueue', item: 'cb: log("Timeout")', detail: 'Timer fires → callback goes to Task Queue (macrotask)', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Call Stack', action: 'push', item: 'Promise.resolve().then(cb)', detail: 'Push Promise.resolve().then()', callStack: ['script()', 'Promise.resolve().then(cb)'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 6 },
      { phase: 'Microtask Queue', action: 'enqueue', item: 'cb: log("Promise")', detail: 'Promise resolves immediately → callback goes to Microtask Queue', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['cb: log("Promise")'], consoleOutput: ['Start'], codeLine: 6 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("End")', detail: 'Push console.log("End")', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['cb: log("Promise")'], consoleOutput: ['Start'], codeLine: 10 },
      { phase: 'Console', action: 'log', item: 'End', detail: 'Logs "End"', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['cb: log("Promise")'], consoleOutput: ['Start', 'End'], codeLine: 10 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("End")', detail: 'Popped off stack', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['cb: log("Promise")'], consoleOutput: ['Start', 'End'], codeLine: 10 },
      { phase: 'Call Stack', action: 'pop', item: 'script()', detail: 'Main script finishes — stack empty', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['cb: log("Promise")'], consoleOutput: ['Start', 'End'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'Microtask Queue', detail: '🔄 Event Loop: Microtasks have PRIORITY over macrotasks — process microtask queue first', callStack: ['cb: log("Promise")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 7 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Promise")', detail: 'Inside Promise callback: push console.log', callStack: ['cb: log("Promise")', 'console.log("Promise")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 7 },
      { phase: 'Console', action: 'log', item: 'Promise', detail: 'Logs "Promise"', callStack: ['cb: log("Promise")', 'console.log("Promise")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise'], codeLine: 7 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Promise")', detail: 'Popped', callStack: ['cb: log("Promise")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise'], codeLine: 7 },
      { phase: 'Call Stack', action: 'pop', item: 'cb: log("Promise")', detail: 'Promise callback completes', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'Task Queue', detail: '🔄 Event Loop: Microtask queue empty → process next macrotask', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise'], codeLine: 3 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Timeout")', detail: 'Inside setTimeout callback', callStack: ['cb: log("Timeout")', 'console.log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise'], codeLine: 3 },
      { phase: 'Console', action: 'log', item: 'Timeout', detail: 'Logs "Timeout"', callStack: ['cb: log("Timeout")', 'console.log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise', 'Timeout'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Timeout")', detail: 'Popped', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise', 'Timeout'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'cb: log("Timeout")', detail: 'All done! ✅', callStack: [], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise', 'Timeout'], codeLine: -1 },
    ],
  },
  mixed: {
    name: 'Nested Microtasks',
    icon: '🪆',
    desc: 'Microtasks queued inside microtasks are processed in the same cycle — before any macrotask.',
    code: `console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout");\n}, 0);\n\nPromise.resolve()\n  .then(() => {\n    console.log("Promise 1");\n    return Promise.resolve();\n  })\n  .then(() => {\n    console.log("Promise 2");\n  });\n\nconsole.log("End");`,
    codeLines: [
      { text: 'console.log("Start");', line: 1 },
      { text: '', line: 2 },
      { text: 'setTimeout(() => {', line: 3 },
      { text: '  console.log("Timeout");', line: 4 },
      { text: '}, 0);', line: 5 },
      { text: '', line: 6 },
      { text: 'Promise.resolve()', line: 7 },
      { text: '  .then(() => {', line: 8 },
      { text: '    console.log("Promise 1");', line: 9 },
      { text: '    return Promise.resolve();', line: 10 },
      { text: '  })', line: 11 },
      { text: '  .then(() => {', line: 12 },
      { text: '    console.log("Promise 2");', line: 13 },
      { text: '  });', line: 14 },
      { text: '', line: 15 },
      { text: 'console.log("End");', line: 16 },
    ],
    expectedOutput: ['Start', 'End', 'Promise 1', 'Promise 2', 'Timeout'],
    steps: [
      { phase: 'Call Stack', action: 'push', item: 'script()', detail: 'Main script begins', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: -1 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Start")', detail: 'Push log("Start")', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: 0 },
      { phase: 'Console', action: 'log', item: 'Start', detail: 'Logs "Start"', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Start")', detail: 'Popped', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'push', item: 'setTimeout(cb, 0)', detail: 'Push setTimeout', callStack: ['script()', 'setTimeout(cb, 0)'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Task Queue', action: 'enqueue', item: 'cb: log("Timeout")', detail: 'Timer fires immediately → macrotask queue', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 2 },
      { phase: 'Call Stack', action: 'push', item: 'Promise.resolve().then(…)', detail: 'Push Promise chain setup', callStack: ['script()', 'Promise.resolve().then(…)'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 6 },
      { phase: 'Microtask Queue', action: 'enqueue', item: 'then: log("Promise 1")', detail: 'First .then() callback → microtask queue', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 1")'], consoleOutput: ['Start'], codeLine: 7 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("End")', detail: 'Push log("End")', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 1")'], consoleOutput: ['Start'], codeLine: 15 },
      { phase: 'Console', action: 'log', item: 'End', detail: 'Logs "End"', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 1")'], consoleOutput: ['Start', 'End'], codeLine: 15 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("End")', detail: 'Popped', callStack: ['script()'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 1")'], consoleOutput: ['Start', 'End'], codeLine: 15 },
      { phase: 'Call Stack', action: 'pop', item: 'script()', detail: 'Script finishes — stack empty', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 1")'], consoleOutput: ['Start', 'End'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'Microtask Queue', detail: '🔄 Process microtask queue first', callStack: ['then: log("Promise 1")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End'], codeLine: 8 },
      { phase: 'Console', action: 'log', item: 'Promise 1', detail: 'Logs "Promise 1" — and returns a new Promise, scheduling next .then()', callStack: ['then: log("Promise 1")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1'], codeLine: 8 },
      { phase: 'Microtask Queue', action: 'enqueue', item: 'then: log("Promise 2")', detail: 'New .then() callback queued — microtask queue not empty yet!', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: ['then: log("Promise 2")'], consoleOutput: ['Start', 'End', 'Promise 1'], codeLine: 9 },
      { phase: 'Event Loop', action: 'tick', item: 'Microtask Queue', detail: '🔄 Still draining microtask queue — process next microtask before any macrotask', callStack: ['then: log("Promise 2")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1'], codeLine: 12 },
      { phase: 'Console', action: 'log', item: 'Promise 2', detail: 'Logs "Promise 2"', callStack: ['then: log("Promise 2")'], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1', 'Promise 2'], codeLine: 12 },
      { phase: 'Call Stack', action: 'pop', item: 'then: log("Promise 2")', detail: 'Microtask queue now empty', callStack: [], webApis: [], taskQueue: ['cb: log("Timeout")'], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1', 'Promise 2'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'Task Queue', detail: '🔄 Microtasks done → process macrotask', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1', 'Promise 2'], codeLine: 3 },
      { phase: 'Console', action: 'log', item: 'Timeout', detail: 'Logs "Timeout"', callStack: ['cb: log("Timeout")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1', 'Promise 2', 'Timeout'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'cb: log("Timeout")', detail: 'All done! ✅', callStack: [], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'End', 'Promise 1', 'Promise 2', 'Timeout'], codeLine: -1 },
    ],
  },
  async_await: {
    name: 'Async/Await',
    icon: '⏳',
    desc: 'Async/await is syntactic sugar over Promises. "await" pauses the function and schedules the rest as a microtask.',
    code: `console.log("Start");\n\nasync function greet() {\n  console.log("Before await");\n  await Promise.resolve();\n  console.log("After await");\n}\n\ngreet();\nconsole.log("End");`,
    codeLines: [
      { text: 'console.log("Start");', line: 1 },
      { text: '', line: 2 },
      { text: 'async function greet() {', line: 3 },
      { text: '  console.log("Before await");', line: 4 },
      { text: '  await Promise.resolve();', line: 5 },
      { text: '  console.log("After await");', line: 6 },
      { text: '}', line: 7 },
      { text: '', line: 8 },
      { text: 'greet();', line: 9 },
      { text: 'console.log("End");', line: 10 },
    ],
    expectedOutput: ['Start', 'Before await', 'End', 'After await'],
    steps: [
      { phase: 'Call Stack', action: 'push', item: 'script()', detail: 'Main script begins', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: -1 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Start")', detail: 'Push log("Start")', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [], codeLine: 0 },
      { phase: 'Console', action: 'log', item: 'Start', detail: 'Logs "Start"', callStack: ['script()', 'console.log("Start")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Start")', detail: 'Popped', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 0 },
      { phase: 'Call Stack', action: 'push', item: 'greet()', detail: 'Push async function greet()', callStack: ['script()', 'greet()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 8 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("Before await")', detail: 'Synchronous code inside greet runs normally', callStack: ['script()', 'greet()', 'console.log("Before await")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start'], codeLine: 3 },
      { phase: 'Console', action: 'log', item: 'Before await', detail: 'Logs "Before await"', callStack: ['script()', 'greet()', 'console.log("Before await")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await'], codeLine: 3 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("Before await")', detail: 'Popped', callStack: ['script()', 'greet()'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await'], codeLine: 3 },
      { phase: 'Microtask Queue', action: 'enqueue', item: 'greet: after await', detail: '⏸️ "await" pauses greet() — schedules the rest as a microtask and returns control', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: ['greet: after await'], consoleOutput: ['Start', 'Before await'], codeLine: 4 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("End")', detail: 'Execution continues after greet() call', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: [], microTaskQueue: ['greet: after await'], consoleOutput: ['Start', 'Before await'], codeLine: 9 },
      { phase: 'Console', action: 'log', item: 'End', detail: 'Logs "End"', callStack: ['script()', 'console.log("End")'], webApis: [], taskQueue: [], microTaskQueue: ['greet: after await'], consoleOutput: ['Start', 'Before await', 'End'], codeLine: 9 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("End")', detail: 'Popped', callStack: ['script()'], webApis: [], taskQueue: [], microTaskQueue: ['greet: after await'], consoleOutput: ['Start', 'Before await', 'End'], codeLine: 9 },
      { phase: 'Call Stack', action: 'pop', item: 'script()', detail: 'Script finishes — stack empty', callStack: [], webApis: [], taskQueue: [], microTaskQueue: ['greet: after await'], consoleOutput: ['Start', 'Before await', 'End'], codeLine: -1 },
      { phase: 'Event Loop', action: 'tick', item: 'Microtask Queue', detail: '🔄 Event Loop: process microtask — resume greet() after await', callStack: ['greet: after await'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await', 'End'], codeLine: 5 },
      { phase: 'Call Stack', action: 'push', item: 'console.log("After await")', detail: 'Continue executing greet() after the await', callStack: ['greet: after await', 'console.log("After await")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await', 'End'], codeLine: 5 },
      { phase: 'Console', action: 'log', item: 'After await', detail: 'Logs "After await"', callStack: ['greet: after await', 'console.log("After await")'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await', 'End', 'After await'], codeLine: 5 },
      { phase: 'Call Stack', action: 'pop', item: 'console.log("After await")', detail: 'Popped', callStack: ['greet: after await'], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await', 'End', 'After await'], codeLine: 5 },
      { phase: 'Call Stack', action: 'pop', item: 'greet: after await', detail: 'greet() fully completes. All done! ✅', callStack: [], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: ['Start', 'Before await', 'End', 'After await'], codeLine: -1 },
    ],
  },
};

function phaseBadge(phase) {
  switch (phase) {
    case 'Call Stack':      return { bg: COLORS.callStack, label: 'Call Stack', icon: '📦' };
    case 'Web API':         return { bg: COLORS.webApi,    label: 'Web API',    icon: '🌐' };
    case 'Task Queue':      return { bg: COLORS.taskQueue, label: 'Task Queue', icon: '📋' };
    case 'Microtask Queue': return { bg: COLORS.microTask, label: 'Microtask',  icon: '⚡' };
    case 'Console':         return { bg: COLORS.console,   label: 'Console',    icon: '💻' };
    case 'Event Loop':      return { bg: COLORS.eventLoop, label: 'Event Loop', icon: '🔄' };
    default:                return { bg: COLORS.idle,      label: phase,        icon: '⏸️' };
  }
}

function QueueCard({ title, icon: Icon, color, items, highlight, emptyText, badge }) {
  return (
    <div className="section-card p-4 flex flex-col" style={{ borderTop: `2px solid ${color}25` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold block leading-tight">{title}</span>
          {badge && <span className="text-[8px] opacity-30 font-mono">{badge}</span>}
        </div>
        {items.length > 0 && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '15', color }}>{items.length}</span>
        )}
      </div>
      <div className="flex-1 min-h-[56px] space-y-1.5">
        {items.length === 0 && (
          <div className="flex items-center justify-center h-[56px]">
            <p className="text-[10px] opacity-20 text-center">{emptyText}</p>
          </div>
        )}
        <AnimatePresence>
          {items.map((item, i) => {
            const isHighlight = highlight === item;
            return (
              <motion.div key={`${item}-${i}`}
                initial={{ opacity: 0, scale: 0.9, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="px-2.5 py-2 rounded-lg text-[10px] font-mono font-semibold border relative overflow-hidden"
                style={{
                  borderColor: isHighlight ? color : 'color-mix(in oklch, var(--color-base-content) 8%, transparent)',
                  backgroundColor: isHighlight ? color + '10' : 'color-mix(in oklch, var(--color-base-200) 50%, transparent)',
                  color: isHighlight ? color : undefined,
                  boxShadow: isHighlight ? `0 0 12px ${color}20` : 'none',
                }}>
                {isHighlight && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: color }} />}
                <span className="pl-1">{item}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EventLoopVisualizer() {
  const [example, setExample] = useState('basic');
  const [speed, setSpeed] = useState(50);
  const [tab, setTab] = useState('visualize');
  const [playing, setPlaying] = useState(false);
  const [stepNo, setStepNo] = useState(-1);
  const [done, setDone] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [sound, setSound] = useState(false);
  const [mode, setMode] = useState('auto'); // 'auto' or 'step'
  const timerRef = useRef(null);

  const info = EXAMPLES[example];
  const steps = info.steps;
  const totalSteps = steps.length;
  const currentStep = stepNo >= 0 && stepNo < totalSteps ? steps[stepNo] : null;

  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setStepNo(-1); setPlaying(false); setDone(false);
  }, []);

  useEffect(() => { reset(); }, [example, reset]);

  const tick = useCallback(() => {
    setStepNo(prev => {
      const next = prev + 1;
      if (next >= totalSteps) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setPlaying(false); setDone(true);
        return totalSteps - 1;
      }
      return next;
    });
  }, [totalSteps]);

  const startTimer = useCallback((spd) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, Math.max(200, 1800 - spd * 15));
  }, [tick]);

  const togglePlay = useCallback(() => {
    if (done) return;
    if (playing) { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setPlaying(false); return; }
    setPlaying(true); startTimer(speed);
  }, [playing, done, speed, startTimer]);

  const forward = useCallback(() => {
    if (done) return;
    setStepNo(prev => { const next = prev + 1; if (next >= totalSteps) { setDone(true); return totalSteps - 1; } return next; });
  }, [done, totalSteps]);

  const backward = useCallback(() => {
    if (stepNo <= 0) return;
    setDone(false); setStepNo(prev => Math.max(-1, prev - 1));
  }, [stepNo]);

  useEffect(() => { if (sound && currentStep) playSoundForPhase(currentStep.phase); }, [stepNo, sound, currentStep]);
  useEffect(() => { if (playing) startTimer(speed); }, [speed, playing, startTimer]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const state = useMemo(() => {
    if (!currentStep) return { callStack: [], webApis: [], taskQueue: [], microTaskQueue: [], consoleOutput: [] };
    return { callStack: currentStep.callStack, webApis: currentStep.webApis, taskQueue: currentStep.taskQueue, microTaskQueue: currentStep.microTaskQueue, consoleOutput: currentStep.consoleOutput };
  }, [currentStep]);

  const stats = useMemo(() => {
    if (stepNo < 0) return { pushes: 0, pops: 0, logs: 0, ticks: 0 };
    let pushes = 0, pops = 0, logs = 0, ticks = 0;
    for (let i = 0; i <= stepNo; i++) { const s = steps[i]; if (s.action === 'push') pushes++; else if (s.action === 'pop') pops++; else if (s.action === 'log') logs++; else if (s.action === 'tick') ticks++; }
    return { pushes, pops, logs, ticks };
  }, [stepNo, steps]);

  const executionHistory = useMemo(() => stepNo < 0 ? [] : steps.slice(0, stepNo + 1), [stepNo, steps]);

  const TABS = [
    { id: 'visualize', label: 'Visualize', Icon: RefreshCw },
    { id: 'learn', label: 'Learn', Icon: BookOpen },
    { id: 'compare', label: 'Compare', Icon: ArrowUpDown },
  ];

  return (
    <>
      <SEO title="JS Event Loop Visualizer | Developer Toolbox" description="Interactive JavaScript Event Loop visualizer" keywords="javascript, event loop, call stack, microtask, promise, setTimeout, async, learning" />
      <div className="max-w-[1200px] mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm"><GraduationCap size={22} /></div>
            <div><h1 className="text-xl font-bold">JS Event Loop Visualizer</h1><p className="text-xs opacity-50 mt-0.5">See how JavaScript executes async code step-by-step</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSound(!sound)} className={`btn btn-sm btn-ghost gap-1.5 ${sound ? 'text-primary' : ''}`}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
            <button onClick={reset} className="btn btn-sm btn-primary gap-1.5" disabled={playing}><RotateCcw size={14} /> Reset</button>
          </div>
        </motion.div>

        {/* Example Selector */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(EXAMPLES).map(([key, ex]) => (
            <button key={key} onClick={() => !playing && setExample(key)} disabled={playing}
              className={`section-card p-4 text-left transition-all duration-200 ${playing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${example === key ? 'border-primary/40 shadow-sm' : ''}`}>
              <div className="flex items-center gap-2.5 mb-2"><span className="text-lg">{ex.icon}</span><span className={`text-[13px] font-bold ${example === key ? 'text-primary' : ''}`}>{ex.name}</span></div>
              <p className="text-[10px] opacity-40 leading-relaxed line-clamp-2">{ex.desc}</p>
            </button>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5"><label className="text-[11px] font-semibold opacity-50 flex items-center gap-1"><Gauge size={10} /> Speed</label><span className="text-[13px] font-mono font-bold text-secondary">{speed}%</span></div>
              <input type="range" min={1} max={100} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="range range-secondary range-xs w-full" />
              <div className="flex justify-between text-[9px] opacity-25 mt-0.5 px-0.5"><span>Slow</span><span>Medium</span><span>Fast</span></div>
            </div>
            <div>
              <label className="text-[11px] font-semibold opacity-50 block mb-1.5">Expected Output</label>
              <div className="flex flex-wrap gap-1.5">
                {info.expectedOutput.map((val, i) => {
                  const isLogged = state.consoleOutput.includes(val) && state.consoleOutput.indexOf(val) <= i;
                  return (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-mono font-semibold transition-all duration-200" style={{ backgroundColor: isLogged ? 'color-mix(in oklch, #22c55e 8%, transparent)' : 'color-mix(in oklch, var(--color-base-200) 60%, transparent)', borderColor: isLogged ? 'color-mix(in oklch, #22c55e 25%, transparent)' : 'color-mix(in oklch, var(--color-base-content) 8%, transparent)', color: isLogged ? '#22c55e' : undefined }}>
                      <span className="opacity-40 mr-1">{i + 1}.</span> {val}{isLogged && <span className="ml-1">✓</span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold opacity-50 block mb-1.5">Live Stats</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Push', val: stats.pushes, color: COLORS.callStack, Icon: Hash },
                  { label: 'Pop', val: stats.pops, color: COLORS.taskQueue, Icon: Activity },
                  { label: 'Logs', val: stats.logs, color: COLORS.console, Icon: Code2 },
                  { label: 'Ticks', val: stats.ticks, color: COLORS.eventLoop, Icon: RefreshCw },
                ].map(({ label, val, color, Icon }) => (
                  <div key={label} className="flex flex-col items-center p-1.5 rounded-lg bg-base-200/50 border border-base-300/30">
                    <Icon size={9} className="opacity-30 mb-0.5" /><span className="text-[8px] opacity-40 font-semibold uppercase">{label}</span><span className="text-[11px] font-bold font-mono" style={{ color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Mode Toggle + Controls */}
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
                      <button className="btn btn-sm gap-1.5 min-w-[120px] pointer-events-none" style={{ backgroundColor: '#22c55e', color: '#fff', borderColor: '#22c55e' }}>✓ Complete!</button>
                    ) : playing ? (
                      <button onClick={togglePlay} className="btn btn-sm gap-1.5 min-w-[120px]" style={{ backgroundColor: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }}><Pause size={14} /> Pause</button>
                    ) : (
                      <button onClick={togglePlay} className="btn btn-sm btn-primary gap-1.5 min-w-[120px]"><Play size={14} /> {stepNo > 0 ? 'Resume' : 'Start'}</button>
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
                <button onClick={reset} className="btn btn-sm btn-ghost gap-1.5" disabled={playing}><RotateCcw size={14} /> Reset</button>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                {stepNo >= 0 && <span className="font-mono opacity-40">Step {stepNo + 1}/{totalSteps}</span>}
                {currentStep && <span className="badge badge-sm text-white" style={{ backgroundColor: phaseBadge(currentStep.phase).bg }}>{phaseBadge(currentStep.phase).icon} {phaseBadge(currentStep.phase).label}</span>}
              </div>
            </div>
          </div>
          {stepNo >= 0 && (
            <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: done ? '#22c55e' : 'var(--color-primary)' }} initial={false} animate={{ width: `${((stepNo + 1) / totalSteps) * 100}%` }} transition={{ duration: 0.1, ease: 'easeOut' }} />
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="tabs tabs-box tabs-sm">
            {TABS.map(({ id, label, Icon }) => (<button key={id} className={`tab gap-1.5 ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}><Icon size={13} /> {label}</button>))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'visualize' && (
            <motion.div key="vis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="section-card px-5 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {[{ c: COLORS.callStack, l: 'Call Stack' }, { c: COLORS.webApi, l: 'Web APIs' }, { c: COLORS.microTask, l: 'Microtask Queue' }, { c: COLORS.taskQueue, l: 'Task Queue' }, { c: COLORS.eventLoop, l: 'Event Loop' }, { c: COLORS.console, l: 'Console' }].map(({ c, l }) => (
                    <div key={l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}44` }} /><span className="text-[10px] opacity-50 font-medium">{l}</span></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="section-card p-4">
                    <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><Code2 size={13} className="text-primary" /> Source Code</h4>
                    <div className="rounded-lg bg-neutral p-3 space-y-0 overflow-x-auto">
                      {info.codeLines.map((line, i) => {
                        const isHighlighted = currentStep && currentStep.codeLine === i;
                        return (
                          <div key={i} className="flex items-center gap-2 font-mono text-[10px] leading-[1.7] transition-all duration-200" style={{ backgroundColor: isHighlighted ? 'rgba(59,130,246,0.15)' : 'transparent', borderLeft: isHighlighted ? '2px solid #3b82f6' : '2px solid transparent', paddingLeft: 6, borderRadius: isHighlighted ? '0 4px 4px 0' : 0, minHeight: line.text ? undefined : '0.5em' }}>
                            <span className="w-3 text-right opacity-20 shrink-0 text-neutral-content select-none">{line.line}</span>
                            <span className={`whitespace-pre ${isHighlighted ? 'text-blue-300 font-semibold' : 'text-neutral-content opacity-70'}`}>{line.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="section-card p-4" style={{ borderTop: `2px solid ${COLORS.console}25` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.console + '15', color: COLORS.console }}><Code2 size={14} /></div>
                      <span className="text-[11px] font-bold">Console Output</span>
                      {state.consoleOutput.length > 0 && <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: COLORS.console + '15', color: COLORS.console }}>{state.consoleOutput.length}</span>}
                    </div>
                    <div className="min-h-[70px] rounded-lg bg-neutral p-3 space-y-1">
                      {state.consoleOutput.length === 0 && <p className="text-[10px] opacity-25 text-neutral-content text-center py-3">No output yet</p>}
                      <AnimatePresence>
                        {state.consoleOutput.map((line, i) => (
                          <motion.div key={`${line}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-[11px] font-mono text-neutral-content">
                            <span className="text-[9px] opacity-20 w-3 text-right shrink-0">{i + 1}</span><span className="opacity-25">{'>'}</span><span className="font-semibold" style={{ color: COLORS.console }}>{line}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-2 gap-3 auto-rows-min">
                  <QueueCard title="Call Stack" badge="LIFO — Last In, First Out" icon={Layers} color={COLORS.callStack} items={[...state.callStack].reverse()} highlight={currentStep?.phase === 'Call Stack' ? currentStep.item : null} emptyText="Stack is empty" />
                  <QueueCard title="Web APIs" badge="Browser-provided APIs" icon={Timer} color={COLORS.webApi} items={state.webApis} highlight={currentStep?.phase === 'Web API' ? currentStep.item : null} emptyText="No active APIs" />
                  <QueueCard title="Microtask Queue" badge="FIFO — Higher Priority" icon={Zap} color={COLORS.microTask} items={state.microTaskQueue} highlight={currentStep?.phase === 'Microtask Queue' ? currentStep.item : null} emptyText="Queue is empty" />
                  <QueueCard title="Task Queue" badge="FIFO — Macrotasks" icon={Inbox} color={COLORS.taskQueue} items={state.taskQueue} highlight={currentStep?.phase === 'Task Queue' ? currentStep.item : null} emptyText="Queue is empty" />
                  <div className="col-span-2 section-card p-4" style={{ borderTop: `2px solid ${COLORS.eventLoop}25` }}>
                    <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.eventLoop + '15', color: COLORS.eventLoop }}><RefreshCw size={14} /></div><span className="text-[11px] font-bold">Event Loop</span></div>
                    {currentStep?.phase === 'Event Loop' ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: COLORS.eventLoop + '30', backgroundColor: COLORS.eventLoop + '08' }}>
                        <RefreshCw size={16} className="animate-spin" style={{ color: COLORS.eventLoop }} />
                        <div><span className="text-[11px] font-semibold block" style={{ color: COLORS.eventLoop }}>Processing: {currentStep.item}</span><span className="text-[9px] opacity-40">Stack empty → checking queues…</span></div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-base-200/30">
                        <CircleDot size={16} className="opacity-20" />
                        <div><span className="text-[11px] opacity-40 block">{state.callStack.length > 0 ? 'Waiting — stack not empty' : stepNo < 0 ? 'Idle — press Start' : 'Idle'}</span><span className="text-[9px] opacity-20">Continuously checks if call stack is empty</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="wait">
                  {currentStep ? (
                    <motion.div key={`step-${stepNo}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="section-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: phaseBadge(currentStep.phase).bg }}>{stepNo + 1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap"><span className="badge badge-sm text-white" style={{ backgroundColor: phaseBadge(currentStep.phase).bg }}>{phaseBadge(currentStep.phase).icon} {phaseBadge(currentStep.phase).label}</span><span className="text-[10px] opacity-30 font-mono">{currentStep.item}</span></div>
                          <p className="text-[11px] opacity-60 leading-relaxed">{currentStep.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="section-card p-4 flex items-center justify-center min-h-[80px]"><p className="text-[11px] opacity-30">Press Start to begin visualization</p></div>
                  )}
                </AnimatePresence>
                {executionHistory.length > 0 ? (
                  <div className="section-card p-4">
                    <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><Clock size={13} className="text-primary" /> Timeline<span className="ml-auto text-[9px] font-mono opacity-30">{executionHistory.length} steps</span></h4>
                    <div className="flex gap-1 flex-wrap max-h-[70px] overflow-y-auto scrollbar-thin">
                      {executionHistory.map((s, i) => (
                        <button key={i} onClick={() => { setStepNo(i); setDone(false); if (playing) { clearInterval(timerRef.current); timerRef.current = null; setPlaying(false); } }}
                          className="flex items-center justify-center rounded-md transition-all duration-100"
                          style={{ width: 22, height: 22, backgroundColor: i === stepNo ? phaseBadge(s.phase).bg : 'color-mix(in oklch, var(--color-base-content) 6%, transparent)', border: i === stepNo ? '2px solid rgba(255,255,255,0.3)' : '1px solid transparent' }}
                          title={`Step ${i + 1}: ${s.detail}`}>
                          <span className="text-[7px] font-bold font-mono" style={{ color: i === stepNo ? '#fff' : 'color-mix(in oklch, var(--color-base-content) 35%, transparent)' }}>{i + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="section-card p-4 flex items-center justify-center min-h-[80px]"><p className="text-[11px] opacity-20">Timeline appears during execution</p></div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'learn' && (
            <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="section-card p-5">
                <div className="flex items-start gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg shrink-0">{info.icon}</div><div><h3 className="text-sm font-bold">{info.name}</h3><p className="text-xs opacity-50 mt-1 leading-relaxed">{info.desc}</p></div></div>
              </div>
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><BookOpen size={13} className="text-primary" /> How the Event Loop Works</h4>
                <ol className="space-y-2">
                  {[
                    { text: 'JavaScript is single-threaded — only one thing executes at a time on the Call Stack.', color: COLORS.callStack },
                    { text: 'Web APIs (setTimeout, fetch, DOM events) handle async operations outside the main thread.', color: COLORS.webApi },
                    { text: 'When an async operation completes, its callback goes to a queue — either Microtask or Task Queue.', color: COLORS.idle },
                    { text: 'Microtask Queue (Promises, queueMicrotask, MutationObserver) has HIGHER priority than Task Queue.', color: COLORS.microTask },
                    { text: 'Task Queue (setTimeout, setInterval, I/O) callbacks run only when the microtask queue is empty.', color: COLORS.taskQueue },
                    { text: 'The Event Loop continuously checks: Is the call stack empty? → Process all microtasks → Process one macrotask → Repeat.', color: COLORS.eventLoop },
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs"><span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5 text-white" style={{ backgroundColor: s.color }}>{i + 1}</span><span className="opacity-60 leading-relaxed">{s.text}</span></li>
                  ))}
                </ol>
              </div>
              <div className="section-card p-5">
                <button onClick={() => setShowCode(!showCode)} className="w-full flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><Code2 size={13} className="text-primary" /> Example Code</span>
                  <ChevronRight size={14} className={`transition-transform duration-200 opacity-40 ${showCode ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {showCode && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><pre className="mt-3 p-4 rounded-xl bg-neutral text-neutral-content font-mono text-[11px] leading-relaxed overflow-x-auto">{info.code}</pre></motion.div>)}
                </AnimatePresence>
              </div>
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><Zap size={13} className="text-primary" /> Key Concepts</h4>
                <ul className="space-y-1.5">
                  {['Synchronous code ALWAYS runs first — before any async callbacks.', 'Promise.resolve().then(cb) creates a microtask — runs before setTimeout callbacks.', 'setTimeout(cb, 0) does NOT mean "run immediately" — it means "as soon as the stack & microtasks are clear".', 'async/await is syntactic sugar over Promises — "await" pauses the function and schedules the continuation as a microtask.', 'The microtask queue is fully drained before any macrotask runs — even microtasks queued during microtask processing.', 'requestAnimationFrame callbacks run before the next paint, after microtasks.'].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs opacity-60"><span className="mt-0.5" style={{ color: '#22c55e' }}>•</span><span className="leading-relaxed">{t}</span></li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {tab === 'compare' && (
            <motion.div key="cmp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="section-card overflow-hidden">
                <div className="p-4 border-b border-base-300/30"><h3 className="text-sm font-bold flex items-center gap-2"><ArrowUpDown size={14} className="text-primary" /> Microtasks vs Macrotasks</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-base-200/30">{['Feature', 'Microtasks', 'Macrotasks (Tasks)'].map(h => (<th key={h} className="px-4 py-3 text-center font-bold first:text-left">{h}</th>))}</tr></thead>
                    <tbody>
                      {[{ feature: 'Priority', micro: 'Higher ⬆️', macro: 'Lower ⬇️' }, { feature: 'Examples', micro: 'Promise.then, queueMicrotask, MutationObserver', macro: 'setTimeout, setInterval, I/O, UI rendering' }, { feature: 'Queue Draining', micro: 'Fully drained each cycle', macro: 'One task per cycle' }, { feature: 'Can Block Rendering?', micro: 'Yes (if infinite loop)', macro: 'No (renders between tasks)' }, { feature: 'Scheduling', micro: 'During current task', macro: 'After current task + microtasks' }, { feature: 'Use Case', micro: 'Promise chains, async/await', macro: 'Deferred execution, timers' }].map(({ feature, micro, macro }, i) => (
                        <tr key={i} className="border-t border-base-300/20"><td className="px-4 py-3 font-semibold">{feature}</td><td className="px-4 py-3 text-center" style={{ color: COLORS.microTask }}>{micro}</td><td className="px-4 py-3 text-center" style={{ color: COLORS.taskQueue }}>{macro}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><Info size={13} className="text-primary" /> Execution Order per Event Loop Cycle</h4>
                <ol className="space-y-2">
                  {[{ step: 'Execute all synchronous code on the Call Stack', color: COLORS.callStack }, { step: 'Drain the entire Microtask Queue', color: COLORS.microTask }, { step: 'Render update (if needed — requestAnimationFrame)', color: COLORS.webApi }, { step: 'Pick ONE task from the Task Queue and execute it', color: COLORS.taskQueue }, { step: 'Go back to step 1', color: COLORS.eventLoop }].map(({ step, color }, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs"><span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5 text-white" style={{ backgroundColor: color }}>{i + 1}</span><span className="opacity-60 leading-relaxed">{step}</span></li>
                  ))}
                </ol>
              </div>
              <div className="section-card p-5">
                <h4 className="text-xs font-bold flex items-center gap-2 mb-3"><Info size={13} className="text-primary" /> Common Interview Questions</h4>
                <div className="space-y-3">
                  {[{ q: 'What is the output order of console.log, setTimeout(0), and Promise.resolve().then()?', a: 'Synchronous log first → Promise (microtask) → setTimeout (macrotask)' }, { q: 'Why does setTimeout(fn, 0) not run immediately?', a: 'The callback must wait for the call stack to empty and all microtasks to drain first.' }, { q: 'Can microtasks block rendering?', a: "Yes! If microtasks keep queueing more microtasks infinitely, the browser can't render." }, { q: 'What happens after "await" in an async function?', a: 'The rest of the function is scheduled as a microtask, and control returns to the caller.' }].map(({ q, a }, i) => (
                    <div key={i} className="p-3 rounded-lg bg-base-200/40 border border-base-300/20"><p className="text-[11px] font-semibold mb-1">{q}</p><p className="text-[10px] opacity-50 leading-relaxed">{a}</p></div>
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
