import { describe, expect, it } from 'vitest'
import { login } from './auth.js'
import { comprar, listarMisBoletas } from './boletas.js'
import { cambiarEstadoCita, estadosSiguientes, listarCitas, solicitarCita } from './citas.js'
import { listarCategorias, listarProductos, obtenerProducto } from './productos.js'
import { apiFalsa } from '../test/apiFalsa.js'

const items = [
  { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, cantidad: 1 },
  { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 30, cantidad: 2 },
]
const visa = { numero: '4111 1111 1111 1111', titular: 'Ana García', vencimiento: '12/30', cvv: '123' }

describe('productos.js (catálogo, /api/v1/productos)', () => {
  it('listarCategorias devuelve las 4 categorías', async () => {
    const categorias = await listarCategorias()
    expect(categorias.map((c) => c.nombre)).toEqual(['Servicios clínicos', 'Alimentos', 'Accesorios', 'Higiene y cuidado'])
  })

  it('listarProductos devuelve el catálogo con el nombre de su categoría', async () => {
    const productos = await listarProductos()
    expect(productos).toHaveLength(12)
    expect(productos[0]).toMatchObject({ nombre: 'Consulta General', tipo: 'SERVICIO', categoriaNombre: 'Servicios clínicos' })
  })

  it('listarProductos envía los filtros como parámetros de la URL', async () => {
    expect(await listarProductos({ categoriaId: 2 })).toHaveLength(2)
    expect(await listarProductos({ tipo: 'SERVICIO' })).toHaveLength(6)
    expect(apiFalsa().peticiones.map((p) => p.query)).toEqual(['categoriaId=2', 'tipo=SERVICIO'])
  })

  it('obtenerProducto devuelve el producto, o null cuando la API responde 404', async () => {
    expect((await obtenerProducto('9')).nombre).toBe('Collar antipulgas')
    expect(await obtenerProducto(999)).toBeNull()
  })

  it('obtenerProducto no confunde un error del servidor con "no existe"', async () => {
    apiFalsa().fallar('GET', '/productos/9', 0)
    await expect(obtenerProducto(9)).rejects.toMatchObject({ status: 0 })
  })
})

describe('boletas.js (compras, /api/v1/boletas)', () => {
  it('comprar envía solo productos y cantidades (el precio lo pone el servidor) y devuelve la boleta', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    const boleta = await comprar({ items, tarjeta: visa, guardarTarjeta: false })
    const [peticion] = apiFalsa().llamadasA('POST', '/boletas')
    expect(peticion.cuerpo.items).toEqual([{ productoId: 1, cantidad: 1 }, { productoId: 9, cantidad: 2 }])
    expect(peticion.cuerpo).not.toHaveProperty('clienteId')
    expect(peticion.cuerpo.pago).toEqual({ tarjeta: { numero: visa.numero, titular: visa.titular, vencimiento: visa.vencimiento }, cvv: '123', guardarTarjeta: false })
    expect(boleta).toMatchObject({ estado: 'PAGADA', total: 50980, medioPago: { marca: 'VISA', ultimos4: '1111' } })
  })

  it('con una tarjeta guardada envía solo su id y el CVV', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    const guardada = apiFalsa().agregarTarjeta('ana.garcia@correo.cl', { marca: 'MASTERCARD', ultimos4: '4444', titular: 'ANA', mes: 8, anio: 2034 })
    await comprar({ items, tarjetaGuardadaId: guardada.id, cvv: '456' })
    expect(apiFalsa().llamadasA('POST', '/boletas')[0].cuerpo.pago).toEqual({ tarjetaGuardadaId: guardada.id, cvv: '456' })
  })

  it('si el banco rechaza la tarjeta la API responde 402 y no se crea la boleta', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    await expect(comprar({ items, tarjeta: { ...visa, numero: '4000 0000 0000 0002' } })).rejects.toMatchObject({ status: 402 })
    expect(await listarMisBoletas()).toEqual([])
  })

  it('sin sesión no se puede comprar (401)', async () => {
    await expect(comprar({ items, tarjeta: visa })).rejects.toMatchObject({ status: 401 })
  })
})

describe('citas.js (agenda, /api/v1/citas)', () => {
  it('cualquiera puede solicitar una cita: queda pendiente', async () => {
    const cita = await solicitarCita({ nombreMascota: 'Michi ', nombreDueno: 'Luc', telefonoContacto: '+56 9 1111 2222', servicioId: '2', fecha: '2030-01-10', hora: '10:00' })
    expect(cita).toMatchObject({ nombreMascota: 'Michi', estado: 'PENDIENTE', servicioNombre: 'Vacunación' })
    expect(apiFalsa().llamadasA('POST', '/citas')[0].cuerpo).toMatchObject({ servicioId: 2, notas: null })
  })

  it('ver la agenda exige un rol del personal', async () => {
    await expect(listarCitas()).rejects.toMatchObject({ status: 401 })
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    await expect(listarCitas()).rejects.toMatchObject({ status: 403 })
  })

  it('el cambio de estado solo ofrece las transiciones válidas', async () => {
    expect(estadosSiguientes('PENDIENTE')).toEqual(['CONFIRMADA', 'CANCELADA'])
    expect(estadosSiguientes('COMPLETADA')).toEqual([])
    await login({ email: 'recepcion@sanmarcos.cl', password: 'Recep123!' })
    await expect(cambiarEstadoCita(2, 'CONFIRMADA')).resolves.toMatchObject({ estado: 'CONFIRMADA' })
    await expect(cambiarEstadoCita(3, 'CANCELADA')).rejects.toMatchObject({ status: 409 })
  })
})
