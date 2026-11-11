import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { actualizarNombre, autenticar, borrarSesion, guardarSesion, leerSesion, registrarCuenta } from '../services/auth.js'
import { guardarPerfil as guardarPerfilEn, leerPerfil } from '../services/perfil.js'

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
    if (!resultado.ok) return resultado
    // El avatar elegido en "Mi cuenta" viaja con la sesión para mostrarlo en la barra.
    const conAvatar = { ...resultado.usuario, avatar: leerPerfil(resultado.usuario.email).avatar }
    guardarSesion(conAvatar)
    setUsuario(conAvatar)
    return { ...resultado, usuario: conAvatar }
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setUsuario(null)
  }, [])

  /** Guarda nombre, avatar y datos de contacto, y refleja el cambio en la sesión al instante. */
  const guardarPerfil = useCallback(
    ({ nombre, ...perfil }) => {
      if (!usuario) return { ok: false, error: 'No hay una sesión iniciada.' }
      const resultadoNombre = actualizarNombre(usuario.email, nombre)
      const resultadoPerfil = guardarPerfilEn(usuario.email, perfil)
      if (!resultadoNombre.ok || !resultadoPerfil.ok) {
        return { ok: false, error: resultadoNombre.error ?? resultadoPerfil.error }
      }
      const actualizado = { ...usuario, nombre: nombre.trim(), avatar: resultadoPerfil.perfil.avatar }
      guardarSesion(actualizado)
      setUsuario(actualizado)
      return { ok: true }
    },
    [usuario],
  )

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      tieneRol: (...roles) => usuario !== null && roles.includes(usuario.rol),
      iniciarSesion,
      cerrarSesion,
      guardarPerfil,
      registrar: registrarCuenta,
    }),
    [usuario, iniciarSesion, cerrarSesion, guardarPerfil],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
