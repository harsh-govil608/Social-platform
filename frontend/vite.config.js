import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '.localhost.run',
      '.lhr.life',
      '.ngrok.io',
      '.ngrok-free.app',
      '.trycloudflare.com'
    ]
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
})
