import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/portfolio/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        hangman: resolve(import.meta.dirname, 'projets/hangman.html'),
        cvEnLigne: resolve(import.meta.dirname, 'projets/cv-en-ligne.html'),
        alternatech: resolve(import.meta.dirname, 'projets/alternatech.html'),
      },
    },
  },
});
