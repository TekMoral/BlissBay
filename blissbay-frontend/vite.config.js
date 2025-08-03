import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ✅ Import Node's path module

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Alias @ to /src
    },
  },
  server: {
    host: true, // Required for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Better for Docker environments
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Use Docker service name instead of localhost
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
