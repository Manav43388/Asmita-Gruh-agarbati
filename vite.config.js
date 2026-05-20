import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // ─── Performance: Target modern browsers for smaller output ───
    target: 'es2020',

    // ─── Minification: Use Vite's default (oxc in v8+) for fastest builds ───
    // ─── Enable CSS code splitting to avoid one massive CSS file ───
    cssCodeSplit: true,

    // ─── Source maps off in production for smaller deploy size ───
    sourcemap: false,

    // ─── Increase chunk warning limit (Three.js is naturally large) ───
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        // ─── Aggressive code splitting to reduce initial bundle ───
        // Separating vendor libraries ensures they are cached independently.
        // When you update app code, users don't re-download vendors.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Three.js + React Three Fiber — very large, only needed for 3D scene
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            // Firebase SDK — loaded on demand via lazy components
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Recharts — only needed in admin panel
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Framer Motion — animation library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // React core + Router + Hot Toast
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('react-hot-toast')) {
              return 'vendor-react';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Everything else
            return 'vendor';
          }
        },

        // ─── Asset file names with content hash for long-term caching ───
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },

    // ─── Inline small assets (< 4KB) as base64 to reduce HTTP requests ───
    assetsInlineLimit: 4096,
  },

  // ─── Development server configuration ───
  server: {
    open: true,
    host: true,
  },
})
