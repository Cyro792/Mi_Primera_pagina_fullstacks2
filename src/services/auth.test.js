import { describe, expect, it } from 'vitest'
import { hayToken } from './api.js'
import {
  cambiarPassword,
  destinoTrasLogin,
  haySesionGuardada,
  login,
  logout,
  recuperarSesion,
  registrar,
  rutaInicialDe,
  usuarioDesdeApi,
  validarCambioPassword,
  validarLogin,
  validarRegistro,
} from './auth.js'
import { apiFalsa } from '../test/apiFalsa.js'

describe('auth.js: validaciones del formulario', () => {
  it('validarLogin pide correo y contraseña', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({ email: 'Ingresa tu correo.', password: 'Ingresa tu contraseña.' })
  })

  it('validarLogin revisa formato de correo y largo mínimo de contraseña', () => {
    const errores = validarLogin({ email: 'mal-correo', password: '123' })
    expect(errores.email).toContain('formato')
    expect(errores.password).toContain('8 caracteres')
  })

  it('validarRegistro revisa nombre, correo, largo y confirmación de la contraseña', () => {
    const errores = validarRegistro({ nombre: 'Al', email: 'x', password: '123', confirmar: '1234' })
    expect(Object.keys(errores)).toEqual(['nombre', 'email', 'password', 'confirmar'])
    expect(validarRegistro({ nombre: 'Luc Pérez', email: 'luc@correo.cl', password: 'Clave1234', confirmar: 'Clave1234' })).toEqual({})
  })

  it('validarCambioPassword exige la actual, 8 caracteres, que sea distinta y que coincida', () => {
    expect(validarCambioPassword({ actual: '', nueva: '123', confirmar: '' })).toEqual({
      actual: 'Ingresa tu contraseña actual.',
      nueva: 'La nueva contraseña debe tener al menos 8 caracteres.',
      confirmar: 'Las contraseñas no coinciden.',
    })
    expect(validarCambioPassword({ actual: 'Clave1234', nueva: 'Clave1234', confirmar: 'Clave1234' }).nueva).toContain('distinta')
  })

  it('destinoTrasLogin vuelve a la página anterior solo si el rol puede verla', () => {
    expect(destinoTrasLogin('CLIENTE', '/carrito')).toBe('/carrito')
    expect(destinoTrasLogin('CLIENTE', '/mi-cuenta')).toBe('/mi-cuenta')
    expect(destinoTrasLogin('ADMIN', '/mi-cuenta')).toBe('/admin')
    expect(destinoTrasLogin('RECEPCIONISTA', '/admin')).toBe('/recepcion')
    expect(destinoTrasLogin('ADMIN', '/recepcion')).toBe('/recepcion')
    expect(destinoTrasLogin('CLIENTE', undefined)).toBe('/tienda')
  })

  it('rutaInicialDe envía a cada rol a su página', () => {
    expect(rutaInicialDe('ADMIN')).toBe('/admin')
    expect(rutaInicialDe('RECEPCIONISTA')).toBe('/recepcion')
    expect(rutaInicialDe('CLIENTE')).toBe('/tienda')
  })
})

describe('auth.js: sesión con la API (JWT)', () => {
  it('login entrega el usuario con el rol de su cuenta y guarda el token solo en memoria', async () => {
    const usuario = await login({ email: ' Admin@sanmarcos.cl ', password: 'Admin123!' })
    expect(usuario).toMatchObject({ id: 1, nombre: 'Administrador General', rol: 'ADMIN' })
    expect(usuario).not.toHaveProperty('password')
    expect(hayToken()).toBe(true)
    // En el navegador solo queda la marca de "sesión abierta", nunca el token.
    expect(haySesionGuardada()).toBe(true)
    expect(JSON.stringify(localStorage)).not.toContain('token')
  })

  it('login con credenciales incorrectas lanza el error de la API', async () => {
    await expect(login({ email: 'admin@sanmarcos.cl', password: 'Incorrecta1' })).rejects.toMatchObject({
      status: 401,
      message: 'Correo o contraseña incorrectos.',
    })
    expect(haySesionGuardada()).toBe(false)
  })

  it('registrar crea una cuenta de CLIENTE e inicia la sesión', async () => {
    const nuevo = await registrar({ nombre: ' Luc Pérez ', email: 'LUC@correo.cl', password: 'Clave1234' })
    expect(nuevo).toMatchObject({ nombre: 'Luc Pérez', email: 'luc@correo.cl', rol: 'CLIENTE' })
    expect(apiFalsa().llamadasA('POST', '/auth/registro')[0].cuerpo).not.toHaveProperty('rol')
  })

  it('registrar con un correo ya usado lanza 409 con el error en el campo email', async () => {
    await expect(registrar({ nombre: 'Otra Ana', email: 'ana.garcia@correo.cl', password: 'Clave1234' })).rejects.toMatchObject({
      status: 409,
      errores: { email: 'Ya existe una cuenta con ese correo.' },
    })
  })

  it('recuperarSesion usa la cookie de renovación (lo que pasa al recargar la página)', async () => {
    apiFalsa().iniciarSesionCon('recepcion@sanmarcos.cl')
    expect(await recuperarSesion()).toMatchObject({ email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA' })
  })

  it('sin cookie válida, recuperarSesion falla y borra la marca de sesión', async () => {
    localStorage.setItem('sanmarcos_sesion_abierta', '1')
    await expect(recuperarSesion()).rejects.toMatchObject({ status: 401 })
    expect(haySesionGuardada()).toBe(false)
  })

  it('logout avisa al servidor, olvida el token y borra la marca de sesión', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    await logout()
    expect(apiFalsa().llamadasA('POST', '/auth/logout')).toHaveLength(1)
    expect(hayToken()).toBe(false)
    expect(haySesionGuardada()).toBe(false)
    expect(apiFalsa().estado.cookie).toBeNull()
  })

  it('cambiarPassword envía la actual y la nueva; si la actual no es correcta, el error viene en ese campo', async () => {
    await login({ email: 'ana.garcia@correo.cl', password: 'Cliente123!' })
    await expect(cambiarPassword({ actual: 'Otra12345', nueva: 'Nueva12345' })).rejects.toMatchObject({
      errores: { actual: 'La contraseña actual no es correcta.' },
    })
    await cambiarPassword({ actual: 'Cliente123!', nueva: 'Nueva12345' })
    await expect(login({ email: 'ana.garcia@correo.cl', password: 'Nueva12345' })).resolves.toMatchObject({ rol: 'CLIENTE' })
  })

  it('usuarioDesdeApi arma el avatar y deja vacíos los datos que faltan', () => {
    const usuario = usuarioDesdeApi({ id: 7, nombre: 'Luc', email: 'l@c.cl', rol: 'CLIENTE', telefono: null, avatarIcono: '🐱', avatarColor: null })
    expect(usuario).toMatchObject({ telefono: '', region: '', avatar: { icono: '🐱', color: '#2A6049' } })
  })
})
