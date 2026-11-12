// Ayudas compartidas por las pruebas: montan un componente con el router y los contextos reales.
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { apiFalsa } from './test/apiFalsa.js'
import { guardarCarrito } from './utils/carrito.js'

// Cuentas de demostración (las mismas que crea el backend en el perfil de desarrollo).
export const USUARIOS = {
  admin: { id: 1, nombre: 'Administrador General', email: 'admin@sanmarcos.cl', rol: 'ADMIN' },
  recepcion: { id: 2, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA' },
  cliente: { id: 3, nombre: 'Ana García', email: 'ana.garcia@correo.cl', rol: 'CLIENTE' },
}

/**
 * Renderiza `elemento` en la ruta indicada, dentro de AuthProvider y CarritoProvider.
 * - sesion: usuario con la sesión abierta (el navegador tiene su cookie, como después de recargar la
 *   página). La aplicación la recupera con POST /auth/refresh, así que el contenido aparece después
 *   de un momento: en las pruebas se usa findBy... para esperarlo.
 * - carrito: ítems que ya están guardados en el carrito.
 * - otrasRutas: rutas extra { '/ruta': <Elemento /> } para comprobar redirecciones.
 */
export function renderConApp(elemento, { ruta = '/', path = '*', sesion = null, carrito = null, otrasRutas = {}, estado } = {}) {
  if (sesion) apiFalsa().iniciarSesionCon(sesion.email)
  if (carrito) guardarCarrito(carrito)
  return render(
    <MemoryRouter initialEntries={[estado ? { pathname: ruta, state: estado } : ruta]}>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            <Route path={path} element={elemento} />
            {Object.entries(otrasRutas).map(([otra, contenido]) => (
              <Route key={otra} path={otra} element={contenido} />
            ))}
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}
