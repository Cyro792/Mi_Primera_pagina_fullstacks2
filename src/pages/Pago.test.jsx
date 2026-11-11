import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Pago from './Pago.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'

const ITEMS = [
  { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, categoriaId: 1, cantidad: 1 },
  { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 30, categoriaId: 3, cantidad: 2 },
]
const TARJETA_GUARDADA = { id: 1, marca: 'MASTERCARD', ultimos4: '4444', titular: 'ANA GARCÍA', mes: 8, anio: 2034, predeterminada: true }

const opciones = (extra = {}) => ({
  ruta: '/pago',
  path: '/pago',
  sesion: USUARIOS.cliente,
  carrito: ITEMS,
  otrasRutas: { '/carrito': <p>Página del carrito</p> },
  ...extra,
})

const conTarjetaGuardada = () => localStorage.setItem('sanmarcos_tarjetas', JSON.stringify({ [USUARIOS.cliente.email]: [TARJETA_GUARDADA] }))
const leer = (clave) => JSON.parse(localStorage.getItem(clave))

function escribirTarjeta({ numero, titular = 'Ana García', vencimiento = '12/35', cvv = '123' }) {
  fireEvent.change(screen.getByLabelText('Número de la tarjeta'), { target: { value: numero } })
  fireEvent.change(screen.getByLabelText('Nombre del titular'), { target: { value: titular } })
  fireEvent.change(screen.getByLabelText('Vencimiento (MM/AA)'), { target: { value: vencimiento } })
  fireEvent.change(screen.getByLabelText('Código de seguridad (CVV)'), { target: { value: cvv } })
}
const pagar = () => fireEvent.click(screen.getByRole('button', { name: /^Pagar/ }))

describe('Pago (pago con tarjeta)', () => {
  it('con el carrito vacío vuelve al carrito', () => {
    renderConApp(<Pago />, opciones({ carrito: [] }))
    expect(screen.getByText('Página del carrito')).toBeInTheDocument()
  })

  it('muestra el pedido y el total a pagar', async () => {
    renderConApp(<Pago />, opciones())
    expect(screen.getByTestId('total-pago')).toHaveTextContent('50.980')
    expect(await screen.findByLabelText('Número de la tarjeta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pagar \$?\s?50\.980/ })).toBeInTheDocument()
  })

  it('da formato al número mientras se escribe y reconoce la marca', async () => {
    renderConApp(<Pago />, opciones())
    const numero = await screen.findByLabelText('Número de la tarjeta')
    fireEvent.change(numero, { target: { value: '5555555555554444' } })
    expect(numero).toHaveValue('5555 5555 5555 4444')
    fireEvent.change(screen.getByLabelText('Vencimiento (MM/AA)'), { target: { value: '0835' } })
    expect(screen.getByLabelText('Vencimiento (MM/AA)')).toHaveValue('08/35')
  })

  it('sin datos válidos muestra los errores y no cobra', async () => {
    renderConApp(<Pago />, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    pagar()
    expect(screen.getByText('Ingresa el número de la tarjeta.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el nombre como aparece en la tarjeta.')).toBeInTheDocument()
    expect(screen.getByText('Usa el formato MM/AA.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el código de seguridad.')).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_boletas')).toBeNull()
  })

  it('paga con una tarjeta nueva, crea la boleta, vacía el carrito y guarda solo datos seguros', async () => {
    renderConApp(<Pago />, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    escribirTarjeta({ numero: '4111111111111111' })
    expect(screen.getByLabelText('Guardar esta tarjeta en mi cuenta')).toBeChecked()
    pagar()

    expect(await screen.findByRole('heading', { name: '¡Gracias por tu compra!' })).toBeInTheDocument()
    expect(screen.getByText(/Pagado con Visa •••• 1111/)).toBeInTheDocument()

    const [boleta] = leer('sanmarcos_boletas')
    expect(boleta).toMatchObject({ total: 50980, medioPago: { marca: 'VISA', ultimos4: '1111' } })
    await waitFor(() => expect(leer('sanmarcos_carrito')).toEqual([]))

    const guardadas = leer('sanmarcos_tarjetas')[USUARIOS.cliente.email]
    expect(guardadas).toEqual([expect.objectContaining({ marca: 'VISA', ultimos4: '1111', predeterminada: true })])
    const todo = JSON.stringify(localStorage)
    expect(todo).not.toContain('4111111111111111')
    expect(todo).not.toContain('"cvv"')
  })

  it('si el banco rechaza la tarjeta avisa, no crea la boleta y conserva el carrito', async () => {
    renderConApp(<Pago />, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    escribirTarjeta({ numero: '4000000000000002' })
    pagar()

    expect(await screen.findByText(/El banco rechazó la tarjeta/)).toBeInTheDocument()
    expect(localStorage.getItem('sanmarcos_boletas')).toBeNull()
    expect(leer('sanmarcos_carrito')).toHaveLength(2)
    // El código de seguridad se borra después del intento.
    expect(screen.getByLabelText('Código de seguridad (CVV)')).toHaveValue('')
  })

  it('con una tarjeta guardada la elige por defecto y solo pide el código de seguridad', async () => {
    conTarjetaGuardada()
    renderConApp(<Pago />, opciones())
    expect(await screen.findByRole('radio', { name: /Mastercard •••• 4444/ })).toBeChecked()
    expect(screen.queryByLabelText('Número de la tarjeta')).not.toBeInTheDocument()

    pagar()
    expect(screen.getByText('Ingresa el código de seguridad.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Código de seguridad (CVV)'), { target: { value: '456' } })
    pagar()
    expect(await screen.findByRole('heading', { name: '¡Gracias por tu compra!' })).toBeInTheDocument()
    expect(leer('sanmarcos_boletas')[0].medioPago).toMatchObject({ marca: 'MASTERCARD', ultimos4: '4444' })
  })

  it('se puede cambiar a "Usar otra tarjeta"', async () => {
    conTarjetaGuardada()
    renderConApp(<Pago />, opciones())
    fireEvent.click(await screen.findByRole('radio', { name: 'Usar otra tarjeta' }))
    expect(await screen.findByLabelText('Número de la tarjeta')).toBeInTheDocument()
    expect(screen.getByLabelText('Guardar esta tarjeta en mi cuenta')).not.toBeChecked()
  })

  it('una tarjeta guardada vencida no se puede elegir', async () => {
    localStorage.setItem('sanmarcos_tarjetas', JSON.stringify({ [USUARIOS.cliente.email]: [{ ...TARJETA_GUARDADA, anio: 2020 }] }))
    renderConApp(<Pago />, opciones())
    expect(await screen.findByRole('radio', { name: /Mastercard •••• 4444/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Usar otra tarjeta' })).toBeChecked()
  })
})
