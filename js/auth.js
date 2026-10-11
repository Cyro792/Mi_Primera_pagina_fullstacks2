import { esEmailValido } from './admin/validators.js'

// SOLO DEMO: en la Evaluación 3 esto se reemplaza por autenticación real (Spring Security + JWT).
export const CUENTAS_DEMO = [
  { email: 'admin@sanmarcos.cl', password: 'Admin123!', role: 'administrador' },
  { email: 'recepcion@sanmarcos.cl', password: 'Recep123!', role: 'recepcionista' },
]

export function validarLogin({ email = '', password = '' }) {
  const errores = {}
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!esEmailValido(email)) errores.email = 'El correo no tiene un formato válido.'
  if (!password) errores.password = 'Ingresa tu contraseña.'
  else if (password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  return errores
}

export function autenticar({ email, password, role }, cuentas = obtenerCuentas()) {
  const cuenta = cuentas.find((c) => c.email === email.trim().toLowerCase() && c.password === password)
  if (!cuenta) return { ok: false, error: 'Correo o contraseña incorrectos.' }
  if (cuenta.role !== role) return { ok: false, error: 'Esta cuenta no tiene acceso al perfil seleccionado.' }
  return { ok: true }
}

// ---------- Registro de cuentas (SOLO DEMO, se guarda en el navegador) ----------
// En la Evaluación 3 esto pasa al backend: la contraseña se guarda con hash (BCrypt) y
// el rol Administrador no se podrá elegir al registrarse, lo asigna otro administrador.
const CLAVE_CUENTAS = 'sanmarcos_cuentas'

function leerRegistradas(storage) {
  try {
    return JSON.parse(storage.getItem(CLAVE_CUENTAS)) || []
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

export function registrarCuenta({ nombre, email, password, role }, storage = window.localStorage) {
  const nueva = { nombre: nombre.trim(), email: email.trim().toLowerCase(), password, role }
  try {
    storage.setItem(CLAVE_CUENTAS, JSON.stringify([...leerRegistradas(storage), nueva]))
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo guardar la cuenta en este navegador.' }
  }
}
