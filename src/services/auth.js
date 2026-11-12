// Sesión y cuentas, conectadas al backend (Spring Security + JWT):
//   POST /api/v1/auth/login     POST /api/v1/auth/registro
//   POST /api/v1/auth/refresh   POST /api/v1/auth/logout     PUT /api/v1/perfil/password
// Las contraseñas solo viajan al servidor, que las guarda con hash BCrypt.
import { api, guardarToken, renovarSesion } from './api.js'
import { AVATAR_INICIAL } from './perfil.js'
import { esEmailValido } from '../utils/validators.js'

export const ROLES = { ADMIN: 'ADMIN', RECEPCIONISTA: 'RECEPCIONISTA', CLIENTE: 'CLIENTE' }

/** Página a la que entra cada rol después de iniciar sesión. */
export function rutaInicialDe(rol) {
  if (rol === ROLES.ADMIN) return '/admin'
  if (rol === ROLES.RECEPCIONISTA) return '/recepcion'
  return '/tienda'
}

// Páginas que solo puede ver cada grupo de roles (las mismas restricciones que App.jsx).
const PAGINAS_CON_ROL = [
  { prefijo: '/admin', roles: [ROLES.ADMIN] },
  { prefijo: '/recepcion', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { prefijo: '/pago', roles: [ROLES.CLIENTE] },
  { prefijo: '/mi-cuenta', roles: [ROLES.CLIENTE] },
  { prefijo: '/mis-compras', roles: [ROLES.CLIENTE] },
]

/**
 * Adónde ir después de iniciar sesión: a la página que se quería ver antes del login, solo si el
 * rol puede verla; si no, a la página inicial del rol.
 */
export function destinoTrasLogin(rol, desde) {
  if (!desde) return rutaInicialDe(rol)
  const restringida = PAGINAS_CON_ROL.find((p) => desde === p.prefijo || desde.startsWith(`${p.prefijo}/`))
  return !restringida || restringida.roles.includes(rol) ? desde : rutaInicialDe(rol)
}

/** Convierte el usuario que envía la API al formato que usan las pantallas. */
export function usuarioDesdeApi(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    telefono: u.telefono ?? '',
    region: u.region ?? '',
    comuna: u.comuna ?? '',
    direccion: u.direccion ?? '',
    avatar: { icono: u.avatarIcono || AVATAR_INICIAL.icono, color: u.avatarColor || AVATAR_INICIAL.color },
  }
}

function iniciar(sesion) {
  guardarToken(sesion.accessToken)
  marcarSesion(true)
  return usuarioDesdeApi(sesion.usuario)
}

export function validarLogin({ email = '', password = '' }) {
  const errores = {}
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!esEmailValido(email)) errores.email = 'El correo no tiene un formato válido.'
  if (!password) errores.password = 'Ingresa tu contraseña.'
  else if (password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  return errores
}

/** Inicia sesión. El rol lo define la cuenta en el servidor: el usuario no lo elige. Devuelve el usuario. */
export async function login({ email, password }) {
  const sesion = await api('/auth/login', { metodo: 'POST', cuerpo: { email: email.trim().toLowerCase(), password } })
  return iniciar(sesion)
}

export function validarRegistro({ nombre = '', email = '', password = '', confirmar = '' }) {
  const errores = {}
  if (nombre.trim().length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!esEmailValido(email)) errores.email = 'El correo no tiene un formato válido.'
  if (password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (confirmar !== password) errores.confirmar = 'Las contraseñas no coinciden.'
  return errores
}

/** Crea una cuenta de CLIENTE (el registro público nunca da roles del personal) e inicia sesión. */
export async function registrar({ nombre, email, password }) {
  const sesion = await api('/auth/registro', {
    metodo: 'POST',
    cuerpo: { nombre: nombre.trim(), email: email.trim().toLowerCase(), password },
  })
  return iniciar(sesion)
}

/** Recupera la sesión con la cookie de renovación (al recargar la página). Devuelve el usuario. */
export async function recuperarSesion() {
  try {
    return iniciar(await renovarSesion())
  } catch (error) {
    marcarSesion(false)
    throw error
  }
}

export async function logout() {
  try {
    await api('/auth/logout', { metodo: 'POST' })
  } finally {
    guardarToken(null)
    marcarSesion(false)
  }
}

export function validarCambioPassword({ actual = '', nueva = '', confirmar = '' }) {
  const errores = {}
  if (!actual) errores.actual = 'Ingresa tu contraseña actual.'
  if (nueva.length < 8) errores.nueva = 'La nueva contraseña debe tener al menos 8 caracteres.'
  else if (nueva === actual) errores.nueva = 'La nueva contraseña debe ser distinta de la actual.'
  if (confirmar !== nueva) errores.confirmar = 'Las contraseñas no coinciden.'
  return errores
}

/** Cambia la contraseña. El servidor comprueba la actual y cierra las sesiones de otros dispositivos. */
export async function cambiarPassword({ actual, nueva }) {
  await api('/perfil/password', { metodo: 'PUT', cuerpo: { actual, nueva } })
}

// ---------- Aviso de "hay una sesión abierta" ----------
// El token no se guarda en el navegador. Solo se guarda esta marca (sin datos sensibles) para
// saber si vale la pena pedir /auth/refresh al cargar, y para que las demás pestañas se enteren
// cuando se inicia o se cierra la sesión.
export const CLAVE_SESION = 'sanmarcos_sesion_abierta'

export function haySesionGuardada(storage = window.localStorage) {
  try {
    return storage.getItem(CLAVE_SESION) === '1'
  } catch {
    return false
  }
}

function marcarSesion(abierta, storage = window.localStorage) {
  try {
    if (abierta) storage.setItem(CLAVE_SESION, '1')
    else storage.removeItem(CLAVE_SESION)
  } catch {
    // Sin almacenamiento igual funciona; solo no se sincronizan las pestañas.
  }
}
