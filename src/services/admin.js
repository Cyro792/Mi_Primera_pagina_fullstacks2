// Servicios del panel de administración (rol ADMIN):
//   GET   /api/v1/reportes/resumen
//   GET   /api/v1/usuarios          POST /api/v1/usuarios
//   PATCH /api/v1/usuarios/{id}/activo
import { api } from './api.js'

export function obtenerResumen() {
  return api('/reportes/resumen')
}

export function listarUsuarios() {
  return api('/usuarios')
}

/** Crea una cuenta de cualquier rol (solo el ADMIN puede crear cuentas del personal). */
export function crearUsuario({ nombre, email, password, telefono, rol }) {
  return api('/usuarios', {
    metodo: 'POST',
    cuerpo: { nombre: nombre.trim(), email: email.trim().toLowerCase(), password, telefono: telefono?.trim() || null, rol },
  })
}

export function cambiarActivoUsuario(id, activo) {
  return api(`/usuarios/${id}/activo`, { metodo: 'PATCH', cuerpo: { activo } })
}
