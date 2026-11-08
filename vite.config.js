import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  appType: 'mpa',
  plugins: [
    {
      name: 'portfolio-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/Portfolio' || req.url === '/Portfolio/') {
            req.url = '/';
          } else if (req.url && req.url.startsWith('/Portfolio/')) {
            req.url = req.url.replace(/^\/Portfolio/, '');
          }
          next();
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    // Allow serving files from the project root (needed for ./images/ path)
    fs: {
      allow: ['..'],
    },
  },
  // Expose VITE_ env variables to the client
  envPrefix: 'VITE_',
});

