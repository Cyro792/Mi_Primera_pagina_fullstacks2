// Acceso al catálogo de la tienda. Todas las funciones son asíncronas (devuelven una Promise)
// porque así funcionarán cuando llamen a la API REST del backend:
//   GET /api/v1/categorias, GET /api/v1/productos, GET /api/v1/productos/{id}
// Por ahora leen el catálogo local, así que al integrar solo cambia el interior de este archivo.
import { CATEGORIAS, PRODUCTOS } from '../data/catalogo.js'

const ESPERA_MS = 150

function responder(valor) {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ESPERA_MS))
}

function conCategoria(producto) {
  const categoria = CATEGORIAS.find((c) => c.id === producto.categoriaId)
  return { ...producto, categoriaNombre: categoria?.nombre ?? '' }
}

export function listarCategorias() {
  return responder(CATEGORIAS.map((c) => ({ ...c })))
}

export function listarProductos({ categoriaId, tipo } = {}) {
  const visibles = PRODUCTOS.filter(
    (p) => p.activo && (!categoriaId || p.categoriaId === Number(categoriaId)) && (!tipo || p.tipo === tipo),
  )
  return responder(visibles.map(conCategoria))
}

/** Devuelve el producto o null si no existe (la API responderá 404). */
export function obtenerProducto(id) {
  const producto = PRODUCTOS.find((p) => p.id === Number(id) && p.activo)
  return responder(producto ? conCategoria(producto) : null)
}
