import { describe, expect, it } from 'vitest'
import { autenticar, cambiarPassword, obtenerCuentas, actualizarNombre, validarCambioPassword } from './auth.js'
import { procesarPago } from './pagos.js'
import { guardarPerfil, leerPerfil, validarPerfil } from './perfil.js'
import { eliminarTarjeta, guardarTarjeta, listarTarjetas, marcarPredeterminada } from './tarjetas.js'

const ANA = 'ana.garcia@correo.cl'
const visa = { numero: '4111 1111 1111 1111', titular: 'Ana García', vencimiento: '12/30', cvv: '123' }
const mastercard = { numero: '5555 5555 5555 4444', titular: 'Ana García', vencimiento: '08/29', cvv: '456' }

describe('tarjetas.js (tarjetas guardadas)', () => {
  it('guarda solo los datos seguros y la primera tarjeta queda como predeterminada', async () => {
    const { tarjeta, duplicada } = await guardarTarjeta(ANA, visa)
    expect(duplicada).toBe(false)
    expect(tarjeta).toMatchObject({ marca: 'VISA', ultimos4: '1111', predeterminada: true })

    const almacenado = localStorage.getItem('sanmarcos_tarjetas')
    expect(almacenado).not.toContain('4111111111111111')
    expect(almacenado).not.toContain('"cvv"')
    expect(almacenado).not.toContain('123"')
  })

  it('no duplica una tarjeta que ya estaba guardada', async () => {
    await guardarTarjeta(ANA, visa)
    const segunda = await guardarTarjeta(ANA, { ...visa, cvv: '999' })
    expect(segunda.duplicada).toBe(true)
    expect(await listarTarjetas(ANA)).toHaveLength(1)
  })

  it('cada cliente ve solo sus propias tarjetas', async () => {
    await guardarTarjeta(ANA, visa)
    expect(await listarTarjetas('pedro@correo.cl')).toEqual([])
  })

  it('marcarPredeterminada deja una sola predeterminada y la lista la muestra primero', async () => {
    await guardarTarjeta(ANA, visa)
    const { tarjeta: mc } = await guardarTarjeta(ANA, mastercard)
    const lista = await marcarPredeterminada(ANA, mc.id)
    expect(lista.map((t) => [t.ultimos4, t.predeterminada])).toEqual([
      ['4444', true],
      ['1111', false],
    ])
  })

  it('al eliminar la predeterminada, otra tarjeta pasa a serlo', async () => {
    const { tarjeta: v } = await guardarTarjeta(ANA, visa)
    await guardarTarjeta(ANA, mastercard)
    const restantes = await eliminarTarjeta(ANA, v.id)
    expect(restantes).toHaveLength(1)
    expect(restantes[0]).toMatchObject({ ultimos4: '4444', predeterminada: true })
  })

  it('ignora datos corruptos en el almacenamiento', async () => {
    localStorage.setItem('sanmarcos_tarjetas', '{roto')
    expect(await listarTarjetas(ANA)).toEqual([])
  })
})

describe('pagos.js (pasarela simulada)', () => {
  it('aprueba una tarjeta nueva y devuelve solo datos seguros con un código de autorización', async () => {
    const pago = await procesarPago({ tarjeta: visa }, 50980)
    expect(pago).toMatchObject({ aprobado: true, marca: 'VISA', ultimos4: '1111', monto: 50980 })
    expect(pago.codigoAutorizacion).toMatch(/^\d{6}$/)
    expect(JSON.stringify(pago)).not.toContain('4111111111111111')
  })

  it('aprueba con una tarjeta guardada', async () => {
    const pago = await procesarPago({ tarjetaGuardada: { marca: 'MASTERCARD', ultimos4: '4444' } }, 1000)
    expect(pago).toMatchObject({ aprobado: true, marca: 'MASTERCARD', ultimos4: '4444' })
  })

  it('rechaza la tarjeta de prueba 4000 0000 0000 0002, un monto inválido o la falta de medio de pago', async () => {
    await expect(procesarPago({ tarjeta: { ...visa, numero: '4000 0000 0000 0002' } }, 1000)).rejects.toThrow('rechazó')
    await expect(procesarPago({ tarjeta: visa }, 0)).rejects.toThrow('monto')
    await expect(procesarPago({}, 1000)).rejects.toThrow('medio de pago')
  })
})

describe('perfil.js (personalización de la cuenta)', () => {
  it('sin datos guardados devuelve un perfil vacío con el avatar inicial', () => {
    expect(leerPerfil(ANA)).toEqual({ telefono: '', region: '', comuna: '', direccion: '', avatar: { icono: '🐾', color: '#2A6049' } })
  })

  it('guarda y recupera el perfil de cada usuario por separado', () => {
    guardarPerfil(ANA, { telefono: ' +56 9 1234 5678 ', region: 'Maule', comuna: 'Talca', direccion: 'Calle 1', avatar: { icono: '🐱', color: '#8E44AD' } })
    expect(leerPerfil(ANA)).toMatchObject({ telefono: '+56 9 1234 5678', region: 'Maule', avatar: { icono: '🐱', color: '#8E44AD' } })
    expect(leerPerfil('pedro@correo.cl').region).toBe('')
  })

  it('validarPerfil revisa el nombre, el celular chileno y la región', () => {
    expect(validarPerfil({ nombre: 'Ana García', telefono: '+56 9 1234 5678', region: 'Maule' })).toEqual({})
    expect(validarPerfil({ nombre: 'Ana García', telefono: '' })).toEqual({})
    expect(validarPerfil({ nombre: 'Ana García', telefono: '912345678' })).toEqual({})
    const errores = validarPerfil({ nombre: 'A', telefono: '1234', region: 'Narnia' })
    expect(Object.keys(errores).sort()).toEqual(['nombre', 'region', 'telefono'])
  })
})

describe('auth.js (cambios en la cuenta)', () => {
  it('actualizarNombre cambia el nombre que entrega el inicio de sesión', () => {
    actualizarNombre(ANA, '  Ana María García ')
    expect(autenticar({ email: ANA, password: 'Cliente123!' }).usuario.nombre).toBe('Ana María García')
  })

  it('los cambios guardados nunca pueden modificar el rol de la cuenta', () => {
    localStorage.setItem('sanmarcos_ajustes_cuentas', JSON.stringify({ [ANA]: { rol: 'ADMIN', nombre: 'Ana' } }))
    expect(obtenerCuentas().find((c) => c.email === ANA).rol).toBe('CLIENTE')
  })

  it('validarCambioPassword exige la contraseña actual correcta y una nueva válida y distinta', () => {
    expect(validarCambioPassword({ actual: 'Cliente123!', nueva: 'NuevaClave1', confirmar: 'NuevaClave1' }, 'Cliente123!')).toEqual({})
    expect(validarCambioPassword({ actual: 'otra', nueva: 'NuevaClave1', confirmar: 'NuevaClave1' }, 'Cliente123!').actual).toContain('no es correcta')
    expect(validarCambioPassword({ actual: 'Cliente123!', nueva: 'Cliente123!', confirmar: 'Cliente123!' }, 'Cliente123!').nueva).toContain('distinta')
    expect(validarCambioPassword({ actual: 'Cliente123!', nueva: 'corta', confirmar: 'corta' }, 'Cliente123!').nueva).toContain('8 caracteres')
    expect(validarCambioPassword({ actual: 'Cliente123!', nueva: 'NuevaClave1', confirmar: 'Otra' }, 'Cliente123!').confirmar).toContain('no coinciden')
  })

  it('después de cambiar la contraseña solo funciona la nueva', () => {
    expect(cambiarPassword(ANA, { actual: 'Cliente123!', nueva: 'NuevaClave1', confirmar: 'NuevaClave1' }).ok).toBe(true)
    expect(autenticar({ email: ANA, password: 'Cliente123!' }).ok).toBe(false)
    expect(autenticar({ email: ANA, password: 'NuevaClave1' }).ok).toBe(true)
  })
})
