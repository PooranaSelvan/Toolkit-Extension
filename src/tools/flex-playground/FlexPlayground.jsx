import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Columns3, Plus, Trash2, RotateCcw, Copy, Check, Code,
  BookOpen, ChevronDown, ChevronUp, Minus, GripVertical,
  Star, Zap, ArrowRight, Eye, EyeOff, Lightbulb,
  Timer, Target, CheckCircle2, Sparkles, Lock, Award,
  Shield, Pause, X, Gamepad2,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import SEO from '../../components/SEO';

// ─── Flexbox property options ──────────────────────────────
const CONTAINER_PROPS = {
  flexDirection:  ['row', 'row-reverse', 'column', 'column-reverse'],
  flexWrap:       ['nowrap', 'wrap', 'wrap-reverse'],
  justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
  alignItems:     ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
  alignContent:   ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
  gap:            [0, 4, 8, 12, 16, 20, 24, 32],
};

const ITEM_PROPS_META = {
  flexGrow:   { min: 0, max: 5, step: 1 },
  flexShrink: { min: 0, max: 5, step: 1 },
  flexBasis:  ['auto', '0', '50px', '100px', '150px', '200px', '25%', '33%', '50%'],
  alignSelf:  ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  order:      { min: -5, max: 5, step: 1 },
};

const ITEM_COLORS = [
  '#2D79FF', '#6366F1', '#8B5CF6', '#06B6D4', '#0EA5E9',
  '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#14B8A6',
  '#F97316', '#8B5CF6', '#3B82F6', '#10B981', '#E11D48',
];

let nextId = 1;

function createItem(label) {
  const id = nextId++;
  return {
    id,
    label: label || `${id}`,
    color: ITEM_COLORS[(id - 1) % ITEM_COLORS.length],
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
    order: 0,
  };
}

// ─── Prop Descriptions (for Learn tab) ─────────────────────
const PROP_DESCRIPTIONS = {
  flexDirection:  'Defines the main axis direction. "row" = horizontal, "column" = vertical.',
  flexWrap:       'Controls whether items wrap to the next line when they overflow.',
  justifyContent: 'Aligns items along the MAIN axis (horizontal in row, vertical in column).',
  alignItems:     'Aligns items along the CROSS axis (vertical in row, horizontal in column).',
  alignContent:   'Aligns wrapped lines. Only works when flex-wrap is enabled and there are multiple lines.',
  gap:            'Adds spacing between flex items without using margins.',
  flexGrow:       'Defines how much an item should grow relative to siblings. 0 = no grow.',
  flexShrink:     'Defines how much an item should shrink when space is limited. 0 = no shrink.',
  flexBasis:      'Sets the initial size of an item before grow/shrink is applied.',
  alignSelf:      'Overrides align-items for this specific item.',
  order:          'Controls the visual order of the item. Lower values appear first.',
};

// ─── Challenge Definitions ─────────────────────────────────
const FLEX_CHALLENGES = [
  {
    id: 1,
    title: 'Center Stage',
    description: 'Center all items both horizontally and vertically.',
    difficulty: 'beginner',
    points: 100,
    hint: 'Think about which properties control the main axis and cross axis alignment.',
    itemCount: 3,
    target: { justifyContent: 'center', alignItems: 'center' },
    requiredProps: ['justifyContent', 'alignItems'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'grasslands',
    emoji: '🎯',
  },
  {
    id: 2,
    title: 'Space Explorer',
    description: 'Distribute items evenly with equal space between them.',
    difficulty: 'beginner',
    points: 100,
    hint: 'There\'s a specific justify-content value that puts equal space between items.',
    itemCount: 4,
    target: { justifyContent: 'space-between' },
    requiredProps: ['justifyContent'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 0 },
    world: 'grasslands',
    emoji: '🚀',
  },
  {
    id: 3,
    title: 'Column Down',
    description: 'Stack items vertically in a column layout.',
    difficulty: 'beginner',
    points: 100,
    hint: 'Change the main axis direction to vertical.',
    itemCount: 3,
    target: { flexDirection: 'column' },
    requiredProps: ['flexDirection'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'grasslands',
    emoji: '⬇️',
  },
  {
    id: 4,
    title: 'End of the Line',
    description: 'Push all items to the end of the main axis and align them to the bottom.',
    difficulty: 'easy',
    points: 150,
    hint: 'Use flex-end for both axes.',
    itemCount: 3,
    target: { justifyContent: 'flex-end', alignItems: 'flex-end' },
    requiredProps: ['justifyContent', 'alignItems'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'desert',
    emoji: '🏁',
  },
  {
    id: 5,
    title: 'Wrap It Up',
    description: 'Make items wrap to the next line with even spacing around each item.',
    difficulty: 'easy',
    points: 150,
    hint: 'You need flex-wrap and a justify-content that distributes space around items.',
    itemCount: 6,
    target: { flexWrap: 'wrap', justifyContent: 'space-around' },
    requiredProps: ['flexWrap', 'justifyContent'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'desert',
    emoji: '🎁',
  },
  {
    id: 6,
    title: 'Reverse Psychology',
    description: 'Reverse the order of items AND center them vertically.',
    difficulty: 'easy',
    points: 150,
    hint: 'There\'s a flex-direction value that reverses the row.',
    itemCount: 4,
    target: { flexDirection: 'row-reverse', alignItems: 'center' },
    requiredProps: ['flexDirection', 'alignItems'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'desert',
    emoji: '🔄',
  },
  {
    id: 7,
    title: 'Mind the Gap',
    description: 'Center items with a 24px gap between them.',
    difficulty: 'medium',
    points: 200,
    hint: 'Combine centering with the gap property.',
    itemCount: 3,
    target: { justifyContent: 'center', alignItems: 'center', gap: 24 },
    requiredProps: ['justifyContent', 'alignItems', 'gap'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'ocean',
    emoji: '🕳️',
  },
  {
    id: 8,
    title: 'Column Reverse Center',
    description: 'Stack items in reverse column order and center them horizontally.',
    difficulty: 'medium',
    points: 200,
    hint: 'In column mode, the cross axis becomes horizontal.',
    itemCount: 3,
    target: { flexDirection: 'column-reverse', alignItems: 'center' },
    requiredProps: ['flexDirection', 'alignItems'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'ocean',
    emoji: '🔃',
  },
  {
    id: 9,
    title: 'Space Evenly Wrapped',
    description: 'Wrap items with space-evenly distribution and center aligned content lines.',
    difficulty: 'medium',
    points: 200,
    hint: 'Use flex-wrap, justify-content: space-evenly, and align-content to center wrapped lines.',
    itemCount: 8,
    target: { flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'center' },
    requiredProps: ['flexWrap', 'justifyContent', 'alignContent'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'volcano',
    emoji: '🌌',
  },
  {
    id: 10,
    title: 'The Grand Flex',
    description: 'Column layout, centered on both axes, with 16px gap, wrapping enabled.',
    difficulty: 'hard',
    points: 300,
    hint: 'Multiple properties need to change. Think column + center + center + wrap + gap.',
    itemCount: 5,
    target: { flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 16 },
    requiredProps: ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'gap'],
    defaults: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: 8 },
    world: 'volcano',
    emoji: '👑',
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
const MAX_LIVES = 5;
const RANKS = [
  { minXP: 0,    title: 'Novice',       icon: '🌱', color: 'text-success' },
  { minXP: 200,  title: 'Apprentice',   icon: '🎯', color: 'text-info' },
  { minXP: 500,  title: 'Journeyman',   icon: '⚡', color: 'text-primary' },
  { minXP: 900,  title: 'Expert',       icon: '🔥', color: 'text-warning' },
  { minXP: 1400, title: 'Master',       icon: '💎', color: 'text-secondary' },
  { minXP: 2000, title: 'Grandmaster',  icon: '👑', color: 'text-error' },
];

const WORLD_THEMES = {
  grasslands: { bg: 'from-emerald-500/10 to-green-500/5', border: 'border-emerald-500/20', label: '🌿 Grasslands', color: 'text-emerald-500' },
  desert:     { bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/20', label: '🏜️ Desert', color: 'text-amber-500' },
  ocean:      { bg: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/20', label: '🌊 Ocean Depths', color: 'text-blue-500' },
  volcano:    { bg: 'from-red-500/10 to-rose-500/5', border: 'border-red-500/20', label: '🌋 Volcano', color: 'text-red-500' },
};

// ─── Achievement / Badge Definitions ───────────────────────
const FLEX_ACHIEVEMENTS = [
  { id: 'first_solve',    icon: '🎉', title: 'First Steps',       description: 'Complete your first challenge', condition: (s) => s.completed >= 1 },
  { id: 'three_star',     icon: '⭐', title: 'Perfectionist',     description: 'Get 3 stars on any challenge', condition: (s) => Object.values(s.stars).some((v) => v === 3) },
  { id: 'streak_3',       icon: '🔥', title: 'On Fire',           description: 'Achieve a 3x streak', condition: (s) => s.maxStreak >= 3 },
  { id: 'streak_5',       icon: '💥', title: 'Unstoppable',       description: 'Achieve a 5x streak', condition: (s) => s.maxStreak >= 5 },
  { id: 'speed_demon',    icon: '⚡', title: 'Speed Demon',       description: 'Solve a challenge in under 10 seconds', condition: (s) => s.fastestSolve > 0 && s.fastestSolve <= 10 },
  { id: 'half_done',      icon: '🏔️', title: 'Halfway There',     description: 'Complete 50% of all challenges', condition: (s) => s.completed >= Math.ceil(FLEX_CHALLENGES.length / 2) },
  { id: 'world_clear',    icon: '🗺️', title: 'World Conqueror',   description: 'Clear all levels in any world', condition: (s) => s.worldsCleared >= 1 },
  { id: 'all_clear',      icon: '👑', title: 'Flexbox Master',    description: 'Complete every challenge', condition: (s) => s.completed >= FLEX_CHALLENGES.length },
  { id: 'no_hint',        icon: '🧠', title: 'Big Brain',         description: 'Complete 5 challenges without hints', condition: (s) => s.noHintSolves >= 5 },
  { id: 'daily_hero',     icon: '📅', title: 'Daily Hero',        description: 'Complete a daily challenge', condition: (s) => s.dailyCompleted >= 1 },
  { id: 'xp_500',         icon: '💎', title: 'XP Hoarder',        description: 'Earn 500 total XP', condition: (s) => s.totalXP >= 500 },
  { id: 'power_user',     icon: '🔋', title: 'Power Player',      description: 'Use a power-up for the first time', condition: (s) => s.powerUpsUsed >= 1 },
];

// ─── Power-up Definitions ──────────────────────────────────
const POWER_UPS = {
  freeHint:    { icon: '💡', label: 'Free Hint',    description: 'Get a hint without XP penalty', cost: 0 },
  timeFreeze:  { icon: '❄️', label: 'Time Freeze',  description: 'Pause the timer for 15 seconds', cost: 0 },
  skipLevel:   { icon: '⏭️', label: 'Skip Level',   description: 'Skip to the next challenge', cost: 0 },
};

// ─── Daily Challenge System ────────────────────────────────
function getDailyChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = seed % FLEX_CHALLENGES.length;
  return { ...FLEX_CHALLENGES[idx], isDaily: true, dailyDate: today.toDateString(), bonusXP: 50 };
}



function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function getNextRank(xp) {
  for (let i = 0; i < RANKS.length; i++) {
    if (xp < RANKS[i].minXP) return RANKS[i];
  }
  return null;
}

function getStars(timer, attempts, hintUsed) {
  let stars = 3;
  if (timer > 45) stars--;
  if (attempts > 3) stars--;
  if (hintUsed) stars--;
  return Math.max(1, stars);
}

// ─── Achievement Badge Popup ───────────────────────────────
function AchievementPopup({ achievement, onClose }) {
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
          >
            {achievement.icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Award size={12} className="text-warning" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-warning">Achievement Unlocked!</span>
            </div>
            <h4 className="text-sm font-bold">{achievement.title}</h4>
            <p className="text-[10px] opacity-50 mt-0.5">{achievement.description}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-square opacity-40 hover:opacity-100">
            <X size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Power-up Bar Component ────────────────────────────────
function PowerUpBar({ powerUps, onUse, disabled }) {
  return (
    <div className="flex items-center gap-2">
      {Object.entries(POWER_UPS).map(([key, pu]) => {
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
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-content text-[8px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Daily Challenge Banner ────────────────────────────────
function DailyChallengeCard({ daily, isCompleted, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card overflow-hidden border-2 border-accent/30"
    >
      <div className="px-5 py-3 bg-gradient-to-r from-accent/10 via-primary/5 to-secondary/10 border-b border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-lg"
            >📅</motion.span>
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                Daily Challenge
                <span className="px-1.5 py-0.5 rounded-md text-[8px] bg-accent/15 text-accent font-bold border border-accent/25">+{daily.bonusXP} BONUS XP</span>
              </h4>
              <p className="text-[9px] opacity-40 mt-0.5">Refreshes every 24 hours</p>
            </div>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 size={12} className="text-success" />
              <span className="text-[10px] font-bold text-success">Completed!</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="btn btn-sm btn-accent gap-1.5"
            >
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

// ─── Combo Indicator Component ─────────────────────────────
function ComboIndicator({ combo, show }) {
  if (!show || combo <= 1) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 2, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -40 }}
      className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 0.3 }}
          className="text-5xl font-black"
          style={{ textShadow: '0 2px 20px rgba(255, 159, 28, 0.5)' }}
        >
          <span className="gradient-text">{combo}x COMBO!</span>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="h-1 rounded-full bg-gradient-to-r from-warning via-primary to-secondary mt-2"
        />
      </div>
    </motion.div>
  );
}



// ─── Achievement Gallery Panel ─────────────────────────────
function AchievementGallery({ unlockedIds }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {FLEX_ACHIEVEMENTS.map((ach) => {
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
            <motion.div
              className="text-2xl mb-2"
              animate={unlocked ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            >
              {unlocked ? ach.icon : '🔒'}
            </motion.div>
            <h5 className="text-[10px] font-bold leading-tight">{ach.title}</h5>
            <p className="text-[9px] opacity-40 mt-1 leading-relaxed">{ach.description}</p>
            {unlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-warning-content text-[8px] flex items-center justify-center font-bold shadow-sm">
                ✓
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Mini Progress Map ─────────────────────────────────────
function MiniProgressMap({ challenges, completedIds, currentId, stars }) {
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
                done
                  ? 'bg-success/15 border-2 border-success/40 text-success'
                  : isCurrent
                  ? 'bg-primary/15 border-2 border-primary/40 text-primary ring-2 ring-primary/20'
                  : 'bg-base-200/40 border border-base-300/30 opacity-40'
              }`}
              title={`Level ${ch.id}: ${ch.title}${done ? ` (${s}★)` : ''}`}
            >
              {done ? <span className="text-[10px]">{ch.emoji}</span> : <span className="text-[9px]">{ch.id}</span>}
              {done && s > 0 && (
                <div className="absolute -bottom-1.5 flex gap-px">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={`text-[6px] ${i <= s ? 'text-warning' : 'opacity-20'}`}>★</span>
                  ))}
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
function XPProgressBar({ xp }) {
  const rank = getRank(xp);
  const next = getNextRank(xp);
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

// ─── Property Selector Component ───────────────────────────
function PropSelect({ label, value, options, onChange, description, highlight }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={`text-[11px] font-bold uppercase tracking-wider ${highlight ? 'text-primary opacity-100' : 'opacity-50'}`}>
          {label}
          {highlight && <span className="ml-1 text-primary animate-pulse">●</span>}
        </label>
        {description && (
          <span className="text-[9px] opacity-30 max-w-[160px] text-right hidden lg:inline">{description}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isActive = typeof opt === 'number' ? value === opt : value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all duration-150 border ${
                isActive
                  ? 'bg-primary text-primary-content border-primary shadow-sm'
                  : 'border-base-300/50 hover:border-primary/30 hover:bg-primary/5 opacity-60 hover:opacity-100'
              }`}
            >
              {typeof opt === 'number' ? `${opt}px` : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Number Stepper for Item Props ─────────────────────────
function NumStepper({ label, value, onChange, min, max, step = 1 }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-50">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="btn btn-xs btn-ghost border border-base-300 btn-square disabled:opacity-20"
        >
          <Minus size={10} />
        </button>
        <span className="text-xs font-mono font-bold w-6 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="btn btn-xs btn-ghost border border-base-300 btn-square disabled:opacity-20"
        >
          <Plus size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Item Card in Sidebar ──────────────────────────────────
function ItemEditor({ item, isSelected, onSelect, onUpdate, onRemove }) {
  return (
    <div
      className={`rounded-lg border transition-all duration-150 overflow-hidden ${
        isSelected
          ? 'border-primary/40 bg-primary/[0.03] shadow-sm'
          : 'border-base-300/40 hover:border-base-300/60'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => onSelect(item.id)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <div className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
        <span className={`font-mono text-xs flex-1 ${isSelected ? 'font-bold text-primary' : 'opacity-70'}`}>
          Item {item.label}
        </span>
        <ChevronDown
          size={12}
          className={`opacity-30 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}
        />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-60 btn-square"
          style={{ opacity: isSelected ? 0.6 : undefined }}
        >
          <Trash2 size={10} />
        </button>
      </button>

      {/* Expanded Props */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-base-300/30">
              <div className="grid grid-cols-3 gap-2">
                <NumStepper
                  label="grow"
                  value={item.flexGrow}
                  onChange={(v) => onUpdate(item.id, 'flexGrow', v)}
                  {...ITEM_PROPS_META.flexGrow}
                />
                <NumStepper
                  label="shrink"
                  value={item.flexShrink}
                  onChange={(v) => onUpdate(item.id, 'flexShrink', v)}
                  {...ITEM_PROPS_META.flexShrink}
                />
                <NumStepper
                  label="order"
                  value={item.order}
                  onChange={(v) => onUpdate(item.id, 'order', v)}
                  {...ITEM_PROPS_META.order}
                />
              </div>
              <PropSelect
                label="flex-basis"
                value={item.flexBasis}
                options={ITEM_PROPS_META.flexBasis}
                onChange={(v) => onUpdate(item.id, 'flexBasis', v)}
              />
              <PropSelect
                label="align-self"
                value={item.alignSelf}
                options={ITEM_PROPS_META.alignSelf}
                onChange={(v) => onUpdate(item.id, 'alignSelf', v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Challenge Preview Box ─────────────────────────────────
function ChallengePreviewBox({ containerStyle, items, label }) {
  return (
    <div className="space-y-2">
      {label && <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">{label}</span>}
      <div style={containerStyle} className="relative">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center rounded-lg select-none"
            style={{
              backgroundColor: item.color,
              color: '#fff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              minWidth: 36,
              minHeight: 36,
              padding: '8px 12px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function FlexPlayground() {
  // Container state
  const [container, setContainer] = useState({
    flexDirection:  'row',
    flexWrap:       'nowrap',
    justifyContent: 'flex-start',
    alignItems:     'stretch',
    alignContent:   'stretch',
    gap:            8,
  });

  // Items
  const [items, setItems] = useState(() => [
    createItem('1'),
    createItem('2'),
    createItem('3'),
  ]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // UI
  const [codeExpanded, setCodeExpanded] = useState(true);
  const [tab, setTab] = useState('playground');

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeContainer, setChallengeContainer] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flex-challenges-completed') || '[]'); } catch { return []; }
  });
  const [totalScore, setTotalScore] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-challenges-score') || '0', 10); } catch { return 0; }
  });
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [showTarget, setShowTarget] = useState(true);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const timerRef = useRef(null);
  const [challengeAttempts, setChallengeAttempts] = useState(0);

  // Game state
  const [lives, setLives] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-game-lives') || String(MAX_LIVES), 10); } catch { return MAX_LIVES; }
  });
  const [challengeStars, setChallengeStars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flex-challenge-stars') || '{}'); } catch { return {}; }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpGained, setXpGained] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [gameOverModal, setGameOverModal] = useState(false);

  // Achievement state
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flex-achievements') || '[]'); } catch { return []; }
  });
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [maxStreak, setMaxStreak] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-max-streak') || '0', 10); } catch { return 0; }
  });
  const [fastestSolve, setFastestSolve] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-fastest-solve') || '0', 10); } catch { return 0; }
  });
  const [noHintSolves, setNoHintSolves] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-no-hint-solves') || '0', 10); } catch { return 0; }
  });
  const [dailyCompleted, setDailyCompleted] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-daily-completed') || '0', 10); } catch { return 0; }
  });
  const [powerUpsUsed, setPowerUpsUsed] = useState(() => {
    try { return parseInt(localStorage.getItem('flex-powerups-used') || '0', 10); } catch { return 0; }
  });

  // Power-up state
  const [powerUps, setPowerUps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flex-powerups') || '{"freeHint":2,"timeFreeze":2,"skipLevel":1}'); } catch { return { freeHint: 2, timeFreeze: 2, skipLevel: 1 }; }
  });
  const [timerFrozen, setTimerFrozen] = useState(false);
  const freezeTimeoutRef = useRef(null);

  // Daily challenge state
  const [dailyChallenge] = useState(() => getDailyChallenge());
  const [dailyDone, setDailyDone] = useState(() => {
    try {
      const stored = localStorage.getItem('flex-daily-done-date');
      return stored === new Date().toDateString();
    } catch { return false; }
  });

  // Combo state
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const comboTimeoutRef = useRef(null);

  const { copied, copyToClipboard } = useCopyToClipboard();

  // ── Persist challenge progress ──
  useEffect(() => {
    localStorage.setItem('flex-challenges-completed', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  useEffect(() => {
    localStorage.setItem('flex-challenges-score', String(totalScore));
  }, [totalScore]);

  useEffect(() => {
    localStorage.setItem('flex-game-lives', String(lives));
  }, [lives]);

  useEffect(() => {
    localStorage.setItem('flex-challenge-stars', JSON.stringify(challengeStars));
  }, [challengeStars]);

  useEffect(() => {
    localStorage.setItem('flex-achievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem('flex-max-streak', String(maxStreak));
  }, [maxStreak]);

  useEffect(() => {
    localStorage.setItem('flex-fastest-solve', String(fastestSolve));
  }, [fastestSolve]);

  useEffect(() => {
    localStorage.setItem('flex-no-hint-solves', String(noHintSolves));
  }, [noHintSolves]);

  useEffect(() => {
    localStorage.setItem('flex-daily-completed', String(dailyCompleted));
  }, [dailyCompleted]);

  useEffect(() => {
    localStorage.setItem('flex-powerups-used', String(powerUpsUsed));
  }, [powerUpsUsed]);

  useEffect(() => {
    localStorage.setItem('flex-powerups', JSON.stringify(powerUps));
  }, [powerUps]);

  // ── Achievement checker ──
  const checkAchievements = useCallback(() => {
    const worldsCleared = Object.keys(WORLD_THEMES).filter((worldKey) => {
      const worldChallenges = FLEX_CHALLENGES.filter((c) => c.world === worldKey);
      return worldChallenges.every((c) => completedChallenges.includes(c.id));
    }).length;

    const stats = {
      completed: completedChallenges.length,
      stars: challengeStars,
      maxStreak,
      fastestSolve,
      noHintSolves,
      dailyCompleted,
      totalXP: totalScore,
      worldsCleared,
      powerUpsUsed,
    };

    const newUnlocked = [];
    for (const ach of FLEX_ACHIEVEMENTS) {
      if (!unlockedAchievements.includes(ach.id) && ach.condition(stats)) {
        newUnlocked.push(ach);
      }
    }

    if (newUnlocked.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...newUnlocked.map((a) => a.id)]);
      // Show popup for first new achievement
      setAchievementPopup(newUnlocked[0]);
      setTimeout(() => setAchievementPopup(null), 4000);
    }
  }, [completedChallenges, challengeStars, maxStreak, fastestSolve, noHintSolves, dailyCompleted, totalScore, unlockedAchievements, powerUpsUsed]);

  // Check achievements whenever stats change
  useEffect(() => {
    checkAchievements();
  }, [completedChallenges.length, totalScore, maxStreak, fastestSolve, noHintSolves, dailyCompleted, powerUpsUsed]);

  // ── Lives regen (1 life every 2 minutes) ──
  useEffect(() => {
    if (lives < MAX_LIVES) {
      const timer = setInterval(() => {
        setLives((l) => Math.min(MAX_LIVES, l + 1));
      }, 120000);
      return () => clearInterval(timer);
    }
    return () => {};
  }, [lives]);

  // ── Challenge timer (respects freeze) ──
  useEffect(() => {
    if (currentChallenge && !challengeResult) {
      timerRef.current = setInterval(() => {
        if (!timerFrozen) {
          setChallengeTimer((t) => t + 1);
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentChallenge, challengeResult, timerFrozen]);

  // ── Updaters ──
  const updateContainer = useCallback((key, value) => {
    setContainer((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => {
      const newItem = createItem(String(prev.length + 1));
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItemId((prev) => (prev === id ? null : prev));
  }, []);

  const updateItem = useCallback((id, key, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }, []);

  const handleReset = useCallback(() => {
    nextId = 1;
    setContainer({
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'stretch',
      gap: 8,
    });
    setItems([createItem('1'), createItem('2'), createItem('3')]);
    setSelectedItemId(null);
  }, []);

  // ── Challenge handlers ──
  const startChallenge = useCallback((challenge) => {
    if (lives <= 0) {
      setGameOverModal(true);
      return;
    }
    setCurrentChallenge(challenge);
    setChallengeContainer({ ...challenge.defaults });
    setChallengeResult(null);
    setShowHint(false);
    setShowTarget(true);
    setChallengeTimer(0);
    setChallengeAttempts(0);
    setXpGained(null);
    setShowConfetti(false);
    setShakeWrong(false);
  }, [lives]);

  const checkChallenge = useCallback(() => {
    if (!currentChallenge || !challengeContainer) return;

    const target = currentChallenge.target;
    const allMatch = Object.entries(target).every(([key, val]) => challengeContainer[key] === val);

    setChallengeAttempts((a) => a + 1);

    if (allMatch) {
      setChallengeResult('success');
      if (timerRef.current) clearInterval(timerRef.current);

      // Calculate stars
      const stars = getStars(challengeTimer, challengeAttempts + 1, showHint);
      setChallengeStars((prev) => ({
        ...prev,
        [currentChallenge.id]: Math.max(prev[currentChallenge.id] || 0, stars),
      }));

      // Track fastest solve
      if (fastestSolve === 0 || challengeTimer < fastestSolve) {
        setFastestSolve(challengeTimer);
      }

      // Track no-hint solves
      if (!showHint) {
        setNoHintSolves((n) => n + 1);
      }

      if (!completedChallenges.includes(currentChallenge.id)) {
        const timeBonus = Math.max(0, 30 - challengeTimer) * 5;
        const hintPenalty = showHint ? Math.floor(currentChallenge.points * 0.3) : 0;
        const attemptPenalty = Math.max(0, challengeAttempts * 10);
        const streakBonus = streak * 25;
        const comboBonus = combo * 15;
        const dailyBonus = currentChallenge.isDaily ? (currentChallenge.bonusXP || 50) : 0;
        const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1;
        const earned = Math.max(10, Math.floor((currentChallenge.points + timeBonus + streakBonus + comboBonus + dailyBonus - hintPenalty - attemptPenalty) * starMultiplier));

        setTotalScore((s) => s + earned);
        setCompletedChallenges((prev) => [...prev, currentChallenge.id]);
        setStreak((s) => {
          const newStreak = s + 1;
          setMaxStreak((m) => Math.max(m, newStreak));
          return newStreak;
        });
        setXpGained(earned);

        // Track daily
        if (currentChallenge.isDaily) {
          setDailyCompleted((d) => d + 1);
          setDailyDone(true);
          localStorage.setItem('flex-daily-done-date', new Date().toDateString());
        }

        // Combo system
        setCombo((c) => c + 1);
        setShowCombo(true);
        if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
        comboTimeoutRef.current = setTimeout(() => { setShowCombo(false); setCombo(0); }, 5000);

        // Award power-ups on milestones
        const newCompleted = completedChallenges.length + 1;
        if (newCompleted % 3 === 0) {
          setPowerUps((p) => ({ ...p, freeHint: (p.freeHint || 0) + 1, timeFreeze: (p.timeFreeze || 0) + 1 }));
        }
        if (newCompleted % 5 === 0) {
          setPowerUps((p) => ({ ...p, skipLevel: (p.skipLevel || 0) + 1 }));
        }
      }

      // Celebration!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setChallengeResult('wrong');
      setShakeWrong(true);
      setStreak(0);
      setCombo(0);
      setLives((l) => Math.max(0, l - 1));

      if (lives <= 1) {
        setTimeout(() => setGameOverModal(true), 800);
      }

      setTimeout(() => {
        setChallengeResult(null);
        setShakeWrong(false);
      }, 1500);
    }
  }, [currentChallenge, challengeContainer, completedChallenges, challengeTimer, showHint, streak, challengeAttempts, lives, combo, fastestSolve]);

  const updateChallengeContainer = useCallback((key, value) => {
    setChallengeContainer((prev) => ({ ...prev, [key]: value }));
    setChallengeResult(null);
  }, []);

  const nextChallenge = useCallback(() => {
    const idx = FLEX_CHALLENGES.findIndex((c) => c.id === currentChallenge?.id);
    if (idx < FLEX_CHALLENGES.length - 1) {
      startChallenge(FLEX_CHALLENGES[idx + 1]);
    } else {
      setCurrentChallenge(null);
    }
  }, [currentChallenge, startChallenge]);

  const resetChallengeProgress = useCallback(() => {
    setCompletedChallenges([]);
    setTotalScore(0);
    setStreak(0);
    setLives(MAX_LIVES);
    setChallengeStars({});
    setCurrentChallenge(null);
    setGameOverModal(false);
    setUnlockedAchievements([]);
    setMaxStreak(0);
    setFastestSolve(0);
    setNoHintSolves(0);
    setDailyCompleted(0);
    setPowerUpsUsed(0);
    setPowerUps({ freeHint: 2, timeFreeze: 2, skipLevel: 1 });
    setCombo(0);
    localStorage.removeItem('flex-challenges-completed');
    localStorage.removeItem('flex-challenges-score');
    localStorage.removeItem('flex-game-lives');
    localStorage.removeItem('flex-challenge-stars');
    localStorage.removeItem('flex-achievements');
    localStorage.removeItem('flex-max-streak');
    localStorage.removeItem('flex-fastest-solve');
    localStorage.removeItem('flex-no-hint-solves');
    localStorage.removeItem('flex-daily-completed');
    localStorage.removeItem('flex-powerups-used');
    localStorage.removeItem('flex-powerups');
    localStorage.removeItem('flex-daily-done-date');
  }, []);

  const refillLives = useCallback(() => {
    setLives(MAX_LIVES);
    setGameOverModal(false);
  }, []);

  // ── Power-up handlers ──
  const usePowerUp = useCallback((key) => {
    if (!currentChallenge || (powerUps[key] || 0) <= 0) return;

    setPowerUps((p) => ({ ...p, [key]: Math.max(0, (p[key] || 0) - 1) }));
    setPowerUpsUsed((n) => n + 1);

    switch (key) {
      case 'freeHint':
        setShowHint(true);
        break;
      case 'timeFreeze':
        setTimerFrozen(true);
        if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
        freezeTimeoutRef.current = setTimeout(() => setTimerFrozen(false), 15000);
        break;
      case 'skipLevel':
        nextChallenge();
        break;
    }
  }, [currentChallenge, powerUps, nextChallenge]);

  // ── Code generation ──
  const cssCode = useMemo(() => {
    const lines = ['.container {', '  display: flex;'];
    if (container.flexDirection !== 'row') lines.push(`  flex-direction: ${container.flexDirection};`);
    if (container.flexWrap !== 'nowrap') lines.push(`  flex-wrap: ${container.flexWrap};`);
    if (container.justifyContent !== 'flex-start') lines.push(`  justify-content: ${container.justifyContent};`);
    if (container.alignItems !== 'stretch') lines.push(`  align-items: ${container.alignItems};`);
    if (container.alignContent !== 'stretch' && container.flexWrap !== 'nowrap') lines.push(`  align-content: ${container.alignContent};`);
    if (container.gap > 0) lines.push(`  gap: ${container.gap}px;`);
    lines.push('}');

    items.forEach((item, idx) => {
      const itemLines = [];
      if (item.flexGrow !== 0) itemLines.push(`  flex-grow: ${item.flexGrow};`);
      if (item.flexShrink !== 1) itemLines.push(`  flex-shrink: ${item.flexShrink};`);
      if (item.flexBasis !== 'auto') itemLines.push(`  flex-basis: ${item.flexBasis};`);
      if (item.alignSelf !== 'auto') itemLines.push(`  align-self: ${item.alignSelf};`);
      if (item.order !== 0) itemLines.push(`  order: ${item.order};`);
      if (itemLines.length > 0) {
        lines.push('');
        lines.push(`.item-${idx + 1} {`);
        lines.push(...itemLines);
        lines.push('}');
      }
    });

    return lines.join('\n');
  }, [container, items]);

  const htmlCode = useMemo(() => {
    const lines = ['<div class="container">'];
    items.forEach((_, idx) => {
      lines.push(`  <div class="item-${idx + 1}">${idx + 1}</div>`);
    });
    lines.push('</div>');
    return lines.join('\n');
  }, [items]);

  const fullCode = `${htmlCode}\n\n${cssCode}`;

  // ── Container style for preview ──
  const previewStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: container.flexDirection,
    flexWrap: container.flexWrap,
    justifyContent: container.justifyContent,
    alignItems: container.alignItems,
    alignContent: container.alignContent,
    gap: `${container.gap}px`,
    minHeight: 320,
    padding: 16,
    width: '100%',
    borderRadius: 12,
    border: '2px dashed',
    borderColor: 'color-mix(in oklch, var(--color-primary) 25%, transparent)',
    background: 'color-mix(in oklch, var(--color-primary) 3%, transparent)',
    transition: 'all 0.3s ease',
  }), [container]);

  // ── Challenge styles ──
  const challengePreviewStyle = useCallback((containerObj) => ({
    display: 'flex',
    flexDirection: containerObj.flexDirection,
    flexWrap: containerObj.flexWrap,
    justifyContent: containerObj.justifyContent,
    alignItems: containerObj.alignItems,
    alignContent: containerObj.alignContent,
    gap: `${containerObj.gap}px`,
    minHeight: 200,
    padding: 12,
    width: '100%',
    borderRadius: 12,
    border: '2px dashed',
    borderColor: 'color-mix(in oklch, var(--color-primary) 25%, transparent)',
    background: 'color-mix(in oklch, var(--color-primary) 3%, transparent)',
    transition: 'all 0.3s ease',
  }), []);

  const challengeItems = useMemo(() => {
    if (!currentChallenge) return [];
    return Array.from({ length: currentChallenge.itemCount }, (_, i) => ({
      label: `${i + 1}`,
      color: ITEM_COLORS[i % ITEM_COLORS.length],
    }));
  }, [currentChallenge]);

  const targetContainerStyle = useMemo(() => {
    if (!currentChallenge) return {};
    const merged = { ...currentChallenge.defaults, ...currentChallenge.target };
    return challengePreviewStyle(merged);
  }, [currentChallenge, challengePreviewStyle]);

  const userContainerStyle = useMemo(() => {
    if (!challengeContainer) return {};
    return challengePreviewStyle(challengeContainer);
  }, [challengeContainer, challengePreviewStyle]);

  const getPropMatchStatus = useCallback((propKey) => {
    if (!currentChallenge || !challengeContainer) return 'neutral';
    if (!currentChallenge.target[propKey]) return 'neutral';
    return challengeContainer[propKey] === currentChallenge.target[propKey] ? 'correct' : 'wrong';
  }, [currentChallenge, challengeContainer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  

  const TABS = [
    { id: 'playground', label: 'Playground', Icon: Columns3 },
    { id: 'challenges', label: 'Challenges', Icon: Gamepad2 },
    { id: 'achievements', label: 'Badges', Icon: Award },
    { id: 'learn', label: 'Learn', Icon: BookOpen },
  ];

  // ═══════════════════════════════════════════════════════════
  return (
    <>
      <SEO
        title="Flexbox Playground | Developer Toolbox"
        description="Interactive CSS Flexbox playground — learn flex properties visually"
        keywords="flexbox, css, layout, playground, flex-direction, justify-content, align-items"
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
              <Columns3 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Flexbox Playground</h1>
              <p className="text-xs opacity-50 mt-0.5">Learn CSS Flexbox visually — tweak properties and see live results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalScore > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning">
                <Star size={13} />
                <span className="text-xs font-bold font-mono">{totalScore}</span>
              </div>
            )}
            {unlockedAchievements.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                <Award size={13} />
                <span className="text-xs font-bold font-mono">{unlockedAchievements.length}/{FLEX_ACHIEVEMENTS.length}</span>
              </div>
            )}
            <button onClick={handleReset} className="btn btn-sm btn-ghost btn-error gap-1.5">
              <RotateCcw size={14} /> Reset
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
                  <span className="badge badge-xs badge-warning">{completedChallenges.length}/{FLEX_CHALLENGES.length}</span>
                )}
                {id === 'achievements' && unlockedAchievements.length > 0 && (
                  <span className="badge badge-xs badge-info">{unlockedAchievements.length}</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Combo Indicator ── */}
        <AnimatePresence>
          <ComboIndicator combo={combo} show={showCombo} />
        </AnimatePresence>

        {/* ── Achievement Popup ── */}
        <AnimatePresence>
          {achievementPopup && (
            <AchievementPopup
              achievement={achievementPopup}
              onClose={() => setAchievementPopup(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ═══ PLAYGROUND TAB ═══ */}
          {tab === 'playground' && (
            <motion.div key="pg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col lg:flex-row gap-5">

                {/* ── Left Sidebar — Controls ── */}
                <div className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4">

                  {/* Container Properties */}
                  <div className="section-card p-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
                      <Columns3 size={12} /> Container
                    </h3>
                    {Object.entries(CONTAINER_PROPS).map(([key, options]) => (
                      <PropSelect
                        key={key}
                        label={key.replace(/([A-Z])/g, '-$1').toLowerCase()}
                        value={container[key]}
                        options={options}
                        onChange={(v) => updateContainer(key, v)}
                      />
                    ))}
                  </div>

                  {/* Items */}
                  <div className="section-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-40">
                        Items ({items.length})
                      </h3>
                      <div className="flex items-center gap-1">
                        {items.length > 0 && (
                          <button
                            onClick={() => { nextId = 1; setItems([]); setSelectedItemId(null); }}
                            className="btn btn-ghost btn-xs gap-1 opacity-40 hover:opacity-100"
                          >
                            <Trash2 size={10} /> Clear
                          </button>
                        )}
                        <button onClick={addItem} className="btn btn-xs btn-primary gap-1">
                          <Plus size={10} /> Add
                        </button>
                      </div>
                    </div>

                    {items.length === 0 ? (
                      <div className="text-center py-6">
                        <GripVertical size={20} className="mx-auto opacity-15 mb-2" />
                        <p className="text-[11px] opacity-30">Add items to the flex container</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-thin pr-0.5">
                        {items.map((item) => (
                          <ItemEditor
                            key={item.id}
                            item={item}
                            isSelected={selectedItemId === item.id}
                            onSelect={setSelectedItemId}
                            onUpdate={updateItem}
                            onRemove={removeItem}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Side — Preview + Code ── */}
                <div className="flex-1 min-w-0 space-y-5">

                  {/* Live Preview */}
                  <div className="section-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold">
                          Live Preview
                          <span className="opacity-40 ml-1.5 font-normal">
                            {container.flexDirection} · {container.justifyContent}
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-30">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="p-5">
                      <div style={previewStyle}>
                        {items.length === 0 ? (
                          <div className="flex items-center justify-center w-full text-[11px] opacity-30">
                            Add items to see them here
                          </div>
                        ) : (
                          items.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              onClick={() => setSelectedItemId(item.id)}
                              className={`flex items-center justify-center rounded-lg cursor-pointer select-none transition-all duration-150 ${
                                selectedItemId === item.id
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-base-100 shadow-lg scale-[1.03]'
                                  : 'hover:brightness-110 hover:shadow-md'
                              }`}
                              style={{
                                backgroundColor: item.color,
                                color: '#fff',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13,
                                fontWeight: 700,
                                minWidth: 48,
                                minHeight: 48,
                                padding: '12px 16px',
                                flexGrow: item.flexGrow,
                                flexShrink: item.flexShrink,
                                flexBasis: item.flexBasis,
                                alignSelf: item.alignSelf,
                                order: item.order,
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              }}
                            >
                              {item.label}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Axis Indicators */}
                    <div className="flex items-center gap-4 px-5 pb-4 text-[10px] opacity-40 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-0.5 rounded-full bg-primary" />
                        Main Axis ({container.flexDirection.includes('row') ? '→ Horizontal' : '↓ Vertical'})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-0.5 h-4 rounded-full bg-secondary" />
                        Cross Axis ({container.flexDirection.includes('row') ? '↓ Vertical' : '→ Horizontal'})
                      </span>
                    </div>
                  </div>

                  {/* Generated Code */}
                  <div className="section-card overflow-hidden">
                    <button
                      onClick={() => setCodeExpanded(!codeExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-base-200/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Code size={14} className="text-primary" />
                        <span className="text-sm font-semibold">Generated Code</span>
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
                            <div className="flex items-center justify-between px-4 py-2 border-b border-base-300/50">
                              <span className="text-[11px] font-semibold opacity-50">HTML + CSS</span>
                              <button
                                onClick={() => copyToClipboard(fullCode)}
                                className="btn btn-xs btn-primary gap-1"
                              >
                                {copied ? <Check size={11} /> : <Copy size={11} />}
                                <span className="text-[10px]">{copied ? 'Copied!' : 'Copy All'}</span>
                              </button>
                            </div>
                            <pre className="p-4 bg-neutral text-neutral-content font-mono text-[12px] leading-relaxed overflow-x-auto max-h-72 scrollbar-thin">
                              {fullCode}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                {timerFrozen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="alert border-2 border-cyan-500/30 bg-cyan-500/10"
                  >
                    <Pause size={16} className="text-cyan-500" />
                    <span className="text-xs font-bold text-cyan-500">❄️ Timer Frozen! You have 15 seconds of peace.</span>
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
                        You've used all your lives. Lives regenerate 1 every 2 minutes.
                      </p>
                      <p className="text-xs opacity-40 mb-5">
                        Or refill them now and keep playing!
                      </p>
                      <div className="flex flex-col gap-2">
                        <button onClick={refillLives} className="btn btn-sm btn-primary gap-2 w-full">
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
                        <LivesDisplay lives={lives} maxLives={MAX_LIVES} />
                        <div className="w-px h-4 bg-base-300/30" />
                        {streak > 0 && (
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
                            <span className="text-[11px] font-bold text-orange-500">{streak}x</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200/50">
                          <Timer size={12} className="opacity-50" />
                          <span className={`text-xs font-mono font-bold ${challengeTimer > 30 ? 'text-error' : challengeTimer > 20 ? 'text-warning' : 'opacity-70'}`}>
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
                          <span className={`text-[9px] font-semibold ${WORLD_THEMES[currentChallenge.world]?.color}`}>
                            {WORLD_THEMES[currentChallenge.world]?.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold">
                          Level {currentChallenge.id}: {currentChallenge.title}
                        </h3>
                        <p className="text-xs opacity-50 mt-0.5">{currentChallenge.description}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowTarget(!showTarget)}
                        className="btn btn-xs btn-ghost gap-1"
                      >
                        {showTarget ? <EyeOff size={11} /> : <Eye size={11} />}
                        {showTarget ? 'Hide' : 'Show'} Target
                      </button>
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className={`btn btn-xs gap-1 ${showHint ? 'btn-warning' : 'btn-ghost'}`}
                      >
                        <Lightbulb size={11} />
                        {showHint ? 'Hint Active' : '💡 Use Hint (-30%)'}
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
                      </div>
                      <PowerUpBar powerUps={powerUps} onUse={usePowerUp} disabled={challengeResult === 'success'} />
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
                  </motion.div>

                  {/* Mini Progress Map */}
                  <div className="section-card px-4 py-2 overflow-x-auto">
                    <MiniProgressMap
                      challenges={FLEX_CHALLENGES}
                      completedIds={completedChallenges}
                      currentId={currentChallenge.id}
                      stars={challengeStars}
                    />
                  </div>

                  {/* Side-by-Side Previews */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {showTarget && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="section-card p-5 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Target size={14} className="text-primary" />
                          <span className="text-xs font-bold">🎯 Target Layout</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold animate-pulse">Match this!</span>
                        </div>
                        <ChallengePreviewBox
                          containerStyle={targetContainerStyle}
                          items={challengeItems}
                          label=""
                        />
                        <div className="mt-3 flex flex-wrap gap-1">
                          {currentChallenge.requiredProps.map((prop) => (
                            <span key={prop} className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-primary/10 text-primary border border-primary/20">
                              {prop.replace(/([A-Z])/g, '-$1').toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={shakeWrong ? { x: [0, -8, 8, -8, 8, 0], opacity: 1 } : { opacity: 1, x: 0 }}
                      transition={shakeWrong ? { duration: 0.4 } : undefined}
                      className={`section-card p-5 overflow-hidden transition-all duration-300 ${
                        challengeResult === 'success' ? 'ring-2 ring-success ring-offset-2 ring-offset-base-100' :
                        challengeResult === 'wrong' ? 'ring-2 ring-error ring-offset-2 ring-offset-base-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-secondary" />
                        <span className="text-xs font-bold">✨ Your Layout</span>
                        {challengeResult === 'success' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/15 text-success font-bold animate-pulse">✓ Perfect!</span>
                        )}
                        {challengeResult === 'wrong' && (
                          <motion.span
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-error/15 text-error font-bold"
                          >
                            ✗ -1 ❤️
                          </motion.span>
                        )}
                      </div>
                      <ChallengePreviewBox
                        containerStyle={userContainerStyle}
                        items={challengeItems}
                        label=""
                      />
                    </motion.div>
                  </div>

                  {/* Challenge Controls */}
                  <div className="section-card p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 flex items-center gap-2">
                      <Columns3 size={12} /> Adjust Properties
                    </h3>
                    {Object.entries(CONTAINER_PROPS).map(([key, options]) => {
                      const status = getPropMatchStatus(key);
                      const isRequired = currentChallenge.requiredProps.includes(key);
                      return (
                        <div key={key} className={`relative ${isRequired ? '' : 'opacity-40'}`}>
                          {status === 'correct' && isRequired && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -left-2 top-0"
                            >
                              <CheckCircle2 size={14} className="text-success" />
                            </motion.div>
                          )}
                          <PropSelect
                            label={key.replace(/([A-Z])/g, '-$1').toLowerCase()}
                            value={challengeContainer[key]}
                            options={options}
                            onChange={(v) => updateChallengeContainer(key, v)}
                            highlight={isRequired}
                          />
                        </div>
                      );
                    })}

                    <div className="flex items-center gap-3 pt-3 border-t border-base-300/30">
                      <button
                        onClick={checkChallenge}
                        disabled={challengeResult === 'success' || lives <= 0}
                        className={`btn btn-sm gap-1.5 ${challengeResult === 'success' ? 'btn-success' : 'btn-primary btn-shimmer'}`}
                      >
                        {challengeResult === 'success' ? (
                          <><CheckCircle2 size={14} /> Solved!</>
                        ) : (
                          <><Zap size={14} /> Check Answer</>
                        )}
                      </button>
                      {challengeResult === 'success' && (
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
                        onClick={() => setChallengeContainer({ ...currentChallenge.defaults })}
                        className="btn btn-sm btn-ghost gap-1 opacity-50"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>
                  </div>

                  {/* Success celebration */}
                  <AnimatePresence>
                    {challengeResult === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="section-card p-8 text-center border-2 border-success/30 bg-gradient-to-b from-success/[0.05] to-transparent overflow-hidden relative"
                      >
                        {/* Glowing background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-warning/5 to-success/5 animate-pulse" />

                        <motion.div
                          initial={{ rotate: -20, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
                          className="relative"
                        >
                          <span className="text-5xl">🏆</span>
                        </motion.div>

                        <h3 className="text-xl font-bold text-success mt-3 mb-1 relative">Level Complete!</h3>

                        {/* Star rating */}
                        <div className="flex justify-center mb-3">
                          <StarRating stars={challengeStars[currentChallenge.id] || 1} size={24} />
                        </div>

                        <p className="text-xs opacity-50 mb-4 relative">
                          Solved in {formatTime(challengeTimer)} · {challengeAttempts + 1} attempt{challengeAttempts > 0 ? 's' : ''}
                          {streak > 1 && (
                            <span className="text-orange-500 font-bold"> · 🔥 {streak}x streak!</span>
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
              ) : (
                /* Challenge List — World Map */
                <div className="space-y-5">
                  {/* Game Dashboard */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="section-card p-5 overflow-hidden relative"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/5 to-transparent rounded-tr-full" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <span className="text-2xl">🎮</span> Flexbox Quest
                        </h3>
                        <p className="text-xs opacity-50 mt-1">
                          Master Flexbox through an epic adventure! Solve puzzles, earn XP, and rank up!
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <LivesDisplay lives={lives} maxLives={MAX_LIVES} />
                        <div className="text-center">
                          <div className="text-lg font-bold font-mono text-warning">{totalScore}</div>
                          <div className="text-[9px] opacity-40 uppercase font-bold">XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold font-mono text-primary">{completedChallenges.length}/{FLEX_CHALLENGES.length}</div>
                          <div className="text-[9px] opacity-40 uppercase font-bold">Cleared</div>
                        </div>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mt-4 relative">
                      <XPProgressBar xp={totalScore} />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {streak > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/25 text-[10px] font-bold text-orange-500">
                          🔥 {streak}x streak
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] opacity-40">
                        ⭐ {Object.values(challengeStars).reduce((a, b) => a + b, 0)} / {FLEX_CHALLENGES.length * 3} stars
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
                  <DailyChallengeCard
                    daily={dailyChallenge}
                    isCompleted={dailyDone}
                    onStart={() => startChallenge(dailyChallenge)}
                  />

                  {/* World Map — grouped by world */}
                  {Object.entries(WORLD_THEMES).map(([worldKey, worldTheme]) => {
                    const worldChallenges = FLEX_CHALLENGES.filter((c) => c.world === worldKey);
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
                        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {worldChallenges.map((challenge, idx) => {
                            const isCompleted = completedChallenges.includes(challenge.id);
                            const globalIdx = FLEX_CHALLENGES.findIndex((c) => c.id === challenge.id);
                            const isLocked = globalIdx > 0 && !completedChallenges.includes(FLEX_CHALLENGES[globalIdx - 1].id) && !isCompleted;
                            const stars = challengeStars[challenge.id] || 0;

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
                                {/* Level number badge */}
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

                                <p className="text-[10px] opacity-40 mb-3 leading-relaxed line-clamp-2">{challenge.description}</p>

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
                  {completedChallenges.length === FLEX_CHALLENGES.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="section-card p-8 text-center border-2 border-warning/30 bg-gradient-to-b from-warning/[0.05] to-transparent"
                    >
                      <span className="text-5xl">👑</span>
                      <h3 className="text-xl font-bold mt-3 mb-1 gradient-text">Flexbox Grandmaster!</h3>
                      <p className="text-xs opacity-50">You've completed all challenges. You are a true Flexbox master!</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {Object.values(challengeStars).map((s, i) => (
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
                    <h3 className="text-lg font-bold">Achievement Gallery</h3>
                    <p className="text-xs opacity-50 mt-0.5">
                      {unlockedAchievements.length} of {FLEX_ACHIEVEMENTS.length} badges unlocked
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="radial-progress text-primary text-[10px] font-bold" style={{
                      '--value': Math.round((unlockedAchievements.length / FLEX_ACHIEVEMENTS.length) * 100),
                      '--size': '3.5rem',
                      '--thickness': '3px',
                    }} role="progressbar">
                      {Math.round((unlockedAchievements.length / FLEX_ACHIEVEMENTS.length) * 100)}%
                    </div>
                  </div>
                </div>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 relative">
                  {[
                    { icon: '⚡', label: 'Total XP', value: totalScore, color: 'text-warning' },
                    { icon: '🔥', label: 'Best Streak', value: `${maxStreak}x`, color: 'text-orange-500' },
                    { icon: '⏱️', label: 'Fastest Solve', value: fastestSolve > 0 ? `${fastestSolve}s` : '—', color: 'text-primary' },
                    { icon: '🧠', label: 'No-Hint Solves', value: noHintSolves, color: 'text-secondary' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-2.5 sm:p-3 rounded-xl bg-base-200/30 border border-base-300/20 text-center">
                      <div className="text-lg mb-0.5">{stat.icon}</div>
                      <div className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-[9px] opacity-40 uppercase font-bold mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Achievement Grid */}
              <AchievementGallery unlockedIds={unlockedAchievements} stats={{}} />

              {/* Power-up Inventory */}
              <div className="section-card p-5">
                <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-primary" /> Power-Up Inventory
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(POWER_UPS).map(([key, pu]) => (
                    <div key={key} className="p-4 rounded-xl border border-base-300/30 bg-base-200/20 text-center">
                      <div className="text-2xl mb-2">{pu.icon}</div>
                      <h5 className="text-xs font-bold">{pu.label}</h5>
                      <p className="text-[9px] opacity-40 mt-1 mb-2">{pu.description}</p>
                      <div className="text-lg font-bold font-mono text-primary">{powerUps[key] || 0}</div>
                      <div className="text-[8px] opacity-30 uppercase font-bold">Available</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-30 mt-3 text-center">
                  💡 Earn power-ups by completing challenges! Every 3 clears = +1 Hint & Freeze. Every 5 clears = +1 Skip.
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ LEARN TAB ═══ */}
          {tab === 'learn' && (
            <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Quick Reference */}
              <div className="section-card p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <BookOpen size={14} className="text-primary" /> Flexbox Quick Reference
                </h3>
                <p className="text-xs opacity-60 leading-relaxed mb-4">
                  Flexbox (Flexible Box Layout) is a one-dimensional layout model that allows items to distribute space within a container. It works along a <strong>main axis</strong> (set by flex-direction) and a <strong>cross axis</strong> (perpendicular to it).
                </p>
                <div className="flex items-center gap-4 text-[11px] mb-1 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-primary/15 border border-primary/30" />
                    Container Properties
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-secondary/15 border border-secondary/30" />
                    Item Properties
                  </span>
                </div>
              </div>

              {/* Container Properties */}
              <div className="section-card p-5 space-y-4">
                <h4 className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider opacity-50">
                  <Columns3 size={12} /> Container Properties
                </h4>
                {Object.entries(CONTAINER_PROPS).map(([key, options]) => {
                  const propName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                  return (
                    <div key={key} className="border border-base-300/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <code className="text-xs font-mono font-bold text-primary">{propName}</code>
                      </div>
                      <p className="text-[11px] opacity-50 mb-2.5 leading-relaxed">{PROP_DESCRIPTIONS[key]}</p>
                      <div className="flex flex-wrap gap-1">
                        {options.map((opt) => (
                          <span
                            key={opt}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-base-200/60 border border-base-300/30 opacity-60"
                          >
                            {typeof opt === 'number' ? `${opt}px` : opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Item Properties */}
              <div className="section-card p-5 space-y-4">
                <h4 className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider opacity-50">
                  <GripVertical size={12} /> Item Properties
                </h4>
                {Object.entries(PROP_DESCRIPTIONS)
                  .filter(([key]) => ITEM_PROPS_META[key])
                  .map(([key, desc]) => {
                    const propName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    const meta = ITEM_PROPS_META[key];
                    return (
                      <div key={key} className="border border-base-300/30 rounded-lg p-4">
                        <code className="text-xs font-mono font-bold text-secondary">{propName}</code>
                        <p className="text-[11px] opacity-50 mt-1.5 mb-2 leading-relaxed">{desc}</p>
                        {Array.isArray(meta) ? (
                          <div className="flex flex-wrap gap-1">
                            {meta.map((opt) => (
                              <span
                                key={opt}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-base-200/60 border border-base-300/30 opacity-60"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono opacity-40">
                            Range: {meta.min} – {meta.max}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Common Patterns */}
              <div className="section-card p-5 space-y-4">
                <h4 className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider opacity-50">
                  🎯 Common Flexbox Patterns
                </h4>
                {[
                  {
                    name: 'Center Everything',
                    code: 'justify-content: center;\nalign-items: center;',
                    tip: 'Perfect for centering a single element both horizontally and vertically.',
                  },
                  {
                    name: 'Space Between Navbar',
                    code: 'justify-content: space-between;\nalign-items: center;',
                    tip: 'Great for navigation bars — logo on left, menu on right.',
                  },
                  {
                    name: 'Equal Width Columns',
                    code: 'flex-grow: 1;\nflex-basis: 0;',
                    tip: 'Set on each item to create equal-width columns that share space.',
                  },
                  {
                    name: 'Sticky Footer',
                    code: 'flex-direction: column;\n/* on main content: */ flex-grow: 1;',
                    tip: 'Column layout where the main content grows to push footer down.',
                  },
                  {
                    name: 'Wrapping Card Grid',
                    code: 'flex-wrap: wrap;\ngap: 16px;\n/* on items: */ flex-basis: 300px; flex-grow: 1;',
                    tip: 'Responsive card layout that wraps items with minimum widths.',
                  },
                ].map((pattern) => (
                  <div key={pattern.name} className="border border-base-300/30 rounded-lg p-4">
                    <h5 className="text-xs font-bold mb-1.5">{pattern.name}</h5>
                    <pre className="p-3 rounded-lg bg-neutral text-neutral-content font-mono text-[11px] leading-relaxed mb-2">
                      {pattern.code}
                    </pre>
                    <p className="text-[10px] opacity-40 leading-relaxed">💡 {pattern.tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
