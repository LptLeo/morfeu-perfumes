import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    proxy: {
      // Dev apenas: executa a function localmente (harness). Em produção o
      // redirect /api/* → /.netlify/functions/* do netlify.toml resolve.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: false,
        // silencioso quando o harness não está rodando
        configure: (proxy) => {
          proxy.on('error', () => {});
        },
      },
    },
  },
});
