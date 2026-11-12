import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { alExpirarSesion, guardarToken } from '../services/api.js'
import {
  CLAVE_SESION,
  haySesionGuardada,
  login,
  logout,
  recuperarSesion,
  registrar as registrarEnApi,
  usuarioDesdeApi,
} from '../services/auth.js'
import { actualizarPerfil } from '../services/perfil.js'

const AuthContext = createContext(null)

/**
 * Guarda quién tiene la sesión iniciada y lo comparte con toda la aplicación.
 * Al cargar la página pide al backend renovar la sesión (cookie HttpOnly): así la sesión sobrevive
 * a una recarga sin guardar el token en el navegador. Mientras eso ocurre, `cargando` es true.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => haySesionGuardada())

  useEffect(() => {
    // Si la API avisa que la sesión ya no se puede renovar, se cierra también en pantalla.
    alExpirarSesion(() => setUsuario(null))

    let vigente = true
    if (haySesionGuardada()) {
      recuperarSesion()
        .then((recuperado) => vigente && setUsuario(recuperado))
        .catch(() => vigente && setUsuario(null))
        .finally(() => vigente && setCargando(false))
    }

    // Si se cierra la sesión en otra pestaña, esta pestaña también la cierra.
    const alCambiar = (evento) => {
      if (evento.key === CLAVE_SESION && evento.newValue === null) {
        guardarToken(null)
        setUsuario(null)
      }
    }
    window.addEventListener('storage', alCambiar)
    return () => {
      vigente = false
      window.removeEventListener('storage', alCambiar)
    }
  }, [])

  /** Inicia sesión. Devuelve el usuario o lanza un ApiError (por ejemplo, credenciales incorrectas). */
  const iniciarSesion = useCallback(async (credenciales) => {
    const conectado = await login(credenciales)
    setUsuario(conectado)
    return conectado
  }, [])

  /** Crea una cuenta de cliente y deja la sesión iniciada. */
  const registrar = useCallback(async (datos) => {
    const nuevo = await registrarEnApi(datos)
    setUsuario(nuevo)
    return nuevo
  }, [])

  /**
   * Cierra la sesión en el servidor y después en pantalla. Quien la llama navega primero a otra
   * página: así una ruta protegida no alcanza a redirigir al login al quedar sin usuario.
   */
  const cerrarSesion = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Aunque el servidor no responda, en este navegador la sesión queda cerrada.
    } finally {
      setUsuario(null)
    }
  }, [])

  /** Guarda nombre, avatar y datos de contacto en el servidor, y refleja el cambio al instante. */
  const guardarPerfil = useCallback(async (datos) => {
    const actualizado = usuarioDesdeApi(await actualizarPerfil(datos))
    setUsuario(actualizado)
    return actualizado
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      estaAutenticado: usuario !== null,
      tieneRol: (...roles) => usuario !== null && roles.includes(usuario.rol),
      iniciarSesion,
      registrar,
      cerrarSesion,
      guardarPerfil,
    }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion, guardarPerfil],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
