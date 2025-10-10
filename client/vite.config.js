import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 3131,
    allowedHosts: [
      '127.0.0.1',
      'www.cseinterns.vjstartup.com',
      'hub.vjstartup.com',
    ],
  },

  plugins: [
    react(),
    // add dev-only plugin here if needed, otherwise remove
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
