import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Needed for WSL
  },
  base: '/',
  build: {
    sourcemap: true, // Generate source maps
    minify: false, // Don't minify in development
  },
  // Enable more detailed logging
  logLevel: 'info',
})
