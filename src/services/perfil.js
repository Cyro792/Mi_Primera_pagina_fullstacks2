// Datos de personalización de la cuenta del cliente: avatar, teléfono y dirección.
// Con el backend serán GET y PUT /api/v1/usuarios/me. Por ahora se guardan en el navegador.

const CLAVE_PERFILES = 'sanmarcos_perfiles'

export const AVATARES = [
  { icono: '🐶', nombre: 'perro' },
  { icono: '🐱', nombre: 'gato' },
  { icono: '🐰', nombre: 'conejo' },
  { icono: '🐹', nombre: 'hámster' },
  { icono: '🦜', nombre: 'loro' },
  { icono: '🐢', nombre: 'tortuga' },
  { icono: '🦊', nombre: 'zorro' },
  { icono: '🐴', nombre: 'caballo' },
]

export const COLORES = [
  { valor: '#2A6049', nombre: 'verde' },
  { valor: '#C96A2E', nombre: 'naranja' },
  { valor: '#2F5FD0', nombre: 'azul' },
  { valor: '#8E44AD', nombre: 'morado' },
  { valor: '#C8952A', nombre: 'dorado' },
  { valor: '#B3261E', nombre: 'rojo' },
]

export const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana de Santiago',
  "Libertador General Bernardo O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo',
  'Magallanes y de la Antártica Chilena',
]

export const AVATAR_INICIAL = { icono: '🐾', color: '#2A6049' }

const PERFIL_VACIO = { telefono: '', region: '', comuna: '', direccion: '', avatar: AVATAR_INICIAL }

function leerTodos(storage) {
  try {
    const todos = JSON.parse(storage.getItem(CLAVE_PERFILES))
    return todos && typeof todos === 'object' && !Array.isArray(todos) ? todos : {}
  } catch {
    return {}
  }
}

/** Perfil del usuario; los campos que nunca guardó vienen vacíos. */
export function leerPerfil(email, storage = window.localStorage) {
  const guardado = leerTodos(storage)[email] ?? {}
  return { ...PERFIL_VACIO, ...guardado, avatar: { ...AVATAR_INICIAL, ...guardado.avatar } }
}

export function guardarPerfil(email, { telefono = '', region = '', comuna = '', direccion = '', avatar = AVATAR_INICIAL }, storage = window.localStorage) {
  const perfil = { telefono: telefono.trim(), region, comuna: comuna.trim(), direccion: direccion.trim(), avatar }
  try {
    storage.setItem(CLAVE_PERFILES, JSON.stringify({ ...leerTodos(storage), [email]: perfil }))
    return { ok: true, perfil }
  } catch {
    return { ok: false, error: 'No se pudieron guardar los cambios en este navegador.' }
  }
}

/** Valida los datos editables del perfil. El teléfono es opcional, pero si se escribe debe ser válido. */
export function validarPerfil({ nombre = '', telefono = '', region = '' }) {
  const errores = {}
  if (nombre.trim().length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  const digitos = telefono.replace(/[\s+()-]/g, '')
  if (telefono.trim() && !/^(56)?9\d{8}$/.test(digitos)) {
    errores.telefono = 'Ingresa un celular válido, por ejemplo +56 9 1234 5678.'
  }
  if (region && !REGIONES.includes(region)) errores.region = 'Selecciona una región de la lista.'
  return errores
}
