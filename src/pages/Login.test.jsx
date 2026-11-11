import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import Login from './Login.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'

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

describe('Login (inicio de sesión y registro)', () => {
  it('valida los campos antes de intentar entrar', () => {
    renderConApp(<Login />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
  })

  it('muestra un error con credenciales incorrectas y no guarda sesión', () => {
    renderConApp(<Login />, opciones())
    iniciarSesion('admin@sanmarcos.cl', 'Equivocada1')
    expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_sesion')).toBeNull()
  })

  it.each([
    ['admin@sanmarcos.cl', 'Admin123!', 'Página de administración'],
    ['recepcion@sanmarcos.cl', 'Recep123!', 'Página de recepción'],
    ['ana.garcia@correo.cl', 'Cliente123!', 'Página de la tienda'],
  ])('%s entra y es enviado a la página de su rol', (email, password, destino) => {
    renderConApp(<Login />, opciones())
    iniciarSesion(email, password)
    expect(screen.getByText(destino)).toBeInTheDocument()
  })

  it('guarda la sesión para que sobreviva a una recarga de la página', () => {
    renderConApp(<Login />, opciones())
    iniciarSesion('ana.garcia@correo.cl', 'Cliente123!')
    expect(JSON.parse(localStorage.getItem('sanmarcos_sesion'))).toMatchObject(USUARIOS.cliente)
  })

  it('vuelve a la página desde la que se pidió iniciar sesión (por ejemplo, el carrito)', () => {
    renderConApp(<Login />, opciones({ estado: { desde: '/carrito' } }))
    iniciarSesion('ana.garcia@correo.cl', 'Cliente123!')
    expect(screen.getByText('Página del carrito')).toBeInTheDocument()
  })

  it('si ya hay sesión iniciada no muestra el formulario y redirige', () => {
    renderConApp(<Login />, opciones({ sesion: USUARIOS.admin }))
    expect(screen.getByText('Página de administración')).toBeInTheDocument()
  })

  it('el registro crea una cuenta de cliente con la que después se puede entrar', () => {
    renderConApp(<Login />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Crear una cuenta' }))
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Luc Pérez' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'luc@correo.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Clave1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByRole('status')).toHaveTextContent('¡Cuenta creada!')
    iniciarSesion('luc@correo.cl', 'Clave1234')
    expect(screen.getByText('Página de la tienda')).toBeInTheDocument()
  })
})
