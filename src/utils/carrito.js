// Lógica del carrito como funciones puras: reciben la lista de ítems y devuelven una lista nueva.
// Así se pueden probar sin React y el contexto (CarritoContext) solo se encarga del estado.

const CLAVE_CARRITO = 'sanmarcos_carrito'

/** Máximo que se puede llevar de un producto: su stock. Los servicios no tienen límite de stock. */
export function maximoPermitido(producto) {
  return producto.tipo === 'SERVICIO' || producto.stock == null ? Infinity : producto.stock
}

function limitar(cantidad, producto) {
  return Math.max(0, Math.min(Math.trunc(cantidad), maximoPermitido(producto)))
}

/** Agrega un producto. Si ya estaba, suma la cantidad (sin pasar del stock). */
export function agregarAlCarrito(items, producto, cantidad = 1) {
  const existente = items.find((i) => i.id === producto.id)
  if (existente) {
    return cambiarCantidad(items, producto.id, existente.cantidad + cantidad)
  }
  const inicial = limitar(cantidad, producto)
  if (inicial === 0) return items
  const { id, nombre, precio, tipo, stock = null, categoriaId = null } = producto
  return [...items, { id, nombre, precio, tipo, stock, categoriaId, cantidad: inicial }]
}

/** Fija la cantidad de un ítem. Con 0 o menos, lo quita del carrito. */
export function cambiarCantidad(items, id, cantidad) {
  return items
    .map((i) => (i.id === id ? { ...i, cantidad: limitar(cantidad, i) } : i))
    .filter((i) => i.cantidad > 0)
}

export function quitarDelCarrito(items, id) {
  return items.filter((i) => i.id !== id)
}

export function totalCarrito(items) {
  return items.reduce((total, i) => total + i.precio * i.cantidad, 0)
}

export function cantidadTotal(items) {
  return items.reduce((total, i) => total + i.cantidad, 0)
}

export function leerCarrito(storage = window.localStorage) {
  try {
    const guardado = JSON.parse(storage.getItem(CLAVE_CARRITO))
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return []
  }
}

export function guardarCarrito(items, storage = window.localStorage) {
  try {
    storage.setItem(CLAVE_CARRITO, JSON.stringify(items))
  } catch {
    // Si el navegador no deja guardar, el carrito sigue funcionando en memoria.
  }
}
