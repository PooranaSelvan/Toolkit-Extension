const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['./ext-src/extension.cjs'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
  logLevel: 'info',
};

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[esbuild] Watching for extension changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('[esbuild] Extension built successfully.');
  }
}

build().catch((err) => {
  console.error('[esbuild] Build failed:', err);
  process.exit(1);
});
