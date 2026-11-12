// Compras (boletas):
//   POST /api/v1/boletas        -> paga y confirma el carrito (rol CLIENTE)
//   GET  /api/v1/boletas/mias   -> compras del cliente con sesión iniciada
// El cliente no se envía: el servidor lo toma del token. Los precios tampoco: los toma de la base
// de datos, así nadie puede cambiar lo que paga editando el carrito en el navegador.
// La pasarela de pago es SIMULADA en el servidor: no se realiza ningún cobro real.
import { api } from './api.js'

/** Tiempo mínimo de la animación "Procesando pago" (en las pruebas no se espera). */
const ESPERA_MINIMA_MS = import.meta.env?.MODE === 'test' ? 0 : 1200

/**
 * Paga el carrito y crea la boleta. Recibe UNA de estas formas de pago:
 * - { tarjetaGuardadaId, cvv }
 * - { tarjeta: { numero, titular, vencimiento, cvv }, guardarTarjeta }
 * Resuelve con la boleta o lanza ApiError (402 si el banco rechaza, 409 si falta stock, etc.).
 */
export async function comprar({ items, tarjetaGuardadaId, tarjeta, cvv, guardarTarjeta = false }) {
  const pago = tarjetaGuardadaId
    ? { tarjetaGuardadaId, cvv }
    : {
        tarjeta: { numero: tarjeta.numero, titular: tarjeta.titular, vencimiento: tarjeta.vencimiento },
        cvv: tarjeta.cvv,
        guardarTarjeta,
      }
  const cuerpo = { items: items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })), pago }
  const [boleta] = await Promise.all([
    api('/boletas', { metodo: 'POST', cuerpo }),
    new Promise((resolve) => setTimeout(resolve, ESPERA_MINIMA_MS)),
  ])
  return boleta
}

/** Compras del cliente con sesión iniciada, de la más reciente a la más antigua. */
export function listarMisBoletas() {
  return api('/boletas/mias')
}
