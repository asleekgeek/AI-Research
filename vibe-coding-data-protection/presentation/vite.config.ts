import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Source is written against the React API; Preact's compat layer stands in at build time.
// Delete the react/* aliases (and add react + react-dom) to drop these components into a React or Next.js app.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      '@data': fileURLToPath(new URL('../data', import.meta.url)),
    },
  },
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  server: { fs: { allow: ['..'] } },
  build: { target: 'es2022', cssCodeSplit: false, assetsInlineLimit: 100_000_000, reportCompressedSize: true },
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
} as any);
