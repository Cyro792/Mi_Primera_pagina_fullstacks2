import { esEmailValido } from '../utils/validators.js'

// SOLO DEMO: mientras no esté conectado el backend, las cuentas viven en el navegador.
// Con el backend esto se reemplaza por POST /api/v1/auth/login (Spring Security + JWT)
// y las contraseñas se guardan con hash BCrypt en la base de datos.
export const ROLES = { ADMIN: 'ADMIN', RECEPCIONISTA: 'RECEPCIONISTA', CLIENTE: 'CLIENTE' }

export const CUENTAS_DEMO = [
  { nombre: 'Administrador General', email: 'admin@sanmarcos.cl', password: 'Admin123!', rol: ROLES.ADMIN },
  { nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', password: 'Recep123!', rol: ROLES.RECEPCIONISTA },
  { nombre: 'Ana García', email: 'ana.garcia@correo.cl', password: 'Cliente123!', rol: ROLES.CLIENTE },
]

/** Página a la que entra cada rol después de iniciar sesión. */
export function rutaInicialDe(rol) {
  if (rol === ROLES.ADMIN) return '/admin'
  if (rol === ROLES.RECEPCIONISTA) return '/recepcion'
  return '/tienda'
}

export function validarLogin({ email = '', password = '' }) {
  const errores = {}
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!esEmailValido(email)) errores.email = 'El correo no tiene un formato válido.'
  if (!password) errores.password = 'Ingresa tu contraseña.'
  else if (password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  return errores
}

/** Comprueba las credenciales. El rol lo define la cuenta: el usuario no lo elige. */
export function autenticar({ email, password }, cuentas = obtenerCuentas()) {
  const correo = email.trim().toLowerCase()
  const cuenta = cuentas.find((c) => c.email === correo && c.password === password)
  if (!cuenta) return { ok: false, error: 'Correo o contraseña incorrectos.' }
  return { ok: true, usuario: { nombre: cuenta.nombre, email: cuenta.email, rol: cuenta.rol } }
}

// ---------- Registro de cuentas (SOLO DEMO, se guarda en el navegador) ----------
const CLAVE_CUENTAS = 'sanmarcos_cuentas'

function leerRegistradas(storage) {
  try {
    const guardadas = JSON.parse(storage.getItem(CLAVE_CUENTAS)) || []
    // El registro público solo crea clientes: nadie puede darse a sí mismo un rol del personal.
    return guardadas.map((c) => ({ nombre: c.nombre, email: c.email, password: c.password, rol: ROLES.CLIENTE }))
  } catch {
    return []
  }
}

export function obtenerCuentas(storage = window.localStorage) {
  return [...CUENTAS_DEMO, ...leerRegistradas(storage)]
}

export function validarRegistro({ nombre = '', email = '', password = '', confirmar = '' }, cuentas = obtenerCuentas()) {
  const errores = {}
  if (nombre.trim().length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!esEmailValido(email)) errores.email = 'El correo no tiene un formato válido.'
  else if (cuentas.some((c) => c.email === email.trim().toLowerCase())) errores.email = 'Ya existe una cuenta con ese correo.'
  if (password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (confirmar !== password) errores.confirmar = 'Las contraseñas no coinciden.'
  return errores
}

export function registrarCuenta({ nombre, email, password }, storage = window.localStorage) {
  const nueva = { nombre: nombre.trim(), email: email.trim().toLowerCase(), password, rol: ROLES.CLIENTE }
  try {
    storage.setItem(CLAVE_CUENTAS, JSON.stringify([...leerRegistradas(storage), nueva]))
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo guardar la cuenta en este navegador.' }
  }
}

// ---------- Sesión: se guarda para que no se pierda al recargar la página ----------
const CLAVE_SESION = 'sanmarcos_sesion'
const ROLES_VALIDOS = Object.values(ROLES)

/** Devuelve el usuario con sesión iniciada, o null si no hay sesión o el dato guardado no es válido. */
export function leerSesion(storage = window.localStorage) {
  try {
    const usuario = JSON.parse(storage.getItem(CLAVE_SESION))
    return usuario && usuario.email && ROLES_VALIDOS.includes(usuario.rol) ? usuario : null
  } catch {
    return null
  }
}

export function guardarSesion(usuario, storage = window.localStorage) {
  try {
    storage.setItem(CLAVE_SESION, JSON.stringify(usuario))
  } catch {
    // Sin almacenamiento la sesión dura hasta recargar la página.
  }
}

export function borrarSesion(storage = window.localStorage) {
  try {
    storage.removeItem(CLAVE_SESION)
  } catch {
    // Nada que borrar.
  }
}
