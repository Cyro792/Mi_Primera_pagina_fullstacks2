import { citasDelDia, citasPorServicio, contarPorEstado, filtrarCitas, formatoCLP, ingresosEstimados, proximasCitas, siguienteId } from '../js/admin/stats.js'
import { aISO } from '../js/admin/data.js'

const HOY = '2026-10-12'
const citas = [
  { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: HOY, hora: '10:00', estado: 'Confirmada' },
  { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Vacunación', fecha: HOY, hora: '09:00', estado: 'Pendiente' },
  { id: 3, cliente: 'María Fuentes', mascota: 'Rocky', servicio: 'Cirugía', fecha: '2026-10-13', hora: '08:00', estado: 'Completada' },
  { id: 4, cliente: 'Luis Araya', mascota: 'Kira', servicio: 'Vacunación', fecha: HOY, hora: '12:00', estado: 'Cancelada' },
]

describe('stats.js (métricas del dashboard)', () => {
  it('contarPorEstado cuenta cada estado, incluso los que no tienen citas', () => {
    expect(contarPorEstado(citas)).toEqual({ Pendiente: 1, Confirmada: 1, Completada: 1, Cancelada: 1 })
    expect(contarPorEstado([])).toEqual({ Pendiente: 0, Confirmada: 0, Completada: 0, Cancelada: 0 })
  })

  it('citasDelDia devuelve solo las de hoy y excluye las canceladas', () => {
    expect(citasDelDia(citas, HOY).map((c) => c.id)).toEqual([1, 2])
  })

  it('citasPorServicio agrupa por servicio sin contar canceladas', () => {
    const datos = citasPorServicio(citas)
    expect(datos.find((d) => d.etiqueta === 'Vacunación').valor).toBe(1)
    expect(datos.find((d) => d.etiqueta === 'Odontología').valor).toBe(0)
    expect(datos.length).toBe(6)
  })

  it('ingresosEstimados suma solo las citas completadas', () => {
    expect(ingresosEstimados(citas)).toBe(120000)
  })

  it('filtrarCitas filtra por estado y por texto (cliente o mascota)', () => {
    expect(filtrarCitas(citas, { estado: 'Pendiente' }).map((c) => c.id)).toEqual([2])
    expect(filtrarCitas(citas, { texto: ' rocky ' }).map((c) => c.id)).toEqual([3])
    expect(filtrarCitas(citas, { estado: 'Todas', texto: 'garcía' }).map((c) => c.id)).toEqual([1])
    expect(filtrarCitas(citas).length).toBe(4)
  })

  it('proximasCitas ordena por fecha y hora, ignora completadas/canceladas y respeta el límite', () => {
    expect(proximasCitas(citas, HOY).map((c) => c.id)).toEqual([2, 1])
    expect(proximasCitas(citas, HOY, 1).length).toBe(1)
  })

  it('formatoCLP da formato de pesos chilenos', () => {
    expect(formatoCLP(120000)).toContain('120.000')
  })

  it('siguienteId entrega el máximo + 1 (y 1 si la lista está vacía)', () => {
    expect(siguienteId(citas)).toBe(5)
    expect(siguienteId([])).toBe(1)
  })

  it('aISO usa un reloj simulado (jasmine.clock) y formatea YYYY-MM-DD', () => {
    jasmine.clock().install()
    jasmine.clock().mockDate(new Date(2026, 9, 5, 23, 30))
    expect(aISO()).toBe('2026-10-05')
    expect(aISO(new Date(), 1)).toBe('2026-10-06')
    jasmine.clock().uninstall()
  })
})
