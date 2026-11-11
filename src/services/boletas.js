// Compras (boletas). Cuando exista la API serán:
//   POST /api/v1/boletas        -> confirma el carrito y crea la boleta
//   GET  /api/v1/boletas/mias   -> compras del cliente con sesión iniciada
// Por ahora se guardan en el navegador para poder probar el flujo completo. El pago es simulado.
import { totalCarrito } from '../utils/carrito.js'

const CLAVE_BOLETAS = 'sanmarcos_boletas'

function leerBoletas(storage) {
  try {
    return JSON.parse(storage.getItem(CLAVE_BOLETAS)) || []
  } catch {
    return []
  }
}

/** Crea la boleta a partir del carrito. Rechaza si no hay cliente o si el carrito está vacío. */
export async function crearBoleta({ cliente, items }, storage = window.localStorage) {
  if (!cliente?.email) throw new Error('Debes iniciar sesión para comprar.')
  if (!items || items.length === 0) throw new Error('Tu carrito está vacío.')

  const anteriores = leerBoletas(storage)
  const boleta = {
    id: anteriores.reduce((max, b) => Math.max(max, b.id), 1000) + 1,
    fecha: new Date().toISOString(),
    clienteEmail: cliente.email,
    clienteNombre: cliente.nombre,
    estado: 'PAGADA',
    detalles: items.map((i) => ({
      productoId: i.id,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.precio,
      subtotal: i.precio * i.cantidad,
    })),
    total: totalCarrito(items),
  }
  storage.setItem(CLAVE_BOLETAS, JSON.stringify([boleta, ...anteriores]))
  return boleta
}

/** Compras de un cliente, de la más reciente a la más antigua. */
export async function listarBoletasDe(email, storage = window.localStorage) {
  return leerBoletas(storage).filter((b) => b.clienteEmail === email)
}
