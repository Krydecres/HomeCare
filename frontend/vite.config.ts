/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The browser only talks to its own origin (R-08). In dev, Vite forwards the BFF paths to api-gateway (:8080) and keeps
// the Host header, so the OAuth2 redirect_uri and the session cookie stay on http://localhost:5173.
// HOMECARE_GATEWAY_URL lets you move the gateway off :8080 if that port is busy (not a VITE_* var: never sent to the browser).
const gateway = {
  target: process.env.HOMECARE_GATEWAY_URL ?? 'http://localhost:8080',
  changeOrigin: false,
  xfwd: true,
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': gateway,
      '/oauth2': gateway,
      '/login/oauth2': gateway,
      '/logout': gateway,
      '/v3/api-docs': gateway,
      '/swagger-ui': gateway,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
