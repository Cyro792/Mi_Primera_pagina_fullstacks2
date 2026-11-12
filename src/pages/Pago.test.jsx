import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Pago from './Pago.jsx'
import RutaProtegida from '../components/RutaProtegida.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { apiFalsa } from '../test/apiFalsa.js'

const ITEMS = [
  { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, categoriaId: 1, cantidad: 1 },
  { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 30, categoriaId: 3, cantidad: 2 },
]
const TARJETA_GUARDADA = { marca: 'MASTERCARD', ultimos4: '4444', titular: 'ANA GARCÍA', mes: 8, anio: 2034, predeterminada: true }

// Igual que en la aplicación: el pago está protegido y solo entra un CLIENTE con sesión.
const pagina = <RutaProtegida roles={['CLIENTE']}><Pago /></RutaProtegida>
const opciones = (extra = {}) => ({
  ruta: '/pago',
  path: '/pago',
  sesion: USUARIOS.cliente,
  carrito: ITEMS,
  otrasRutas: { '/carrito': <p>Página del carrito</p> },
  ...extra,
})

const conTarjetaGuardada = (datos = {}) => apiFalsa().agregarTarjeta(USUARIOS.cliente.email, { ...TARJETA_GUARDADA, ...datos })
const leer = (clave) => JSON.parse(localStorage.getItem(clave))

function escribirTarjeta({ numero, titular = 'Ana García', vencimiento = '12/35', cvv = '123' }) {
  fireEvent.change(screen.getByLabelText('Número de la tarjeta'), { target: { value: numero } })
  fireEvent.change(screen.getByLabelText('Nombre del titular'), { target: { value: titular } })
  fireEvent.change(screen.getByLabelText('Vencimiento (MM/AA)'), { target: { value: vencimiento } })
  fireEvent.change(screen.getByLabelText('Código de seguridad (CVV)'), { target: { value: cvv } })
}
const pagar = () => fireEvent.click(screen.getByRole('button', { name: /^Pagar/ }))

describe('Pago (pago con tarjeta contra la API)', () => {
  it('con el carrito vacío vuelve al carrito', async () => {
    renderConApp(pagina, opciones({ carrito: [] }))
    expect(await screen.findByText('Página del carrito')).toBeInTheDocument()
  })

  it('muestra el pedido y el total a pagar', async () => {
    renderConApp(pagina, opciones())
    expect(await screen.findByLabelText('Número de la tarjeta')).toBeInTheDocument()
    expect(screen.getByTestId('total-pago')).toHaveTextContent('50.980')
    expect(screen.getByRole('button', { name: /Pagar \$?\s?50\.980/ })).toBeInTheDocument()
  })

  it('da formato al número mientras se escribe y reconoce la marca', async () => {
    renderConApp(pagina, opciones())
    const numero = await screen.findByLabelText('Número de la tarjeta')
    fireEvent.change(numero, { target: { value: '5555555555554444' } })
    expect(numero).toHaveValue('5555 5555 5555 4444')
    fireEvent.change(screen.getByLabelText('Vencimiento (MM/AA)'), { target: { value: '0835' } })
    expect(screen.getByLabelText('Vencimiento (MM/AA)')).toHaveValue('08/35')
  })

  it('sin datos válidos muestra los errores y no llama a la API', async () => {
    renderConApp(pagina, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    pagar()
    expect(screen.getByText('Ingresa el número de la tarjeta.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el nombre como aparece en la tarjeta.')).toBeInTheDocument()
    expect(screen.getByText('Usa el formato MM/AA.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el código de seguridad.')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/boletas')).toHaveLength(0)
  })

  it('paga con una tarjeta nueva: el servidor crea la boleta, guarda la tarjeta y se vacía el carrito', async () => {
    renderConApp(pagina, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    escribirTarjeta({ numero: '4111111111111111' })
    expect(screen.getByLabelText('Guardar esta tarjeta en mi cuenta')).toBeChecked()
    pagar()

    expect(await screen.findByRole('heading', { name: '¡Gracias por tu compra!' })).toBeInTheDocument()
    expect(screen.getByText(/Pagado con Visa •••• 1111/)).toBeInTheDocument()

    const [peticion] = apiFalsa().llamadasA('POST', '/boletas')
    expect(peticion.cuerpo.items).toEqual([{ productoId: 1, cantidad: 1 }, { productoId: 9, cantidad: 2 }])
    expect(peticion.cuerpo.pago.guardarTarjeta).toBe(true)
    expect(apiFalsa().estado.boletas[0]).toMatchObject({ total: 50980, medioPago: { marca: 'VISA', ultimos4: '1111' } })
    expect(apiFalsa().estado.tarjetas).toEqual([expect.objectContaining({ marca: 'VISA', ultimos4: '1111', predeterminada: true })])
    await waitFor(() => expect(leer('sanmarcos_carrito')).toEqual([]))
    // En el navegador no queda nada de la tarjeta.
    expect(JSON.stringify(localStorage)).not.toContain('4111')
  })

  it('si el banco rechaza la tarjeta (402) avisa, no crea la boleta y conserva el carrito', async () => {
    renderConApp(pagina, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    escribirTarjeta({ numero: '4000000000000002' })
    pagar()

    expect(await screen.findByText(/El banco rechazó la tarjeta/)).toBeInTheDocument()
    expect(apiFalsa().estado.boletas).toEqual([])
    expect(leer('sanmarcos_carrito')).toHaveLength(2)
    // El código de seguridad se borra después del intento.
    expect(screen.getByLabelText('Código de seguridad (CVV)')).toHaveValue('')
  })

  it('si ya no queda stock suficiente muestra el mensaje del servidor', async () => {
    apiFalsa().estado.productos.find((p) => p.id === 9).stock = 1
    renderConApp(pagina, opciones())
    await screen.findByLabelText('Número de la tarjeta')
    escribirTarjeta({ numero: '4111111111111111' })
    pagar()
    expect(await screen.findByText(/Stock insuficiente de "Collar antipulgas"/)).toBeInTheDocument()
  })

  it('con una tarjeta guardada la elige por defecto y solo pide el código de seguridad', async () => {
    const guardada = conTarjetaGuardada()
    renderConApp(pagina, opciones())
    expect(await screen.findByRole('radio', { name: /Mastercard •••• 4444/ })).toBeChecked()
    expect(screen.queryByLabelText('Número de la tarjeta')).not.toBeInTheDocument()

    pagar()
    expect(screen.getByText('Ingresa el código de seguridad.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Código de seguridad (CVV)'), { target: { value: '456' } })
    pagar()
    expect(await screen.findByRole('heading', { name: '¡Gracias por tu compra!' })).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/boletas')[0].cuerpo.pago).toEqual({ tarjetaGuardadaId: guardada.id, cvv: '456' })
  })

  it('se puede cambiar a "Usar otra tarjeta"', async () => {
    conTarjetaGuardada()
    renderConApp(pagina, opciones())
    fireEvent.click(await screen.findByRole('radio', { name: 'Usar otra tarjeta' }))
    expect(await screen.findByLabelText('Número de la tarjeta')).toBeInTheDocument()
    expect(screen.getByLabelText('Guardar esta tarjeta en mi cuenta')).not.toBeChecked()
  })

  it('una tarjeta guardada vencida no se puede elegir', async () => {
    conTarjetaGuardada({ anio: 2020, vencida: true })
    renderConApp(pagina, opciones())
    expect(await screen.findByRole('radio', { name: /Mastercard •••• 4444/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Usar otra tarjeta' })).toBeChecked()
  })
})
