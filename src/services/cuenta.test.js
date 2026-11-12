import { beforeEach, describe, expect, it } from 'vitest'
import { login } from './auth.js'
import { actualizarPerfil, validarPerfil } from './perfil.js'
import { eliminarTarjeta, guardarTarjeta, listarTarjetas, marcarPredeterminada } from './tarjetas.js'
import { apiFalsa } from '../test/apiFalsa.js'

const visa = { numero: '4111 1111 1111 1111', titular: 'Ana García', vencimiento: '12/30', cvv: '123' }
const mastercard = { numero: '5555 5555 5555 4444', titular: 'Ana García', vencimiento: '08/29', cvv: '456' }

describe('tarjetas.js (tarjetas guardadas, /api/v1/tarjetas)', () => {
  beforeEach(() => login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' }))

  it('envía solo número, titular y vencimiento: el CVV nunca sale del navegador al guardar', async () => {
    const { tarjeta, duplicada } = await guardarTarjeta(visa)
    expect(duplicada).toBe(false)
    expect(tarjeta).toMatchObject({ marca: 'VISA', ultimos4: '1111', predeterminada: true })
    const [peticion] = apiFalsa().llamadasA('POST', '/tarjetas')
    expect(peticion.cuerpo).toEqual({ numero: visa.numero, titular: visa.titular, vencimiento: visa.vencimiento })
  })

  it('la respuesta 200 (en vez de 201) indica que la tarjeta ya estaba guardada', async () => {
    await guardarTarjeta(visa)
    const segunda = await guardarTarjeta({ ...visa, cvv: '999' })
    expect(segunda.duplicada).toBe(true)
    expect(await listarTarjetas()).toHaveLength(1)
  })

  it('marcarPredeterminada deja una sola predeterminada y la lista la muestra primero', async () => {
    await guardarTarjeta(visa)
    const { tarjeta: mc } = await guardarTarjeta(mastercard)
    const lista = await marcarPredeterminada(mc.id)
    expect(lista.map((t) => [t.ultimos4, t.predeterminada])).toEqual([
      ['4444', true],
      ['1111', false],
    ])
  })

  it('al eliminar la predeterminada, otra tarjeta pasa a serlo', async () => {
    const { tarjeta: v } = await guardarTarjeta(visa)
    await guardarTarjeta(mastercard)
    const restantes = await eliminarTarjeta(v.id)
    expect(restantes).toHaveLength(1)
    expect(restantes[0]).toMatchObject({ ultimos4: '4444', predeterminada: true })
  })

  it('una tarjeta inválida devuelve los errores por campo', async () => {
    await expect(guardarTarjeta({ numero: '1234', titular: '', vencimiento: '' })).rejects.toMatchObject({
      status: 400,
      errores: expect.objectContaining({ numero: expect.any(String), titular: expect.any(String) }),
    })
  })

  it('sin sesión de cliente la API responde 401', async () => {
    const { logout } = await import('./auth.js')
    await logout()
    await expect(listarTarjetas()).rejects.toMatchObject({ status: 401 })
  })
})

describe('perfil.js (personalización de la cuenta, /api/v1/perfil)', () => {
  it('actualizarPerfil envía los datos limpios y el avatar como ícono y color', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    const actualizado = await actualizarPerfil({
      nombre: ' Ana María García ',
      telefono: ' +56 9 1234 5678 ',
      region: 'Maule',
      comuna: 'Talca ',
      direccion: 'Calle 1',
      avatar: { icono: '🐱', color: '#8E44AD' },
    })
    expect(apiFalsa().llamadasA('PUT', '/perfil')[0].cuerpo).toEqual({
      nombre: 'Ana María García',
      telefono: '+56 9 1234 5678',
      region: 'Maule',
      comuna: 'Talca',
      direccion: 'Calle 1',
      avatarIcono: '🐱',
      avatarColor: '#8E44AD',
    })
    expect(actualizado).toMatchObject({ nombre: 'Ana María García', avatarIcono: '🐱', rol: 'CLIENTE' })
  })

  it('validarPerfil revisa el nombre, el celular chileno y la región', () => {
    expect(validarPerfil({ nombre: 'Ana García', telefono: '+56 9 1234 5678', region: 'Maule' })).toEqual({})
    expect(validarPerfil({ nombre: 'Ana García', telefono: '' })).toEqual({})
    expect(validarPerfil({ nombre: 'Ana García', telefono: '912345678' })).toEqual({})
    const errores = validarPerfil({ nombre: 'A', telefono: '1234', region: 'Narnia' })
    expect(Object.keys(errores).sort()).toEqual(['nombre', 'region', 'telefono'])
  })
})
