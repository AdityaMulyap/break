import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        finder: resolve(import.meta.dirname, 'finder.html'),
      },
    },
  },
  server: {
    port: 5170,
    proxy: {
      '/api': 'http://localhost:5171',
      '/mock': 'http://localhost:5171',
      '/renders': 'http://localhost:5171',
    },
  },
});
