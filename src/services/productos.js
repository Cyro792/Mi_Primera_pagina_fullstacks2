// Catálogo de la tienda (público, no necesita sesión):
//   GET /api/v1/categorias   GET /api/v1/productos?categoriaId=&tipo=   GET /api/v1/productos/{id}
// El ADMIN además lo administra: POST, PUT y DELETE /api/v1/productos.
import { api, ApiError, consulta } from './api.js'

export function listarCategorias() {
  return api('/categorias')
}

/** Productos activos. Con incluirInactivos (solo ADMIN) también los dados de baja. */
export function listarProductos({ categoriaId, tipo, incluirInactivos } = {}) {
  return api(`/productos${consulta({ categoriaId, tipo, incluirInactivos })}`)
}

/** Devuelve el producto o null si no existe o fue dado de baja (la API responde 404). */
export async function obtenerProducto(id) {
  try {
    return await api(`/productos/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function crearProducto(datos) {
  return api('/productos', { metodo: 'POST', cuerpo: datos })
}

export function actualizarProducto(id, datos) {
  return api(`/productos/${id}`, { metodo: 'PUT', cuerpo: datos })
}

/** Baja lógica: el producto deja de verse en la tienda, pero sigue en las boletas antiguas. */
export function darDeBajaProducto(id) {
  return api(`/productos/${id}`, { metodo: 'DELETE' })
}
