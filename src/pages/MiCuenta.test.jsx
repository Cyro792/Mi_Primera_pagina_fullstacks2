import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import MiCuenta from './MiCuenta.jsx'
import RutaProtegida from '../components/RutaProtegida.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { apiFalsa } from '../test/apiFalsa.js'

const EMAIL = USUARIOS.cliente.email
const pagina = <RutaProtegida roles={['CLIENTE']}><MiCuenta /></RutaProtegida>
const opciones = (seccion) => ({ ruta: seccion ? `/mi-cuenta?seccion=${seccion}` : '/mi-cuenta', path: '/mi-cuenta', sesion: USUARIOS.cliente })
const cambiar = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
const ana = () => apiFalsa().estado.usuarios.find((u) => u.email === EMAIL)

describe('MiCuenta: perfil', () => {
  it('saluda al cliente y abre la sección Perfil con sus datos del servidor', async () => {
    renderConApp(pagina, opciones())
    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Perfil/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana García')
    expect(screen.getByLabelText('Teléfono celular')).toHaveValue('+56 9 8765 4321')
    expect(screen.getByLabelText('Correo')).toBeDisabled()
  })

  it('personaliza avatar, color y datos, los guarda en la API y actualiza la sesión', async () => {
    renderConApp(pagina, opciones())
    fireEvent.click(await screen.findByRole('button', { name: 'Ícono gato' }))
    fireEvent.click(screen.getByRole('button', { name: 'Color morado' }))
    expect(screen.getByRole('button', { name: 'Ícono gato' })).toHaveAttribute('aria-pressed', 'true')

    cambiar('Nombre completo', 'Ana María García')
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Maule' } })
    cambiar('Comuna', 'Talca')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Cambios guardados')).toBeInTheDocument()
    expect(ana()).toMatchObject({ nombre: 'Ana María García', region: 'Maule', comuna: 'Talca', avatarIcono: '🐱', avatarColor: '#8E44AD' })
    expect(screen.getByRole('img', { name: 'Avatar de Ana María García' })).toBeInTheDocument()
  })

  it('no llama a la API si el teléfono no es válido', async () => {
    renderConApp(pagina, opciones())
    await screen.findByLabelText('Teléfono celular')
    cambiar('Teléfono celular', '123')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText(/Ingresa un celular válido/)).toBeInTheDocument()
    expect(apiFalsa().llamadasA('PUT', '/perfil')).toHaveLength(0)
  })

  it('muestra el error del servidor si no se pudo guardar', async () => {
    apiFalsa().fallar('PUT', '/perfil', 400, 'Revisa los datos enviados.', { telefono: 'Ingresa un celular válido, por ejemplo +56 9 1234 5678.' })
    renderConApp(pagina, opciones())
    fireEvent.click(await screen.findByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Revisa los datos enviados.')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono celular')).toHaveClass('is-invalid')
  })

  it('el menú cambia de sección', async () => {
    renderConApp(pagina, opciones())
    fireEvent.click(await screen.findByRole('button', { name: /Seguridad/ }))
    expect(await screen.findByRole('form', { name: 'Cambiar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mis compras/ })).toHaveAttribute('href', '/mis-compras')
  })
})

describe('MiCuenta: tarjetas guardadas', () => {
  const conTarjetas = () => {
    apiFalsa().agregarTarjeta(EMAIL, { marca: 'VISA', ultimos4: '1111', titular: 'ANA GARCÍA', mes: 12, anio: 2035, predeterminada: true })
    return apiFalsa().agregarTarjeta(EMAIL, { marca: 'MASTERCARD', ultimos4: '4444', titular: 'ANA GARCÍA', mes: 8, anio: 2034 })
  }

  it('lista las tarjetas con la predeterminada primero', async () => {
    conTarjetas()
    renderConApp(pagina, opciones('tarjetas'))
    const lista = await screen.findByRole('list', { name: 'Tus tarjetas' })
    const items = await within(lista).findAllByRole('listitem')
    expect(items[0]).toHaveAccessibleName('Visa •••• 1111')
    expect(within(items[0]).getByText('★ Predeterminada')).toBeInTheDocument()
  })

  it('agrega una tarjeta sin pedir el CVV y la muestra en la lista', async () => {
    renderConApp(pagina, opciones('tarjetas'))
    expect(await screen.findByText('Aún no tienes tarjetas guardadas.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar tarjeta' }))
    expect(screen.queryByLabelText('Código de seguridad (CVV)')).not.toBeInTheDocument()

    cambiar('Número de la tarjeta', '378282246310005')
    cambiar('Nombre del titular', 'Ana García')
    cambiar('Vencimiento (MM/AA)', '0333')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarjeta' }))

    expect(await screen.findByText('American Express •••• 0005 guardada')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'American Express •••• 0005' })).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/tarjetas')[0].cuerpo).not.toHaveProperty('cvv')
  })

  it('valida la tarjeta antes de enviarla', async () => {
    renderConApp(pagina, opciones('tarjetas'))
    fireEvent.click(await screen.findByRole('button', { name: '+ Agregar tarjeta' }))
    cambiar('Número de la tarjeta', '4111111111111112')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarjeta' }))
    expect(screen.getByText(/El número de la tarjeta no es válido/)).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/tarjetas')).toHaveLength(0)
  })

  it('cambia la tarjeta predeterminada en el servidor', async () => {
    const mastercard = conTarjetas()
    renderConApp(pagina, opciones('tarjetas'))
    fireEvent.click(await screen.findByRole('button', { name: 'Usar como predeterminada' }))
    expect(await screen.findByText('Mastercard •••• 4444 es ahora tu tarjeta predeterminada')).toBeInTheDocument()
    expect(apiFalsa().estado.tarjetas.find((t) => t.id === mastercard.id).predeterminada).toBe(true)
  })

  it('elimina una tarjeta solo si el cliente confirma', async () => {
    conTarjetas()
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    renderConApp(pagina, opciones('tarjetas'))
    const boton = await screen.findByRole('button', { name: 'Eliminar Mastercard •••• 4444' })

    fireEvent.click(boton)
    expect(apiFalsa().llamadasA('DELETE', expect.anything())).toHaveLength(0)

    fireEvent.click(boton)
    await waitFor(() => expect(apiFalsa().estado.tarjetas).toHaveLength(1))
    expect(confirmar).toHaveBeenCalledTimes(2)
  })
})

describe('MiCuenta: seguridad', () => {
  it('si el servidor dice que la contraseña actual no es correcta, lo muestra en ese campo', async () => {
    renderConApp(pagina, opciones('seguridad'))
    await screen.findByLabelText('Contraseña actual')
    cambiar('Contraseña actual', 'Equivocada1')
    cambiar('Nueva contraseña', 'NuevaClave1')
    cambiar('Repite la nueva contraseña', 'NuevaClave1')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument()
  })

  it('valida en el navegador que las contraseñas coincidan antes de enviarlas', async () => {
    renderConApp(pagina, opciones('seguridad'))
    await screen.findByLabelText('Contraseña actual')
    cambiar('Contraseña actual', 'Cliente123!')
    cambiar('Nueva contraseña', 'NuevaClave1')
    cambiar('Repite la nueva contraseña', 'OtraClave1')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('PUT', '/perfil/password')).toHaveLength(0)
  })

  it('cambia la contraseña en el servidor y limpia el formulario', async () => {
    renderConApp(pagina, opciones('seguridad'))
    await screen.findByLabelText('Contraseña actual')
    cambiar('Contraseña actual', 'Cliente123!')
    cambiar('Nueva contraseña', 'NuevaClave1')
    cambiar('Repite la nueva contraseña', 'NuevaClave1')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText(/Contraseña actualizada/)).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('')
    expect(ana().password).toBe('NuevaClave1')
  })
})
