import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: false, // Allow fallback to another port if 3000 is taken
    cors: true, // Enable CORS
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxy
      },
    },
    watch: {
      usePolling: true, // Enable polling on Windows
    },
  },
});
