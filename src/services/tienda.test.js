import { describe, expect, it } from 'vitest'
import { crearBoleta, listarBoletasDe } from './boletas.js'
import { listarCategorias, listarProductos, obtenerProducto } from './productos.js'

const ana = { nombre: 'Ana García', email: 'ana.garcia@correo.cl', rol: 'CLIENTE' }
const items = [
  { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, cantidad: 1 },
  { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 30, cantidad: 2 },
]

describe('productos.js (catálogo de la tienda)', () => {
  it('listarCategorias devuelve las 4 categorías', async () => {
    const categorias = await listarCategorias()
    expect(categorias.map((c) => c.nombre)).toEqual(['Servicios clínicos', 'Alimentos', 'Accesorios', 'Higiene y cuidado'])
  })

  it('listarProductos devuelve el catálogo con el nombre de su categoría', async () => {
    const productos = await listarProductos()
    expect(productos).toHaveLength(12)
    expect(productos[0]).toMatchObject({ nombre: 'Consulta General', tipo: 'SERVICIO', categoriaNombre: 'Servicios clínicos' })
  })

  it('listarProductos filtra por categoría y por tipo', async () => {
    expect(await listarProductos({ categoriaId: 2 })).toHaveLength(2)
    expect(await listarProductos({ tipo: 'SERVICIO' })).toHaveLength(6)
    expect((await listarProductos({ tipo: 'SERVICIO' })).every((p) => p.stock === null)).toBe(true)
  })

  it('obtenerProducto devuelve el producto, o null si no existe', async () => {
    expect((await obtenerProducto('9')).nombre).toBe('Collar antipulgas')
    expect(await obtenerProducto(999)).toBeNull()
  })
})

describe('boletas.js (compras)', () => {
  it('crearBoleta genera la boleta con detalles, subtotales y total', async () => {
    const boleta = await crearBoleta({ cliente: ana, items })
    expect(boleta).toMatchObject({ clienteEmail: 'ana.garcia@correo.cl', estado: 'PAGADA', total: 50980 })
    expect(boleta.detalles).toEqual([
      { productoId: 1, nombre: 'Consulta General', cantidad: 1, precioUnitario: 25000, subtotal: 25000 },
      { productoId: 9, nombre: 'Collar antipulgas', cantidad: 2, precioUnitario: 12990, subtotal: 25980 },
    ])
  })

  it('cada boleta nueva recibe un número correlativo', async () => {
    const primera = await crearBoleta({ cliente: ana, items })
    const segunda = await crearBoleta({ cliente: ana, items })
    expect(segunda.id).toBe(primera.id + 1)
  })

  it('crearBoleta rechaza la compra sin sesión o con el carrito vacío', async () => {
    await expect(crearBoleta({ cliente: null, items })).rejects.toThrow('iniciar sesión')
    await expect(crearBoleta({ cliente: ana, items: [] })).rejects.toThrow('vacío')
  })

  it('listarBoletasDe devuelve solo las compras de ese cliente, la más reciente primero', async () => {
    const primera = await crearBoleta({ cliente: ana, items })
    const segunda = await crearBoleta({ cliente: ana, items })
    await crearBoleta({ cliente: { nombre: 'Pedro', email: 'pedro@correo.cl' }, items })

    const deAna = await listarBoletasDe('ana.garcia@correo.cl')
    expect(deAna.map((b) => b.id)).toEqual([segunda.id, primera.id])
    expect(await listarBoletasDe('nadie@correo.cl')).toEqual([])
  })
})
