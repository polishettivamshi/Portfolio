import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Portfolio/',
  appType: 'mpa',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Allow serving files from the project root (needed for ./images/ path)
    fs: {
      allow: ['..'],
    },
  },
});
