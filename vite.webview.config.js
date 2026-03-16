import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite config for building the webview (React app) that runs inside VS Code's webview panel.
 * 
 * Key differences from standard web build:
 * - Output to dist/webview/ (extension reads from here)
 * - Assets use relative paths (VS Code webview rewrites them)
 * - No code splitting (single bundle for simpler CSP)
 * - Inline CSS to minimize CSP issues
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist/webview',
    emptyDirBefore: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Single JS bundle — avoids CSP issues with dynamic imports in webview
        manualChunks: undefined,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Keep reasonable chunk size for webview
    chunkSizeWarningLimit: 4000,
  },
  // Inline small assets as data URIs
  assetsInlineLimit: 8192,
});
