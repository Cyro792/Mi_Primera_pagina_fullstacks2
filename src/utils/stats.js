// Funciones puras para las métricas y filtros de los paneles. Trabajan con las citas tal como las
// entrega la API: { nombreDueno, nombreMascota, servicioNombre, fecha, hora, estado: 'PENDIENTE' | ... }.
import { aISO } from './data.js'

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

export function contarPorEstado(citas) {
  const resultado = Object.fromEntries(ESTADOS.map((e) => [e, 0]))
  citas.forEach((c) => {
    if (c.estado in resultado) resultado[c.estado] += 1
  })
  return resultado
}

/** Citas de un día, sin contar las canceladas. */
export function citasDelDia(citas, hoy = aISO()) {
  return citas.filter((c) => c.fecha === hoy && c.estado !== 'CANCELADA')
}

/** Filtra por estado ('TODAS' para no filtrar) y por texto en el nombre del dueño o de la mascota. */
export function filtrarCitas(citas, { estado = 'TODAS', texto = '' } = {}) {
  const q = texto.trim().toLowerCase()
  return citas.filter(
    (c) =>
      (estado === 'TODAS' || c.estado === estado) &&
      (!q || c.nombreDueno.toLowerCase().includes(q) || c.nombreMascota.toLowerCase().includes(q)),
  )
}

/** Próximas citas por atender (pendientes o confirmadas), de la más cercana a la más lejana. */
export function proximasCitas(citas, hoy = aISO(), limite = 5) {
  return citas
    .filter((c) => c.fecha >= hoy && (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA'))
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, limite)
}

export function formatoCLP(monto) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monto)
}
