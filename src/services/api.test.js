import { describe, expect, it, vi } from 'vitest'
import { alExpirarSesion, api, ApiError, consulta, guardarToken, hayToken, renovarSesion } from './api.js'
import { apiFalsa } from '../test/apiFalsa.js'

describe('api.js (cliente HTTP con JWT)', () => {
  it('pide a /api/v1 y devuelve el JSON de la respuesta', async () => {
    const categorias = await api('/categorias')
    expect(categorias).toHaveLength(4)
    expect(apiFalsa().fetch).toHaveBeenCalledWith('/api/v1/categorias', expect.objectContaining({ method: 'GET', credentials: 'include' }))
  })

  it('envía el token de acceso en la cabecera Authorization: Bearer', async () => {
    guardarToken('token-1')
    await api('/usuarios')
    expect(apiFalsa().peticiones.at(-1).cabeceras.Authorization).toBe('Bearer token-1')
  })

  it('sin token no envía la cabecera Authorization', async () => {
    await api('/categorias')
    expect(apiFalsa().peticiones.at(-1).cabeceras.Authorization).toBeUndefined()
  })

  it('envía el cuerpo como JSON', async () => {
    await api('/auth/login', { metodo: 'POST', cuerpo: { email: 'admin@sanmarcos.cl', password: 'Admin123!' } })
    const [peticion] = apiFalsa().llamadasA('POST', '/auth/login')
    expect(peticion.cabeceras['Content-Type']).toBe('application/json')
    expect(peticion.cuerpo).toEqual({ email: 'admin@sanmarcos.cl', password: 'Admin123!' })
  })

  it('un error de la API se convierte en ApiError con el código, el mensaje y los errores por campo', async () => {
    apiFalsa().fallar('POST', '/usuarios', 400, 'Revisa los datos enviados.', { email: 'Ingresa un correo válido.' })
    const error = await api('/usuarios', { metodo: 'POST', cuerpo: {} }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('Revisa los datos enviados.')
    expect(error.errores).toEqual({ email: 'Ingresa un correo válido.' })
  })

  it('sin conexión con el servidor lanza un ApiError con status 0 y un mensaje claro', async () => {
    apiFalsa().fallar('GET', '/categorias', 0)
    await expect(api('/categorias')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('No pudimos conectar') })
  })

  it('con completa: true entrega también el código HTTP (por ejemplo 201 o 200)', async () => {
    const { status, datos } = await api('/auth/login', { metodo: 'POST', cuerpo: { email: 'admin@sanmarcos.cl', password: 'Admin123!' }, completa: true })
    expect(status).toBe(200)
    expect(datos.usuario.rol).toBe('ADMIN')
  })

  it('si el token de acceso venció, renueva la sesión con la cookie y repite la petición', async () => {
    apiFalsa().iniciarSesionCon('admin@sanmarcos.cl')
    guardarToken('token-vencido')
    const usuarios = await api('/usuarios')
    expect(usuarios.length).toBeGreaterThan(0)
    expect(apiFalsa().llamadasA('POST', '/auth/refresh')).toHaveLength(1)
    expect(apiFalsa().llamadasA('GET', '/usuarios').map((p) => p.cabeceras.Authorization)).toEqual(['Bearer token-vencido', 'Bearer token-1'])
  })

  it('si la sesión ya no se puede renovar, avisa para cerrarla en pantalla', async () => {
    const alPerder = vi.fn()
    alExpirarSesion(alPerder)
    guardarToken('token-vencido')
    await expect(api('/usuarios')).rejects.toMatchObject({ status: 401 })
    expect(alPerder).toHaveBeenCalled()
    expect(hayToken()).toBe(false)
    alExpirarSesion(() => {})
  })

  it('varias renovaciones simultáneas se juntan en una sola (cada cookie sirve una vez)', async () => {
    apiFalsa().iniciarSesionCon('ana.garcia@correo.cl')
    const [a, b] = await Promise.all([renovarSesion(), renovarSesion()])
    expect(a.accessToken).toBe('token-3')
    expect(b).toBe(a)
    expect(apiFalsa().llamadasA('POST', '/auth/refresh')).toHaveLength(1)
  })

  it('consulta arma los parámetros de la URL y omite los vacíos', () => {
    expect(consulta({ categoriaId: 2, tipo: undefined, texto: '' })).toBe('?categoriaId=2')
    expect(consulta({})).toBe('')
  })
})
