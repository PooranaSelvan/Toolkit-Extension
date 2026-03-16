import {
  FileText, Send, Settings, Server, KeyRound, Regex, Palette,
  Blend, Square, Gem, Braces,
  Layout, Grid3X3,
  Lock,
  GraduationCap, GitBranch, RefreshCw,
  Columns3, Database,
} from 'lucide-react';

const TOOLS = [
  // ─── Developer Tools ───
  {
    id: 'readme-generator',
    name: 'README Generator',
    description: 'Generate professional README.md files with GitHub import, 8 templates, widget library, quality scoring & sharing',
    icon: FileText,
    path: '/readme-generator',
    category: 'developer',
    tags: ['markdown', 'github', 'documentation', 'readme', 'profile', 'badges', 'widgets', 'templates', 'share'],
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Test REST & WebSocket APIs with environments, assertions, bulk runner, diff, import/export & code generation',
    icon: Send,
    path: '/api-tester',
    category: 'developer',
    tags: ['api', 'rest', 'http', 'postman', 'websocket', 'environment', 'testing', 'bulk', 'diff', 'import', 'export', 'assertions'],
  },
  {
    id: 'mock-api',
    name: 'Mock API Generator',
    description: 'Generate fake REST APIs with realistic data for testing',
    icon: Server,
    path: '/mock-api',
    category: 'developer',
    tags: ['api', 'mock', 'data', 'testing'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Toolkit',
    description: 'Decode, verify, build, audit & analyze JSON Web Tokens',
    icon: KeyRound,
    path: '/jwt-decoder',
    category: 'developer',
    tags: ['jwt', 'token', 'auth', 'security', 'decode', 'verify', 'build'],
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, minify, and transform JSON data',
    icon: Braces,
    path: '/json-formatter',
    category: 'developer',
    tags: ['json', 'format', 'validate', 'minify'],
  },
  {
    id: 'regex-generator',
    name: 'Regex Generator',
    description: 'Build, test & generate regex patterns with live preview',
    icon: Regex,
    path: '/regex-generator',
    category: 'developer',
    tags: ['regex', 'pattern', 'match', 'test'],
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords, passphrases, PINs & check strength',
    icon: Lock,
    path: '/password-generator',
    category: 'developer',
    tags: ['password', 'security', 'passphrase', 'pin', 'strength', 'generator'],
  },
  // ─── Frontend Tools ───
  {
    id: 'color-palette',
    name: 'Color Palette',
    description: 'Generate, explore & export beautiful color palettes',
    icon: Palette,
    path: '/color-palette',
    category: 'frontend',
    tags: ['color', 'palette', 'design', 'css'],
  },
  {
    id: 'css-gradient',
    name: 'CSS Gradient',
    description: 'Create beautiful CSS gradients with live preview',
    icon: Blend,
    path: '/css-gradient',
    category: 'frontend',
    tags: ['gradient', 'css', 'design', 'visual'],
  },
  {
    id: 'box-shadow',
    name: 'Box Shadow',
    description: 'Create layered box shadows with visual editor',
    icon: Square,
    path: '/box-shadow',
    category: 'frontend',
    tags: ['shadow', 'css', 'design', 'visual'],
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Create stunning frosted glass UI effects',
    icon: Gem,
    path: '/glassmorphism',
    category: 'frontend',
    tags: ['glass', 'blur', 'css', 'design'],
  },
  
  {
    id: 'grid-generator',
    name: 'Grid Generator',
    description: 'Click & drag to build CSS Grid layouts and export clean code',
    icon: Grid3X3,
    path: '/grid-generator',
    category: 'frontend',
    tags: ['grid', 'css', 'layout', 'responsive', 'generator', 'columns', 'rows', 'drag'],
  },
  
  {
    id: 'frontend-playground',
    name: 'Frontend Playground',
    description: 'Code HTML, CSS & JS with live preview, Emmet, split view, CDN, layouts & sharing',
    icon: Layout,
    path: '/frontend-playground',
    category: 'frontend',
    tags: ['html', 'css', 'javascript', 'playground', 'preview', 'live', 'editor', 'emmet', 'split', 'share', 'layout', 'fonts'],
  },

  // ─── Learning Tools ───
  {
    id: 'sorting-visualizer',
    name: 'Sorting Visualizer',
    description: 'Learn sorting algorithms visually with step-by-step animations',
    icon: GraduationCap,
    path: '/sorting-visualizer',
    category: 'learning',
    tags: ['sorting', 'algorithms', 'visualization', 'selection', 'merge', 'bubble', 'insertion', 'dsa', 'learning'],
  },
  {
    id: 'recursion-visualizer',
    name: 'Recursion Visualizer',
    description: 'Visualize recursive calls with animated call trees & stack frames',
    icon: GitBranch,
    path: '/recursion-visualizer',
    category: 'learning',
    tags: ['recursion', 'call stack', 'fibonacci', 'factorial', 'tree', 'dsa', 'learning', 'visualization'],
  },
  {
    id: 'event-loop-visualizer',
    name: 'JS Event Loop Visualizer',
    description: 'See how JavaScript executes async code with Call Stack, Queues & Event Loop',
    icon: RefreshCw,
    path: '/event-loop-visualizer',
    category: 'learning',
    tags: ['javascript', 'event loop', 'call stack', 'microtask', 'promise', 'setTimeout', 'async', 'learning'],
  },

  {
    id: 'flex-playground',
    name: 'Flexbox Playground',
    description: 'Learn CSS Flexbox visually — tweak properties & see live results',
    icon: Columns3,
    path: '/flex-playground',
    category: 'learning',
    tags: ['flexbox', 'css', 'layout', 'flex-direction', 'justify-content', 'align-items', 'learning'],
  },
  {
    id: 'sql-playground',
    name: 'SQL Playground',
    description: 'Practice SQL queries in-browser with sample datasets — no setup needed',
    icon: Database,
    path: '/sql-playground',
    category: 'learning',
    tags: ['sql', 'database', 'query', 'select', 'join', 'group by', 'learning', 'practice'],
  },

  // ─── Preferences ───
  {
    id: 'settings',
    name: 'Settings',
    description: 'Customize themes, appearance, and manage your data',
    icon: Settings,
    path: '/settings',
    category: 'preferences',
    tags: ['settings', 'theme', 'preferences'],
  },
];

export const CATEGORIES = [
  { id: 'developer', label: 'Developer Tools', emoji: '🛠️' },
  { id: 'frontend', label: 'Frontend Tools', emoji: '🎨' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'preferences', label: 'Preferences', emoji: '⚙️' },
];

export const getTools = () => TOOLS;
export const getToolById = (id) => {
  try {
    return TOOLS.find((tool) => tool.id === id) || null;
  } catch {
    return null;
  }
};
export const getToolsByCategory = (category) => {
  try {
    if (!category) return [];
    return TOOLS.filter((tool) => tool.category === category);
  } catch {
    return [];
  }
};
export const searchTools = (query) => {
  try {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return TOOLS.filter(
      (t) =>
        t.id !== 'settings' &&
        (t.name.toLowerCase().includes(q) ||
         t.description.toLowerCase().includes(q) ||
         (Array.isArray(t.tags) && t.tags.some((tag) => tag.includes(q))))
    );
  } catch {
    return [];
  }
};

export default TOOLS;
