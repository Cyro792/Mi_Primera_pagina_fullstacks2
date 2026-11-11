import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { rutaInicialDe } from '../services/auth.js'

/**
 * Protege una ruta según la sesión y el rol.
 * - Sin sesión: envía al login y recuerda a qué página se quería entrar.
 * - Con sesión pero sin el rol necesario: muestra "Acceso restringido" (no la página pedida).
 * roles: lista de roles que pueden entrar. Si se omite, basta con tener sesión iniciada.
 */
export default function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth()
  const ubicacion = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <main className="aviso-pantalla">
        <div className="aviso-tarjeta" role="alert">
          <div className="aviso-icono">🔒</div>
          <h1 className="font-display h3">Acceso restringido</h1>
          <p className="text-secondary">
            Tu cuenta no tiene permiso para ver esta página. Si crees que es un error, consulta con el administrador.
          </p>
          <Link to={rutaInicialDe(usuario.rol)} className="btn btn-vet">Ir a mi página de inicio</Link>
        </div>
      </main>
    )
  }

  return children
}
