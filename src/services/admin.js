// Servicios del panel de administración (rol ADMIN):
//   GET   /api/v1/reportes/citas, /reportes/ventas, /reportes/usuarios y /reportes/inventario
//   GET   /api/v1/usuarios          POST /api/v1/usuarios
//   PATCH /api/v1/usuarios/{id}/activo
import { api } from './api.js'

/**
 * Resumen del panel. Cada microservicio entrega las métricas de sus propios datos y aquí se juntan
 * (composición en el cliente): ms-agenda las citas, ms-ventas las ventas, ms-usuarios los clientes
 * y ms-catalogo el stock. Las cuatro peticiones van en paralelo.
 */
export async function obtenerResumen() {
  const [citas, ventas, usuarios, inventario] = await Promise.all([
    api('/reportes/citas'),
    api('/reportes/ventas'),
    api('/reportes/usuarios'),
    api('/reportes/inventario'),
  ])
  return { ...citas, ...ventas, ...usuarios, ...inventario }
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
