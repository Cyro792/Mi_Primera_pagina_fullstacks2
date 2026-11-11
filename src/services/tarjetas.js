// Tarjetas guardadas en la cuenta de un cliente. Con el backend serán:
//   GET    /api/v1/tarjetas/mias
//   POST   /api/v1/tarjetas                 (guarda solo marca, últimos 4, titular y vencimiento)
//   PATCH  /api/v1/tarjetas/{id}/predeterminada
//   DELETE /api/v1/tarjetas/{id}
// Por ahora se guardan en el navegador. Nunca se guarda el número completo ni el CVV.
import { datosSeguros } from '../utils/tarjeta.js'

const CLAVE_TARJETAS = 'sanmarcos_tarjetas'

function leerTodas(storage) {
  try {
    const todas = JSON.parse(storage.getItem(CLAVE_TARJETAS))
    return todas && typeof todas === 'object' && !Array.isArray(todas) ? todas : {}
  } catch {
    return {}
  }
}

function escribir(email, tarjetas, storage) {
  storage.setItem(CLAVE_TARJETAS, JSON.stringify({ ...leerTodas(storage), [email]: tarjetas }))
}

function ordenar(tarjetas) {
  return [...tarjetas].sort((a, b) => Number(b.predeterminada) - Number(a.predeterminada) || b.id - a.id)
}

/** Tarjetas del cliente, con la predeterminada primero. */
export async function listarTarjetas(email, storage = window.localStorage) {
  return ordenar(leerTodas(storage)[email] ?? [])
}

/**
 * Guarda una tarjeta ya validada. Recibe los datos completos del formulario, pero solo
 * conserva los datos seguros. La primera tarjeta queda como predeterminada.
 * Devuelve { tarjeta, duplicada }: si ya estaba guardada no se repite.
 */
export async function guardarTarjeta(email, datosFormulario, storage = window.localStorage) {
  const actuales = leerTodas(storage)[email] ?? []
  const segura = datosSeguros(datosFormulario)
  const existente = actuales.find(
    (t) => t.marca === segura.marca && t.ultimos4 === segura.ultimos4 && t.mes === segura.mes && t.anio === segura.anio,
  )
  if (existente) return { tarjeta: existente, duplicada: true }

  const tarjeta = {
    id: actuales.reduce((max, t) => Math.max(max, t.id), 0) + 1,
    ...segura,
    predeterminada: actuales.length === 0,
  }
  escribir(email, [...actuales, tarjeta], storage)
  return { tarjeta, duplicada: false }
}

/** Elimina una tarjeta. Si era la predeterminada, la más reciente que quede pasa a serlo. */
export async function eliminarTarjeta(email, id, storage = window.localStorage) {
  const actuales = leerTodas(storage)[email] ?? []
  const eliminada = actuales.find((t) => t.id === id)
  let restantes = actuales.filter((t) => t.id !== id)
  if (eliminada?.predeterminada && restantes.length > 0) {
    const nueva = ordenar(restantes)[0].id
    restantes = restantes.map((t) => ({ ...t, predeterminada: t.id === nueva }))
  }
  escribir(email, restantes, storage)
  return ordenar(restantes)
}

export async function marcarPredeterminada(email, id, storage = window.localStorage) {
  const actualizadas = (leerTodas(storage)[email] ?? []).map((t) => ({ ...t, predeterminada: t.id === id }))
  escribir(email, actualizadas, storage)
  return ordenar(actualizadas)
}
