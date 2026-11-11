import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Tienda from './Tienda.jsx'
import DetalleProducto from './DetalleProducto.jsx'
import { renderConApp } from '../testUtils.jsx'

const carritoGuardado = () => JSON.parse(localStorage.getItem('sanmarcos_carrito'))

describe('Tienda (catálogo)', () => {
  it('muestra el aviso de carga y luego los 12 productos del catálogo', async () => {
    renderConApp(<Tienda />, { ruta: '/tienda' })
    expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeInTheDocument()
    expect(await screen.findByText('Consulta General')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(12)
  })

  it('con ?categoria=2 en la dirección muestra solo los alimentos', async () => {
    renderConApp(<Tienda />, { ruta: '/tienda?categoria=2' })
    expect(await screen.findByText('Alimento premium perro adulto 15 kg')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Alimentos' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('el filtro por categoría cambia los productos visibles', async () => {
    renderConApp(<Tienda />, { ruta: '/tienda' })
    await screen.findByText('Consulta General')
    fireEvent.click(screen.getByRole('button', { name: 'Accesorios' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2))
    expect(screen.getByText('Collar antipulgas')).toBeInTheDocument()
    expect(screen.queryByText('Consulta General')).not.toBeInTheDocument()
  })

  it('el buscador filtra por nombre y avisa cuando no hay resultados', async () => {
    renderConApp(<Tienda />, { ruta: '/tienda' })
    await screen.findByText('Consulta General')
    const buscador = screen.getByLabelText('Buscar productos')

    fireEvent.change(buscador, { target: { value: 'shampoo' } })
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))

    fireEvent.change(buscador, { target: { value: 'dinosaurio' } })
    expect(await screen.findByText(/No encontramos productos/)).toBeInTheDocument()
  })

  it('"Agregar" suma el producto al carrito, lo guarda y confirma en el botón', async () => {
    renderConApp(<Tienda />, { ruta: '/tienda' })
    const boton = await screen.findByRole('button', { name: 'Agregar Collar antipulgas al carrito' })

    fireEvent.click(boton)
    expect(boton).toHaveTextContent('✓ Agregado')
    await waitFor(() => expect(carritoGuardado()).toMatchObject([{ id: 9, nombre: 'Collar antipulgas', cantidad: 1 }]))

    fireEvent.click(boton)
    await waitFor(() => expect(carritoGuardado()[0].cantidad).toBe(2))
  })

  it('un artículo no se puede agregar más allá de su stock', async () => {
    const collarAlTope = [{ id: 9, nombre: 'Collar antipulgas', precio: 12990, tipo: 'PRODUCTO', stock: 30, categoriaId: 3, cantidad: 30 }]
    renderConApp(<Tienda />, { ruta: '/tienda', carrito: collarAlTope })
    const boton = await screen.findByRole('button', { name: 'Agregar Collar antipulgas al carrito' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveTextContent('Sin stock')
  })
})

describe('DetalleProducto (/producto/:id)', () => {
  const opciones = (id) => ({ ruta: `/producto/${id}`, path: '/producto/:id' })

  it('muestra los datos del producto indicado en la dirección', async () => {
    renderConApp(<DetalleProducto />, opciones(9))
    expect(await screen.findByRole('heading', { name: 'Collar antipulgas' })).toBeInTheDocument()
    expect(screen.getByText('30 en stock')).toBeInTheDocument()
    expect(screen.getByText(/12\.990/)).toBeInTheDocument()
  })

  it('permite elegir la cantidad antes de agregar al carrito', async () => {
    renderConApp(<DetalleProducto />, opciones(9))
    await screen.findByRole('heading', { name: 'Collar antipulgas' })
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    await waitFor(() => expect(carritoGuardado()).toMatchObject([{ id: 9, cantidad: 3 }]))
    expect(screen.getByText(/Ya tienes 3 en tu carrito/)).toBeInTheDocument()
  })

  it('avisa cuando el producto no existe', async () => {
    renderConApp(<DetalleProducto />, opciones(999))
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
  })
})
