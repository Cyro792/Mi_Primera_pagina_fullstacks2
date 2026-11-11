// Pasarela de pago SIMULADA: no se conecta a ningún banco ni realiza cobros reales.
// Imita lo que haría una pasarela real: tarda un momento, puede rechazar la tarjeta y,
// si aprueba, entrega un código de autorización. Del medio de pago solo devuelve datos seguros.
import { datosSeguros, soloDigitos } from '../utils/tarjeta.js'

// En las pruebas automáticas no hace falta esperar.
const ESPERA_MS = import.meta.env?.MODE === 'test' ? 0 : 1400

/** Números de prueba que el "banco" rechaza siempre, para poder mostrar un pago fallido. */
export const TARJETAS_RECHAZADAS = ['4000000000000002']

/**
 * Procesa el pago con una tarjeta nueva ({ tarjeta }) o con una guardada ({ tarjetaGuardada }).
 * Resuelve con { aprobado, codigoAutorizacion, marca, ultimos4, monto } o rechaza con un Error.
 */
export async function procesarPago({ tarjeta, tarjetaGuardada }, monto) {
  if (!(monto > 0)) throw new Error('El monto a pagar no es válido.')
  if (!tarjeta && !tarjetaGuardada) throw new Error('Elige un medio de pago.')

  await new Promise((resolve) => setTimeout(resolve, ESPERA_MS))

  if (tarjeta && TARJETAS_RECHAZADAS.includes(soloDigitos(tarjeta.numero))) {
    throw new Error('El banco rechazó la tarjeta. Prueba con otra tarjeta o comunícate con tu banco.')
  }

  const { marca, ultimos4 } = tarjetaGuardada ?? datosSeguros(tarjeta)
  return {
    aprobado: true,
    codigoAutorizacion: String(Math.floor(100000 + Math.random() * 900000)),
    marca,
    ultimos4,
    monto,
  }
}
