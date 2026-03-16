import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

const ghHeaders = {
  Accept: 'application/vnd.github.v3+json',
};

/**
 * Parse a GitHub repo URL into { owner, repo }.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - github.com/owner/repo
 *   - owner/repo
 */
export function parseGitHubUrl(url) {
  if (!url) return null;

  const cleaned = url.trim().replace(/\.git$/, '').replace(/\/$/, '');

  // Try full URL pattern
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/;
  const urlMatch = cleaned.match(urlPattern);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Try owner/repo pattern
  const shortPattern = /^([^/]+)\/([^/]+)$/;
  const shortMatch = cleaned.match(shortPattern);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

/**
 * Fetch repository details from GitHub public API.
 */
export async function fetchRepoDetails(owner, repo) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: ghHeaders,
    });

    const data = response.data;

    return {
      success: true,
      data: {
        name: data.name || '',
        fullName: data.full_name || '',
        description: data.description || '',
        language: data.language || '',
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        watchers: data.watchers_count || 0,
        openIssues: data.open_issues_count || 0,
        license: data.license?.spdx_id || data.license?.name || '',
        owner: data.owner?.login || '',
        ownerAvatar: data.owner?.avatar_url || '',
        homepage: data.homepage || '',
        topics: data.topics || [],
        defaultBranch: data.default_branch || 'main',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || '',
        htmlUrl: data.html_url || '',
      },
    };
  } catch (error) {
    const status = error.response?.status;
    let message = 'Failed to fetch repository details.';

    if (status === 404) {
      message = 'Repository not found. Please check the URL.';
    } else if (status === 403) {
      message = 'API rate limit exceeded. Please try again later.';
    } else if (status === 401) {
      message = 'Authentication required for this repository.';
    }

    return {
      success: false,
      error: message,
      status,
    };
  }
}

/* ═══════════════════════════════════════════════════════
   Deep Repository Analysis — Fetches full repo content
   to generate a comprehensive, pre-filled README.
   ═══════════════════════════════════════════════════════ */

/** Safe fetch helper that returns null on failure */
async function safeFetch(url) {
  try {
    const res = await axios.get(url, { headers: ghHeaders });
    return res.data;
  } catch {
    return null;
  }
}

/** Fetch file content (decoded from base64) from the GitHub Contents API */
async function fetchFileContent(owner, repo, path) {
  try {
    const res = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: ghHeaders,
    });
    if (res.data?.content) {
      return atob(res.data.content.replace(/\n/g, ''));
    }
    // If the file is too large, try the download URL
    if (res.data?.download_url) {
      const dl = await axios.get(res.data.download_url, { responseType: 'text' });
      return dl.data;
    }
    return null;
  } catch {
    return null;
  }
}

/** Detect project type and extract installation/usage from package files */
function analyzePackageJson(raw) {
  try {
    const pkg = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const info = {
      description: pkg.description || '',
      license: pkg.license || '',
      author: '',
      homepage: pkg.homepage || '',
      keywords: pkg.keywords || [],
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
    };

    // Resolve author
    if (typeof pkg.author === 'string') {
      info.author = pkg.author;
    } else if (pkg.author?.name) {
      info.author = pkg.author.name;
    }

    return info;
  } catch {
    return null;
  }
}

/** Infer tech stack from languages, dependencies, and file tree */
function inferTechStack(languages, deps, devDeps, tree) {
  const stack = new Set();
  const allDeps = [...(deps || []), ...(devDeps || [])];
  const filePaths = (tree || []).map((f) => f.path?.toLowerCase() || '');

  // From languages
  if (languages) {
    Object.keys(languages).forEach((lang) => stack.add(lang));
  }

  // Framework detection from dependencies
  const frameworkMap = {
    react: 'React',
    'react-dom': 'React',
    next: 'Next.js',
    vue: 'Vue.js',
    nuxt: 'Nuxt.js',
    '@angular/core': 'Angular',
    svelte: 'Svelte',
    express: 'Express.js',
    fastify: 'Fastify',
    koa: 'Koa',
    'nest': 'NestJS',
    '@nestjs/core': 'NestJS',
    django: 'Django',
    flask: 'Flask',
    'spring-boot': 'Spring Boot',
    tailwindcss: 'TailwindCSS',
    bootstrap: 'Bootstrap',
    mongoose: 'MongoDB',
    prisma: 'Prisma',
    '@prisma/client': 'Prisma',
    sequelize: 'Sequelize',
    typeorm: 'TypeORM',
    'pg': 'PostgreSQL',
    mysql2: 'MySQL',
    redis: 'Redis',
    graphql: 'GraphQL',
    'apollo-server': 'Apollo GraphQL',
    socket: 'Socket.io',
    'socket.io': 'Socket.io',
    electron: 'Electron',
    'react-native': 'React Native',
    flutter: 'Flutter',
    docker: 'Docker',
    webpack: 'Webpack',
    vite: 'Vite',
    esbuild: 'esbuild',
    jest: 'Jest',
    mocha: 'Mocha',
    vitest: 'Vitest',
    cypress: 'Cypress',
    typescript: 'TypeScript',
    'firebase': 'Firebase',
    'aws-sdk': 'AWS',
    '@aws-sdk/client-s3': 'AWS S3',
    stripe: 'Stripe',
    axios: 'Axios',
    'framer-motion': 'Framer Motion',
    'three': 'Three.js',
    'd3': 'D3.js',
    storybook: 'Storybook',
    '@storybook/react': 'Storybook',
    'react-router-dom': 'React Router',
    redux: 'Redux',
    '@reduxjs/toolkit': 'Redux Toolkit',
    zustand: 'Zustand',
    'react-query': 'React Query',
    '@tanstack/react-query': 'TanStack Query',
    daisyui: 'DaisyUI',
    'shadcn-ui': 'shadcn/ui',
    'material-ui': 'Material UI',
    '@mui/material': 'Material UI',
    'chakra-ui': 'Chakra UI',
    '@chakra-ui/react': 'Chakra UI',
  };

  allDeps.forEach((dep) => {
    const depLower = dep.toLowerCase();
    if (frameworkMap[depLower]) {
      stack.add(frameworkMap[depLower]);
    }
  });

  // From file tree
  if (filePaths.some((f) => f === 'dockerfile' || f.includes('docker-compose'))) stack.add('Docker');
  if (filePaths.some((f) => f.endsWith('.py') || f === 'requirements.txt' || f === 'pyproject.toml')) stack.add('Python');
  if (filePaths.some((f) => f === 'go.mod' || f.endsWith('.go'))) stack.add('Go');
  if (filePaths.some((f) => f === 'cargo.toml')) stack.add('Rust');
  if (filePaths.some((f) => f === 'tsconfig.json')) stack.add('TypeScript');
  if (filePaths.some((f) => f === 'tailwind.config.js' || f === 'tailwind.config.ts')) stack.add('TailwindCSS');
  if (filePaths.some((f) => f === '.github/workflows' || f.includes('.github/workflows/'))) stack.add('GitHub Actions');
  if (filePaths.some((f) => f === 'vercel.json')) stack.add('Vercel');
  if (filePaths.some((f) => f === 'netlify.toml')) stack.add('Netlify');

  // Remove generic languages if we have specific frameworks
  if (stack.has('React') || stack.has('Vue.js') || stack.has('Angular') || stack.has('Next.js')) {
    stack.delete('JavaScript');
    stack.delete('CSS');
    stack.delete('HTML');
  }
  if (stack.has('TypeScript')) {
    stack.delete('JavaScript');
  }

  return [...stack].slice(0, 12);
}

/** Generate installation instructions from project files */
function generateInstallSteps(owner, repo, pkgInfo, tree) {
  const filePaths = (tree || []).map((f) => f.path?.toLowerCase() || '');
  const lines = [];

  lines.push(`git clone https://github.com/${owner}/${repo}.git`);
  lines.push(`cd ${repo}`);

  // Detect package manager
  if (filePaths.includes('pnpm-lock.yaml')) {
    lines.push('pnpm install');
  } else if (filePaths.includes('yarn.lock')) {
    lines.push('yarn install');
  } else if (filePaths.includes('bun.lockb')) {
    lines.push('bun install');
  } else if (filePaths.includes('package-lock.json') || filePaths.includes('package.json')) {
    lines.push('npm install');
  } else if (filePaths.includes('requirements.txt')) {
    lines.push('pip install -r requirements.txt');
  } else if (filePaths.includes('pyproject.toml')) {
    lines.push('pip install -e .');
  } else if (filePaths.includes('go.mod')) {
    lines.push('go mod download');
  } else if (filePaths.includes('cargo.toml')) {
    lines.push('cargo build');
  } else if (filePaths.includes('gemfile')) {
    lines.push('bundle install');
  } else if (filePaths.includes('composer.json')) {
    lines.push('composer install');
  }

  return lines.join('\n');
}

/** Generate usage / run commands from scripts or project type */
function generateUsageSteps(pkgInfo, tree) {
  const filePaths = (tree || []).map((f) => f.path?.toLowerCase() || '');
  const scripts = pkgInfo?.scripts || {};
  const lines = [];

  // For Node.js projects with scripts
  if (scripts.dev) {
    const pm = filePaths.includes('pnpm-lock.yaml') ? 'pnpm' :
               filePaths.includes('yarn.lock') ? 'yarn' :
               filePaths.includes('bun.lockb') ? 'bun' : 'npm';
    lines.push(`${pm} run dev`);
  } else if (scripts.start) {
    lines.push('npm start');
  }

  if (scripts.build) {
    lines.push(`# Build for production\nnpm run build`);
  }

  if (scripts.test) {
    lines.push(`# Run tests\nnpm test`);
  }

  // Python projects
  if (filePaths.includes('manage.py')) {
    lines.push('python manage.py runserver');
  } else if (filePaths.some((f) => f === 'app.py' || f === 'main.py')) {
    const entry = filePaths.includes('app.py') ? 'app.py' : 'main.py';
    lines.push(`python ${entry}`);
  }

  // Go projects
  if (filePaths.includes('go.mod')) {
    lines.push('go run .');
  }

  // Rust projects
  if (filePaths.includes('cargo.toml')) {
    lines.push('cargo run');
  }

  return lines.join('\n');
}

/** Extract env var names from .env.example or similar files */
function parseEnvExample(content) {
  if (!content) return '';
  return content
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    })
    .join('\n');
}

/** Generate features list from topics, description, and repo analysis */
function generateFeatures(repoData, pkgInfo, tree) {
  const features = new Set();
  const filePaths = (tree || []).map((f) => f.path?.toLowerCase() || '');

  // From topics
  (repoData.topics || []).forEach((topic) => {
    features.add(topic.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  });

  // Infer features from file structure
  if (filePaths.some((f) => f.includes('test') || f.includes('spec') || f.includes('__tests__'))) {
    features.add('Comprehensive test suite');
  }
  if (filePaths.some((f) => f.includes('.github/workflows/'))) {
    features.add('CI/CD with GitHub Actions');
  }
  if (filePaths.some((f) => f === 'dockerfile' || f.includes('docker-compose'))) {
    features.add('Docker support for containerized deployment');
  }
  if (filePaths.some((f) => f.includes('i18n') || f.includes('locale') || f.includes('lang/'))) {
    features.add('Internationalization (i18n) support');
  }
  if (filePaths.some((f) => f === '.env.example' || f === '.env.sample')) {
    features.add('Environment-based configuration');
  }
  if (filePaths.some((f) => f === 'contributing.md')) {
    features.add('Open to community contributions');
  }
  if (filePaths.some((f) => f.includes('storybook'))) {
    features.add('Component documentation with Storybook');
  }
  if (filePaths.some((f) => f.includes('docs/') || f === 'docs')) {
    features.add('Comprehensive documentation');
  }

  // From package.json keywords
  (pkgInfo?.keywords || []).forEach((kw) => {
    features.add(kw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  });

  return [...features].slice(0, 10).join('\n');
}

/** Generate prerequisites from the detected tech stack */
function generatePrerequisites(pkgInfo, tree) {
  const filePaths = (tree || []).map((f) => f.path?.toLowerCase() || '');
  const prereqs = [];

  if (filePaths.includes('package.json') || filePaths.includes('package-lock.json')) {
    prereqs.push('- [Node.js](https://nodejs.org/) (v16 or higher)');
    if (filePaths.includes('pnpm-lock.yaml')) {
      prereqs.push('- [pnpm](https://pnpm.io/) (v8 or higher)');
    } else if (filePaths.includes('yarn.lock')) {
      prereqs.push('- [Yarn](https://yarnpkg.com/) (v1.22 or higher)');
    } else {
      prereqs.push('- [npm](https://www.npmjs.com/) (v8 or higher)');
    }
  }

  if (filePaths.includes('requirements.txt') || filePaths.includes('pyproject.toml')) {
    prereqs.push('- [Python](https://www.python.org/) (v3.8 or higher)');
    prereqs.push('- pip (latest version)');
  }

  if (filePaths.includes('go.mod')) {
    prereqs.push('- [Go](https://golang.org/) (v1.20 or higher)');
  }

  if (filePaths.includes('cargo.toml')) {
    prereqs.push('- [Rust](https://www.rust-lang.org/) (latest stable)');
    prereqs.push('- Cargo (comes with Rust)');
  }

  if (filePaths.some((f) => f === 'dockerfile' || f.includes('docker-compose'))) {
    prereqs.push('- [Docker](https://www.docker.com/) (v20 or higher)');
    if (filePaths.some((f) => f.includes('docker-compose'))) {
      prereqs.push('- [Docker Compose](https://docs.docker.com/compose/) (v2 or higher)');
    }
  }

  if (filePaths.includes('.env.example') || filePaths.includes('.env.sample')) {
    prereqs.push('- A `.env` file configured with required environment variables (see below)');
  }

  return prereqs.join('\n');
}

/**
 * Deep analysis: fetch multiple repo endpoints in parallel
 * and produce a comprehensive formData object.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {function} onProgress - optional callback (step, message)
 * @returns {Promise<Object>} - { success, data: formData-shaped, meta }
 */
export async function deepAnalyzeRepo(owner, repo, onProgress) {
  const progress = (step, msg) => onProgress && onProgress(step, msg);

  try {
    progress(1, 'Fetching repository metadata...');

    // Step 1: Fetch repo details, languages, tree, contributors in parallel
    const [repoResult, languages, treeData, contributors] = await Promise.all([
      fetchRepoDetails(owner, repo),
      safeFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`),
      safeFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`),
      safeFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=5`),
    ]);

    if (!repoResult.success) {
      return repoResult; // pass error through
    }

    const repoData = repoResult.data;
    const tree = treeData?.tree || [];

    progress(2, 'Analyzing project structure...');

    // Step 2: Fetch key files in parallel
    const filePaths = tree.map((f) => f.path?.toLowerCase() || '');

    // Determine which files to fetch
    const filesToFetch = [];
    if (filePaths.includes('package.json')) filesToFetch.push('package.json');
    if (filePaths.includes('requirements.txt')) filesToFetch.push('requirements.txt');
    if (filePaths.includes('.env.example')) filesToFetch.push('.env.example');
    else if (filePaths.includes('.env.sample')) filesToFetch.push('.env.sample');
    if (filePaths.includes('contributing.md')) filesToFetch.push('CONTRIBUTING.md');
    if (filePaths.includes('changelog.md')) filesToFetch.push('CHANGELOG.md');

    const fileContents = await Promise.all(
      filesToFetch.map(async (path) => {
        // Use case-sensitive original path from tree
        const original = tree.find((f) => f.path?.toLowerCase() === path.toLowerCase());
        const content = await fetchFileContent(owner, repo, original?.path || path);
        return { path: path.toLowerCase(), content };
      })
    );

    const getFile = (name) => fileContents.find((f) => f.path === name.toLowerCase())?.content || null;

    progress(3, 'Detecting tech stack & generating content...');

    // Step 3: Analyze package.json
    const pkgRaw = getFile('package.json');
    const pkgInfo = pkgRaw ? analyzePackageJson(pkgRaw) : null;

    // Step 4: Build comprehensive tech stack
    const techStack = inferTechStack(
      languages,
      pkgInfo?.dependencies,
      pkgInfo?.devDependencies,
      tree
    );

    // Step 5: Generate installation steps
    const installation = generateInstallSteps(owner, repo, pkgInfo, tree);

    // Step 6: Generate usage steps
    const usage = generateUsageSteps(pkgInfo, tree);

    // Step 7: Parse env vars
    const envContent = getFile('.env.example') || getFile('.env.sample');
    const envVars = parseEnvExample(envContent);

    // Step 8: Generate features
    const features = generateFeatures(repoData, pkgInfo, tree);

    // Step 9: Generate prerequisites
    const prerequisites = generatePrerequisites(pkgInfo, tree);

    // Step 10: Contributing content
    const contributingContent = getFile('contributing.md');
    const contributing = contributingContent
      ? contributingContent.substring(0, 1000).trim()
      : (repoData.openIssues > 0
        ? 'Contributions, issues, and feature requests are welcome!\nFeel free to check the [issues page](../../issues).'
        : '');

    // Step 11: Changelog
    const changelogContent = getFile('changelog.md');
    const changelog = changelogContent
      ? changelogContent.substring(0, 1500).trim()
      : '';

    // Step 12: Build description (use repo description or package description)
    const description = repoData.description
      || pkgInfo?.description
      || '';

    // Step 13: Acknowledgments from top contributors
    const acknowledgments = contributors && Array.isArray(contributors)
      ? contributors
          .filter((c) => c.login !== owner)
          .slice(0, 5)
          .map((c) => `[@${c.login}](https://github.com/${c.login}) — ${c.contributions} contributions`)
          .join('\n')
      : '';

    // Step 14: Infer demo URL
    const demoUrl = repoData.homepage || pkgInfo?.homepage || '';

    // Step 15: Build roadmap from open issues labels if available (light hint)
    const roadmap = repoData.openIssues > 0
      ? `See the [open issues](https://github.com/${owner}/${repo}/issues) for a list of proposed features and known issues.`
      : '';

    progress(4, 'Generating README...');

    // Assemble the form data
    const formData = {
      projectName: repoData.name || '',
      description,
      installation,
      usage,
      features,
      techStack: techStack.join(', '),
      screenshots: '',
      contributing,
      license: repoData.license || pkgInfo?.license || '',
      author: repoData.owner || '',
      authorTwitter: '',
      authorWebsite: demoUrl,
      badges: [],
      demoUrl,
      prerequisites,
      envVars,
      apiReference: '',
      roadmap,
      faq: '',
      changelog,
      acknowledgments,
      customSections: [],
    };

    // Build metadata for the success message
    const meta = {
      stars: repoData.stars,
      forks: repoData.forks,
      language: repoData.language,
      fullName: repoData.fullName,
      totalFiles: tree.length,
      languages: languages ? Object.keys(languages) : [],
      depsCount: (pkgInfo?.dependencies?.length || 0) + (pkgInfo?.devDependencies?.length || 0),
      contributorsCount: contributors?.length || 0,
      sectionsPopulated: Object.entries(formData).filter(([key, val]) => {
        if (key === 'badges' || key === 'customSections') return Array.isArray(val) && val.length > 0;
        return typeof val === 'string' && val.trim() !== '';
      }).length,
    };

    return { success: true, data: formData, meta };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.status === 403
        ? 'GitHub API rate limit exceeded. Please try again later.'
        : `Analysis failed: ${error.message || 'Unknown error'}`,
    };
  }
}
