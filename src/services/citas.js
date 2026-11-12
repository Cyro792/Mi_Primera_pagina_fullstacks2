// Agenda de citas:
//   POST   /api/v1/citas                 -> público: solicitud de cita desde el sitio
//   GET    /api/v1/citas                 -> ADMIN y RECEPCIONISTA
//   PUT    /api/v1/citas/{id}            -> editar o reagendar
//   PATCH  /api/v1/citas/{id}/estado     -> confirmar, completar o cancelar
//   DELETE /api/v1/citas/{id}
import { api, consulta } from './api.js'

export const ESTADOS_CITA = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

export const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

/** Estados a los que puede pasar una cita (las mismas reglas que valida el backend). */
const SIGUIENTES = {
  PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['COMPLETADA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
}

export function estadosSiguientes(estado) {
  return SIGUIENTES[estado] ?? []
}

/** Una cita completada o cancelada ya no se modifica. */
export function esEstadoFinal(estado) {
  return estadosSiguientes(estado).length === 0
}

/**
 * Datos de una cita. Si la cita es de una mascota registrada se conserva su mascotaId (los datos de
 * contacto salen de su dueño); si no, se envían el nombre de la mascota, del dueño y el teléfono.
 */
function cuerpoCita({ mascotaId = null, nombreMascota, nombreDueno, telefonoContacto, servicioId, fecha, hora, notas }) {
  const limpio = (texto) => (texto ?? '').trim()
  return {
    mascotaId,
    nombreMascota: limpio(nombreMascota),
    nombreDueno: limpio(nombreDueno),
    telefonoContacto: limpio(telefonoContacto),
    servicioId: Number(servicioId),
    fecha,
    hora,
    notas: limpio(notas) || null,
  }
}

export function solicitarCita(datos) {
  return api('/citas', { metodo: 'POST', cuerpo: cuerpoCita(datos) })
}

export function listarCitas({ estado, fecha } = {}) {
  return api(`/citas${consulta({ estado, fecha })}`)
}

export function actualizarCita(id, datos) {
  return api(`/citas/${id}`, { metodo: 'PUT', cuerpo: cuerpoCita(datos) })
}

export function cambiarEstadoCita(id, estado) {
  return api(`/citas/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado } })
}

export function eliminarCita(id) {
  return api(`/citas/${id}`, { metodo: 'DELETE' })
}
