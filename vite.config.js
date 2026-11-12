import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    // En desarrollo, las llamadas a /api van al backend Spring Boot. Así el navegador ve un solo
    // sitio (sin CORS) y la cookie de renovación de la sesión funciona igual que en producción.
    proxy: {
      '/api': { target: process.env.VITE_PROXY_API ?? 'http://localhost:8080', changeOrigin: false },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', 'src/**/*.test.{js,jsx}'],
      reporter: ['text', 'html'],
    },
  },
})
