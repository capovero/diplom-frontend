import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Все запросы, начинающиеся с /api,
      // Vite будет перенаправлять на http://localhost:5209
      '/api': {
        target: 'http://localhost:5209',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
