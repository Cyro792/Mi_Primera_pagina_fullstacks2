// Ayudas compartidas por las pruebas: montan un componente con el router y los contextos reales.
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { guardarSesion } from './services/auth.js'
import { guardarCarrito } from './utils/carrito.js'

export const USUARIOS = {
  admin: { nombre: 'Administrador General', email: 'admin@sanmarcos.cl', rol: 'ADMIN' },
  recepcion: { nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA' },
  cliente: { nombre: 'Ana García', email: 'ana.garcia@correo.cl', rol: 'CLIENTE' },
}

/**
 * Renderiza `elemento` en la ruta indicada, dentro de AuthProvider y CarritoProvider.
 * - sesion: usuario que ya tiene la sesión guardada (como después de recargar la página).
 * - carrito: ítems que ya están guardados en el carrito.
 * - otrasRutas: rutas extra { '/ruta': <Elemento /> } para comprobar redirecciones.
 */
export function renderConApp(elemento, { ruta = '/', path = '*', sesion = null, carrito = null, otrasRutas = {}, estado } = {}) {
  if (sesion) guardarSesion(sesion)
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
