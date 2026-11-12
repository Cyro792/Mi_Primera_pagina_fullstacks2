// Datos de personalización de la cuenta: avatar, nombre, teléfono y dirección.
//   GET /api/v1/perfil   PUT /api/v1/perfil
import { api } from './api.js'

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

/**
 * Guarda los datos del perfil en el servidor y devuelve el usuario actualizado tal como lo envía la API.
 * El correo y el rol no se pueden cambiar desde aquí.
 */
export async function actualizarPerfil({ nombre = '', telefono = '', region = '', comuna = '', direccion = '', avatar = AVATAR_INICIAL }) {
  return api('/perfil', {
    metodo: 'PUT',
    cuerpo: {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      region,
      comuna: comuna.trim(),
      direccion: direccion.trim(),
      avatarIcono: avatar.icono,
      avatarColor: avatar.color,
    },
  })
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
