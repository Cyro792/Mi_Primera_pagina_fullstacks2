import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { ROLES } from './services/auth.js'
import LayoutPublico from './components/LayoutPublico.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Inicio from './pages/Inicio.jsx'
import Tienda from './pages/Tienda.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'
import Carrito from './pages/Carrito.jsx'
import MisCompras from './pages/MisCompras.jsx'
import MiCuenta from './pages/MiCuenta.jsx'
import Pago from './pages/Pago.jsx'
import Login from './pages/Login.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

// Carga diferida: el código de los paneles solo se descarga cuando alguien del personal entra.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const RecepcionistaDashboard = lazy(() => import('./pages/RecepcionistaDashboard.jsx'))

/** Entrega a un panel la función para cerrar sesión y volver al inicio. */
function Panel({ componente: Componente }) {
  const { cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const salir = () => {
    navigate('/')
    cerrarSesion()
  }
  return (
    <Suspense fallback={<p className="p-5 texto-suave" role="status">Cargando panel…</p>}>
      <Componente onLogout={salir} />
    </Suspense>
  )
}

/** Rutas de la aplicación. Se exporta sin el Router para poder probarla con MemoryRouter. */
export function Rutas() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            {/* Sitio público: cualquiera puede entrar */}
            <Route element={<LayoutPublico />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/tienda" element={<Tienda />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
              <Route path="/carrito" element={<Carrito />} />
              {/* Solo clientes con sesión iniciada */}
              <Route path="/pago" element={<RutaProtegida roles={[ROLES.CLIENTE]}><Pago /></RutaProtegida>} />
              <Route path="/mi-cuenta" element={<RutaProtegida roles={[ROLES.CLIENTE]}><MiCuenta /></RutaProtegida>} />
              <Route path="/mis-compras" element={<RutaProtegida roles={[ROLES.CLIENTE]}><MisCompras /></RutaProtegida>} />
              <Route path="*" element={<NoEncontrada />} />
            </Route>

            <Route path="/login" element={<Login />} />

            {/* Paneles del personal: restringidos por rol */}
            <Route path="/admin" element={<RutaProtegida roles={[ROLES.ADMIN]}><Panel componente={AdminDashboard} /></RutaProtegida>} />
            <Route path="/recepcion" element={<RutaProtegida roles={[ROLES.ADMIN, ROLES.RECEPCIONISTA]}><Panel componente={RecepcionistaDashboard} /></RutaProtegida>} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Rutas />
    </BrowserRouter>
  )
}
