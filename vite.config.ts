import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// The workbench in apps/preview serves the app; `@/` imports reach the skin in src/.
export default defineConfig({
  root: path('./apps/preview'),
  // Relative URLs, so the build works at a domain root or in a subfolder such as GitHub Pages.
  base: './',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@preview': path('./apps/preview/src'),
      '@': path('./src'),
    },
  },
  server: {
    fs: { allow: [path('.')] },
  },
  build: {
    outDir: path('./dist'),
    emptyOutDir: true,
    // The preview is a single route, so React, Video.js and motion are most of its
    // page weight: ~1.3 MB raw but ~406 kB gzipped, because the custom deck pulls in
    // the whole Video.js controls set (menus, captions, PiP, fullscreen) plus the
    // slider's spring library. 1400 kB keeps the chunk warning for a real regression
    // instead of firing on the player's size.
    chunkSizeWarningLimit: 1400,
    rolldownOptions: {
      // The workbench shell, and the preview page it frames.
      input: { main: path('./apps/preview/index.html') },
      checks: {
        // `react-compiler-runtime`, pulled in by @videojs/react, opens with a
        // "use no memo" module directive. The directive is valid; it just cannot
        // survive bundling into one scope, so the warning is noise.
        moduleLevelDirective: false,
        // Plugin timing stats are informational, and here they mostly report the cost of
        // moving the demo video out of `public/` into `dist/`.
        bundlerTimings: false,
      },
    },
  },
});
