// Funciones puras para calcular las métricas del dashboard (fáciles de probar con Jasmine).
import { ESTADOS, SERVICIOS, PRECIOS, aISO } from './data.js'

export function contarPorEstado(citas) {
  const resultado = Object.fromEntries(ESTADOS.map((e) => [e, 0]))
  citas.forEach((c) => {
    if (c.estado in resultado) resultado[c.estado] += 1
  })
  return resultado
}

export function citasDelDia(citas, hoy = aISO()) {
  return citas.filter((c) => c.fecha === hoy && c.estado !== 'Cancelada')
}

export function citasPorServicio(citas) {
  return SERVICIOS.map((s) => ({
    etiqueta: s,
    valor: citas.filter((c) => c.servicio === s && c.estado !== 'Cancelada').length,
  }))
}

export function ingresosEstimados(citas) {
  return citas
    .filter((c) => c.estado === 'Completada')
    .reduce((total, c) => total + (PRECIOS[c.servicio] ?? 0), 0)
}

export function filtrarCitas(citas, { estado = 'Todas', texto = '' } = {}) {
  const q = texto.trim().toLowerCase()
  return citas.filter(
    (c) =>
      (estado === 'Todas' || c.estado === estado) &&
      (!q || c.cliente.toLowerCase().includes(q) || c.mascota.toLowerCase().includes(q)),
  )
}

export function proximasCitas(citas, hoy = aISO(), limite = 5) {
  return citas
    .filter((c) => c.fecha >= hoy && (c.estado === 'Pendiente' || c.estado === 'Confirmada'))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, limite)
}

export function formatoCLP(monto) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)
}

export function siguienteId(lista) {
  return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
