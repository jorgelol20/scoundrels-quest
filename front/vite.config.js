import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [
      'scoundrels-quest.com',
      '.scoundrels-quest.com',
      'localhost',
      '127.0.0.1',
    ]
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Konva en chunk propio: solo se descarga al entrar a /jugar o /jugar/tutorial
            if (id.includes('konva') || id.includes('react-konva') || id.includes('use-image')) {
              return 'konva';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['./src/testSetup.js']
  }
})