import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'GlobaleTextViewerLibrary',
      fileName: () => 'globale-text-viewer.js',
      formats: ['iife'], // Ensures output in ES and CommonJS. can use 'es', 'cjs' or 'iife'
    },
    rollupOptions: {
      external: [], // Ensure dependencies are bundled
    },
    minify: false,
  },
});
