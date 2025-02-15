import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), TanStackRouterVite()],
  server: {
    port: 32200,
    host: true, // Needed for docker
    watch: {
      usePolling: true, // Better HMR support in Docker
    },
    // Proper shutdown handling
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  // Add build options for production
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
