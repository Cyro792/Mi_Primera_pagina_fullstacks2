import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Carrito from './Carrito.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'

const ITEMS = [
  { id: 1, nombre: 'Consulta General', precio: 25000, tipo: 'SERVICIO', stock: null, categoriaId: 1, cantidad: 1 },
  { id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 3, categoriaId: 3, cantidad: 2 },
]
const opciones = (extra = {}) => ({ ruta: '/carrito', path: '/carrito', carrito: ITEMS, ...extra })

describe('Carrito de compras', () => {
  it('con el carrito vacío invita a ir a la tienda', () => {
    renderConApp(<Carrito />, { ruta: '/carrito', path: '/carrito' })
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/tienda')
  })

  it('muestra los ítems guardados (sobrevive a una recarga) y calcula el total', () => {
    renderConApp(<Carrito />, opciones())
    expect(screen.getByText('Consulta General')).toBeInTheDocument()
    expect(screen.getByText('Collar antipulgas')).toBeInTheDocument()
    expect(screen.getByTestId('total-carrito')).toHaveTextContent('50.980')
  })

  it('los botones + y − cambian la cantidad y actualizan el total', async () => {
    renderConApp(<Carrito />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Agregar una unidad de Collar antipulgas' }))
    await waitFor(() => expect(screen.getByTestId('total-carrito')).toHaveTextContent('63.970'))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar una unidad de Collar antipulgas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar una unidad de Collar antipulgas' }))
    await waitFor(() => expect(screen.getByTestId('total-carrito')).toHaveTextContent('37.990'))
  })

  it('el botón + se desactiva al llegar al stock del artículo', () => {
    renderConApp(<Carrito />, opciones({ carrito: [{ ...ITEMS[1], cantidad: 3 }] }))
    expect(screen.getByRole('button', { name: 'Agregar una unidad de Collar antipulgas' })).toBeDisabled()
  })

  it('× quita el producto del carrito', async () => {
    renderConApp(<Carrito />, opciones())
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Consulta General del carrito' }))
    await waitFor(() => expect(screen.queryByText('Consulta General')).not.toBeInTheDocument())
    expect(screen.getByTestId('total-carrito')).toHaveTextContent('25.980')
  })

  it('sin sesión pide iniciar sesión y no permite confirmar la compra', () => {
    renderConApp(<Carrito />, opciones())
    expect(screen.getByRole('link', { name: 'Inicia sesión para comprar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Confirmar compra' })).not.toBeInTheDocument()
  })

  it('el personal de la clínica no puede comprar con su cuenta', () => {
    renderConApp(<Carrito />, opciones({ sesion: USUARIOS.recepcion }))
    expect(screen.queryByRole('button', { name: 'Confirmar compra' })).not.toBeInTheDocument()
    expect(screen.getByText(/cuenta de cliente/)).toBeInTheDocument()
  })

  it('un cliente confirma la compra: se crea la boleta, se vacía el carrito y se celebra', async () => {
    renderConApp(<Carrito />, opciones({ sesion: USUARIOS.cliente }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(await screen.findByRole('heading', { name: '¡Gracias por tu compra!' })).toBeInTheDocument()
    expect(screen.getByText(/Total pagado: \$?\s?50\.980/)).toBeInTheDocument()
    expect(screen.getByTestId('confeti')).toBeInTheDocument()

    const boletas = JSON.parse(localStorage.getItem('sanmarcos_boletas'))
    expect(boletas).toHaveLength(1)
    expect(boletas[0]).toMatchObject({ clienteEmail: 'ana.garcia@correo.cl', total: 50980 })
    await waitFor(() => expect(JSON.parse(localStorage.getItem('sanmarcos_carrito'))).toEqual([]))
  })
})
