import { describe, expect, it, vi } from 'vitest'
import {
  agregarAlCarrito,
  cambiarCantidad,
  cantidadTotal,
  guardarCarrito,
  leerCarrito,
  maximoPermitido,
  quitarDelCarrito,
  totalCarrito,
} from './carrito.js'

const consulta = { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, categoriaId: 1 }
const collar = { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 3, categoriaId: 3 }

describe('carrito.js (lógica del carrito)', () => {
  it('agregarAlCarrito agrega un producto nuevo con cantidad 1 por defecto', () => {
    const items = agregarAlCarrito([], consulta)
    expect(items).toEqual([{ id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, categoriaId: 1, cantidad: 1 }])
  })

  it('agregarAlCarrito suma la cantidad si el producto ya estaba', () => {
    const items = agregarAlCarrito(agregarAlCarrito([], collar), collar, 1)
    expect(items).toHaveLength(1)
    expect(items[0].cantidad).toBe(2)
  })

  it('no modifica la lista original (devuelve una nueva)', () => {
    const original = []
    const nueva = agregarAlCarrito(original, consulta)
    expect(original).toEqual([])
    expect(nueva).not.toBe(original)
  })

  it('un artículo nunca supera su stock', () => {
    const items = agregarAlCarrito([], collar, 10)
    expect(items[0].cantidad).toBe(3)
    expect(agregarAlCarrito(items, collar, 1)[0].cantidad).toBe(3)
    expect(maximoPermitido(collar)).toBe(3)
  })

  it('un servicio no tiene límite de stock', () => {
    expect(maximoPermitido(consulta)).toBe(Infinity)
    expect(agregarAlCarrito([], consulta, 50)[0].cantidad).toBe(50)
  })

  it('no agrega productos sin stock', () => {
    expect(agregarAlCarrito([], { ...collar, stock: 0 })).toEqual([])
  })

  it('cambiarCantidad fija la cantidad y quita el ítem si llega a 0', () => {
    const items = agregarAlCarrito(agregarAlCarrito([], consulta), collar, 2)
    expect(cambiarCantidad(items, 9, 1).find((i) => i.id === 9).cantidad).toBe(1)
    expect(cambiarCantidad(items, 9, 0).map((i) => i.id)).toEqual([1])
    expect(cambiarCantidad(items, 9, 99).find((i) => i.id === 9).cantidad).toBe(3)
  })

  it('quitarDelCarrito elimina solo el producto indicado', () => {
    const items = agregarAlCarrito(agregarAlCarrito([], consulta), collar)
    expect(quitarDelCarrito(items, 1).map((i) => i.id)).toEqual([9])
  })

  it('totalCarrito y cantidadTotal calculan el resumen de la compra', () => {
    const items = agregarAlCarrito(agregarAlCarrito([], consulta), collar, 2)
    expect(totalCarrito(items)).toBe(50980)
    expect(cantidadTotal(items)).toBe(3)
    expect(totalCarrito([])).toBe(0)
  })

  it('guardarCarrito y leerCarrito conservan el carrito en el navegador', () => {
    const items = agregarAlCarrito([], collar, 2)
    guardarCarrito(items)
    expect(leerCarrito()).toEqual(items)
  })

  it('leerCarrito devuelve un carrito vacío si lo guardado está corrupto', () => {
    const storage = { getItem: vi.fn(() => '{roto') }
    expect(leerCarrito(storage)).toEqual([])
    expect(leerCarrito({ getItem: () => JSON.stringify({ no: 'es una lista' }) })).toEqual([])
  })
})
