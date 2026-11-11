import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import RecepcionistaDashboard from './RecepcionistaDashboard.jsx'

describe('RecepcionistaDashboard (panel de recepción)', () => {
  beforeEach(() => {
    // Sembrar datos de prueba en localStorage para que db.js los consuma.
    const reservasIniciales = [
      { id: 1, mascota: 'Pepe', dueno: 'Ana García', telefono: '+56 9 8765 4321', fecha: '2026-10-18', hora: '09:30', servicio: 'Consulta General', estado: 'Confirmada' },
      { id: 2, mascota: 'Luna', dueno: 'Pedro Soto', telefono: '+56 9 1122 3344', fecha: '2026-10-18', hora: '11:00', servicio: 'Vacunación', estado: 'Pendiente' },
    ]
    const serviciosIniciales = [
      { id: 1, nombre: 'Consulta General' },
      { id: 2, nombre: 'Vacunación' },
    ]
    localStorage.setItem('san_marcos_reservas', JSON.stringify(reservasIniciales))
    localStorage.setItem('san_marcos_servicios', JSON.stringify(serviciosIniciales))
  })

  it('1. Debe renderizar el panel de recepción sin lanzar errores', () => {
    const { container } = render(<RecepcionistaDashboard />)
    expect(container).toBeTruthy()
  })

  it('2. Debe mostrar los títulos del panel de recepción', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Gestión de Reservas' })).toBeInTheDocument()
  })

  it('3. Debe visualizar el botón para crear una nueva reserva', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getByRole('button', { name: /\+ Nueva Reserva/i })).toBeInTheDocument()
  })

  it('4. Debe visualizar el botón para cerrar la sesión actual', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument()
  })

  it('5. Debe abrir el formulario al hacer clic en el botón de nueva reserva', () => {
    render(<RecepcionistaDashboard />)
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Reserva/i }))
    expect(screen.getByRole('heading', { name: 'Nueva Reserva de Atención' })).toBeInTheDocument()
  })

  it('6. Debe desplegar la tarjeta de métricas con las citas programadas de hoy', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getByText(/CITAS DE HOY/i)).toBeInTheDocument()
  })

  it('7. Debe desplegar la sección de citas o solicitudes pendientes', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getByText(/PENDIENTES/i)).toBeInTheDocument()
  })

  it('8. Debe ejecutar la función onLogout enviada por props al hacer clic en cerrar sesión', () => {
    const mockLogout = vi.fn()
    render(<RecepcionistaDashboard onLogout={mockLogout} />)
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }))
    expect(mockLogout).toHaveBeenCalled()
  })

  it('9. Debe listar en pantalla a los pacientes agendados como Pepe y Luna', () => {
    render(<RecepcionistaDashboard />)
    expect(screen.getByText(/Pepe/i)).toBeInTheDocument()
    expect(screen.getByText(/Luna/i)).toBeInTheDocument()
  })

  it('10. Debe permitir la lectura de datos desde localStorage', () => {
    const datos = JSON.parse(localStorage.getItem('san_marcos_reservas'))
    expect(datos).toHaveLength(2)
  })

  it('11. Confirmar una reserva pendiente cambia su estado y lo guarda', () => {
    render(<RecepcionistaDashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    const guardadas = JSON.parse(localStorage.getItem('san_marcos_reservas'))
    expect(guardadas.find((r) => r.id === 2).estado).toBe('Confirmada')
  })
})
