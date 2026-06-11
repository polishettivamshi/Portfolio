import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Keep default publicDir (public/) — we'll serve images via middleware
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
