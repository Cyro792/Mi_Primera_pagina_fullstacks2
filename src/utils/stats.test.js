import { describe, expect, it, vi } from 'vitest'
import { citasDelDia, contarPorEstado, filtrarCitas, formatoCLP, proximasCitas } from './stats.js'
import { aISO } from './data.js'

const HOY = '2026-10-12'
// Mismo formato que entrega GET /api/v1/citas.
const citas = [
  { id: 1, nombreDueno: 'Ana García', nombreMascota: 'Pepe', servicioNombre: 'Consulta General', fecha: HOY, hora: '10:00', estado: 'CONFIRMADA' },
  { id: 2, nombreDueno: 'Pedro Soto', nombreMascota: 'Luna', servicioNombre: 'Vacunación', fecha: HOY, hora: '09:00', estado: 'PENDIENTE' },
  { id: 3, nombreDueno: 'María Fuentes', nombreMascota: 'Rocky', servicioNombre: 'Cirugía', fecha: '2026-10-13', hora: '08:00', estado: 'COMPLETADA' },
  { id: 4, nombreDueno: 'Luis Araya', nombreMascota: 'Kira', servicioNombre: 'Vacunación', fecha: HOY, hora: '12:00', estado: 'CANCELADA' },
]

describe('stats.js (métricas de los paneles)', () => {
  it('contarPorEstado cuenta cada estado, incluso los que no tienen citas', () => {
    expect(contarPorEstado(citas)).toEqual({ PENDIENTE: 1, CONFIRMADA: 1, COMPLETADA: 1, CANCELADA: 1 })
    expect(contarPorEstado([])).toEqual({ PENDIENTE: 0, CONFIRMADA: 0, COMPLETADA: 0, CANCELADA: 0 })
  })

  it('citasDelDia devuelve solo las de hoy y excluye las canceladas', () => {
    expect(citasDelDia(citas, HOY).map((c) => c.id)).toEqual([1, 2])
  })

  it('filtrarCitas filtra por estado y por texto (dueño o mascota)', () => {
    expect(filtrarCitas(citas, { estado: 'PENDIENTE' }).map((c) => c.id)).toEqual([2])
    expect(filtrarCitas(citas, { texto: ' rocky ' }).map((c) => c.id)).toEqual([3])
    expect(filtrarCitas(citas, { estado: 'TODAS', texto: 'garcía' }).map((c) => c.id)).toEqual([1])
    expect(filtrarCitas(citas)).toHaveLength(4)
  })

  it('proximasCitas ordena por fecha y hora, ignora completadas/canceladas y respeta el límite', () => {
    expect(proximasCitas(citas, HOY).map((c) => c.id)).toEqual([2, 1])
    expect(proximasCitas(citas, HOY, 1)).toHaveLength(1)
  })

  it('formatoCLP da formato de pesos chilenos', () => {
    expect(formatoCLP(120000)).toContain('120.000')
  })

  it('aISO usa un reloj simulado (vi.useFakeTimers) y formatea YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 5, 23, 30))
    expect(aISO()).toBe('2026-10-05')
    expect(aISO(new Date(), 1)).toBe('2026-10-06')
    vi.useRealTimers()
  })
})
