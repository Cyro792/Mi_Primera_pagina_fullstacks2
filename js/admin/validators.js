import { ROLES } from './data.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function esEmailValido(valor) {
  return EMAIL_RE.test((valor || '').trim())
}

// Devuelve un objeto { campo: 'mensaje' }. Si está vacío, el formulario es válido.
export function validarUsuario({ nombre = '', email = '', rol = '' }, existentes = []) {
  const errores = {}
  if (nombre.trim().length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!email.trim()) errores.email = 'El correo es obligatorio.'
  else if (!esEmailValido(email)) errores.email = 'Ingresa un correo válido.'
  else if (existentes.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
    errores.email = 'Ya existe un usuario con ese correo.'
  if (!ROLES.includes(rol)) errores.rol = 'Selecciona un rol.'
  return errores
}
