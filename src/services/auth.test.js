import { describe, expect, it, vi } from 'vitest'
import {
  autenticar,
  borrarSesion,
  guardarSesion,
  leerSesion,
  obtenerCuentas,
  registrarCuenta,
  rutaInicialDe,
  validarLogin,
  validarRegistro,
} from './auth.js'

// Almacenamiento falso en memoria: así las pruebas no tocan el localStorage real.
function storageFalso(inicial) {
  let guardado = inicial ?? null
  return {
    getItem: vi.fn(() => guardado),
    setItem: vi.fn((_clave, valor) => {
      guardado = valor
    }),
    removeItem: vi.fn(() => {
      guardado = null
    }),
  }
}

describe('auth.js (login)', () => {
  it('validarLogin pide correo y contraseña', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({ email: 'Ingresa tu correo.', password: 'Ingresa tu contraseña.' })
  })

  it('validarLogin revisa formato de correo y largo mínimo de contraseña', () => {
    const errores = validarLogin({ email: 'mal-correo', password: '123' })
    expect(errores.email).toContain('formato')
    expect(errores.password).toContain('8 caracteres')
  })

  it('autenticar acepta credenciales correctas y entrega el usuario con el rol de su cuenta', () => {
    const resultado = autenticar({ email: ' Admin@sanmarcos.cl ', password: 'Admin123!' })
    expect(resultado.ok).toBe(true)
    expect(resultado.usuario).toEqual({ nombre: 'Administrador General', email: 'admin@sanmarcos.cl', rol: 'ADMIN' })
  })

  it('autenticar nunca devuelve la contraseña junto con el usuario', () => {
    const { usuario } = autenticar({ email: 'recepcion@sanmarcos.cl', password: 'Recep123!' })
    expect(usuario.rol).toBe('RECEPCIONISTA')
    expect(usuario).not.toHaveProperty('password')
  })

  it('autenticar rechaza una contraseña incorrecta', () => {
    const resultado = autenticar({ email: 'admin@sanmarcos.cl', password: 'Incorrecta1' })
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toContain('incorrectos')
  })

  it('autenticar acepta una lista de cuentas falsa (mock) inyectada', () => {
    const cuentasFalsas = [{ nombre: 'Test', email: 'test@test.cl', password: 'Password1', rol: 'RECEPCIONISTA' }]
    expect(autenticar({ email: 'test@test.cl', password: 'Password1' }, cuentasFalsas).usuario.rol).toBe('RECEPCIONISTA')
  })

  it('rutaInicialDe envía a cada rol a su página', () => {
    expect(rutaInicialDe('ADMIN')).toBe('/admin')
    expect(rutaInicialDe('RECEPCIONISTA')).toBe('/recepcion')
    expect(rutaInicialDe('CLIENTE')).toBe('/tienda')
  })
})

describe('auth.js (registro de cuentas)', () => {
  const datosOk = { nombre: 'Luc Pérez', email: 'luc@correo.cl', password: 'Clave1234', confirmar: 'Clave1234' }

  it('validarRegistro no devuelve errores con datos válidos', () => {
    expect(validarRegistro(datosOk, [])).toEqual({})
  })

  it('validarRegistro detecta nombre corto, correo inválido y contraseña corta', () => {
    const errores = validarRegistro({ nombre: 'L', email: 'mal', password: '123', confirmar: '123' }, [])
    expect(Object.keys(errores).sort()).toEqual(['email', 'nombre', 'password'])
  })

  it('validarRegistro exige que las contraseñas coincidan', () => {
    expect(validarRegistro({ ...datosOk, confirmar: 'Otra12345' }, []).confirmar).toContain('no coinciden')
  })

  it('validarRegistro rechaza correos ya registrados', () => {
    const cuentas = [{ email: 'luc@correo.cl', password: 'x', rol: 'CLIENTE' }]
    expect(validarRegistro({ ...datosOk, email: 'LUC@correo.cl' }, cuentas).email).toContain('Ya existe')
  })

  it('registrarCuenta guarda la cuenta normalizada y siempre con rol CLIENTE', () => {
    const storage = storageFalso()
    expect(registrarCuenta({ ...datosOk, email: ' LUC@Correo.cl ' }, storage).ok).toBe(true)
    const guardadas = JSON.parse(storage.setItem.mock.calls.at(-1)[1])
    expect(guardadas).toEqual([{ nombre: 'Luc Pérez', email: 'luc@correo.cl', password: 'Clave1234', rol: 'CLIENTE' }])
  })

  it('una cuenta registrada puede iniciar sesión y entra como cliente', () => {
    const storage = storageFalso()
    registrarCuenta(datosOk, storage)
    const resultado = autenticar({ email: 'luc@correo.cl', password: 'Clave1234' }, obtenerCuentas(storage))
    expect(resultado.ok).toBe(true)
    expect(resultado.usuario.rol).toBe('CLIENTE')
  })

  it('nadie puede darse un rol del personal manipulando los datos guardados', () => {
    const manipulado = JSON.stringify([{ nombre: 'Intruso', email: 'intruso@correo.cl', password: 'Clave1234', rol: 'ADMIN', role: 'administrador' }])
    const cuentas = obtenerCuentas(storageFalso(manipulado))
    expect(cuentas.find((c) => c.email === 'intruso@correo.cl').rol).toBe('CLIENTE')
  })

  it('obtenerCuentas ignora datos corruptos del storage y mantiene las cuentas demo', () => {
    expect(obtenerCuentas(storageFalso('{esto no es json'))).toHaveLength(3)
  })

  it('registrarCuenta informa el error si el storage falla (por ejemplo, está lleno)', () => {
    const storage = storageFalso()
    storage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const resultado = registrarCuenta(datosOk, storage)
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toContain('No se pudo guardar')
  })
})

describe('auth.js (persistencia de la sesión)', () => {
  const ana = { nombre: 'Ana García', email: 'ana.garcia@correo.cl', rol: 'CLIENTE' }

  it('la sesión guardada se recupera igual (lo que ocurre al recargar la página)', () => {
    const storage = storageFalso()
    guardarSesion(ana, storage)
    expect(leerSesion(storage)).toEqual(ana)
  })

  it('sin sesión guardada leerSesion devuelve null', () => {
    expect(leerSesion(storageFalso())).toBeNull()
  })

  it('borrarSesion elimina la sesión', () => {
    const storage = storageFalso()
    guardarSesion(ana, storage)
    borrarSesion(storage)
    expect(leerSesion(storage)).toBeNull()
  })

  it('leerSesion descarta datos corruptos o con un rol que no existe', () => {
    expect(leerSesion(storageFalso('{roto'))).toBeNull()
    expect(leerSesion(storageFalso(JSON.stringify({ email: 'x@x.cl', rol: 'SUPERUSUARIO' })))).toBeNull()
    expect(leerSesion(storageFalso(JSON.stringify({ rol: 'ADMIN' })))).toBeNull()
  })
})
