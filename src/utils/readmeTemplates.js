/**
 * README.md template generators — Premium Professional Edition.
 * Each template produces a visually stunning, well-structured README
 * with modern GitHub-compatible markdown & HTML enhancements.
 */

/* ══════════════════════════════════════════
   Badge Helpers
   ══════════════════════════════════════════ */
function shieldBadge(label, message, color, style = 'for-the-badge') {
  return `![${label}](https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${style})`;
}

function generateBadges(data) {
  const badges = [];

  // Custom badges from the badge builder
  if (data.badges && data.badges.length > 0) {
    const customBadges = typeof data.badges === 'string'
      ? data.badges.split('\n').filter(Boolean)
      : data.badges.filter((b) => b.text);
    customBadges.forEach((b) => {
      if (typeof b === 'string') {
        badges.push(b);
      } else {
        const url = b.url
          ? `[${shieldBadge(b.label || '', b.text, b.color || '333', b.style || 'for-the-badge')}](${b.url})`
          : shieldBadge(b.label || '', b.text, b.color || '333', b.style || 'for-the-badge');
        badges.push(url);
      }
    });
  }

  if (data.license) {
    badges.push(`![License](https://img.shields.io/badge/License-${encodeURIComponent(data.license)}-blue?style=for-the-badge)`);
  }

  return badges;
}

function generateTechBadges(data) {
  if (!data.techStack) return [];
  const techs = data.techStack.split(',').map((t) => t.trim()).filter(Boolean);
  const colorMap = {
    'react': '61DAFB', 'next.js': '000000', 'vue.js': '4FC08D', 'angular': 'DD0031',
    'svelte': 'FF3E00', 'node.js': '339933', 'express.js': '000000', 'express': '000000',
    'typescript': '3178C6', 'javascript': 'F7DF1E', 'python': '3776AB', 'django': '092E20',
    'flask': '000000', 'go': '00ADD8', 'rust': '000000', 'java': '007396',
    'tailwindcss': '06B6D4', 'bootstrap': '7952B3', 'mongodb': '47A248', 'postgresql': '4169E1',
    'mysql': '4479A1', 'redis': 'DC382D', 'docker': '2496ED', 'aws': '232F3E',
    'firebase': 'FFCA28', 'graphql': 'E10098', 'prisma': '2D3748', 'vite': '646CFF',
    'webpack': '8DD6F9', 'jest': 'C21325', 'vitest': '6E9F18', 'cypress': '17202C',
    'electron': '47848F', 'react native': '61DAFB', 'flutter': '02569B', 'dart': '0175C2',
    'stripe': '008CDD', 'vercel': '000000', 'netlify': '00C7B7', 'github actions': '2088FF',
    'daisyui': '5A0EF8', 'material ui': '0081CB', 'chakra ui': '319795',
    'framer motion': '0055FF', 'redux': '764ABC', 'zustand': '433D37',
    'socket.io': '010101', 'three.js': '000000', 'd3.js': 'F9A03C',
    'storybook': 'FF4785', 'react router': 'CA4245', 'axios': '5A29E4',
  };
  return techs.map((tech) => {
    const logo = encodeURIComponent(tech.toLowerCase().replace(/\.js$/, '').replace(/\s+/g, ''));
    const color = colorMap[tech.toLowerCase()] || '333333';
    return `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)`;
  });
}

/* ══════════════════════════════════════════
   Section Renderers
   ══════════════════════════════════════════ */

function renderFeatures(data) {
  if (!data.features) return '';
  const lines = data.features.split('\n').filter(Boolean);
  return lines.map((f) => `- ${f.replace(/^[-*✅🔹•]\s*/u, '')}`).join('\n') + '\n';
}

function renderFeaturesWithIcons(data) {
  if (!data.features) return '';
  const icons = ['🚀', '⚡', '🎯', '🔒', '🎨', '📱', '🔧', '✨', '💡', '🌐', '📊', '🔥'];
  const lines = data.features.split('\n').filter(Boolean);
  return lines.map((f, i) => {
    const icon = icons[i % icons.length];
    return `${icon} **${f.replace(/^[-*✅🔹•]\s*/u, '').trim()}**`;
  }).join('  \n') + '\n';
}

function renderFeaturesTable(data) {
  if (!data.features) return '';
  const icons = ['🚀', '⚡', '🎯', '🔒', '🎨', '📱', '🔧', '✨', '💡', '🌐'];
  const lines = data.features.split('\n').filter(Boolean);
  const rows = [];
  for (let i = 0; i < lines.length; i += 2) {
    const left = lines[i] ? `${icons[i % icons.length]} **${lines[i].replace(/^[-*✅🔹•]\s*/u, '').trim()}**` : '';
    const right = lines[i + 1] ? `${icons[(i + 1) % icons.length]} **${lines[i + 1].replace(/^[-*✅🔹•]\s*/u, '').trim()}**` : '';
    rows.push(`| ${left} | ${right} |`);
  }
  return `| | |\n|---|---|\n${rows.join('\n')}\n`;
}

function renderTechTable(data) {
  if (!data.techStack) return '';
  const techs = data.techStack.split(',').map((t) => t.trim()).filter(Boolean);
  let md = '| Technology | Purpose |\n|:---:|:---|\n';
  techs.forEach((tech) => {
    const logo = encodeURIComponent(tech.toLowerCase().replace(/\.js$/, '').replace(/\s+/g, ''));
    md += `| <img src="https://img.shields.io/badge/${encodeURIComponent(tech)}-333?style=flat-square&logo=${logo}&logoColor=white" alt="${tech}" /> | ${tech} |\n`;
  });
  return md + '\n';
}

function renderTechBadgeRow(data) {
  if (!data.techStack) return '';
  const badges = generateTechBadges(data);
  return badges.join(' ') + '\n';
}

function renderTechList(data) {
  if (!data.techStack) return '';
  return data.techStack.split(',').map((t) => t.trim()).filter(Boolean).map((t) => `- **${t}**`).join('\n') + '\n';
}

function renderEnvVars(data) {
  if (!data.envVars) return '';
  const lines = data.envVars.split('\n').filter(Boolean);
  let md = '| Variable | Description | Required |\n|:---|:---|:---:|\n';
  lines.forEach((line) => {
    const [key, ...desc] = line.split('=');
    const varName = key?.trim() || line;
    const description = desc.join('=').trim() || 'Configure as needed';
    md += `| \`${varName}\` | ${description} | ✅ |\n`;
  });
  return md + '\n';
}

function renderRoadmap(data) {
  if (!data.roadmap) return '';
  const lines = data.roadmap.split('\n').filter(Boolean);
  return lines.map((item) => {
    const cleaned = item.replace(/^[-*•]\s*/, '');
    return `- [ ] ${cleaned}`;
  }).join('\n') + '\n';
}

function renderFaq(data) {
  if (!data.faq) return '';
  const lines = data.faq.split('\n').filter(Boolean);
  let md = '';
  let inQuestion = false;
  lines.forEach((line) => {
    if (line.startsWith('Q:') || line.startsWith('q:')) {
      md += `<details>\n<summary><b>${line.replace(/^[Qq]:\s*/, '').trim()}</b></summary>\n\n`;
      inQuestion = true;
    } else if (line.startsWith('A:') || line.startsWith('a:')) {
      md += `${line.replace(/^[Aa]:\s*/, '').trim()}\n\n</details>\n\n`;
      inQuestion = false;
    } else {
      if (inQuestion) {
        md += `${line.trim()}\n`;
      } else {
        md += `<details>\n<summary><b>${line.trim()}</b></summary>\n\nPlease refer to the documentation for details.\n\n</details>\n\n`;
      }
    }
  });
  if (inQuestion) md += '\n</details>\n\n';
  return md;
}

function renderChangelog(data) {
  if (!data.changelog) return '';
  return data.changelog + '\n\n';
}

function renderAcknowledgments(data) {
  if (!data.acknowledgments) return '';
  const lines = data.acknowledgments.split('\n').filter(Boolean);
  return lines.map((a) => `- ${a.replace(/^[-*•]\s*/, '')}`).join('\n') + '\n';
}

function renderDemoLinks(data) {
  if (!data.demoUrl && !data.screenshots) return '';
  let md = '';
  if (data.demoUrl) {
    md += `<p align="center">\n  <a href="${data.demoUrl}">\n    <img src="https://img.shields.io/badge/🔗_Live_Demo-Click_Here-2ea44f?style=for-the-badge" alt="Live Demo" />\n  </a>\n</p>\n\n`;
  }
  if (data.screenshots) {
    md += data.screenshots + '\n';
  }
  return md + '\n';
}

function renderApiReference(data) {
  if (!data.apiReference) return '';
  const lines = data.apiReference.split('\n').filter(Boolean);
  const methodColors = {
    'GET': '61affe', 'POST': '49cc90', 'PUT': 'fca130',
    'PATCH': '50e3c2', 'DELETE': 'f93e3e', 'HEAD': '9012fe', 'OPTIONS': '0d5aa7',
  };
  let md = '| Method | Endpoint | Description |\n|:---:|:---|:---|\n';
  lines.forEach((line) => {
    const parts = line.split(/\s+/);
    const method = parts[0]?.toUpperCase() || 'GET';
    const endpoint = parts[1] || '/';
    const desc = parts.slice(2).join(' ') || '-';
    const color = methodColors[method] || '333';
    md += `| ![${method}](https://img.shields.io/badge/${method}-${color}?style=flat-square&logoColor=white) | \`${endpoint}\` | ${desc} |\n`;
  });
  return md + '\n';
}

function renderCustomSections(data) {
  if (!data.customSections || data.customSections.length === 0) return '';
  let md = '';
  data.customSections.forEach((section) => {
    if (section.title && section.content) {
      md += `## ${section.title}\n\n${section.content}\n\n`;
    }
  });
  return md;
}

function renderInstallation(data) {
  if (!data.installation) return '';
  return `\`\`\`bash\n${data.installation}\n\`\`\`\n\n`;
}

function renderContributingSteps(data) {
  let md = '';
  md += `1. **Fork** the repository\n`;
  md += `2. **Clone** your fork: \`git clone https://github.com/your-username/${data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project'}.git\`\n`;
  md += `3. **Create** a branch: \`git checkout -b feature/amazing-feature\`\n`;
  md += `4. **Commit** changes: \`git commit -m 'Add amazing feature'\`\n`;
  md += `5. **Push** to branch: \`git push origin feature/amazing-feature\`\n`;
  md += `6. **Submit** a Pull Request\n\n`;
  if (data.contributing) {
    md += `${data.contributing}\n\n`;
  }
  return md;
}

function divider() {
  return `\n<br>\n\n<div align="center">\n  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">\n</div>\n\n<br>\n\n`;
}

function buildTocAnchors(label) {
  return label.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

/* ═══════════════════════════════════════════════════════
   Template: Minimal — Elegant & Clean
   ═══════════════════════════════════════════════════════ */
export function minimalTemplate(data) {
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // Header
  md += `# ${data.projectName || 'Project Name'}\n\n`;

  if (data.description) {
    md += `> ${data.description}\n\n`;
  }

  // Badges row
  if (badges.length > 0 || techBadges.length > 0) {
    md += [...badges, ...techBadges].join(' ') + '\n\n';
  }

  if (data.demoUrl) {
    md += `**[→ Live Demo](${data.demoUrl})**\n\n`;
  }

  md += `---\n\n`;

  if (data.features) {
    md += `## Features\n\n${renderFeatures(data)}\n`;
  }

  if (data.techStack) {
    md += `## Built With\n\n${renderTechList(data)}\n`;
  }

  if (data.installation) {
    md += `## Quick Start\n\n${renderInstallation(data)}\n`;
  }

  if (data.usage) {
    md += `## Usage\n\n\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  if (data.envVars) {
    md += `## Environment Variables\n\n${renderEnvVars(data)}`;
  }

  if (data.apiReference) {
    md += `## API\n\n${renderApiReference(data)}`;
  }

  if (data.roadmap) {
    md += `## Roadmap\n\n${renderRoadmap(data)}\n`;
  }

  if (data.contributing) {
    md += `## Contributing\n\n${data.contributing}\n\n`;
  }

  if (data.license) {
    md += `## License\n\n[${data.license}](LICENSE)\n\n`;
  }

  md += renderCustomSections(data);

  if (data.author) {
    md += `---\n\nBuilt by **[@${data.author}](https://github.com/${data.author})**\n`;
  }

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Standard — Professional Balanced README
   ═══════════════════════════════════════════════════════ */
export function standardTemplate(data) {
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // Centered header
  md += `<div align="center">\n\n`;
  md += `# 📋 ${data.projectName || 'Project Name'}\n\n`;

  if (data.description) {
    md += `**${data.description}**\n\n`;
  }

  // Badges
  if (badges.length > 0) {
    md += badges.join(' ') + '\n\n';
  }
  if (techBadges.length > 0) {
    md += techBadges.join(' ') + '\n\n';
  }

  // Quick links
  const quickLinks = [];
  if (data.demoUrl) quickLinks.push(`[Live Demo](${data.demoUrl})`);
  quickLinks.push(`[Report Bug](../../issues)`);
  quickLinks.push(`[Request Feature](../../issues)`);
  if (quickLinks.length > 0) {
    md += quickLinks.join(' · ') + '\n\n';
  }

  md += `</div>\n\n`;
  md += `---\n\n`;

  // Table of Contents
  const tocItems = [];
  if (data.description) tocItems.push({ label: '📖 About', anchor: '-about' });
  if (data.demoUrl || data.screenshots) tocItems.push({ label: '📸 Screenshots', anchor: '-screenshots' });
  if (data.features) tocItems.push({ label: '✨ Features', anchor: '-features' });
  if (data.techStack) tocItems.push({ label: '🛠 Tech Stack', anchor: '-tech-stack' });
  tocItems.push({ label: '🚀 Getting Started', anchor: '-getting-started' });
  if (data.envVars) tocItems.push({ label: '⚙️ Environment Variables', anchor: '️-environment-variables' });
  if (data.usage) tocItems.push({ label: '💻 Usage', anchor: '-usage' });
  if (data.apiReference) tocItems.push({ label: '📡 API Reference', anchor: '-api-reference' });
  if (data.roadmap) tocItems.push({ label: '🗺️ Roadmap', anchor: '️-roadmap' });
  if (data.faq) tocItems.push({ label: '❓ FAQ', anchor: '-faq' });
  if (data.contributing) tocItems.push({ label: '🤝 Contributing', anchor: '-contributing' });
  if (data.changelog) tocItems.push({ label: '📝 Changelog', anchor: '-changelog' });
  if (data.license) tocItems.push({ label: '📄 License', anchor: '-license' });
  if (data.author) tocItems.push({ label: '👤 Author', anchor: '-author' });

  if (tocItems.length > 4) {
    md += `## 📋 Table of Contents\n\n`;
    tocItems.forEach(({ label, anchor }) => {
      md += `- [${label}](#${anchor})\n`;
    });
    md += '\n';
  }

  // About
  if (data.description) {
    md += `## 📖 About\n\n`;
    md += `${data.description}\n\n`;
  }

  // Screenshots
  if (data.demoUrl || data.screenshots) {
    md += `## 📸 Screenshots\n\n${renderDemoLinks(data)}`;
  }

  // Features
  if (data.features) {
    md += `## ✨ Features\n\n${renderFeaturesWithIcons(data)}\n`;
  }

  // Tech Stack
  if (data.techStack) {
    md += `## 🛠 Tech Stack\n\n${renderTechBadgeRow(data)}\n`;
  }

  // Getting Started
  md += `## 🚀 Getting Started\n\n`;
  md += `### Prerequisites\n\n`;
  if (data.prerequisites) {
    md += `${data.prerequisites}\n\n`;
  } else {
    md += `- [Node.js](https://nodejs.org/) (v16+)\n- npm or yarn\n\n`;
  }

  if (data.installation) {
    md += `### Installation\n\n${renderInstallation(data)}`;
  }

  // Environment Variables
  if (data.envVars) {
    md += `## ⚙️ Environment Variables\n\n`;
    md += `Create a \`.env\` file in the root directory:\n\n`;
    md += `\`\`\`env\n${data.envVars}\n\`\`\`\n\n`;
    md += `${renderEnvVars(data)}`;
  }

  // Usage
  if (data.usage) {
    md += `## 💻 Usage\n\n\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  // API Reference
  if (data.apiReference) {
    md += `## 📡 API Reference\n\n${renderApiReference(data)}`;
  }

  // Roadmap
  if (data.roadmap) {
    md += `## 🗺️ Roadmap\n\n${renderRoadmap(data)}\n`;
    md += `See the [open issues](../../issues) for a full list of proposed features.\n\n`;
  }

  // FAQ
  if (data.faq) {
    md += `## ❓ FAQ\n\n${renderFaq(data)}`;
  }

  // Contributing
  if (data.contributing) {
    md += `## 🤝 Contributing\n\n`;
    md += `Contributions are welcome! Here's how you can help:\n\n`;
    md += renderContributingSteps(data);
  }

  // Changelog
  if (data.changelog) {
    md += `## 📝 Changelog\n\n${renderChangelog(data)}`;
  }

  // License
  if (data.license) {
    md += `## 📄 License\n\nDistributed under the **${data.license}** License. See [\`LICENSE\`](LICENSE) for more information.\n\n`;
  }

  // Author
  if (data.author) {
    md += `## 👤 Author\n\n`;
    md += `**${data.author}**\n\n`;
    md += `[![GitHub](https://img.shields.io/badge/GitHub-@${data.author}-181717?style=flat-square&logo=github)](https://github.com/${data.author})`;
    if (data.authorTwitter) md += `\n[![Twitter](https://img.shields.io/badge/Twitter-@${data.authorTwitter}-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/${data.authorTwitter})`;
    if (data.authorWebsite) md += `\n[![Website](https://img.shields.io/badge/Website-${encodeURIComponent(data.authorWebsite.replace(/https?:\/\//, ''))}-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](${data.authorWebsite})`;
    md += '\n\n';
  }

  // Acknowledgments
  if (data.acknowledgments) {
    md += `## 🙏 Acknowledgments\n\n${renderAcknowledgments(data)}\n`;
  }

  md += renderCustomSections(data);

  // Footer
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  md += `⭐ Star this repo if you find it helpful!\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Open Source — Premium Community-Focused
   ═══════════════════════════════════════════════════════ */
export function openSourceTemplate(data) {
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);
  const slug = data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project';

  // ── Hero Section ──
  md += `<div align="center">\n\n`;
  md += `# ✨ ${data.projectName || 'Project Name'}\n\n`;

  if (data.description) {
    md += `<p align="center">\n  <em>${data.description}</em>\n</p>\n\n`;
  }

  // Badge rows — custom badges first, then tech badges
  if (badges.length > 0) {
    md += `<p align="center">\n  ${badges.join('\n  ')}\n</p>\n\n`;
  }
  if (techBadges.length > 0) {
    md += `<p align="center">\n  ${techBadges.join('\n  ')}\n</p>\n\n`;
  }

  // Action links
  md += `<p align="center">\n`;
  if (data.demoUrl) md += `  <a href="${data.demoUrl}"><strong>🔗 Live Demo</strong></a> ·\n`;
  md += `  <a href="../../issues/new?labels=bug"><strong>🐛 Report Bug</strong></a> ·\n`;
  md += `  <a href="../../issues/new?labels=enhancement"><strong>💡 Request Feature</strong></a>\n`;
  md += `</p>\n\n`;

  md += `</div>\n\n`;

  md += divider();

  // ── Table of Contents ──
  const tocItems = [];
  if (data.description) tocItems.push('📖 About');
  if (data.demoUrl || data.screenshots) tocItems.push('📸 Demo & Screenshots');
  if (data.features) tocItems.push('✨ Features');
  if (data.techStack) tocItems.push('🏗️ Tech Stack');
  tocItems.push('🚀 Getting Started');
  if (data.envVars) tocItems.push('⚙️ Environment Variables');
  if (data.usage) tocItems.push('💻 Usage');
  if (data.apiReference) tocItems.push('📡 API Reference');
  if (data.roadmap) tocItems.push('🗺️ Roadmap');
  if (data.faq) tocItems.push('❓ FAQ');
  tocItems.push('🤝 Contributing');
  if (data.changelog) tocItems.push('📝 Changelog');
  if (data.license) tocItems.push('📄 License');
  if (data.author) tocItems.push('👤 Author');
  if (data.acknowledgments) tocItems.push('🙏 Acknowledgments');

  md += `## 📋 Table of Contents\n\n`;
  md += `<details>\n<summary>Click to expand</summary>\n\n`;
  tocItems.forEach((item) => {
    const anchor = buildTocAnchors(item);
    md += `- [${item}](#${anchor})\n`;
  });
  md += `\n</details>\n\n`;

  // ── About ──
  if (data.description) {
    md += `## 📖 About\n\n`;
    md += `${data.description}\n\n`;

    if (data.author) {
      md += `> **Built with ❤️ by [@${data.author}](https://github.com/${data.author})**\n\n`;
    }
  }

  // ── Demo ──
  if (data.demoUrl || data.screenshots) {
    md += `## 📸 Demo & Screenshots\n\n`;
    md += renderDemoLinks(data);
  }

  // ── Features ──
  if (data.features) {
    md += `## ✨ Features\n\n`;
    md += renderFeaturesTable(data);
    md += '\n';
  }

  // ── Tech Stack ──
  if (data.techStack) {
    md += `## 🏗️ Tech Stack\n\n`;
    md += `<div align="center">\n\n`;
    md += renderTechBadgeRow(data);
    md += `\n</div>\n\n`;
  }

  // ── Getting Started ──
  md += `## 🚀 Getting Started\n\n`;
  md += `### Prerequisites\n\n`;
  if (data.prerequisites) {
    md += `${data.prerequisites}\n\n`;
  } else {
    md += `- [Node.js](https://nodejs.org/) (v16+)\n- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)\n\n`;
  }

  if (data.installation) {
    md += `### 📥 Installation\n\n${renderInstallation(data)}`;
  }

  // ── Environment Variables ──
  if (data.envVars) {
    md += `## ⚙️ Environment Variables\n\n`;
    md += `> **Note:** Create a \`.env\` file in the root directory based on \`.env.example\`\n\n`;
    md += `\`\`\`env\n${data.envVars}\n\`\`\`\n\n`;
    md += renderEnvVars(data);
  }

  // ── Usage ──
  if (data.usage) {
    md += `## 💻 Usage\n\n\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  // ── API Reference ──
  if (data.apiReference) {
    md += `## 📡 API Reference\n\n${renderApiReference(data)}`;
  }

  // ── Roadmap ──
  if (data.roadmap) {
    md += `## 🗺️ Roadmap\n\n`;
    md += renderRoadmap(data);
    md += `\nSee the [open issues](../../issues) for a full list of proposed features and known issues.\n\n`;
  }

  // ── FAQ ──
  if (data.faq) {
    md += `## ❓ FAQ\n\n${renderFaq(data)}`;
  }

  // ── Contributing ──
  md += `## 🤝 Contributing\n\n`;
  md += `Contributions are what make the open source community such an amazing place to learn, inspire, and create.\n`;
  md += `Any contributions you make are **greatly appreciated**.\n\n`;
  md += renderContributingSteps(data);

  // ── Changelog ──
  if (data.changelog) {
    md += `## 📝 Changelog\n\n${renderChangelog(data)}`;
  }

  // ── License ──
  if (data.license) {
    md += `## 📄 License\n\n`;
    md += `This project is licensed under the **${data.license}** License — see the [\`LICENSE\`](LICENSE) file for details.\n\n`;
  }

  // ── Author ──
  if (data.author) {
    md += `## 👤 Author\n\n`;
    md += `<table>\n  <tr>\n`;
    md += `    <td align="center">\n`;
    md += `      <a href="https://github.com/${data.author}">\n`;
    md += `        <img src="https://github.com/${data.author}.png" width="100px;" alt="${data.author}"/><br />\n`;
    md += `        <sub><b>${data.author}</b></sub>\n`;
    md += `      </a><br />\n`;
    const authorLinks = [];
    authorLinks.push(`<a href="https://github.com/${data.author}" title="GitHub">💻</a>`);
    if (data.authorTwitter) authorLinks.push(`<a href="https://twitter.com/${data.authorTwitter}" title="Twitter">🐦</a>`);
    if (data.authorWebsite) authorLinks.push(`<a href="${data.authorWebsite}" title="Website">🌐</a>`);
    md += `      ${authorLinks.join(' ')}\n`;
    md += `    </td>\n`;
    md += `  </tr>\n</table>\n\n`;
  }

  // ── Acknowledgments ──
  if (data.acknowledgments) {
    md += `## 🙏 Acknowledgments\n\n${renderAcknowledgments(data)}\n`;
  }

  md += renderCustomSections(data);

  // ── Footer ──
  md += divider();

  md += `<div align="center">\n\n`;
  md += `**If you found this project helpful, please consider giving it a ⭐**\n\n`;
  md += `[![Star History](https://img.shields.io/github/stars/${data.author || 'username'}/${slug}?style=social)](../../stargazers)\n\n`;
  md += `Made with ❤️ and lots of ☕\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Enterprise — Professional & Comprehensive
   ═══════════════════════════════════════════════════════ */
export function enterpriseTemplate(data) {
  const slug = data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project';
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // ── Premium Header ──
  md += `<div align="center">\n\n`;
  md += `<br>\n\n`;
  md += `# ${data.projectName || 'Project Name'}\n\n`;

  if (data.description) {
    md += `### ${data.description}\n\n`;
  }

  // Badge rows
  if (badges.length > 0) {
    md += `<p>\n  ${badges.join('\n  ')}\n</p>\n\n`;
  }
  if (techBadges.length > 0) {
    md += `<p>\n  ${techBadges.join('\n  ')}\n</p>\n\n`;
  }

  // Navigation bar
  md += `<p>\n`;
  md += `  <a href="#-getting-started"><strong>Getting Started</strong></a> · \n`;
  md += `  <a href="#-documentation"><strong>Documentation</strong></a> · \n`;
  md += `  <a href="#-contributing"><strong>Contributing</strong></a>`;
  if (data.roadmap) md += ` · \n  <a href="#️-roadmap"><strong>Roadmap</strong></a>`;
  if (data.apiReference) md += ` · \n  <a href="#-api-reference"><strong>API</strong></a>`;
  md += `\n</p>\n\n`;

  md += `<br>\n\n`;
  md += `</div>\n\n`;

  md += `---\n\n`;

  // ── About ──
  md += `## 📖 About\n\n`;
  md += `${data.description || 'Add a detailed project description.'}\n\n`;

  // Key highlights callout
  if (data.features) {
    const featureLines = data.features.split('\n').filter(Boolean);
    if (featureLines.length > 0) {
      md += `> **Key Highlights:**\n`;
      featureLines.slice(0, 3).forEach((f) => {
        md += `> - ${f.replace(/^[-*✅🔹•]\s*/u, '').trim()}\n`;
      });
      md += '\n';
    }
  }

  // ── Demo ──
  if (data.demoUrl || data.screenshots) {
    md += `## 📸 Demo & Screenshots\n\n`;
    md += renderDemoLinks(data);
  }

  // ── Features ──
  if (data.features) {
    md += `## ✨ Key Features\n\n`;
    md += renderFeaturesTable(data);
    md += '\n';
  }

  // ── Architecture & Tech Stack ──
  if (data.techStack) {
    md += `## 🏗️ Architecture & Tech Stack\n\n`;
    md += renderTechTable(data);
  }

  // ── Getting Started ──
  md += `## 🚀 Getting Started\n\n`;

  md += `### System Requirements\n\n`;
  if (data.prerequisites) {
    md += `${data.prerequisites}\n\n`;
  } else {
    md += `| Requirement | Version |\n|:---|:---|\n| Node.js | \`>= 16.x\` |\n| npm / yarn | \`>= 8.x\` / \`>= 1.22.x\` |\n\n`;
  }

  if (data.installation) {
    md += `### 📥 Installation\n\n`;
    md += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${data.author || 'username'}/${slug}.git\n\n`;
    md += `# Navigate to project directory\ncd ${slug}\n\n`;
    md += `# Install dependencies\n${data.installation}\n\`\`\`\n\n`;
  }

  // ── Environment Configuration ──
  if (data.envVars) {
    md += `### ⚙️ Environment Configuration\n\n`;
    md += `Copy the example env file and configure:\n\n`;
    md += `\`\`\`bash\ncp .env.example .env\n\`\`\`\n\n`;
    md += `\`\`\`env\n${data.envVars}\n\`\`\`\n\n`;
    md += renderEnvVars(data);
  }

  // ── Running ──
  if (data.usage) {
    md += `### ▶️ Running the Application\n\n\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  // ── Documentation ──
  md += `## 📚 Documentation\n\n`;
  md += `| Resource | Link |\n|:---|:---|\n`;
  md += `| 📖 Wiki | [Project Wiki](../../wiki) |\n`;
  md += `| 📁 Docs Directory | [\`/docs\`](./docs) |\n`;
  if (data.apiReference) md += `| 📡 API Reference | [API Docs](#-api-reference) |\n`;
  if (data.demoUrl) md += `| 🔗 Live Demo | [${data.demoUrl}](${data.demoUrl}) |\n`;
  md += '\n';

  // ── API Reference ──
  if (data.apiReference) {
    md += `## 📡 API Reference\n\n${renderApiReference(data)}`;
  }

  // ── Roadmap ──
  if (data.roadmap) {
    md += `## 🗺️ Roadmap\n\n`;
    md += renderRoadmap(data);
    md += `\n> See the [open issues](../../issues) for a full list of proposed features and known bugs.\n\n`;
  }

  // ── FAQ ──
  if (data.faq) {
    md += `## ❓ FAQ\n\n${renderFaq(data)}`;
  }

  // ── Contributing ──
  md += `## 🤝 Contributing\n\n`;
  md += `We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.\n\n`;
  md += renderContributingSteps(data);

  // ── Changelog ──
  if (data.changelog) {
    md += `## 📝 Changelog\n\n`;
    md += `See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.\n\n`;
    md += renderChangelog(data);
  }

  // ── License ──
  if (data.license) {
    md += `## 📄 License\n\n`;
    md += `Distributed under the **${data.license}** License. See [\`LICENSE\`](LICENSE) for more information.\n\n`;
  }

  // ── Team ──
  if (data.author) {
    md += `## 👥 Team & Maintainers\n\n`;
    md += `<table>\n  <tr>\n`;
    md += `    <td align="center">\n`;
    md += `      <a href="https://github.com/${data.author}">\n`;
    md += `        <img src="https://github.com/${data.author}.png" width="80px;" alt="${data.author}" style="border-radius:50%"/><br />\n`;
    md += `        <sub><b>${data.author}</b></sub>\n`;
    md += `      </a><br />\n`;
    md += `      <sub>Lead Developer</sub>\n`;
    md += `    </td>\n`;
    md += `  </tr>\n</table>\n\n`;
  }

  // ── Acknowledgments ──
  if (data.acknowledgments) {
    md += `## 🙏 Acknowledgments\n\n${renderAcknowledgments(data)}\n`;
  }

  md += renderCustomSections(data);

  // ── Footer ──
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  md += `<sub>Built with precision by ${data.author ? `<a href="https://github.com/${data.author}">@${data.author}</a>` : 'the team'}</sub>\n\n`;
  md += `[![Star this repo](https://img.shields.io/badge/⭐_Star_This_Repo-FFD700?style=for-the-badge)](../../stargazers)\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: API Docs — Comprehensive API Documentation
   ═══════════════════════════════════════════════════════ */
export function apiDocsTemplate(data) {
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // ── Header ──
  md += `<div align="center">\n\n`;
  md += `# 📡 ${data.projectName || 'API Name'}\n\n`;

  if (data.description) {
    md += `**${data.description}**\n\n`;
  }

  if (badges.length > 0 || techBadges.length > 0) {
    md += [...badges, ...techBadges].join(' ') + '\n\n';
  }

  md += `</div>\n\n`;
  md += `---\n\n`;

  // ── Base URL ──
  if (data.demoUrl) {
    md += `## 🌐 Base URL\n\n`;
    md += `\`\`\`\n${data.demoUrl}\n\`\`\`\n\n`;
  }

  // ── Authentication ──
  md += `## 🔐 Authentication\n\n`;
  md += `All API requests require authentication. Include your API key in the request headers:\n\n`;
  md += `\`\`\`http\nAuthorization: Bearer YOUR_API_KEY\nContent-Type: application/json\n\`\`\`\n\n`;
  md += `> **⚠️ Important:** Never expose your API key in client-side code or public repositories.\n\n`;

  // ── Quick Start ──
  if (data.installation) {
    md += `## ⚡ Quick Start\n\n\`\`\`bash\n${data.installation}\n\`\`\`\n\n`;
  }

  // ── Configuration ──
  if (data.envVars) {
    md += `## ⚙️ Configuration\n\n`;
    md += `\`\`\`env\n${data.envVars}\n\`\`\`\n\n`;
    md += renderEnvVars(data);
  }

  // ── Endpoints ──
  if (data.apiReference) {
    md += `## 📡 Endpoints\n\n${renderApiReference(data)}`;
  }

  // ── Usage Examples ──
  if (data.usage) {
    md += `## 💡 Usage Examples\n\n`;
    md += `### cURL\n\n\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  // ── Features ──
  if (data.features) {
    md += `## ✨ Features\n\n${renderFeaturesWithIcons(data)}\n`;
  }

  // ── Built With ──
  if (data.techStack) {
    md += `## 🛠️ Built With\n\n`;
    md += `<div align="center">\n\n${renderTechBadgeRow(data)}\n</div>\n\n`;
  }

  // ── Rate Limiting ──
  md += `## 📊 Rate Limiting\n\n`;
  md += `| Plan | Requests/min | Requests/day | Burst |\n|:---:|:---:|:---:|:---:|\n`;
  md += `| 🆓 Free | 60 | 1,000 | 10 |\n`;
  md += `| 💎 Pro | 300 | 10,000 | 50 |\n`;
  md += `| 🏢 Enterprise | Unlimited | Unlimited | Unlimited |\n\n`;

  // ── Error Codes ──
  md += `## 🚨 Error Handling\n\n`;
  md += `All errors follow a consistent format:\n\n`;
  md += `\`\`\`json\n{\n  "error": {\n    "code": 400,\n    "message": "Invalid request parameters",\n    "details": "The 'email' field is required"\n  }\n}\n\`\`\`\n\n`;
  md += `### Status Codes\n\n`;
  md += `| Code | Status | Description |\n|:---:|:---|:---|\n`;
  md += `| \`200\` | ✅ OK | Request successful |\n`;
  md += `| \`201\` | ✅ Created | Resource created successfully |\n`;
  md += `| \`400\` | ⚠️ Bad Request | Invalid parameters |\n`;
  md += `| \`401\` | 🔒 Unauthorized | Invalid or missing API key |\n`;
  md += `| \`403\` | 🚫 Forbidden | Insufficient permissions |\n`;
  md += `| \`404\` | ❓ Not Found | Resource doesn't exist |\n`;
  md += `| \`429\` | ⏳ Too Many Requests | Rate limit exceeded |\n`;
  md += `| \`500\` | 💥 Server Error | Internal server error |\n\n`;

  // ── FAQ ──
  if (data.faq) {
    md += `## ❓ FAQ\n\n${renderFaq(data)}`;
  }

  // ── Changelog ──
  if (data.changelog) {
    md += `## 📝 Changelog\n\n${renderChangelog(data)}`;
  }

  // ── Roadmap ──
  if (data.roadmap) {
    md += `## 🗺️ Roadmap\n\n${renderRoadmap(data)}\n`;
  }

  // ── License ──
  if (data.license) {
    md += `## 📄 License\n\n[${data.license}](LICENSE)\n\n`;
  }

  md += renderCustomSections(data);

  // ── Footer ──
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  if (data.author) {
    md += `Maintained by **[@${data.author}](https://github.com/${data.author})**\n\n`;
  }
  md += `[![API Status](https://img.shields.io/badge/API_Status-Operational-2ea043?style=for-the-badge)](${data.demoUrl || '#'})\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Library/Package — npm/pip Package README
   ═══════════════════════════════════════════════════════ */
export function libraryTemplate(data) {
  const slug = data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'package';
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // ── Premium Header ──
  md += `<div align="center">\n\n`;
  md += `# 📦 ${data.projectName || 'Package Name'}\n\n`;

  if (data.description) {
    md += `<p align="center">\n  <em>${data.description}</em>\n</p>\n\n`;
  }

  // Badge rows
  if (badges.length > 0) {
    md += `<p align="center">\n  ${badges.join('\n  ')}\n</p>\n\n`;
  }

  // npm-style badges
  md += `<p align="center">\n`;
  md += `  <a href="https://www.npmjs.com/package/${slug}"><img src="https://img.shields.io/npm/v/${slug}?style=flat-square&color=cb3837&label=npm" alt="npm version" /></a>\n`;
  md += `  <a href="https://www.npmjs.com/package/${slug}"><img src="https://img.shields.io/npm/dm/${slug}?style=flat-square&color=blue&label=downloads" alt="npm downloads" /></a>\n`;
  md += `  <a href="https://bundlephobia.com/package/${slug}"><img src="https://img.shields.io/bundlephobia/minzip/${slug}?style=flat-square&label=size" alt="bundle size" /></a>\n`;
  md += `</p>\n\n`;

  if (techBadges.length > 0) {
    md += `<p align="center">\n  ${techBadges.join('\n  ')}\n</p>\n\n`;
  }

  md += `</div>\n\n`;
  md += `---\n\n`;

  // ── Installation ──
  md += `## 📥 Installation\n\n`;
  md += `\`\`\`bash\n# npm\nnpm install ${slug}\n\n# yarn\nyarn add ${slug}\n\n# pnpm\npnpm add ${slug}\n\`\`\`\n\n`;

  if (data.installation) {
    md += `### Additional Setup\n\n\`\`\`bash\n${data.installation}\n\`\`\`\n\n`;
  }

  // ── Quick Start ──
  if (data.usage) {
    md += `## 🚀 Quick Start\n\n\`\`\`javascript\n${data.usage}\n\`\`\`\n\n`;
  }

  // ── Features ──
  if (data.features) {
    md += `## ✨ Features\n\n`;
    md += renderFeaturesTable(data);
    md += '\n';
  }

  // ── API ──
  if (data.apiReference) {
    md += `## 📖 API Reference\n\n${renderApiReference(data)}`;
  }

  // ── Configuration ──
  if (data.envVars) {
    md += `## ⚙️ Configuration\n\n${renderEnvVars(data)}`;
  }

  // ── Tech Stack ──
  if (data.techStack) {
    md += `## 🛠️ Built With\n\n`;
    md += `<div align="center">\n\n${renderTechBadgeRow(data)}\n</div>\n\n`;
  }

  // ── FAQ ──
  if (data.faq) {
    md += `## ❓ FAQ\n\n${renderFaq(data)}`;
  }

  // ── Contributing ──
  if (data.contributing) {
    md += `## 🤝 Contributing\n\n`;
    md += renderContributingSteps(data);
  }

  // ── Changelog ──
  if (data.changelog) {
    md += `## 📝 Changelog\n\n${renderChangelog(data)}`;
  }

  // ── Roadmap ──
  if (data.roadmap) {
    md += `## 🗺️ Roadmap\n\n${renderRoadmap(data)}\n`;
  }

  // ── License ──
  if (data.license) {
    md += `## 📄 License\n\n[${data.license}](LICENSE)\n\n`;
  }

  md += renderCustomSections(data);

  // ── Acknowledgments ──
  if (data.acknowledgments) {
    md += `## 🙏 Acknowledgments\n\n${renderAcknowledgments(data)}\n`;
  }

  // ── Footer ──
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  if (data.author) {
    md += `Made with ❤️ by **[@${data.author}](https://github.com/${data.author})**\n\n`;
  }
  md += `If this package helps you, consider giving it a ⭐\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Profile README — GitHub Profile (username/username)
   ═══════════════════════════════════════════════════════ */
export function profileTemplate(data) {
  const user = data.author || 'username';
  let md = '';
  const techBadges = generateTechBadges(data);

  // ── Typing SVG Header ──
  md += `<div align="center">\n\n`;
  md += `<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=3000&pause=1000&color=2D79FF&center=true&vCenter=true&random=false&width=500&lines=${encodeURIComponent(`Hi 👋, I'm ${data.projectName || user}`)};${encodeURIComponent(data.description || 'A passionate developer')}" alt="Typing SVG" />\n\n`;

  // ── Social badges ──
  const socialBadges = [];
  socialBadges.push(`[![GitHub followers](https://img.shields.io/github/followers/${user}?style=for-the-badge&logo=github&color=181717)](https://github.com/${user})`);
  if (data.authorTwitter) {
    socialBadges.push(`[![Twitter](https://img.shields.io/badge/@${data.authorTwitter}-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${data.authorTwitter})`);
  }
  if (data.authorWebsite) {
    socialBadges.push(`[![Portfolio](https://img.shields.io/badge/Portfolio-000?style=for-the-badge&logo=vercel&logoColor=white)](${data.authorWebsite})`);
  }
  socialBadges.push(`![Profile Views](https://komarev.com/ghpvc/?username=${user}&color=blueviolet&style=for-the-badge&label=PROFILE+VIEWS)`);

  md += socialBadges.join(' ') + '\n\n';
  md += `</div>\n\n`;

  // ── Divider ──
  md += `<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">\n\n`;

  // ── About Me ──
  md += `## 🙋‍♂️ About Me\n\n`;
  if (data.description) {
    md += `${data.description}\n\n`;
  }

  // Quick facts bullets
  const facts = [];
  if (data.features) {
    const lines = data.features.split('\n').filter(Boolean);
    lines.forEach(line => {
      facts.push(line.replace(/^[-*✅🔹•]\s*/u, '').trim());
    });
  }
  if (facts.length > 0) {
    facts.forEach(fact => {
      md += `- ${fact}\n`;
    });
    md += '\n';
  }

  if (data.demoUrl) {
    md += `- 🔗 **Portfolio:** [${data.demoUrl.replace(/https?:\/\//, '')}](${data.demoUrl})\n\n`;
  }

  // ── Tech Stack ──
  if (data.techStack) {
    md += `## 🛠️ Tech Stack\n\n`;
    md += `<div align="center">\n\n`;
    md += techBadges.join(' ') + '\n';
    md += `\n</div>\n\n`;
  }

  // ── GitHub Stats ──
  md += `## 📊 GitHub Stats\n\n`;
  md += `<div align="center">\n\n`;
  md += `<img src="https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&theme=tokyonight&hide_border=true&count_private=true" alt="GitHub Stats" height="180" />\n`;
  md += `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${user}&layout=compact&theme=tokyonight&hide_border=true&langs_count=8" alt="Top Languages" height="180" />\n\n`;
  md += `</div>\n\n`;

  md += `<div align="center">\n\n`;
  md += `<img src="https://github-readme-streak-stats.herokuapp.com/?user=${user}&theme=tokyonight&hide_border=true" alt="GitHub Streak" />\n\n`;
  md += `</div>\n\n`;

  // ── Trophies ──
  md += `## 🏆 GitHub Trophies\n\n`;
  md += `<div align="center">\n\n`;
  md += `<img src="https://github-profile-trophy.vercel.app/?username=${user}&theme=tokyonight&no-frame=true&no-bg=true&row=1&column=7" alt="Trophies" />\n\n`;
  md += `</div>\n\n`;

  // ── Contribution Graph ──
  md += `## 📈 Contribution Graph\n\n`;
  md += `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=tokyo-night&hide_border=true" alt="Contribution Graph" width="100%" />\n\n`;

  // ── Current projects / Roadmap ──
  if (data.roadmap) {
    md += `## 🗺️ Current Focus\n\n`;
    md += renderRoadmap(data);
    md += '\n';
  }

  // ── Blog / Usage as articles ──
  if (data.usage) {
    md += `## ✍️ Latest Blog Posts\n\n`;
    const posts = data.usage.split('\n').filter(Boolean);
    posts.forEach(post => {
      md += `- ${post}\n`;
    });
    md += `\n<!-- BLOG-POST-LIST:START -->\n<!-- BLOG-POST-LIST:END -->\n\n`;
  }

  // ── Fun section ──
  md += `## 😄 Random Dev Quote\n\n`;
  md += `<div align="center">\n\n`;
  md += `<img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" alt="Random Dev Quote" />\n\n`;
  md += `</div>\n\n`;

  // ── Acknowledgments as "Support" ──
  if (data.acknowledgments) {
    md += `## 💖 Support\n\n`;
    md += renderAcknowledgments(data);
    md += '\n';
  }

  md += renderCustomSections(data);

  // ── Footer ──
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  md += `**Thanks for visiting! ⭐ Star my repos if you find them interesting!**\n\n`;
  md += `<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer" width="100%" />\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══════════════════════════════════════════════════════
   Template: Hackathon — Quick project submission README
   ═══════════════════════════════════════════════════════ */
export function hackathonTemplate(data) {
  let md = '';
  const badges = generateBadges(data);
  const techBadges = generateTechBadges(data);

  // ── Header ──
  md += `<div align="center">\n\n`;
  md += `# 🏆 ${data.projectName || 'Project Name'}\n\n`;

  if (data.description) {
    md += `### _${data.description}_\n\n`;
  }

  if (badges.length > 0 || techBadges.length > 0) {
    md += [...badges, ...techBadges].join(' ') + '\n\n';
  }

  // Links row
  const links = [];
  if (data.demoUrl) links.push(`[🔗 Live Demo](${data.demoUrl})`);
  links.push(`[📹 Demo Video](#-demo)`);
  links.push(`[📊 Slides](#-presentation)`);
  md += links.join(' • ') + '\n\n';

  md += `</div>\n\n`;
  md += `---\n\n`;

  // ── Problem Statement ──
  md += `## 💡 Problem Statement\n\n`;
  if (data.description) {
    md += `${data.description}\n\n`;
  } else {
    md += `Describe the problem your project solves...\n\n`;
  }

  // ── Solution ──
  if (data.features) {
    md += `## 🚀 Our Solution\n\n`;
    md += renderFeaturesWithIcons(data);
    md += '\n';
  }

  // ── Demo ──
  md += `## 🎬 Demo\n\n`;
  if (data.demoUrl) {
    md += `🔗 **Live Demo:** [${data.demoUrl}](${data.demoUrl})\n\n`;
  }
  if (data.screenshots) {
    md += data.screenshots + '\n\n';
  } else {
    md += `> Add screenshots, GIFs, or a video link of your project in action!\n\n`;
  }

  // ── Tech Stack ──
  if (data.techStack) {
    md += `## 🛠️ Built With\n\n`;
    md += `<div align="center">\n\n${techBadges.join(' ')}\n\n</div>\n\n`;
  }

  // ── Setup ──
  md += `## ⚡ Quick Setup\n\n`;
  if (data.prerequisites) {
    md += `### Prerequisites\n\n${data.prerequisites}\n\n`;
  }
  if (data.installation) {
    md += `\`\`\`bash\n# Clone & install\ngit clone https://github.com/${data.author || 'team'}/${data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project'}.git\ncd ${data.projectName?.toLowerCase().replace(/\s+/g, '-') || 'project'}\n${data.installation}\n\`\`\`\n\n`;
  }
  if (data.envVars) {
    md += `\`\`\`env\n${data.envVars}\n\`\`\`\n\n`;
  }
  if (data.usage) {
    md += `\`\`\`bash\n${data.usage}\n\`\`\`\n\n`;
  }

  // ── API ──
  if (data.apiReference) {
    md += `## 📡 API Endpoints\n\n${renderApiReference(data)}`;
  }

  // ── Architecture ──
  md += `## 🏗️ Architecture\n\n`;
  md += `> _Add your system architecture diagram here_\n\n`;
  md += `\`\`\`\n┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│   Frontend   │────▶│   Backend    │────▶│  Database    │\n│  (React)     │◀────│  (Node.js)   │◀────│  (MongoDB)   │\n└─────────────┘     └─────────────┘     └─────────────┘\n\`\`\`\n\n`;

  // ── Future ──
  if (data.roadmap) {
    md += `## 🔮 What's Next\n\n${renderRoadmap(data)}\n`;
  }

  // ── Team ──
  md += `## 👥 Team\n\n`;
  if (data.author) {
    md += `| Name | Role | GitHub |\n|:---|:---|:---|\n`;
    md += `| ${data.author} | Lead Developer | [@${data.author}](https://github.com/${data.author}) |\n\n`;
  }

  // ── License ──
  if (data.license) {
    md += `## 📄 License\n\n[${data.license}](LICENSE)\n\n`;
  }

  md += renderCustomSections(data);

  // ── Footer ──
  md += `---\n\n`;
  md += `<div align="center">\n\n`;
  md += `**Built with ❤️ at [Hackathon Name]**\n\n`;
  md += `⭐ Star this repo if you like our project!\n\n`;
  md += `</div>\n`;

  return md;
}

/* ═══ Template registry ═══ */
export const TEMPLATES = {
  minimal:    { name: 'Minimal',     emoji: '📄', description: 'Elegant & clean for small projects',                fn: minimalTemplate },
  standard:   { name: 'Standard',    emoji: '📘', description: 'Professional balanced README',                      fn: standardTemplate },
  openSource: { name: 'Open Source', emoji: '🌍', description: 'Premium community-focused with visual flair',       fn: openSourceTemplate },
  enterprise: { name: 'Enterprise',  emoji: '🏢', description: 'Comprehensive enterprise-grade documentation',      fn: enterpriseTemplate },
  apiDocs:    { name: 'API Docs',    emoji: '📡', description: 'Complete API documentation with status codes',       fn: apiDocsTemplate },
  library:    { name: 'Library',     emoji: '📦', description: 'npm/pip package with install badges & size info',    fn: libraryTemplate },
  profile:    { name: 'Profile',     emoji: '👤', description: 'GitHub profile README with stats & widgets',         fn: profileTemplate },
  hackathon:  { name: 'Hackathon',   emoji: '🏆', description: 'Quick project submission with problem/solution',     fn: hackathonTemplate },
};
