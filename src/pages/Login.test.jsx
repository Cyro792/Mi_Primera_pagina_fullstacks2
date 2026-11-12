import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import Login from './Login.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { apiFalsa } from '../test/apiFalsa.js'

const destinos = {
  '/admin': <p>Página de administración</p>,
  '/recepcion': <p>Página de recepción</p>,
  '/tienda': <p>Página de la tienda</p>,
  '/carrito': <p>Página del carrito</p>,
}
const opciones = (extra = {}) => ({ ruta: '/login', path: '/login', otrasRutas: destinos, ...extra })

function iniciarSesion(email, password) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('Login (inicio de sesión y registro con la API)', () => {
  it('valida los campos antes de llamar a la API', () => {
    renderConApp(<Login />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
    expect(apiFalsa().peticiones).toHaveLength(0)
  })

  it('muestra el error que envía la API con credenciales incorrectas y no abre sesión', async () => {
    renderConApp(<Login />, opciones())
    iniciarSesion('admin@sanmarcos.cl', 'Equivocada1')
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_sesion_abierta')).toBeNull()
  })

  it('avisa si no hay conexión con el servidor', async () => {
    apiFalsa().fallar('POST', '/auth/login', 0)
    renderConApp(<Login />, opciones())
    iniciarSesion('admin@sanmarcos.cl', 'Admin123!')
    expect(await screen.findByText(/No pudimos conectar con el servidor/)).toBeInTheDocument()
  })

  it.each([
    ['admin@sanmarcos.cl', 'Admin123!', 'Página de administración'],
    ['recepcion@sanmarcos.cl', 'Recep123!', 'Página de recepción'],
    ['ana.garcia@correo.cl', 'Cliente123!', 'Página de la tienda'],
  ])('%s entra y es enviado a la página de su rol', async (email, password, destino) => {
    renderConApp(<Login />, opciones())
    iniciarSesion(email, password)
    expect(await screen.findByText(destino)).toBeInTheDocument()
  })

  it('mientras espera la respuesta desactiva el botón', async () => {
    renderConApp(<Login />, opciones())
    iniciarSesion('ana.garcia@correo.cl', 'Cliente123!')
    expect(screen.getByRole('button', { name: 'Un momento…' })).toBeDisabled()
    expect(await screen.findByText('Página de la tienda')).toBeInTheDocument()
  })

  it('el token no se guarda en el navegador: solo una marca de que hay sesión abierta', async () => {
    renderConApp(<Login />, opciones())
    iniciarSesion('ana.garcia@correo.cl', 'Cliente123!')
    await screen.findByText('Página de la tienda')
    expect(localStorage.getItem('sanmarcos_sesion_abierta')).toBe('1')
    expect(JSON.stringify(localStorage)).not.toContain('token')
  })

  it('vuelve a la página desde la que se pidió iniciar sesión (por ejemplo, el carrito)', async () => {
    renderConApp(<Login />, opciones({ estado: { desde: '/carrito' } }))
    iniciarSesion('ana.garcia@correo.cl', 'Cliente123!')
    expect(await screen.findByText('Página del carrito')).toBeInTheDocument()
  })

  it('si ya hay sesión (por ejemplo, al recargar) la recupera y redirige sin mostrar el formulario', async () => {
    renderConApp(<Login />, opciones({ sesion: USUARIOS.admin }))
    expect(screen.getByRole('status')).toHaveTextContent('Recuperando tu sesión')
    expect(await screen.findByText('Página de administración')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/auth/refresh')).toHaveLength(1)
  })

  it('el registro crea una cuenta de cliente y deja la sesión iniciada', async () => {
    renderConApp(<Login />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Crear una cuenta' }))
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Luc Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'luc@correo.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Página de la tienda')).toBeInTheDocument()
    expect(apiFalsa().estado.usuarios.at(-1)).toMatchObject({ email: 'luc@correo.cl', rol: 'CLIENTE' })
  })

  it('el registro con un correo ya usado muestra el error de la API en el campo', async () => {
    renderConApp(<Login />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Crear una cuenta' }))
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Otra Ana' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana.garcia@correo.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findAllByText('Ya existe una cuenta con ese correo.')).not.toHaveLength(0)
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
  })
})
