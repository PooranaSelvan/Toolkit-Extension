import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileStack, Copy, Check, ChevronRight, BookOpen } from 'lucide-react';

/* ════════════════════════════════════════════════
   Section Templates — Pre-written content blocks
   for Contributing, Code of Conduct, Security, etc.
   ════════════════════════════════════════════════ */

const SECTION_TEMPLATES = [
  {
    id: 'contributing-detailed',
    category: 'Community',
    name: 'Detailed Contributing Guide',
    description: 'Comprehensive step-by-step contribution workflow',
    field: 'contributing',
    content: `We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Development Process
We use GitHub Flow, so all code changes happen through Pull Requests:

1. Fork the repo and create your branch from \`main\`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

### Any contributions you make will be under the project's license
When you submit code changes, your submissions are understood to be under the same license that covers the project.

### Report bugs using GitHub Issues
We use GitHub issues to track public bugs. Report a bug by opening a new issue.

### Write bug reports with detail, background, and sample code
**Great Bug Reports** tend to have:
- A quick summary and/or background
- Steps to reproduce (be specific!)
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)`,
  },
  {
    id: 'contributing-simple',
    category: 'Community',
    name: 'Simple Contributing Guide',
    description: 'Short and sweet contribution guidelines',
    field: 'contributing',
    content: `Contributions are always welcome!

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.`,
  },
  {
    id: 'code-of-conduct',
    category: 'Community',
    name: 'Code of Conduct (Contributor Covenant)',
    description: 'Standard Contributor Covenant Code of Conduct',
    field: 'customSection',
    title: 'Code of Conduct',
    content: `This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

**Our Pledge:** We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

**Our Standards:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members`,
  },
  {
    id: 'security-policy',
    category: 'Community',
    name: 'Security Policy',
    description: 'How to report security vulnerabilities',
    field: 'customSection',
    title: 'Security',
    content: `### Reporting a Vulnerability

If you discover a security vulnerability, please do **NOT** open a public issue.

Instead, please send an email to **security@example.com** with:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Possible impact

We take security seriously and will respond within **48 hours**.

### Security Best Practices
- Keep dependencies up to date
- Never commit secrets or API keys
- Use environment variables for configuration
- Follow the principle of least privilege`,
  },
  {
    id: 'deployment-guide',
    category: 'Setup',
    name: 'Deployment Guide',
    description: 'Docker, Vercel, Netlify deployment instructions',
    field: 'customSection',
    title: 'Deployment',
    content: `### Docker

\`\`\`bash
# Build the image
docker build -t my-project .

# Run the container
docker run -p 3000:3000 my-project
\`\`\`

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/repo)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/username/repo)

### Manual Deployment

\`\`\`bash
# Build for production
npm run build

# The build output will be in the dist/ directory
# Serve it with any static file server
npx serve dist
\`\`\``,
  },
  {
    id: 'testing-guide',
    category: 'Setup',
    name: 'Testing Guide',
    description: 'Instructions for running tests',
    field: 'customSection',
    title: 'Testing',
    content: `### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

### Test Structure

\`\`\`
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/            # End-to-end tests
└── fixtures/       # Test fixtures & mocks
\`\`\`

### Writing Tests

We use [Jest](https://jestjs.io/) for testing. Please ensure:
- All new features have corresponding tests
- Test coverage doesn't decrease
- Tests are meaningful (not just for coverage)`,
  },
  {
    id: 'project-structure',
    category: 'Documentation',
    name: 'Project Structure',
    description: 'Directory tree with descriptions',
    field: 'customSection',
    title: 'Project Structure',
    content: `\`\`\`
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components / routes
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions & helpers
│   ├── contexts/       # React context providers
│   ├── styles/         # Global styles & themes
│   ├── App.jsx         # Root application component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── tests/              # Test files
├── docs/               # Documentation
├── .env.example        # Environment variable template
├── package.json        # Dependencies & scripts
└── README.md           # You are here!
\`\`\``,
  },
  {
    id: 'support-section',
    category: 'Community',
    name: 'Support & Help',
    description: 'How to get help and support channels',
    field: 'customSection',
    title: 'Support',
    content: `Need help? Here's how to get support:

- 📖 **Documentation**: Check the [Wiki](../../wiki) for detailed guides
- 💬 **Discussions**: Ask questions in [GitHub Discussions](../../discussions)
- 🐛 **Bug Reports**: Open an [issue](../../issues/new?labels=bug) with a clear description
- 💡 **Feature Requests**: Suggest features via [issues](../../issues/new?labels=enhancement)
- 📧 **Email**: Reach out at support@example.com

> **Tip**: Before asking a question, please search existing issues and discussions — your question may have already been answered!`,
  },
  {
    id: 'quick-features',
    category: 'Content',
    name: 'Feature Highlights (Rich)',
    description: 'Detailed feature list with emoji & descriptions',
    field: 'features',
    content: `🚀 Lightning Fast — Optimized for performance with lazy loading & code splitting
🎨 Beautiful UI — Modern, responsive design with dark mode support
🔒 Secure — Built-in authentication, CSRF protection & input sanitization
📱 Mobile First — Fully responsive across all screen sizes
🧩 Modular — Plugin-based architecture for easy customization
📊 Analytics — Built-in dashboard with real-time metrics
🌐 i18n Ready — Multi-language support out of the box
⚡ Real-time — WebSocket-powered live updates
🔧 Developer Experience — Hot reload, TypeScript, ESLint & Prettier configured
📦 CI/CD — Automated testing & deployment pipelines included`,
  },
  {
    id: 'changelog-sample',
    category: 'Documentation',
    name: 'Changelog Template',
    description: 'Versioned changelog following Keep a Changelog',
    field: 'changelog',
    content: `### [1.0.0] - 2024-01-15

#### Added
- Initial release
- User authentication (login, register, forgot password)
- Dashboard with analytics
- REST API with full CRUD operations
- Docker support for easy deployment

#### Changed
- Upgraded to React 18
- Improved mobile responsiveness

#### Fixed
- Fixed issue with dark mode toggle persistence
- Resolved memory leak in WebSocket connection

### [0.9.0] - 2024-01-01

#### Added
- Beta release for early testers
- Basic CRUD functionality
- Dark mode support`,
  },
];

const CATEGORIES = [...new Set(SECTION_TEMPLATES.map(t => t.category))];

export default function SectionTemplates({ onApply, formData }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [appliedId, setAppliedId] = useState(null);

  const handleApply = (template) => {
    if (template.field === 'customSection') {
      // Add as custom section
      const currentSections = formData.customSections || [];
      onApply('customSections', [
        ...currentSections,
        { title: template.title, content: template.content },
      ]);
    } else {
      // Direct field assignment
      onApply(template.field, template.content);
    }
    setAppliedId(template.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
              <FileStack size={14} className="text-primary" />
            </div>
            Section Templates
            <span className="badge badge-xs badge-primary">{SECTION_TEMPLATES.length}</span>
          </h3>
        </div>

        <p className="text-[11px] text-base-content/60 mb-3 flex items-center gap-1.5">
          <BookOpen size={10} />
          Pre-written content blocks — click to insert into your README
        </p>

        {/* Category list */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
          {CATEGORIES.map((cat) => {
            const templates = SECTION_TEMPLATES.filter(t => t.category === cat);
            return (
              <div key={cat} className="rounded-lg border border-base-200 overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-base-200/50 transition-colors"
                >
                  <span className="text-xs font-bold">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-base-content/50">{templates.length}</span>
                    <motion.div
                      animate={{ rotate: expandedCategory === cat ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight size={12} className="text-base-content/50" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCategory === cat && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-base-200 bg-base-200/20 p-2 space-y-2">
                        {templates.map((tmpl) => (
                          <div
                            key={tmpl.id}
                            className="rounded-lg border border-base-200 bg-base-100 p-3 hover:border-primary/20 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{tmpl.name}</p>
                                <p className="text-[10px] text-base-content/60">{tmpl.description}</p>
                              </div>
                              <motion.button
                                onClick={() => handleApply(tmpl)}
                                className={`btn btn-xs gap-1 rounded-lg shrink-0 transition-all ${
                                  appliedId === tmpl.id
                                    ? 'btn-success shadow-sm shadow-success/20'
                                    : 'btn-primary'
                                }`}
                              >
                                {appliedId === tmpl.id ? (
                                  <><Check size={10} /> Applied</>
                                ) : (
                                  <><Copy size={10} /> Apply</>
                                )}
                              </motion.button>
                            </div>
                            {/* Preview snippet */}
                            <pre className="text-[10px] font-mono text-base-content/50 max-h-16 overflow-hidden bg-base-200/40 rounded p-1.5 mt-1.5 select-none leading-relaxed">
                              {tmpl.content.slice(0, 200)}...
                            </pre>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="badge badge-xs badge-ghost">
                                {tmpl.field === 'customSection' ? '➕ Custom Section' : `📝 ${tmpl.field}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
