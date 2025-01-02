import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        page1: 'page1.html'
      },
    },
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
    }
  },
  publicDir: 'public'
}); 