import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Reparto de rutas entre los microservicios (el mismo que hace el gateway de Nginx en Docker).
// Solo se usa con "npm run dev:sin-docker", cuando cada servicio corre directo en su puerto.
const RUTAS_POR_SERVICIO = {
  '/api/v1/reportes/usuarios': 8081,
  '/api/v1/reportes/inventario': 8082,
  '/api/v1/reportes/ventas': 8083,
  '/api/v1/reportes/citas': 8084,
  '/api/v1/auth': 8081,
  '/api/v1/perfil': 8081,
  '/api/v1/usuarios': 8081,
  '/api/v1/categorias': 8082,
  '/api/v1/productos': 8082,
  '/api/v1/boletas': 8083,
  '/api/v1/tarjetas': 8083,
  '/api/v1/citas': 8084,
  '/api/v1/mascotas': 8084,
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    // Las llamadas a /api van al gateway del backend (Docker, puerto 8080). Así el navegador ve un
    // solo sitio (sin CORS) y la cookie de renovación de la sesión funciona igual que en producción.
    proxy:
      mode === 'sin-docker'
        ? Object.fromEntries(Object.entries(RUTAS_POR_SERVICIO).map(([ruta, puerto]) => [ruta, { target: `http://localhost:${puerto}` }]))
        : { '/api': { target: process.env.VITE_PROXY_API ?? 'http://localhost:8080', changeOrigin: false } },
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
}))
