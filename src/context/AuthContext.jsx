import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { autenticar, borrarSesion, guardarSesion, leerSesion, registrarCuenta } from '../services/auth.js'

const AuthContext = createContext(null)

/**
 * Guarda quién tiene la sesión iniciada y lo comparte con toda la aplicación.
 * La sesión se lee del almacenamiento al cargar, por eso sobrevive a una recarga de página.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leerSesion())

  // Si la sesión se cierra o se inicia en otra pestaña, esta pestaña se actualiza sola.
  useEffect(() => {
    const alCambiar = () => setUsuario(leerSesion())
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const iniciarSesion = useCallback((credenciales) => {
    const resultado = autenticar(credenciales)
    if (resultado.ok) {
      guardarSesion(resultado.usuario)
      setUsuario(resultado.usuario)
    }
    return resultado
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      tieneRol: (...roles) => usuario !== null && roles.includes(usuario.rol),
      iniciarSesion,
      cerrarSesion,
      registrar: registrarCuenta,
    }),
    [usuario, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
