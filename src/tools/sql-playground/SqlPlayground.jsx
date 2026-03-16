import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Play, RotateCcw, Copy, Check, BookOpen,
  Table2, ChevronDown, ChevronRight, AlertCircle,
  Clock, Zap, Trash2, Info, Star, ArrowRight,
  Lightbulb, Timer, CheckCircle2, Lock, Award,
  Shield, Pause, X, Gamepad2,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import SEO from '../../components/SEO';
import { executeSQL, SAMPLE_TABLES, SAMPLE_QUERIES } from './sqlEngine';

// Deep clone tables for reset
function cloneTables(tables) {
  const clone = {};
  for (const [name, table] of Object.entries(tables)) {
    clone[name] = {
      columns: [...table.columns],
      rows: table.rows.map((r) => [...r]),
    };
  }
  return clone;
}

// ─── SQL Challenge Definitions ──────────────────────────────
const SQL_CHALLENGES = [
  {
    id: 1,
    title: 'Hello, World!',
    description: 'Select all columns from the employees table.',
    difficulty: 'beginner',
    points: 100,
    hint: 'Use SELECT * to get all columns. Specify the table with FROM.',
    expectedQuery: 'SELECT * FROM employees;',
    validateResult: (result) => {
      if (!result?.columns || !result?.rows) return false;
      return result.columns.length === 6 && result.rows.length === 10;
    },
    tables: ['employees'],
    world: 'tutorial',
    emoji: '👋',
  },
  {
    id: 2,
    title: 'Pick and Choose',
    description: 'Select only the name and salary columns from employees.',
    difficulty: 'beginner',
    points: 100,
    hint: 'List the specific column names after SELECT, separated by commas.',
    expectedQuery: 'SELECT name, salary FROM employees;',
    validateResult: (result) => {
      if (!result?.columns || !result?.rows) return false;
      return result.columns.length === 2 &&
        result.columns.includes('name') &&
        result.columns.includes('salary') &&
        result.rows.length === 10;
    },
    tables: ['employees'],
    world: 'tutorial',
    emoji: '🎯',
  },
  {
    id: 3,
    title: 'Engineering Team',
    description: 'Find all employees in the Engineering department.',
    difficulty: 'beginner',
    points: 100,
    hint: 'Use WHERE department = \'Engineering\' to filter rows.',
    expectedQuery: "SELECT * FROM employees WHERE department = 'Engineering';",
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 4 && result.rows.every((r) => {
        const deptIdx = result.columns.indexOf('department');
        return r[deptIdx] === 'Engineering';
      });
    },
    tables: ['employees'],
    world: 'tutorial',
    emoji: '⚙️',
  },
  {
    id: 4,
    title: 'High Rollers',
    description: 'Find employees earning more than $80,000, ordered by salary descending.',
    difficulty: 'easy',
    points: 150,
    hint: 'Use WHERE salary > 80000 and ORDER BY salary DESC.',
    expectedQuery: 'SELECT * FROM employees WHERE salary > 80000 ORDER BY salary DESC;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      const salIdx = result.columns.indexOf('salary');
      const allAbove80k = result.rows.every((r) => r[salIdx] > 80000);
      const sorted = result.rows.every((r, i) => i === 0 || r[salIdx] <= result.rows[i - 1][salIdx]);
      return allAbove80k && sorted && result.rows.length === 5;
    },
    tables: ['employees'],
    world: 'filtering',
    emoji: '💰',
  },
  {
    id: 5,
    title: 'Unique Departments',
    description: 'List all unique department names from the employees table.',
    difficulty: 'easy',
    points: 150,
    hint: 'Use SELECT DISTINCT to eliminate duplicate values.',
    expectedQuery: 'SELECT DISTINCT department FROM employees;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.columns.length === 1 &&
        result.rows.length === 4;
    },
    tables: ['employees'],
    world: 'filtering',
    emoji: '🔍',
  },
  {
    id: 6,
    title: 'Head Count',
    description: 'Count the number of employees in each department.',
    difficulty: 'medium',
    points: 200,
    hint: 'Use GROUP BY department with COUNT(*). Name the count column "count".',
    expectedQuery: 'SELECT department, COUNT(*) AS count FROM employees GROUP BY department;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 4 && result.columns.length === 2;
    },
    tables: ['employees'],
    world: 'filtering',
    emoji: '📊',
  },
  {
    id: 7,
    title: 'Big Departments',
    description: 'Find departments with more than 2 employees. Show department name and headcount.',
    difficulty: 'medium',
    points: 200,
    hint: 'Use GROUP BY with HAVING COUNT(*) > 2 to filter groups.',
    expectedQuery: 'SELECT department, COUNT(*) AS headcount FROM employees GROUP BY department HAVING COUNT(*) > 2;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 1 && result.columns.length === 2;
    },
    tables: ['employees'],
    world: 'aggregation',
    emoji: '🏢',
  },
  {
    id: 8,
    title: 'Top 3 Expensive',
    description: 'Find the 3 most expensive products. Show name and price.',
    difficulty: 'easy',
    points: 150,
    hint: 'Use ORDER BY price DESC with LIMIT 3.',
    expectedQuery: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 3 && result.columns.length === 2 &&
        result.columns.includes('name') && result.columns.includes('price');
    },
    tables: ['products'],
    world: 'aggregation',
    emoji: '🏷️',
  },
  {
    id: 9,
    title: 'Order Details',
    description: 'Join orders with products to show order id, product name, quantity, and order status.',
    difficulty: 'medium',
    points: 200,
    hint: 'JOIN products ON orders.product_id = products.id. Use table aliases.',
    expectedQuery: 'SELECT o.id, p.name, o.quantity, o.status FROM orders o JOIN products p ON o.product_id = p.id;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 10 && result.columns.length === 4;
    },
    tables: ['orders', 'products'],
    world: 'aggregation',
    emoji: '🔗',
  },
  {
    id: 10,
    title: 'Revenue Report',
    description: 'Calculate total revenue per product (quantity × price). Show product name and total_revenue, sorted by revenue descending.',
    difficulty: 'hard',
    points: 300,
    hint: 'JOIN orders with products, use SUM(o.quantity * p.price) with GROUP BY, and ORDER BY.',
    expectedQuery: 'SELECT p.name, SUM(o.quantity * p.price) AS total_revenue FROM orders o JOIN products p ON o.product_id = p.id GROUP BY p.name ORDER BY total_revenue DESC;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      const hasName = result.columns.some((c) => c === 'name' || c === 'p.name');
      const hasRev = result.columns.some((c) => c.toLowerCase().includes('revenue') || c.toLowerCase().includes('total'));
      return result.rows.length > 0 && result.columns.length === 2 && hasName && hasRev;
    },
    tables: ['orders', 'products'],
    world: 'mastery',
    emoji: '💎',
  },
  {
    id: 11,
    title: 'Department Stats',
    description: 'Show each department\'s name, headcount, minimum salary (min_sal), maximum salary (max_sal), and average salary (avg_sal).',
    difficulty: 'hard',
    points: 300,
    hint: 'Use GROUP BY department with COUNT(*), MIN(salary), MAX(salary), AVG(salary).',
    expectedQuery: 'SELECT department, COUNT(*) AS headcount, MIN(salary) AS min_sal, MAX(salary) AS max_sal, AVG(salary) AS avg_sal FROM employees GROUP BY department;',
    validateResult: (result) => {
      if (!result?.rows) return false;
      return result.rows.length === 4 && result.columns.length === 5;
    },
    tables: ['employees'],
    world: 'mastery',
    emoji: '📈',
  },
  {
    id: 12,
    title: 'Pattern Finder',
    description: 'Find all products whose name contains the word "Desk". Show name and price.',
    difficulty: 'easy',
    points: 150,
    hint: 'Use LIKE with % wildcards: WHERE name LIKE \'%Desk%\'.',
    expectedQuery: "SELECT name, price FROM products WHERE name LIKE '%Desk%';",
    validateResult: (result) => {
      if (!result?.rows) return false;
      const nameIdx = result.columns.indexOf('name');
      return result.rows.length > 0 && result.rows.every((r) => String(r[nameIdx]).includes('Desk'));
    },
    tables: ['products'],
    world: 'mastery',
    emoji: '🔎',
  },
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-success/15 text-success border-success/30',
  easy: 'bg-info/15 text-info border-info/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  hard: 'bg-error/15 text-error border-error/30',
};

const DIFFICULTY_LABELS = {
  beginner: '🌱 Beginner',
  easy: '🎯 Easy',
  medium: '🔥 Medium',
  hard: '💎 Hard',
};

// ─── Gamification Constants ────────────────────────────────
const SQL_MAX_LIVES = 5;
const SQL_RANKS = [
  { minXP: 0,    title: 'Intern',        icon: '🌱', color: 'text-success' },
  { minXP: 200,  title: 'Junior DBA',    icon: '📊', color: 'text-info' },
  { minXP: 500,  title: 'Data Analyst',   icon: '⚡', color: 'text-primary' },
  { minXP: 900,  title: 'Senior DBA',    icon: '🔥', color: 'text-warning' },
  { minXP: 1400, title: 'Data Architect', icon: '💎', color: 'text-secondary' },
  { minXP: 2000, title: 'SQL Wizard',     icon: '🧙', color: 'text-error' },
];

const SQL_WORLD_THEMES = {
  tutorial:    { bg: 'from-emerald-500/10 to-green-500/5', border: 'border-emerald-500/20', label: '📖 Tutorial Island', color: 'text-emerald-500' },
  filtering:   { bg: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/20', label: '🔍 Filter Forest', color: 'text-blue-500' },
  aggregation: { bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/20', label: '📊 Aggregate Mountains', color: 'text-amber-500' },
  mastery:     { bg: 'from-purple-500/10 to-pink-500/5', border: 'border-purple-500/20', label: '👑 Mastery Peak', color: 'text-purple-500' },
};

// ─── SQL Achievement / Badge Definitions ───────────────────
const SQL_ACHIEVEMENTS = [
  { id: 'first_query',     icon: '🎉', title: 'Hello Database',     description: 'Complete your first SQL challenge', condition: (s) => s.completed >= 1 },
  { id: 'three_star',      icon: '⭐', title: 'Query Perfectionist', description: 'Get 3 stars on any challenge', condition: (s) => Object.values(s.stars).some((v) => v === 3) },
  { id: 'streak_3',        icon: '🔥', title: 'Query Streak',       description: 'Achieve a 3x streak', condition: (s) => s.maxStreak >= 3 },
  { id: 'streak_5',        icon: '💥', title: 'Query Machine',      description: 'Achieve a 5x streak', condition: (s) => s.maxStreak >= 5 },
  { id: 'speed_query',     icon: '⚡', title: 'Lightning Query',    description: 'Solve a challenge in under 15 seconds', condition: (s) => s.fastestSolve > 0 && s.fastestSolve <= 15 },
  { id: 'half_done',       icon: '🏔️', title: 'Halfway DBA',       description: 'Complete 50% of all challenges', condition: (s) => s.completed >= Math.ceil(SQL_CHALLENGES.length / 2) },
  { id: 'world_clear',     icon: '🗺️', title: 'World Explorer',    description: 'Clear all levels in any world', condition: (s) => s.worldsCleared >= 1 },
  { id: 'all_clear',       icon: '🧙', title: 'SQL Wizard',        description: 'Complete every challenge', condition: (s) => s.completed >= SQL_CHALLENGES.length },
  { id: 'no_hint',         icon: '🧠', title: 'Pure Skill',        description: 'Complete 5 challenges without hints', condition: (s) => s.noHintSolves >= 5 },
  { id: 'daily_hero',      icon: '📅', title: 'Daily Querier',     description: 'Complete a daily challenge', condition: (s) => s.dailyCompleted >= 1 },
  { id: 'xp_500',          icon: '💎', title: 'XP Collector',      description: 'Earn 500 total XP', condition: (s) => s.totalXP >= 500 },
  { id: 'join_master',     icon: '🔗', title: 'Join Master',       description: 'Complete all JOIN challenges', condition: (s) => s.joinsDone },
  { id: 'power_user',      icon: '🔋', title: 'Power Player',      description: 'Use a power-up for the first time', condition: (s) => s.powerUpsUsed >= 1 },
];

// ─── SQL Power-up Definitions ──────────────────────────────
const SQL_POWER_UPS = {
  freeHint:     { icon: '💡', label: 'Free Hint',    description: 'Get a hint without XP penalty' },
  timeFreeze:   { icon: '❄️', label: 'Time Freeze',  description: 'Pause the timer for 20 seconds' },
  skipLevel:    { icon: '⏭️', label: 'Skip Level',   description: 'Skip to the next challenge' },
  showSchema:   { icon: '📋', label: 'Schema Peek',  description: 'Highlight relevant columns in the schema' },
};

// ─── SQL Daily Challenge System ────────────────────────────
function getSqlDailyChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = (seed * 7) % SQL_CHALLENGES.length;
  return { ...SQL_CHALLENGES[idx], isDaily: true, dailyDate: today.toDateString(), bonusXP: 50 };
}



function getSqlRank(xp) {
  for (let i = SQL_RANKS.length - 1; i >= 0; i--) {
    if (xp >= SQL_RANKS[i].minXP) return { ...SQL_RANKS[i], index: i };
  }
  return { ...SQL_RANKS[0], index: 0 };
}

function getSqlNextRank(xp) {
  for (let i = 0; i < SQL_RANKS.length; i++) {
    if (xp < SQL_RANKS[i].minXP) return SQL_RANKS[i];
  }
  return null;
}

function getSqlStars(timer, attempts, hintUsed, answerUsed) {
  let stars = 3;
  if (timer > 60) stars--;
  if (attempts > 3) stars--;
  if (hintUsed) stars--;
  if (answerUsed) stars = 1;
  return Math.max(1, stars);
}

// ─── SQL Achievement Popup ─────────────────────────────────
function SqlAchievementPopup({ achievement, onClose }) {
  if (!achievement) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="fixed bottom-6 right-6 z-50 max-w-xs"
    >
      <div className="section-card p-4 border-2 border-warning/40 bg-gradient-to-br from-warning/[0.08] to-transparent shadow-xl">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ rotate: -30, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.15 }}
            className="text-3xl"
          >{achievement.icon}</motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Award size={12} className="text-warning" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-warning">Achievement Unlocked!</span>
            </div>
            <h4 className="text-sm font-bold">{achievement.title}</h4>
            <p className="text-[10px] opacity-50 mt-0.5">{achievement.description}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-square opacity-40 hover:opacity-100"><X size={12} /></button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SQL Power-up Bar Component ────────────────────────────
function SqlPowerUpBar({ powerUps, onUse, disabled }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(SQL_POWER_UPS).map(([key, pu]) => {
        const count = powerUps[key] || 0;
        return (
          <motion.button
            key={key}
            whileHover={!disabled && count > 0 ? { scale: 1.08, y: -2 } : {}}
            whileTap={!disabled && count > 0 ? { scale: 0.95 } : {}}
            onClick={() => count > 0 && !disabled && onUse(key)}
            disabled={disabled || count <= 0}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-200 ${
              count > 0 && !disabled
                ? 'border-primary/30 bg-primary/[0.05] hover:bg-primary/10 cursor-pointer'
                : 'border-base-300/20 opacity-30 cursor-not-allowed'
            }`}
            title={`${pu.label}: ${pu.description}`}
          >
            <span className="text-sm">{pu.icon}</span>
            <span className="hidden sm:inline">{pu.label}</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-content text-[8px] font-bold flex items-center justify-center">{count}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── SQL Daily Challenge Banner ────────────────────────────
function SqlDailyChallengeCard({ daily, isCompleted, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card overflow-hidden border-2 border-accent/30"
    >
      <div className="px-5 py-3 bg-gradient-to-r from-accent/10 via-primary/5 to-secondary/10 border-b border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-lg">📅</motion.span>
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                Daily SQL Challenge
                <span className="px-1.5 py-0.5 rounded-md text-[8px] bg-accent/15 text-accent font-bold border border-accent/25">+{daily.bonusXP} BONUS XP</span>
              </h4>
              <p className="text-[9px] opacity-40 mt-0.5">New challenge every 24 hours</p>
            </div>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 size={12} className="text-success" />
              <span className="text-[10px] font-bold text-success">Completed!</span>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStart} className="btn btn-sm btn-accent gap-1.5">
              <Zap size={13} /> Play Now
            </motion.button>
          )}
        </div>
      </div>
      <div className="px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">{daily.emoji}</span>
        <div>
          <h5 className="text-xs font-bold">{daily.title}</h5>
          <p className="text-[10px] opacity-50">{daily.description}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${DIFFICULTY_COLORS[daily.difficulty]}`}>
            {DIFFICULTY_LABELS[daily.difficulty]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SQL Combo Indicator ───────────────────────────────────
function SqlComboIndicator({ combo, show }) {
  if (!show || combo <= 1) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 2, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -40 }}
      className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3 }} className="text-5xl font-black" style={{ textShadow: '0 2px 20px rgba(255, 159, 28, 0.5)' }}>
          <span className="gradient-text">{combo}x COMBO!</span>
        </motion.div>
      </div>
    </motion.div>
  );
}



// ─── SQL Achievement Gallery ───────────────────────────────
function SqlAchievementGallery({ unlockedIds }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {SQL_ACHIEVEMENTS.map((ach) => {
        const unlocked = unlockedIds.includes(ach.id);
        return (
          <motion.div
            key={ach.id}
            whileHover={unlocked ? { scale: 1.03, y: -2 } : {}}
            className={`relative p-4 rounded-xl border text-center transition-all duration-200 ${
              unlocked
                ? 'border-warning/30 bg-gradient-to-b from-warning/[0.05] to-transparent'
                : 'border-base-300/20 bg-base-200/20 opacity-40'
            }`}
          >
            <motion.div className="text-2xl mb-2" animate={unlocked ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}>
              {unlocked ? ach.icon : '🔒'}
            </motion.div>
            <h5 className="text-[10px] font-bold leading-tight">{ach.title}</h5>
            <p className="text-[9px] opacity-40 mt-1 leading-relaxed">{ach.description}</p>
            {unlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-warning-content text-[8px] flex items-center justify-center font-bold shadow-sm">✓</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── SQL Mini Progress Map ─────────────────────────────────
function SqlMiniProgressMap({ challenges, completedIds, currentId, stars }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-1">
      {challenges.map((ch, idx) => {
        const done = completedIds.includes(ch.id);
        const isCurrent = currentId === ch.id;
        const s = stars[ch.id] || 0;
        return (
          <div key={ch.id} className="flex items-center">
            <motion.div
              animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-success/15 border-2 border-success/40 text-success'
                  : isCurrent ? 'bg-primary/15 border-2 border-primary/40 text-primary ring-2 ring-primary/20'
                  : 'bg-base-200/40 border border-base-300/30 opacity-40'
              }`}
              title={`Level ${ch.id}: ${ch.title}${done ? ` (${s}★)` : ''}`}
            >
              {done ? <span className="text-[10px]">{ch.emoji}</span> : <span className="text-[9px]">{ch.id}</span>}
              {done && s > 0 && (
                <div className="absolute -bottom-1.5 flex gap-px">
                  {[1, 2, 3].map((i) => (<span key={i} className={`text-[6px] ${i <= s ? 'text-warning' : 'opacity-20'}`}>★</span>))}
                </div>
              )}
            </motion.div>
            {idx < challenges.length - 1 && (
              <div className={`w-3 h-0.5 mx-0.5 rounded-full ${done ? 'bg-success/40' : 'bg-base-300/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Confetti Burst Component ──────────────────────────────
function ConfettiBurst({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#2D79FF', '#F59E0B', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'][i % 7],
    delay: Math.random() * 0.5,
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: '40vh', x: `${p.x}vw`, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: ['-10vh'],
            x: `${p.x + (Math.random() - 0.5) * 30}vw`,
            scale: [0, 1.2, 0.8],
            rotate: p.rotation + 720,
          }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeOut' }}
          style={{ position: 'absolute', width: p.size, height: p.size, backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
        />
      ))}
    </div>
  );
}

// ─── Lives Display Component ───────────────────────────────
function LivesDisplay({ lives, maxLives }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxLives }, (_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={i < lives ? { scale: [1, 1.3, 1], opacity: 1 } : { scale: 0.8, opacity: 0.2 }}
          transition={{ duration: 0.3 }}
          className="text-sm"
        >
          {i < lives ? '❤️' : '🖤'}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Star Rating Component ─────────────────────────────────
function StarRating({ stars, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((s) => (
        <motion.span
          key={s}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: s * 0.15, type: 'spring', stiffness: 400 }}
          className={s <= stars ? 'text-warning' : 'opacity-20'}
          style={{ fontSize: size }}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

// ─── XP Progress Bar Component ─────────────────────────────
function SqlXPProgressBar({ xp }) {
  const rank = getSqlRank(xp);
  const next = getSqlNextRank(xp);
  const progress = next ? ((xp - rank.minXP) / (next.minXP - rank.minXP)) * 100 : 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px]">
        <span className={`font-bold ${rank.color}`}>{rank.icon} {rank.title}</span>
        {next && <span className="opacity-40">{next.icon} {next.title} ({next.minXP} XP)</span>}
      </div>
      <div className="w-full h-2 rounded-full bg-base-300/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
          style={{ boxShadow: '0 0 8px var(--color-primary)' }}
        />
      </div>
      <div className="text-[9px] font-mono opacity-30 text-right">{xp} XP {next ? `/ ${next.minXP}` : '(MAX)'}</div>
    </div>
  );
}

// ─── Schema Viewer ──────────────────────────────────────────
function SchemaViewer({ tables }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (name) => setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="space-y-1.5">
      {Object.entries(tables).map(([name, table]) => (
        <div key={name} className="border border-base-300/30 rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(name)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-base-200/50 transition-colors text-left"
          >
            <Table2 size={12} className="text-primary shrink-0" />
            <span className="text-[11px] font-bold font-mono flex-1">{name}</span>
            <span className="text-[9px] opacity-30">{table.rows.length} rows</span>
            <ChevronRight
              size={11}
              className={`opacity-30 transition-transform duration-200 ${expanded[name] ? 'rotate-90' : ''}`}
            />
          </button>
          <AnimatePresence>
            {expanded[name] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-2.5 pt-0.5 border-t border-base-300/20">
                  {table.columns.map((col, i) => (
                    <div key={col} className="flex items-center gap-2 py-0.5">
                      <span className={`text-[10px] font-mono ${i === 0 ? 'text-warning font-bold' : 'opacity-50'}`}>
                        {i === 0 ? '🔑' : '  •'} {col}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Results Table ──────────────────────────────────────────
function ResultsTable({ columns, rows }) {
  if (!columns || !rows) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-base-200/40">
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider opacity-40 border-b border-base-300/40 w-10">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider opacity-60 border-b border-base-300/40 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-base-300/20 hover:bg-primary/[0.02] transition-colors"
            >
              <td className="px-3 py-1.5 font-mono text-[10px] opacity-25">{i + 1}</td>
              {row.map((val, j) => (
                <td key={j} className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap">
                  {val === null || val === undefined ? (
                    <span className="italic opacity-30">NULL</span>
                  ) : typeof val === 'number' ? (
                    <span className="text-primary font-semibold">{val}</span>
                  ) : (
                    <span className="opacity-70">{String(val)}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── History Item ───────────────────────────────────────────
function HistoryItem({ entry, onRun }) {
  return (
    <button
      onClick={() => onRun(entry.sql)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-base-200/50 transition-colors group"
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
            entry.success ? 'bg-success' : 'bg-error'
          }`}
        />
        <div className="flex-1 min-w-0">
          <pre className="text-[10px] font-mono opacity-60 truncate leading-relaxed">{entry.sql}</pre>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] opacity-25">{entry.time}</span>
            {entry.rowCount !== undefined && (
              <span className="text-[9px] opacity-25">{entry.rowCount} rows</span>
            )}
            <span className="text-[9px] opacity-25">{entry.duration}ms</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function SqlPlayground() {
  const [tables, setTables] = useState(() => cloneTables(SAMPLE_TABLES));
  const [query, setQuery] = useState('SELECT * FROM employees;');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [duration, setDuration] = useState(null);
  const [tab, setTab] = useState('editor');
  const [sampleCategory, setSampleCategory] = useState(null);

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeQuery, setChallengeQuery] = useState('');
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeError, setChallengeError] = useState(null);
  const [challengeVerdict, setChallengeVerdict] = useState(null); // 'success' | 'wrong' | null
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sql-challenges-completed') || '[]'); } catch { return []; }
  });
  const [sqlTotalScore, setSqlTotalScore] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-challenges-score') || '0', 10); } catch { return 0; }
  });
  const [sqlStreak, setSqlStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [challengeAttempts, setChallengeAttempts] = useState(0);
  const challengeTimerRef = useRef(null);
  const challengeTextareaRef = useRef(null);

  // Game state
  const [sqlLives, setSqlLives] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-game-lives') || String(SQL_MAX_LIVES), 10); } catch { return SQL_MAX_LIVES; }
  });
  const [sqlChallengeStars, setSqlChallengeStars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sql-challenge-stars') || '{}'); } catch { return {}; }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpGained, setXpGained] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [gameOverModal, setGameOverModal] = useState(false);

  // Achievement state
  const [sqlUnlockedAchievements, setSqlUnlockedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sql-achievements') || '[]'); } catch { return []; }
  });
  const [sqlAchievementPopup, setSqlAchievementPopup] = useState(null);
  const [sqlMaxStreak, setSqlMaxStreak] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-max-streak') || '0', 10); } catch { return 0; }
  });
  const [sqlFastestSolve, setSqlFastestSolve] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-fastest-solve') || '0', 10); } catch { return 0; }
  });
  const [sqlNoHintSolves, setSqlNoHintSolves] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-no-hint-solves') || '0', 10); } catch { return 0; }
  });
  const [sqlDailyCompleted, setSqlDailyCompleted] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-daily-completed') || '0', 10); } catch { return 0; }
  });
  const [sqlPowerUpsUsed, setSqlPowerUpsUsed] = useState(() => {
    try { return parseInt(localStorage.getItem('sql-powerups-used') || '0', 10); } catch { return 0; }
  });

  // Power-up state
  const [sqlPowerUps, setSqlPowerUps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sql-powerups') || '{"freeHint":2,"timeFreeze":2,"skipLevel":1,"showSchema":1}'); } catch { return { freeHint: 2, timeFreeze: 2, skipLevel: 1, showSchema: 1 }; }
  });
  const [sqlTimerFrozen, setSqlTimerFrozen] = useState(false);
  const sqlFreezeTimeoutRef = useRef(null);
  const [highlightSchema, setHighlightSchema] = useState(false);

  // Daily challenge state
  const [sqlDailyChallenge] = useState(() => getSqlDailyChallenge());
  const [sqlDailyDone, setSqlDailyDone] = useState(() => {
    try { return localStorage.getItem('sql-daily-done-date') === new Date().toDateString(); } catch { return false; }
  });

  // Combo state
  const [sqlCombo, setSqlCombo] = useState(0);
  const [showSqlCombo, setShowSqlCombo] = useState(false);
  const sqlComboTimeoutRef = useRef(null);

  const textareaRef = useRef(null);
  const { copied, copyToClipboard } = useCopyToClipboard();

  // ── Persist challenge progress ──
  useEffect(() => {
    localStorage.setItem('sql-challenges-completed', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  useEffect(() => {
    localStorage.setItem('sql-challenges-score', String(sqlTotalScore));
  }, [sqlTotalScore]);

  useEffect(() => {
    localStorage.setItem('sql-game-lives', String(sqlLives));
  }, [sqlLives]);

  useEffect(() => {
    localStorage.setItem('sql-challenge-stars', JSON.stringify(sqlChallengeStars));
  }, [sqlChallengeStars]);

  useEffect(() => {
    localStorage.setItem('sql-achievements', JSON.stringify(sqlUnlockedAchievements));
  }, [sqlUnlockedAchievements]);

  useEffect(() => {
    localStorage.setItem('sql-max-streak', String(sqlMaxStreak));
  }, [sqlMaxStreak]);

  useEffect(() => {
    localStorage.setItem('sql-fastest-solve', String(sqlFastestSolve));
  }, [sqlFastestSolve]);

  useEffect(() => {
    localStorage.setItem('sql-no-hint-solves', String(sqlNoHintSolves));
  }, [sqlNoHintSolves]);

  useEffect(() => {
    localStorage.setItem('sql-daily-completed', String(sqlDailyCompleted));
  }, [sqlDailyCompleted]);

  useEffect(() => {
    localStorage.setItem('sql-powerups-used', String(sqlPowerUpsUsed));
  }, [sqlPowerUpsUsed]);

  useEffect(() => {
    localStorage.setItem('sql-powerups', JSON.stringify(sqlPowerUps));
  }, [sqlPowerUps]);

  // ── Achievement checker ──
  const checkSqlAchievements = useCallback(() => {
    const worldsCleared = Object.keys(SQL_WORLD_THEMES).filter((worldKey) => {
      const worldChallenges = SQL_CHALLENGES.filter((c) => c.world === worldKey);
      return worldChallenges.every((c) => completedChallenges.includes(c.id));
    }).length;

    const joinChallenges = SQL_CHALLENGES.filter((c) => c.tables.length > 1);
    const joinsDone = joinChallenges.every((c) => completedChallenges.includes(c.id));

    const stats = {
      completed: completedChallenges.length,
      stars: sqlChallengeStars,
      maxStreak: sqlMaxStreak,
      fastestSolve: sqlFastestSolve,
      noHintSolves: sqlNoHintSolves,
      dailyCompleted: sqlDailyCompleted,
      totalXP: sqlTotalScore,
      worldsCleared,
      joinsDone,
      powerUpsUsed: sqlPowerUpsUsed,
    };

    const newUnlocked = [];
    for (const ach of SQL_ACHIEVEMENTS) {
      if (!sqlUnlockedAchievements.includes(ach.id) && ach.condition(stats)) {
        newUnlocked.push(ach);
      }
    }

    if (newUnlocked.length > 0) {
      setSqlUnlockedAchievements((prev) => [...prev, ...newUnlocked.map((a) => a.id)]);
      setSqlAchievementPopup(newUnlocked[0]);
      setTimeout(() => setSqlAchievementPopup(null), 4000);
    }
  }, [completedChallenges, sqlChallengeStars, sqlMaxStreak, sqlFastestSolve, sqlNoHintSolves, sqlDailyCompleted, sqlTotalScore, sqlUnlockedAchievements, sqlPowerUpsUsed]);

  useEffect(() => {
    checkSqlAchievements();
  }, [completedChallenges.length, sqlTotalScore, sqlMaxStreak, sqlFastestSolve, sqlNoHintSolves, sqlDailyCompleted, sqlPowerUpsUsed]);

  // ── Lives regen (1 life every 2 minutes) ──
  useEffect(() => {
    if (sqlLives < SQL_MAX_LIVES) {
      const timer = setInterval(() => {
        setSqlLives((l) => Math.min(SQL_MAX_LIVES, l + 1));
      }, 120000);
      return () => clearInterval(timer);
    }
    return () => {};
  }, [sqlLives]);

  // ── Challenge timer (respects freeze) ──
  useEffect(() => {
    if (currentChallenge && challengeVerdict !== 'success') {
      challengeTimerRef.current = setInterval(() => {
        if (!sqlTimerFrozen) {
          setChallengeTimer((t) => t + 1);
        }
      }, 1000);
    }
    return () => { if (challengeTimerRef.current) clearInterval(challengeTimerRef.current); };
  }, [currentChallenge, challengeVerdict, sqlTimerFrozen]);

  // ── Auto-resize challenge textarea ──
  useEffect(() => {
    if (challengeTextareaRef.current) {
      challengeTextareaRef.current.style.height = 'auto';
      challengeTextareaRef.current.style.height = Math.min(challengeTextareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [challengeQuery]);

  // ── Execute query ──
  const runQuery = useCallback((sql) => {
    const trimmed = (sql || query).trim();
    if (!trimmed) return;

    const start = performance.now();
    try {
      const res = executeSQL(trimmed, tables);
      const dur = Math.round((performance.now() - start) * 100) / 100;
      setDuration(dur);
      setError(null);

      if (res.type === 'result') {
        setResult({ columns: res.columns, rows: res.rows });
        setHistory((prev) => [
          {
            sql: trimmed,
            success: true,
            time: new Date().toLocaleTimeString(),
            rowCount: res.rows.length,
            duration: dur,
          },
          ...prev.slice(0, 49),
        ]);
      } else {
        setResult({ message: res.message });
        setTables({ ...tables });
        setHistory((prev) => [
          {
            sql: trimmed,
            success: true,
            time: new Date().toLocaleTimeString(),
            rowCount: res.affectedRows,
            duration: dur,
          },
          ...prev.slice(0, 49),
        ]);
      }
    } catch (err) {
      const dur = Math.round((performance.now() - start) * 100) / 100;
      setDuration(dur);
      setError(err.message);
      setResult(null);
      setHistory((prev) => [
        { sql: trimmed, success: false, time: new Date().toLocaleTimeString(), duration: dur },
        ...prev.slice(0, 49),
      ]);
    }
  }, [query, tables]);

  // ── Load sample query ──
  const loadSample = useCallback((sql) => {
    setQuery(sql);
    setError(null);
    setResult(null);
  }, []);

  // ── Reset database ──
  const resetDB = useCallback(() => {
    setTables(cloneTables(SAMPLE_TABLES));
    setResult(null);
    setError(null);
    setDuration(null);
  }, []);

  // ── Keyboard shortcut ──
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
  }, [runQuery]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  }, [query]);

  // ── Challenge handlers ──
  const startChallenge = useCallback((challenge) => {
    if (sqlLives <= 0) {
      setGameOverModal(true);
      return;
    }
    setCurrentChallenge(challenge);
    setChallengeQuery('');
    setChallengeResult(null);
    setChallengeError(null);
    setChallengeVerdict(null);
    setShowHint(false);
    setShowExpected(false);
    setChallengeTimer(0);
    setChallengeAttempts(0);
    setXpGained(null);
    setShowConfetti(false);
    setShakeWrong(false);
  }, [sqlLives]);

  const runChallengeQuery = useCallback(() => {
    if (!currentChallenge || !challengeQuery.trim()) return;
    const trimmed = challengeQuery.trim();
    const freshTables = cloneTables(SAMPLE_TABLES);

    try {
      const res = executeSQL(trimmed, freshTables);
      setChallengeError(null);

      if (res.type === 'result') {
        setChallengeResult({ columns: res.columns, rows: res.rows });

        // Validate
        setChallengeAttempts((a) => a + 1);
        const isCorrect = currentChallenge.validateResult({ columns: res.columns, rows: res.rows });

        if (isCorrect) {
          setChallengeVerdict('success');
          if (challengeTimerRef.current) clearInterval(challengeTimerRef.current);

          // Calculate stars
          const stars = getSqlStars(challengeTimer, challengeAttempts + 1, showHint, showExpected);
          setSqlChallengeStars((prev) => ({
            ...prev,
            [currentChallenge.id]: Math.max(prev[currentChallenge.id] || 0, stars),
          }));

          // Track fastest solve
          if (sqlFastestSolve === 0 || challengeTimer < sqlFastestSolve) {
            setSqlFastestSolve(challengeTimer);
          }

          // Track no-hint solves
          if (!showHint && !showExpected) {
            setSqlNoHintSolves((n) => n + 1);
          }

          if (!completedChallenges.includes(currentChallenge.id)) {
            const timeBonus = Math.max(0, 60 - challengeTimer) * 3;
            const hintPenalty = showHint ? Math.floor(currentChallenge.points * 0.3) : 0;
            const expectedPenalty = showExpected ? Math.floor(currentChallenge.points * 0.5) : 0;
            const attemptPenalty = Math.max(0, challengeAttempts * 10);
            const streakBonus = sqlStreak * 25;
            const comboBonus = sqlCombo * 15;
            const dailyBonus = currentChallenge.isDaily ? (currentChallenge.bonusXP || 50) : 0;
            const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1;
            const earned = Math.max(10, Math.floor((currentChallenge.points + timeBonus + streakBonus + comboBonus + dailyBonus - hintPenalty - expectedPenalty - attemptPenalty) * starMultiplier));

            setSqlTotalScore((s) => s + earned);
            setCompletedChallenges((prev) => [...prev, currentChallenge.id]);
            setSqlStreak((s) => {
              const newStreak = s + 1;
              setSqlMaxStreak((m) => Math.max(m, newStreak));
              return newStreak;
            });
            setXpGained(earned);

            // Track daily
            if (currentChallenge.isDaily) {
              setSqlDailyCompleted((d) => d + 1);
              setSqlDailyDone(true);
              localStorage.setItem('sql-daily-done-date', new Date().toDateString());
            }

            // Combo system
            setSqlCombo((c) => c + 1);
            setShowSqlCombo(true);
            if (sqlComboTimeoutRef.current) clearTimeout(sqlComboTimeoutRef.current);
            sqlComboTimeoutRef.current = setTimeout(() => { setShowSqlCombo(false); setSqlCombo(0); }, 5000);

            // Award power-ups on milestones
            const newCompleted = completedChallenges.length + 1;
            if (newCompleted % 3 === 0) {
              setSqlPowerUps((p) => ({ ...p, freeHint: (p.freeHint || 0) + 1, timeFreeze: (p.timeFreeze || 0) + 1 }));
            }
            if (newCompleted % 4 === 0) {
              setSqlPowerUps((p) => ({ ...p, skipLevel: (p.skipLevel || 0) + 1, showSchema: (p.showSchema || 0) + 1 }));
            }
          }

          // Celebration!
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setChallengeVerdict('wrong');
          setShakeWrong(true);
          setSqlStreak(0);
          setSqlCombo(0);
          setSqlLives((l) => Math.max(0, l - 1));

          if (sqlLives <= 1) {
            setTimeout(() => setGameOverModal(true), 800);
          }

          setTimeout(() => {
            setChallengeVerdict(null);
            setShakeWrong(false);
          }, 2000);
        }
      } else {
        setChallengeResult({ message: res.message });
        setChallengeAttempts((a) => a + 1);
        setChallengeVerdict('wrong');
        setShakeWrong(true);
        setSqlStreak(0);
        setSqlLives((l) => Math.max(0, l - 1));
        setTimeout(() => {
          setChallengeVerdict(null);
          setShakeWrong(false);
        }, 2000);
      }
    } catch (err) {
      setChallengeError(err.message);
      setChallengeResult(null);
      setChallengeVerdict(null);
    }
  }, [currentChallenge, challengeQuery, completedChallenges, challengeTimer, showHint, showExpected, sqlStreak, challengeAttempts, sqlLives]);

  const handleChallengeKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runChallengeQuery();
    }
  }, [runChallengeQuery]);

  const nextChallenge = useCallback(() => {
    const idx = SQL_CHALLENGES.findIndex((c) => c.id === currentChallenge?.id);
    if (idx < SQL_CHALLENGES.length - 1) {
      startChallenge(SQL_CHALLENGES[idx + 1]);
    } else {
      setCurrentChallenge(null);
    }
  }, [currentChallenge, startChallenge]);

  const resetChallengeProgress = useCallback(() => {
    setCompletedChallenges([]);
    setSqlTotalScore(0);
    setSqlStreak(0);
    setSqlLives(SQL_MAX_LIVES);
    setSqlChallengeStars({});
    setCurrentChallenge(null);
    setGameOverModal(false);
    setSqlUnlockedAchievements([]);
    setSqlMaxStreak(0);
    setSqlFastestSolve(0);
    setSqlNoHintSolves(0);
    setSqlDailyCompleted(0);
    setSqlPowerUpsUsed(0);
    setSqlPowerUps({ freeHint: 2, timeFreeze: 2, skipLevel: 1, showSchema: 1 });
    setSqlCombo(0);
    localStorage.removeItem('sql-challenges-completed');
    localStorage.removeItem('sql-challenges-score');
    localStorage.removeItem('sql-game-lives');
    localStorage.removeItem('sql-challenge-stars');
    localStorage.removeItem('sql-achievements');
    localStorage.removeItem('sql-max-streak');
    localStorage.removeItem('sql-fastest-solve');
    localStorage.removeItem('sql-no-hint-solves');
    localStorage.removeItem('sql-daily-completed');
    localStorage.removeItem('sql-powerups-used');
    localStorage.removeItem('sql-powerups');
    localStorage.removeItem('sql-daily-done-date');
  }, []);

  const refillSqlLives = useCallback(() => {
    setSqlLives(SQL_MAX_LIVES);
    setGameOverModal(false);
  }, []);

  // ── Power-up handlers ──
  const useSqlPowerUp = useCallback((key) => {
    if (!currentChallenge || (sqlPowerUps[key] || 0) <= 0) return;

    setSqlPowerUps((p) => ({ ...p, [key]: Math.max(0, (p[key] || 0) - 1) }));
    setSqlPowerUpsUsed((n) => n + 1);

    switch (key) {
      case 'freeHint':
        setShowHint(true);
        break;
      case 'timeFreeze':
        setSqlTimerFrozen(true);
        if (sqlFreezeTimeoutRef.current) clearTimeout(sqlFreezeTimeoutRef.current);
        sqlFreezeTimeoutRef.current = setTimeout(() => setSqlTimerFrozen(false), 20000);
        break;
      case 'skipLevel':
        nextChallenge();
        break;
      case 'showSchema':
        setHighlightSchema(true);
        setTimeout(() => setHighlightSchema(false), 10000);
        break;
    }
  }, [currentChallenge, sqlPowerUps, nextChallenge]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const tableNames = useMemo(() => Object.keys(tables), [tables]);

  const TABS = [
    { id: 'editor', label: 'Query Editor', Icon: Database },
    { id: 'challenges', label: 'Challenges', Icon: Gamepad2 },
    { id: 'achievements', label: 'Badges', Icon: Award },
    { id: 'samples', label: 'Samples', Icon: BookOpen },
    { id: 'reference', label: 'Reference', Icon: Info },
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <>
      <SEO
        title="SQL Playground | Developer Toolbox"
        description="Practice SQL queries in-browser with sample datasets — no setup needed"
        keywords="sql, query, database, playground, learn, select, join, group by"
      />

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
              <Database size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">SQL Playground</h1>
              <p className="text-xs opacity-50 mt-0.5">Write and run SQL queries against sample datasets — right in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sqlTotalScore > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning">
                <Star size={13} />
                <span className="text-xs font-bold font-mono">{sqlTotalScore}</span>
              </div>
            )}
            {sqlUnlockedAchievements.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                <Award size={13} />
                <span className="text-xs font-bold font-mono">{sqlUnlockedAchievements.length}/{SQL_ACHIEVEMENTS.length}</span>
              </div>
            )}
            <button onClick={resetDB} className="btn btn-sm btn-ghost btn-error gap-1.5">
              <RotateCcw size={14} /> Reset DB
            </button>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="tabs tabs-box tabs-sm">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`tab gap-1.5 ${tab === id ? 'tab-active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={13} /> {label}
                {id === 'challenges' && completedChallenges.length > 0 && (
                  <span className="badge badge-xs badge-warning">{completedChallenges.length}/{SQL_CHALLENGES.length}</span>
                )}
                {id === 'achievements' && sqlUnlockedAchievements.length > 0 && (
                  <span className="badge badge-xs badge-info">{sqlUnlockedAchievements.length}</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Combo Indicator ── */}
        <AnimatePresence>
          <SqlComboIndicator combo={sqlCombo} show={showSqlCombo} />
        </AnimatePresence>

        {/* ── Achievement Popup ── */}
        <AnimatePresence>
          {sqlAchievementPopup && (
            <SqlAchievementPopup
              achievement={sqlAchievementPopup}
              onClose={() => setSqlAchievementPopup(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ═══ EDITOR TAB ═══ */}
          {tab === 'editor' && (
            <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col lg:flex-row gap-5">

                {/* ── Left Sidebar — Schema + History ── */}
                <div className="w-full lg:w-64 shrink-0 space-y-4">

                  {/* Schema */}
                  <div className="section-card p-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
                      <Table2 size={12} /> Tables ({tableNames.length})
                    </h3>
                    <SchemaViewer tables={tables} />
                  </div>

                  {/* History */}
                  <div className="section-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
                        <Clock size={12} /> History
                      </h3>
                      {history.length > 0 && (
                        <button
                          onClick={() => setHistory([])}
                          className="btn btn-ghost btn-xs gap-1 opacity-40 hover:opacity-100"
                        >
                          <Trash2 size={10} /> Clear
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center py-6">
                        <Clock size={18} className="mx-auto opacity-15 mb-2" />
                        <p className="text-[10px] opacity-30">Run a query to see history</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin">
                        {history.map((entry, i) => (
                          <HistoryItem
                            key={i}
                            entry={entry}
                            onRun={(sql) => { setQuery(sql); runQuery(sql); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Side — Editor + Results ── */}
                <div className="flex-1 min-w-0 space-y-4">

                  {/* Query Editor */}
                  <div className="section-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold">SQL Editor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] opacity-25 hidden sm:inline">Ctrl + Enter to run</span>
                        <button
                          onClick={() => copyToClipboard(query)}
                          className="btn btn-xs btn-ghost gap-1"
                        >
                          {copied ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write your SQL query here..."
                        className="w-full p-4 bg-neutral text-neutral-content font-mono text-[13px] leading-relaxed resize-none focus:outline-none min-h-[120px] placeholder:opacity-30"
                        spellCheck={false}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-300 bg-base-200/30">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => runQuery()}
                          className="btn btn-sm btn-primary gap-1.5"
                        >
                          <Play size={13} /> Run Query
                        </button>
                        <button
                          onClick={() => { setQuery(''); setResult(null); setError(null); }}
                          className="btn btn-sm btn-ghost gap-1"
                        >
                          <Trash2 size={12} /> Clear
                        </button>
                      </div>
                      {duration !== null && (
                        <div className="flex items-center gap-1.5 text-[10px] opacity-40">
                          <Zap size={10} />
                          <span className="font-mono">{duration}ms</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="alert alert-error text-[12px]"
                      >
                        <AlertCircle size={14} />
                        <span className="font-mono">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Results */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="section-card overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-xs font-semibold">
                              {result.message ? 'Result' : `Results (${result.rows?.length || 0} rows)`}
                            </span>
                          </div>
                          {result.columns && (
                            <span className="text-[10px] font-mono opacity-30">
                              {result.columns.length} column{result.columns.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {result.message ? (
                          <div className="p-5 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 text-success text-sm font-semibold">
                              <Check size={16} />
                              {result.message}
                            </div>
                          </div>
                        ) : result.rows?.length === 0 ? (
                          <div className="p-8 text-center">
                            <Database size={20} className="mx-auto opacity-15 mb-2" />
                            <p className="text-xs opacity-30">No rows returned</p>
                          </div>
                        ) : (
                          <ResultsTable columns={result.columns} rows={result.rows} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ CHALLENGES TAB ═══ */}
          {tab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Confetti */}
              <ConfettiBurst active={showConfetti} />

              {/* Timer Frozen Indicator */}
              <AnimatePresence>
                {sqlTimerFrozen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="alert border-2 border-cyan-500/30 bg-cyan-500/10"
                  >
                    <Pause size={16} className="text-cyan-500" />
                    <span className="text-xs font-bold text-cyan-500">❄️ Timer Frozen! You have 20 seconds of peace.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over Modal */}
              <AnimatePresence>
                {gameOverModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setGameOverModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.5, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.5, y: 50 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="section-card p-8 max-w-sm mx-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-4"
                      >
                        💔
                      </motion.div>
                      <h3 className="text-xl font-bold text-error mb-2">Out of Lives!</h3>
                      <p className="text-xs opacity-50 mb-1">
                        Lives regenerate 1 every 2 minutes.
                      </p>
                      <p className="text-xs opacity-40 mb-5">
                        Or refill them now and keep querying!
                      </p>
                      <div className="flex flex-col gap-2">
                        <button onClick={refillSqlLives} className="btn btn-sm btn-primary gap-2 w-full">
                          ❤️ Refill Lives
                        </button>
                        <button onClick={() => setGameOverModal(false)} className="btn btn-sm btn-ghost gap-2 w-full opacity-50">
                          Wait for Regen
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentChallenge ? (
                <div className="space-y-5">
                  {/* Challenge Header — Game HUD */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="section-card p-5"
                  >
                    {/* Top HUD bar */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300/30">
                      <div className="flex items-center gap-3">
                        <LivesDisplay lives={sqlLives} maxLives={SQL_MAX_LIVES} />
                        <div className="w-px h-4 bg-base-300/30" />
                        {sqlStreak > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/25"
                          >
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="text-sm"
                            >🔥</motion.span>
                            <span className="text-[11px] font-bold text-orange-500">{sqlStreak}x</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200/50">
                          <Timer size={12} className="opacity-50" />
                          <span className={`text-xs font-mono font-bold ${challengeTimer > 45 ? 'text-error' : challengeTimer > 30 ? 'text-warning' : 'opacity-70'}`}>
                            {formatTime(challengeTimer)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/10 border border-warning/20">
                          <Star size={12} className="text-warning" />
                          <span className="text-xs font-bold font-mono text-warning">{currentChallenge.points}</span>
                        </div>
                        <button
                          onClick={() => setCurrentChallenge(null)}
                          className="btn btn-xs btn-ghost gap-1 opacity-40 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Challenge info */}
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className="text-2xl"
                      >
                        {currentChallenge.emoji}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${DIFFICULTY_COLORS[currentChallenge.difficulty]}`}>
                            {DIFFICULTY_LABELS[currentChallenge.difficulty]}
                          </div>
                          <span className={`text-[9px] font-semibold ${SQL_WORLD_THEMES[currentChallenge.world]?.color}`}>
                            {SQL_WORLD_THEMES[currentChallenge.world]?.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold">
                          Level {currentChallenge.id}: {currentChallenge.title}
                        </h3>
                        <p className="text-xs opacity-50 mt-0.5">{currentChallenge.description}</p>
                      </div>
                    </div>

                    {/* Tables + actions */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-[10px] opacity-40 font-semibold">Tables:</span>
                      {currentChallenge.tables.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-primary/10 text-primary border border-primary/20">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className={`btn btn-xs gap-1 ${showHint ? 'btn-warning' : 'btn-ghost'}`}
                      >
                        <Lightbulb size={11} />
                        {showHint ? 'Hint Active' : '💡 Use Hint (-30%)'}
                      </button>
                      <button
                        onClick={() => setShowExpected(!showExpected)}
                        className={`btn btn-xs gap-1 ${showExpected ? 'btn-error' : 'btn-ghost'}`}
                      >
                        <Database size={11} />
                        {showExpected ? 'Answer Shown' : '🔑 Show Answer (-50%)'}
                      </button>
                      {challengeAttempts > 0 && (
                        <span className="text-[10px] opacity-30 font-mono ml-auto">
                          {challengeAttempts} attempt{challengeAttempts !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Power-ups */}
                    <div className="mt-3 pt-3 border-t border-base-300/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 flex items-center gap-1">
                          <Shield size={10} /> Power-Ups
                        </span>
                        {highlightSchema && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-info/15 text-info font-bold animate-pulse">📋 Schema highlighted!</span>
                        )}
                      </div>
                      <SqlPowerUpBar powerUps={sqlPowerUps} onUse={useSqlPowerUp} disabled={challengeVerdict === 'success'} />
                    </div>

                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-[11px] text-warning leading-relaxed"
                      >
                        <Lightbulb size={12} className="inline mr-1.5" />
                        {currentChallenge.hint}
                      </motion.div>
                    )}

                    {showExpected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 rounded-lg bg-error/5 border border-error/20"
                      >
                        <span className="text-[10px] font-bold text-error uppercase tracking-wider">⚠️ Example Solution (★ reduced to 1):</span>
                        <pre className="text-[11px] font-mono opacity-60 mt-1 leading-relaxed whitespace-pre-wrap">
                          {currentChallenge.expectedQuery}
                        </pre>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Mini Progress Map */}
                  <div className="section-card px-4 py-2 overflow-x-auto">
                    <SqlMiniProgressMap
                      challenges={SQL_CHALLENGES}
                      completedIds={completedChallenges}
                      currentId={currentChallenge.id}
                      stars={sqlChallengeStars}
                    />
                  </div>

                  {/* Challenge Editor + Results */}
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Schema sidebar */}
                    <div className="w-full lg:w-56 shrink-0">
                      <div className={`section-card p-4 space-y-3 transition-all duration-500 ${highlightSchema ? 'ring-2 ring-info/40 bg-info/[0.03]' : ''}`}>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
                          <Table2 size={12} /> Schema
                          {highlightSchema && <span className="text-[8px] text-info animate-pulse">📋 PEEK</span>}
                        </h3>
                        <SchemaViewer tables={
                          Object.fromEntries(
                            Object.entries(SAMPLE_TABLES).filter(([name]) =>
                              currentChallenge.tables.includes(name)
                            )
                          )
                        } />
                      </div>
                    </div>

                    {/* Editor + Results */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <motion.div
                        animate={shakeWrong ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                        transition={shakeWrong ? { duration: 0.4 } : undefined}
                        className={`section-card overflow-hidden transition-all duration-300 ${
                          challengeVerdict === 'success' ? 'ring-2 ring-success ring-offset-2 ring-offset-base-100' :
                          challengeVerdict === 'wrong' ? 'ring-2 ring-error ring-offset-2 ring-offset-base-100' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              challengeVerdict === 'success' ? 'bg-success' :
                              challengeVerdict === 'wrong' ? 'bg-error' : 'bg-primary animate-pulse'
                            }`} />
                            <span className="text-xs font-semibold">Write Your Query</span>
                            {challengeVerdict === 'wrong' && (
                              <motion.span initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-[9px] text-error font-bold">-1 ❤️</motion.span>
                            )}
                          </div>
                          <span className="text-[9px] opacity-25 hidden sm:inline">Ctrl + Enter to run</span>
                        </div>

                        <div className="relative">
                          <textarea
                            ref={challengeTextareaRef}
                            value={challengeQuery}
                            onChange={(e) => { setChallengeQuery(e.target.value); setChallengeVerdict(null); }}
                            onKeyDown={handleChallengeKeyDown}
                            placeholder="Write your SQL query here to solve the challenge..."
                            className="w-full p-4 bg-neutral text-neutral-content font-mono text-[13px] leading-relaxed resize-none focus:outline-none min-h-[100px] placeholder:opacity-30"
                            spellCheck={false}
                          />
                        </div>

                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-300 bg-base-200/30">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={runChallengeQuery}
                              disabled={challengeVerdict === 'success' || sqlLives <= 0}
                              className={`btn btn-sm gap-1.5 ${challengeVerdict === 'success' ? 'btn-success' : 'btn-primary btn-shimmer'}`}
                            >
                              {challengeVerdict === 'success' ? (
                                <><CheckCircle2 size={13} /> Solved!</>
                              ) : (
                                <><Zap size={13} /> Run &amp; Check</>
                              )}
                            </button>
                            {challengeVerdict === 'success' && (
                              <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={nextChallenge}
                                className="btn btn-sm btn-secondary gap-1.5"
                              >
                                <ArrowRight size={14} /> Next Level
                              </motion.button>
                            )}
                            <button
                              onClick={() => { setChallengeQuery(''); setChallengeResult(null); setChallengeError(null); setChallengeVerdict(null); }}
                              className="btn btn-sm btn-ghost gap-1"
                            >
                              <Trash2 size={12} /> Clear
                            </button>
                          </div>
                        </div>
                      </motion.div>

                      {/* Challenge Error */}
                      <AnimatePresence>
                        {challengeError && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="alert alert-error text-[12px]"
                          >
                            <AlertCircle size={14} />
                            <span className="font-mono">{challengeError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Challenge Query Result */}
                      <AnimatePresence>
                        {challengeResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="section-card overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${challengeVerdict === 'success' ? 'bg-success' : challengeVerdict === 'wrong' ? 'bg-error' : 'bg-info'}`} />
                                <span className="text-xs font-semibold">
                                  {challengeResult.message ? 'Result' : `Your Output (${challengeResult.rows?.length || 0} rows)`}
                                </span>
                                {challengeVerdict === 'success' && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">✓ Correct!</span>
                                )}
                                {challengeVerdict === 'wrong' && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-error/15 text-error font-bold">✗ Not matching</span>
                                )}
                              </div>
                            </div>

                            {challengeResult.message ? (
                              <div className="p-4 text-center text-sm opacity-60">{challengeResult.message}</div>
                            ) : challengeResult.rows?.length === 0 ? (
                              <div className="p-6 text-center">
                                <Database size={18} className="mx-auto opacity-15 mb-2" />
                                <p className="text-xs opacity-30">No rows returned</p>
                              </div>
                            ) : (
                              <ResultsTable columns={challengeResult.columns} rows={challengeResult.rows} />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Success celebration */}
                      <AnimatePresence>
                        {challengeVerdict === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="section-card p-8 text-center border-2 border-success/30 bg-gradient-to-b from-success/[0.05] to-transparent overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-warning/5 to-success/5 animate-pulse" />

                            <motion.div
                              initial={{ rotate: -20, scale: 0 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
                              className="relative"
                            >
                              <span className="text-5xl">🏆</span>
                            </motion.div>

                            <h3 className="text-xl font-bold text-success mt-3 mb-1 relative">Query Mastered!</h3>

                            {/* Star rating */}
                            <div className="flex justify-center mb-3">
                              <StarRating stars={sqlChallengeStars[currentChallenge.id] || 1} size={24} />
                            </div>

                            <p className="text-xs opacity-50 mb-4 relative">
                              Solved in {formatTime(challengeTimer)} · {challengeAttempts} attempt{challengeAttempts !== 1 ? 's' : ''}
                              {sqlStreak > 1 && (
                                <span className="text-orange-500 font-bold"> · 🔥 {sqlStreak}x streak!</span>
                              )}
                            </p>

                            {/* XP breakdown */}
                            {xpGained && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/20 relative"
                              >
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [0, 1.5, 1] }}
                                  transition={{ delay: 0.5, duration: 0.5 }}
                                  className="text-lg"
                                >⚡</motion.span>
                                <span className="text-lg font-bold text-warning font-mono">+{xpGained} XP</span>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : (
                /* Challenge List — World Map */
                <div className="space-y-5">
                  {/* Game Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="section-card p-5 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/5 to-transparent rounded-tr-full" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <span className="text-2xl">🗄️</span> SQL Quest
                        </h3>
                        <p className="text-xs opacity-50 mt-1">
                          Write SQL queries to conquer each level. Earn XP, rank up, and become an SQL Wizard!
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <LivesDisplay lives={sqlLives} maxLives={SQL_MAX_LIVES} />
                        <div className="text-center">
                          <div className="text-lg font-bold font-mono text-warning">{sqlTotalScore}</div>
                          <div className="text-[9px] opacity-40 uppercase font-bold">XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold font-mono text-primary">{completedChallenges.length}/{SQL_CHALLENGES.length}</div>
                          <div className="text-[9px] opacity-40 uppercase font-bold">Cleared</div>
                        </div>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mt-4 relative">
                      <SqlXPProgressBar xp={sqlTotalScore} />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {sqlStreak > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/25 text-[10px] font-bold text-orange-500">
                          🔥 {sqlStreak}x streak
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] opacity-40">
                        ⭐ {Object.values(sqlChallengeStars).reduce((a, b) => a + b, 0)} / {SQL_CHALLENGES.length * 3} stars
                      </div>
                      {completedChallenges.length > 0 && (
                        <button
                          onClick={resetChallengeProgress}
                          className="btn btn-xs btn-ghost opacity-30 hover:opacity-60 ml-auto gap-1"
                        >
                          <RotateCcw size={10} /> Reset All
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Daily Challenge */}
                  <SqlDailyChallengeCard
                    daily={sqlDailyChallenge}
                    isCompleted={sqlDailyDone}
                    onStart={() => startChallenge(sqlDailyChallenge)}
                  />

                  {/* World Map — grouped by world */}
                  {Object.entries(SQL_WORLD_THEMES).map(([worldKey, worldTheme]) => {
                    const worldChallenges = SQL_CHALLENGES.filter((c) => c.world === worldKey);
                    if (worldChallenges.length === 0) return null;
                    const worldCompleted = worldChallenges.filter((c) => completedChallenges.includes(c.id)).length;
                    const allWorldDone = worldCompleted === worldChallenges.length;

                    return (
                      <motion.div
                        key={worldKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`section-card overflow-hidden ${allWorldDone ? 'border-success/30' : ''}`}
                      >
                        {/* World header */}
                        <div className={`px-5 py-3 bg-gradient-to-r ${worldTheme.bg} border-b ${worldTheme.border}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${worldTheme.color}`}>{worldTheme.label}</span>
                              {allWorldDone && <span className="text-xs">✅</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {worldChallenges.map((c) => (
                                <div key={c.id} className={`w-2 h-2 rounded-full ${completedChallenges.includes(c.id) ? 'bg-success' : 'bg-base-300/40'}`} />
                              ))}
                              <span className="text-[9px] font-mono opacity-40 ml-1">{worldCompleted}/{worldChallenges.length}</span>
                            </div>
                          </div>
                        </div>

                        {/* Challenge cards in this world */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {worldChallenges.map((challenge, idx) => {
                            const isCompleted = completedChallenges.includes(challenge.id);
                            const globalIdx = SQL_CHALLENGES.findIndex((c) => c.id === challenge.id);
                            const isLocked = globalIdx > 0 && !completedChallenges.includes(SQL_CHALLENGES[globalIdx - 1].id) && !isCompleted;
                            const stars = sqlChallengeStars[challenge.id] || 0;

                            return (
                              <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.08 }}
                                whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
                                whileTap={!isLocked ? { scale: 0.98 } : {}}
                                className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                  isCompleted
                                    ? 'border-success/30 bg-success/[0.03]'
                                    : isLocked
                                    ? 'opacity-40 cursor-not-allowed border-base-300/20 bg-base-200/20'
                                    : 'border-base-300/30 hover:border-primary/40 hover:shadow-lg bg-base-100'
                                }`}
                                onClick={() => !isLocked && startChallenge(challenge)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                      <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
                                        <span className="text-base">{challenge.emoji}</span>
                                      </div>
                                    ) : isLocked ? (
                                      <div className="w-8 h-8 rounded-full bg-base-300/20 flex items-center justify-center">
                                        <Lock size={14} className="opacity-30" />
                                      </div>
                                    ) : (
                                      <motion.div
                                        animate={{ boxShadow: ['0 0 0 0 rgba(45,121,255,0)', '0 0 0 6px rgba(45,121,255,0.15)', '0 0 0 0 rgba(45,121,255,0)'] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                                      >
                                        <span className="text-base">{challenge.emoji}</span>
                                      </motion.div>
                                    )}
                                    <div>
                                      <h4 className="text-[11px] font-bold leading-tight">{challenge.title}</h4>
                                      <span className={`text-[9px] font-bold ${DIFFICULTY_COLORS[challenge.difficulty].split(' ')[1]}`}>
                                        {DIFFICULTY_LABELS[challenge.difficulty]}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[10px] opacity-40 mb-2 leading-relaxed line-clamp-2">{challenge.description}</p>

                                {/* Tables badges */}
                                <div className="flex gap-1 mb-2">
                                  {challenge.tables.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-base-200/60 opacity-50">{t}</span>
                                  ))}
                                </div>

                                {/* Bottom: stars + points */}
                                <div className="flex items-center justify-between">
                                  {isCompleted ? (
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3].map((s) => (
                                        <span key={s} className={`text-xs ${s <= stars ? 'text-warning' : 'opacity-15'}`}>★</span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3].map((s) => (
                                        <span key={s} className="text-xs opacity-10">★</span>
                                      ))}
                                    </div>
                                  )}
                                  <span className="text-[10px] font-bold text-warning font-mono">
                                    {challenge.points} XP
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Completion celebration */}
                  {completedChallenges.length === SQL_CHALLENGES.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="section-card p-8 text-center border-2 border-warning/30 bg-gradient-to-b from-warning/[0.05] to-transparent"
                    >
                      <span className="text-5xl">🧙</span>
                      <h3 className="text-xl font-bold mt-3 mb-1 gradient-text">SQL Wizard!</h3>
                      <p className="text-xs opacity-50">You've mastered all SQL challenges. The database bows before you!</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {Object.values(sqlChallengeStars).map((s, i) => (
                          <span key={i} className="text-warning text-lg">{'★'.repeat(s)}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ ACHIEVEMENTS TAB ═══ */}
          {tab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Achievement Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="section-card p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-3 mb-4 relative">
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="text-3xl"
                  >🎖️</motion.span>
                  <div>
                    <h3 className="text-lg font-bold">SQL Achievement Gallery</h3>
                    <p className="text-xs opacity-50 mt-0.5">
                      {sqlUnlockedAchievements.length} of {SQL_ACHIEVEMENTS.length} badges unlocked
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="radial-progress text-primary text-[10px] font-bold" style={{
                      '--value': Math.round((sqlUnlockedAchievements.length / SQL_ACHIEVEMENTS.length) * 100),
                      '--size': '3.5rem',
                      '--thickness': '3px',
                    }} role="progressbar">
                      {Math.round((sqlUnlockedAchievements.length / SQL_ACHIEVEMENTS.length) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                  {[
                    { icon: '⚡', label: 'Total XP', value: sqlTotalScore, color: 'text-warning' },
                    { icon: '🔥', label: 'Best Streak', value: `${sqlMaxStreak}x`, color: 'text-orange-500' },
                    { icon: '⏱️', label: 'Fastest Solve', value: sqlFastestSolve > 0 ? `${sqlFastestSolve}s` : '—', color: 'text-primary' },
                    { icon: '🧠', label: 'No-Hint Solves', value: sqlNoHintSolves, color: 'text-secondary' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-base-200/30 border border-base-300/20 text-center">
                      <div className="text-lg mb-0.5">{stat.icon}</div>
                      <div className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-[9px] opacity-40 uppercase font-bold mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Achievement Grid */}
              <SqlAchievementGallery unlockedIds={sqlUnlockedAchievements} />

              {/* Power-up Inventory */}
              <div className="section-card p-5">
                <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-primary" /> Power-Up Inventory
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(SQL_POWER_UPS).map(([key, pu]) => (
                    <div key={key} className="p-4 rounded-xl border border-base-300/30 bg-base-200/20 text-center">
                      <div className="text-2xl mb-2">{pu.icon}</div>
                      <h5 className="text-xs font-bold">{pu.label}</h5>
                      <p className="text-[9px] opacity-40 mt-1 mb-2">{pu.description}</p>
                      <div className="text-lg font-bold font-mono text-primary">{sqlPowerUps[key] || 0}</div>
                      <div className="text-[8px] opacity-30 uppercase font-bold">Available</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-30 mt-3 text-center">
                  💡 Earn power-ups by completing challenges! Every 3 clears = +1 Hint & Freeze. Every 4 clears = +1 Skip & Schema.
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ SAMPLE QUERIES TAB ═══ */}
          {tab === 'samples' && (
            <motion.div key="samples" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="section-card p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                  <BookOpen size={14} className="text-primary" /> Sample Queries
                </h3>
                <p className="text-xs opacity-50 mb-4">Click any query to load it into the editor, then switch to the Query Editor tab to run it.</p>

                <div className="space-y-3">
                  {SAMPLE_QUERIES.map((cat) => (
                    <div key={cat.category} className="border border-base-300/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setSampleCategory(sampleCategory === cat.category ? null : cat.category)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-base-200/50 transition-colors"
                      >
                        <span className="text-xs font-bold">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-xs badge-ghost">{cat.queries.length}</span>
                          <ChevronDown
                            size={12}
                            className={`opacity-40 transition-transform duration-200 ${
                              sampleCategory === cat.category ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>
                      <AnimatePresence>
                        {sampleCategory === cat.category && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-base-300/30 p-3 space-y-2">
                              {cat.queries.map((q, i) => (
                                <button
                                  key={i}
                                  onClick={() => { loadSample(q.sql); setTab('editor'); }}
                                  className="w-full text-left p-3 rounded-lg border border-base-300/20 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold group-hover:text-primary transition-colors">
                                      {q.label}
                                    </span>
                                    <Play size={10} className="opacity-0 group-hover:opacity-50 transition-opacity text-primary" />
                                  </div>
                                  <pre className="text-[10px] font-mono opacity-40 leading-relaxed whitespace-pre-wrap">
                                    {q.sql}
                                  </pre>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ REFERENCE TAB ═══ */}
          {tab === 'reference' && (
            <motion.div key="reference" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Overview */}
              <div className="section-card p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Info size={14} className="text-primary" /> SQL Quick Reference
                </h3>
                <p className="text-xs opacity-50 leading-relaxed">
                  SQL (Structured Query Language) is used to communicate with databases. This playground supports
                  a subset of SQL ideal for learning the fundamentals. All queries run entirely in your browser — no server needed.
                </p>
              </div>

              {/* Supported Statements */}
              {[
                {
                  title: 'SELECT — Querying Data',
                  syntax: 'SELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column ASC|DESC\nLIMIT n;',
                  notes: [
                    'Use * to select all columns',
                    'Use DISTINCT to remove duplicates',
                    'Use AS to create column aliases',
                  ],
                },
                {
                  title: 'WHERE — Filtering',
                  syntax: "WHERE column = 'value'\n  AND column > 100\n  OR column IN ('a', 'b')\n  AND column LIKE '%pattern%'\n  AND column BETWEEN 10 AND 100\n  AND column IS NULL",
                  notes: [
                    '% matches any characters in LIKE',
                    '_ matches a single character in LIKE',
                    'IS NULL / IS NOT NULL for null checks',
                  ],
                },
                {
                  title: 'JOIN — Combining Tables',
                  syntax: 'SELECT a.col, b.col\nFROM table_a a\nJOIN table_b b ON a.id = b.a_id;',
                  notes: [
                    'INNER JOIN (or just JOIN) — only matching rows',
                    'LEFT JOIN — all rows from left table + matches from right',
                    'Use table aliases (a, b) for clarity',
                  ],
                },
                {
                  title: 'GROUP BY — Aggregation',
                  syntax: 'SELECT department, COUNT(*), AVG(salary)\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 2;',
                  notes: [
                    'Aggregate functions: COUNT, SUM, AVG, MIN, MAX',
                    'GROUP BY creates groups of rows',
                    'HAVING filters groups (like WHERE for aggregates)',
                  ],
                },
                {
                  title: 'INSERT — Adding Data',
                  syntax: "INSERT INTO table_name\nVALUES (val1, val2, val3);",
                  notes: [
                    'Values must match the column order',
                    'Use NULL for empty values',
                    'Strings must be quoted with single quotes',
                  ],
                },
                {
                  title: 'UPDATE — Modifying Data',
                  syntax: "UPDATE table_name\nSET column = value\nWHERE condition;",
                  notes: [
                    'Always use WHERE to avoid updating all rows',
                    'Can SET multiple columns separated by commas',
                  ],
                },
                {
                  title: 'DELETE — Removing Data',
                  syntax: 'DELETE FROM table_name\nWHERE condition;',
                  notes: [
                    'Always use WHERE to avoid deleting all rows',
                    'Use Reset Database to restore sample data',
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="section-card p-5 space-y-3">
                  <h4 className="text-xs font-bold">{section.title}</h4>
                  <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-[11px] leading-relaxed overflow-x-auto">
                    {section.syntax}
                  </pre>
                  <ul className="space-y-1">
                    {section.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] opacity-50">
                        <span className="text-success mt-0.5">•</span>
                        <span className="leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Available Tables */}
              <div className="section-card p-5 space-y-3">
                <h4 className="text-xs font-bold flex items-center gap-2">
                  <Table2 size={13} className="text-primary" /> Available Sample Tables
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(SAMPLE_TABLES).map(([name, table]) => (
                    <div key={name} className="border border-base-300/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={12} className="text-primary" />
                        <span className="text-xs font-bold font-mono">{name}</span>
                        <span className="badge badge-xs badge-ghost">{table.rows.length} rows</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {table.columns.map((col, i) => (
                          <span
                            key={col}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              i === 0
                                ? 'bg-warning/15 text-warning font-bold'
                                : 'bg-base-200/60 opacity-50'
                            }`}
                          >
                            {col}
                          </span>
                        ))}
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
