import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import MiCuenta from './MiCuenta.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { autenticar } from '../services/auth.js'

const EMAIL = USUARIOS.cliente.email
const opciones = (seccion) => ({ ruta: seccion ? `/mi-cuenta?seccion=${seccion}` : '/mi-cuenta', path: '/mi-cuenta', sesion: USUARIOS.cliente })
const leer = (clave) => JSON.parse(localStorage.getItem(clave))
const cambiar = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

describe('MiCuenta: perfil', () => {
  it('saluda al cliente y abre la sección Perfil por defecto', () => {
    renderConApp(<MiCuenta />, opciones())
    expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Perfil/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana García')
    expect(screen.getByLabelText('Correo')).toBeDisabled()
  })

  it('personaliza avatar, color y datos, y la sesión se actualiza al guardar', async () => {
    renderConApp(<MiCuenta />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Ícono gato' }))
    fireEvent.click(screen.getByRole('button', { name: 'Color morado' }))
    expect(screen.getByRole('button', { name: 'Ícono gato' })).toHaveAttribute('aria-pressed', 'true')

    cambiar('Nombre completo', 'Ana María García')
    cambiar('Teléfono celular', '+56 9 8765 4321')
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Maule' } })
    cambiar('Comuna', 'Talca')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Cambios guardados')).toBeInTheDocument()
    expect(leer('sanmarcos_sesion')).toMatchObject({ nombre: 'Ana María García', avatar: { icono: '🐱', color: '#8E44AD' } })
    expect(leer('sanmarcos_perfiles')[EMAIL]).toMatchObject({ telefono: '+56 9 8765 4321', region: 'Maule', comuna: 'Talca' })
    expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
  })

  it('no guarda si el teléfono no es válido', () => {
    renderConApp(<MiCuenta />, opciones())
    cambiar('Teléfono celular', '123')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText(/Ingresa un celular válido/)).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_perfiles')).toBeNull()
  })

  it('el menú cambia de sección', async () => {
    renderConApp(<MiCuenta />, opciones())
    fireEvent.click(screen.getByRole('button', { name: /Seguridad/ }))
    expect(await screen.findByRole('form', { name: 'Cambiar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mis compras/ })).toHaveAttribute('href', '/mis-compras')
  })
})

describe('MiCuenta: tarjetas guardadas', () => {
  const guardadas = [
    { id: 1, marca: 'VISA', ultimos4: '1111', titular: 'ANA GARCÍA', mes: 12, anio: 2035, predeterminada: true },
    { id: 2, marca: 'MASTERCARD', ultimos4: '4444', titular: 'ANA GARCÍA', mes: 8, anio: 2034, predeterminada: false },
  ]
  const conTarjetas = () => localStorage.setItem('sanmarcos_tarjetas', JSON.stringify({ [EMAIL]: guardadas }))

  it('lista las tarjetas con la predeterminada primero', async () => {
    conTarjetas()
    renderConApp(<MiCuenta />, opciones('tarjetas'))
    const lista = await screen.findByRole('list', { name: 'Tus tarjetas' })
    const items = within(lista).getAllByRole('listitem')
    expect(items[0]).toHaveAccessibleName('Visa •••• 1111')
    expect(within(items[0]).getByText('★ Predeterminada')).toBeInTheDocument()
  })

  it('agrega una tarjeta sin pedir el CVV y la muestra en la lista', async () => {
    renderConApp(<MiCuenta />, opciones('tarjetas'))
    expect(await screen.findByText('Aún no tienes tarjetas guardadas.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar tarjeta' }))
    expect(screen.queryByLabelText('Código de seguridad (CVV)')).not.toBeInTheDocument()

    cambiar('Número de la tarjeta', '378282246310005')
    cambiar('Nombre del titular', 'Ana García')
    cambiar('Vencimiento (MM/AA)', '0333')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarjeta' }))

    expect(await screen.findByText('American Express •••• 0005 guardada')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'American Express •••• 0005' })).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_tarjetas')).not.toContain('378282246310005')
  })

  it('valida la tarjeta antes de guardarla', async () => {
    renderConApp(<MiCuenta />, opciones('tarjetas'))
    fireEvent.click(await screen.findByRole('button', { name: '+ Agregar tarjeta' }))
    cambiar('Número de la tarjeta', '4111111111111112')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarjeta' }))
    expect(screen.getByText(/El número de la tarjeta no es válido/)).toBeInTheDocument()
  })

  it('cambia la tarjeta predeterminada', async () => {
    conTarjetas()
    renderConApp(<MiCuenta />, opciones('tarjetas'))
    fireEvent.click(await screen.findByRole('button', { name: 'Usar como predeterminada' }))
    expect(await screen.findByText('Mastercard •••• 4444 es ahora tu tarjeta predeterminada')).toBeInTheDocument()
    expect(leer('sanmarcos_tarjetas')[EMAIL].find((t) => t.id === 2).predeterminada).toBe(true)
  })

  it('elimina una tarjeta solo si el cliente confirma', async () => {
    conTarjetas()
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    renderConApp(<MiCuenta />, opciones('tarjetas'))
    const boton = await screen.findByRole('button', { name: 'Eliminar Mastercard •••• 4444' })

    fireEvent.click(boton)
    expect(leer('sanmarcos_tarjetas')[EMAIL]).toHaveLength(2)

    fireEvent.click(boton)
    await waitFor(() => expect(leer('sanmarcos_tarjetas')[EMAIL]).toHaveLength(1))
    expect(confirmar).toHaveBeenCalledTimes(2)
  })
})

describe('MiCuenta: seguridad', () => {
  it('rechaza el cambio si la contraseña actual no es correcta', () => {
    renderConApp(<MiCuenta />, opciones('seguridad'))
    cambiar('Contraseña actual', 'Equivocada1')
    cambiar('Nueva contraseña', 'NuevaClave1')
    cambiar('Repite la nueva contraseña', 'NuevaClave1')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByText('La contraseña actual no es correcta.')).toBeInTheDocument()
  })

  it('cambia la contraseña y desde entonces solo sirve la nueva', async () => {
    renderConApp(<MiCuenta />, opciones('seguridad'))
    cambiar('Contraseña actual', 'Cliente123!')
    cambiar('Nueva contraseña', 'NuevaClave1')
    cambiar('Repite la nueva contraseña', 'NuevaClave1')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('')
    expect(autenticar({ email: EMAIL, password: 'NuevaClave1' }).ok).toBe(true)
    expect(autenticar({ email: EMAIL, password: 'Cliente123!' }).ok).toBe(false)
  })
})
