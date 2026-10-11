import { autenticar, obtenerCuentas, registrarCuenta, validarRegistro } from '../js/auth.js'

// Almacenamiento falso en memoria: así las pruebas no tocan el localStorage real.
function storageFalso(inicial) {
  let guardado = inicial ?? null
  return {
    getItem: jasmine.createSpy('getItem').and.callFake(() => guardado),
    setItem: jasmine.createSpy('setItem').and.callFake((_clave, valor) => { guardado = valor }),
  }
}

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
    const cuentas = [{ email: 'luc@correo.cl', password: 'x', role: 'administrador' }]
    expect(validarRegistro({ ...datosOk, email: 'LUC@correo.cl' }, cuentas).email).toContain('Ya existe')
  })

  it('registrarCuenta guarda la cuenta normalizada en el storage', () => {
    const storage = storageFalso()
    expect(registrarCuenta({ ...datosOk, email: ' LUC@Correo.cl ', role: 'administrador' }, storage).ok).toBeTrue()
    const guardadas = JSON.parse(storage.setItem.calls.mostRecent().args[1])
    expect(guardadas).toEqual([{ nombre: 'Luc Pérez', email: 'luc@correo.cl', password: 'Clave1234', role: 'administrador' }])
  })

  it('una cuenta registrada puede iniciar sesión, solo con su rol', () => {
    const storage = storageFalso()
    registrarCuenta({ ...datosOk, role: 'administrador' }, storage)
    const cuentas = obtenerCuentas(storage)
    expect(autenticar({ email: 'luc@correo.cl', password: 'Clave1234', role: 'administrador' }, cuentas).ok).toBeTrue()
    expect(autenticar({ email: 'luc@correo.cl', password: 'Clave1234', role: 'recepcionista' }, cuentas).ok).toBeFalse()
  })

  it('obtenerCuentas ignora datos corruptos del storage y mantiene las cuentas demo', () => {
    expect(obtenerCuentas(storageFalso('{esto no es json')).length).toBe(2)
  })

  it('registrarCuenta informa el error si el storage falla (por ejemplo, está lleno)', () => {
    const storage = storageFalso()
    storage.setItem.and.throwError('QuotaExceededError')
    const resultado = registrarCuenta({ ...datosOk, role: 'administrador' }, storage)
    expect(resultado.ok).toBeFalse()
    expect(resultado.error).toContain('No se pudo guardar')
  })
})
