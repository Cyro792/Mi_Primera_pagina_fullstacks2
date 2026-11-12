// Tarjetas guardadas en la cuenta del cliente (rol CLIENTE):
//   GET    /api/v1/tarjetas
//   POST   /api/v1/tarjetas                     (201 si es nueva, 200 si ya estaba guardada)
//   PATCH  /api/v1/tarjetas/{id}/predeterminada
//   DELETE /api/v1/tarjetas/{id}
// El servidor guarda solo la marca, los últimos 4 dígitos, el titular y el vencimiento.
// Nunca se guarda el número completo ni el CVV.
import { api } from './api.js'

/** Tarjetas del cliente, con la predeterminada primero. */
export function listarTarjetas() {
  return api('/tarjetas')
}

/** Guarda una tarjeta. Devuelve { tarjeta, duplicada }: si ya estaba guardada no se repite. */
export async function guardarTarjeta({ numero, titular, vencimiento }) {
  const { status, datos } = await api('/tarjetas', { metodo: 'POST', cuerpo: { numero, titular, vencimiento }, completa: true })
  return { tarjeta: datos, duplicada: status === 200 }
}

/** Elimina una tarjeta y devuelve la lista actualizada (si era la predeterminada, otra pasa a serlo). */
export async function eliminarTarjeta(id) {
  await api(`/tarjetas/${id}`, { metodo: 'DELETE' })
  return listarTarjetas()
}

export function marcarPredeterminada(id) {
  return api(`/tarjetas/${id}/predeterminada`, { metodo: 'PATCH' })
}
