import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Copy, Check, ChevronDown, ChevronRight, Search, ExternalLink } from 'lucide-react';

/* ════════════════════════════════════════════════
   GitHub Widget / Insert Library
   Quick-insert GitHub stats, social badges, 
   visitor counters, typing SVGs, etc.
   ════════════════════════════════════════════════ */

const WIDGET_CATEGORIES = [
  {
    id: 'stats',
    label: '📊 GitHub Stats Cards',
    description: 'Stats, streaks, languages & trophies',
    widgets: [
      {
        id: 'github-stats',
        name: 'GitHub Stats Card',
        description: 'Shows stars, commits, PRs, issues & contributions',
        previewUrl: (u) => `https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=radical&hide_border=true`,
        generate: (u, opts) => {
          const theme = opts?.theme || 'radical';
          return `<p align="center">\n  <img src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=${theme}&hide_border=true&count_private=true" alt="GitHub Stats" />\n</p>`;
        },
        options: [{ id: 'theme', label: 'Theme', type: 'select', values: ['radical', 'tokyonight', 'dracula', 'gruvbox', 'nord', 'catppuccin_mocha', 'dark', 'transparent', 'default'] }],
      },
      {
        id: 'streak-stats',
        name: 'GitHub Streak Stats',
        description: 'Current streak, longest streak & total contributions',
        previewUrl: (u) => `https://github-readme-streak-stats.herokuapp.com/?user=${u}&theme=radical&hide_border=true`,
        generate: (u, opts) => {
          const theme = opts?.theme || 'radical';
          return `<p align="center">\n  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${u}&theme=${theme}&hide_border=true" alt="GitHub Streak" />\n</p>`;
        },
        options: [{ id: 'theme', label: 'Theme', type: 'select', values: ['radical', 'tokyonight', 'dracula', 'gruvbox', 'nord', 'dark', 'default'] }],
      },
      {
        id: 'top-langs',
        name: 'Top Languages Card',
        description: 'Most used programming languages',
        previewUrl: (u) => `https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&theme=radical&hide_border=true`,
        generate: (u, opts) => {
          const layout = opts?.layout || 'compact';
          const theme = opts?.theme || 'radical';
          return `<p align="center">\n  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=${layout}&theme=${theme}&hide_border=true&langs_count=8" alt="Top Languages" />\n</p>`;
        },
        options: [
          { id: 'layout', label: 'Layout', type: 'select', values: ['compact', 'donut', 'donut-vertical', 'pie', 'normal'] },
          { id: 'theme', label: 'Theme', type: 'select', values: ['radical', 'tokyonight', 'dracula', 'gruvbox', 'nord', 'dark', 'default'] },
        ],
      },
      {
        id: 'github-trophies',
        name: 'GitHub Profile Trophies',
        description: 'Achievement trophies for your profile',
        previewUrl: (u) => `https://github-profile-trophy.vercel.app/?username=${u}&theme=radical&no-frame=true&row=1&column=6`,
        generate: (u, opts) => {
          const theme = opts?.theme || 'radical';
          return `<p align="center">\n  <img src="https://github-profile-trophy.vercel.app/?username=${u}&theme=${theme}&no-frame=true&no-bg=true&row=1&column=7" alt="Trophies" />\n</p>`;
        },
        options: [{ id: 'theme', label: 'Theme', type: 'select', values: ['radical', 'tokyonight', 'dracula', 'gruvbox', 'nord', 'darkhub', 'flat', 'onedark'] }],
      },
      {
        id: 'contrib-graph',
        name: 'Contribution Graph (Activity)',
        description: 'Snake animation of your contribution graph',
        generate: (u) => {
          return `<p align="center">\n  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${u}&theme=react-dark&hide_border=true" alt="Contribution Graph" />\n</p>`;
        },
        options: [],
      },
    ],
  },
  {
    id: 'social',
    label: '🔗 Social & Contact Badges',
    description: 'LinkedIn, Twitter, Email, Portfolio links',
    widgets: [
      {
        id: 'social-badges',
        name: 'Social Badge Row',
        description: 'LinkedIn, Twitter, Email & website badges',
        generate: (u, opts) => {
          const lines = [];
          lines.push('<p align="center">');
          if (opts?.linkedin) lines.push(`  <a href="https://linkedin.com/in/${opts.linkedin}"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>`);
          if (opts?.twitter) lines.push(`  <a href="https://twitter.com/${opts.twitter}"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>`);
          if (opts?.email) lines.push(`  <a href="mailto:${opts.email}"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>`);
          if (opts?.website) lines.push(`  <a href="${opts.website}"><img src="https://img.shields.io/badge/Portfolio-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" /></a>`);
          if (opts?.discord) lines.push(`  <a href="https://discord.gg/${opts.discord}"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a>`);
          lines.push('</p>');
          return lines.join('\n');
        },
        options: [
          { id: 'linkedin', label: 'LinkedIn Username', type: 'text', placeholder: 'your-linkedin' },
          { id: 'twitter', label: 'Twitter Handle', type: 'text', placeholder: 'your_twitter' },
          { id: 'email', label: 'Email', type: 'text', placeholder: 'you@example.com' },
          { id: 'website', label: 'Website URL', type: 'text', placeholder: 'https://yoursite.com' },
          { id: 'discord', label: 'Discord Invite Code', type: 'text', placeholder: 'invite-code' },
        ],
      },
      {
        id: 'profile-views',
        name: 'Profile View Counter',
        description: 'Visitor counter badge for your profile or repo',
        generate: (u) => {
          return `![Profile Views](https://komarev.com/ghpvc/?username=${u}&color=blueviolet&style=for-the-badge&label=PROFILE+VIEWS)`;
        },
        options: [],
      },
    ],
  },
  {
    id: 'dynamic',
    label: '✨ Dynamic Content',
    description: 'Typing SVGs, quotes, jokes & activity',
    widgets: [
      {
        id: 'typing-svg',
        name: 'Typing Animation SVG',
        description: 'Animated typing text for profile headers',
        previewUrl: () => `https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=2D79FF&center=true&vCenter=true&width=500&lines=Hello+World!`,
        generate: (u, opts) => {
          const lines = (opts?.lines || 'Hello World!;Full Stack Developer;Open Source Enthusiast').split(';').map(l => encodeURIComponent(l.trim())).join(';');
          const color = opts?.color || '2D79FF';
          return `<p align="center">\n  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=${color}&center=true&vCenter=true&random=false&width=500&lines=${lines}" alt="Typing SVG" />\n</p>`;
        },
        options: [
          { id: 'lines', label: 'Lines (semicolon-separated)', type: 'text', placeholder: 'Hello World!;Full Stack Developer;Open Source Enthusiast' },
          { id: 'color', label: 'Text Color (hex, no #)', type: 'text', placeholder: '2D79FF' },
        ],
      },
      {
        id: 'random-quote',
        name: 'Random Dev Quote',
        description: 'Show a random programming quote',
        generate: () => {
          return `<p align="center">\n  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=radical" alt="Random Dev Quote" />\n</p>`;
        },
        options: [],
      },
      {
        id: 'random-joke',
        name: 'Random Programming Joke',
        description: 'Fun programming joke card',
        generate: () => {
          return `<p align="center">\n  <img src="https://readme-jokes.vercel.app/api?theme=radical" alt="Programming Joke" />\n</p>`;
        },
        options: [],
      },
    ],
  },
  {
    id: 'markdown',
    label: '📝 Markdown Snippets',
    description: 'Tables, collapsibles, callouts, image galleries',
    widgets: [
      {
        id: 'md-table',
        name: 'Markdown Table',
        description: '3-column table with header',
        generate: () => `| Column 1 | Column 2 | Column 3 |\n|:---------|:--------:|---------:|\n| Left     | Center   | Right    |\n| Data     | Data     | Data     |\n| Data     | Data     | Data     |`,
        options: [],
      },
      {
        id: 'md-collapsible',
        name: 'Collapsible Section',
        description: 'Click-to-expand section using <details>',
        generate: (u, opts) => {
          const title = opts?.title || 'Click to expand';
          return `<details>\n<summary><b>${title}</b></summary>\n\nYour content here...\n\n</details>`;
        },
        options: [{ id: 'title', label: 'Summary Title', type: 'text', placeholder: 'Click to expand' }],
      },
      {
        id: 'md-callout-note',
        name: 'GitHub Callout (Note)',
        description: 'GitHub-flavored note/warning/tip callout',
        generate: (u, opts) => {
          const type = opts?.type || 'NOTE';
          return `> [!${type}]\n> Your ${type.toLowerCase()} content here.`;
        },
        options: [{ id: 'type', label: 'Callout Type', type: 'select', values: ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] }],
      },
      {
        id: 'md-image-gallery',
        name: 'Image Gallery (2-column)',
        description: 'Side-by-side images using HTML table',
        generate: () => `<table>\n  <tr>\n    <td><img src="https://via.placeholder.com/400x300" alt="Screenshot 1" width="400"/></td>\n    <td><img src="https://via.placeholder.com/400x300" alt="Screenshot 2" width="400"/></td>\n  </tr>\n  <tr>\n    <td align="center"><em>Caption 1</em></td>\n    <td align="center"><em>Caption 2</em></td>\n  </tr>\n</table>`,
        options: [],
      },
      {
        id: 'md-kbd',
        name: 'Keyboard Shortcuts Table',
        description: 'Keyboard shortcut documentation',
        generate: () => `| Action | Shortcut |\n|:---|:---|\n| Save | <kbd>Ctrl</kbd> + <kbd>S</kbd> |\n| Undo | <kbd>Ctrl</kbd> + <kbd>Z</kbd> |\n| Find | <kbd>Ctrl</kbd> + <kbd>F</kbd> |`,
        options: [],
      },
      {
        id: 'md-centered-header',
        name: 'Centered Header Block',
        description: 'Centered heading with description',
        generate: (u, opts) => {
          const title = opts?.title || 'Project Name';
          const desc = opts?.desc || 'A brief description of the project';
          return `<div align="center">\n\n# ${title}\n\n**${desc}**\n\n</div>`;
        },
        options: [
          { id: 'title', label: 'Title', type: 'text', placeholder: 'Project Name' },
          { id: 'desc', label: 'Description', type: 'text', placeholder: 'A brief description' },
        ],
      },
      {
        id: 'md-back-to-top',
        name: 'Back to Top Link',
        description: 'Scroll-to-top anchor link',
        generate: () => `<p align="right">(<a href="#top">back to top</a>)</p>`,
        options: [],
      },
    ],
  },
];

export default function WidgetInserter({ username, onInsert }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [widgetOptions, setWidgetOptions] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');

  const effectiveUser = username?.trim() || 'username';

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return WIDGET_CATEGORIES;
    const q = search.toLowerCase();
    return WIDGET_CATEGORIES.map(cat => ({
      ...cat,
      widgets: cat.widgets.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        cat.label.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.widgets.length > 0);
  }, [search]);

  const setOption = (widgetId, optId, value) => {
    setWidgetOptions(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], [optId]: value },
    }));
  };

  const handleInsert = (widget) => {
    const opts = widgetOptions[widget.id] || {};
    const markdown = widget.generate(effectiveUser, opts);
    onInsert(markdown);
    setCopiedId(widget.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Wand2 size={14} className="text-primary" />
            </div>
            Widget Library
            <span className="badge badge-xs badge-primary">
              {WIDGET_CATEGORIES.reduce((sum, c) => sum + c.widgets.length, 0)}
            </span>
          </h3>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search widgets..."
            className="input input-xs w-full pl-8 rounded-lg"
          />
        </div>

        {/* Categories */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-base-200 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-base-200/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{cat.label}</span>
                  <span className="text-[10px] text-base-content/50">{cat.widgets.length}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedCat === cat.id ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight size={12} className="text-base-content/50" />
                </motion.div>
              </button>

              {/* Widgets list */}
              <AnimatePresence>
                {expandedCat === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-base-200 bg-base-200/20 p-2 space-y-2">
                      {cat.widgets.map((widget) => (
                        <div
                          key={widget.id}
                          className="rounded-lg border border-base-200 bg-base-100 p-3 space-y-2.5 hover:border-primary/20 transition-colors"
                        >
                          {/* Widget header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold">{widget.name}</p>
                              <p className="text-[10px] text-base-content/60">{widget.description}</p>
                            </div>
                            <motion.button
                              onClick={() => handleInsert(widget)}
                              className={`btn btn-xs gap-1 rounded-lg transition-all ${
                                copiedId === widget.id
                                  ? 'btn-success shadow-sm shadow-success/20'
                                  : 'btn-primary'
                              }`}
                            >
                              {copiedId === widget.id ? (
                                <><Check size={10} /> Inserted</>
                              ) : (
                                <><Copy size={10} /> Insert</>
                              )}
                            </motion.button>
                          </div>

                          {/* Widget options */}
                          {widget.options && widget.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {widget.options.map((opt) => (
                                <div key={opt.id} className="space-y-1">
                                  <label className="text-[10px] font-semibold text-base-content/70">{opt.label}</label>
                                  {opt.type === 'select' ? (
                                    <select
                                      value={widgetOptions[widget.id]?.[opt.id] || opt.values[0]}
                                      onChange={(e) => setOption(widget.id, opt.id, e.target.value)}
                                      className="select select-xs w-full rounded-lg"
                                    >
                                      {opt.values.map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={widgetOptions[widget.id]?.[opt.id] || ''}
                                      onChange={(e) => setOption(widget.id, opt.id, e.target.value)}
                                      placeholder={opt.placeholder || ''}
                                      className="input input-xs w-full rounded-lg"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Username hint */}
        <p className="text-[10px] text-base-content/50 mt-3 flex items-center gap-1.5">
          <ExternalLink size={8} />
          Widgets use username: <strong className="text-base-content/70">{effectiveUser}</strong> — change it in the Author step
        </p>
      </div>
    </div>
  );
}
