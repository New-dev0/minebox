import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  assetsInclude: ['**/*.glb'],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
      external: [/three-stdlib\/libs\/lottie\.js/],
    },
    // Prevent minification of external dependencies
    minify: false,
  },
  optimizeDeps: {
    include: ['lottie-web'],
    exclude: [
      'three-stdlib'
    ]
  },
  esbuild: {
    legalComments: 'none', // Suppress eval warnings in the console
  },
})
