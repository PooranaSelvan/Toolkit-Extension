import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

/**
 * Vite config for building the webview (React app) that runs inside VS Code's webview panel.
 * 
 * Key differences from standard web build:
 * - Output to dist/webview/ (extension reads from here)
 * - Assets use relative paths (VS Code webview rewrites them)
 * - No code splitting — single bundle is REQUIRED because VS Code webview
 *   cannot resolve dynamic import() chunk paths (they resolve against
 *   vscode-webview:// origin, not the local file system)
 * - Inline CSS to minimize CSP issues
 */
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist/webview',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // CRITICAL: Inline all dynamic imports into a single JS bundle.
        // VS Code webview cannot resolve dynamic import() chunk URLs because
        // they resolve against vscode-webview:// origin instead of the file system.
        // manualChunks: undefined alone does NOT prevent code splitting from lazy imports.
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Single bundle will be larger — raise the warning limit
    chunkSizeWarningLimit: 8000,
  },
  // Inline small assets as data URIs
  assetsInlineLimit: 8192,
});
