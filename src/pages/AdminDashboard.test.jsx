import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import AdminDashboard from './AdminDashboard.jsx'

const HOY = '2026-10-12'
const citas = [
  { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: HOY, hora: '10:00', estado: 'Pendiente' },
  { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Cirugía', fecha: HOY, hora: '12:00', estado: 'Completada' },
]
const usuarios = [{ id: 1, nombre: 'Admin', email: 'admin@sanmarcos.cl', rol: 'Administrador', activo: true }]

describe('AdminDashboard (integración: estado elevado + navegación)', () => {
  let onLogout

  const menu = () => within(screen.getByLabelText('Navegación del panel'))
  const ir = (nombre) => fireEvent.click(menu().getByRole('button', { name: new RegExp(nombre) }))
  const valorTarjeta = (titulo) =>
    screen.getAllByTestId('stat-card').find((t) => t.textContent.includes(titulo)).querySelector('.h3').textContent

  beforeEach(() => {
    onLogout = vi.fn()
    render(<AdminDashboard onLogout={onLogout} citasIniciales={citas} usuariosIniciales={usuarios} hoy={HOY} />)
  })

  it('muestra el resumen con los KPIs calculados desde los datos recibidos', () => {
    expect(valorTarjeta('Citas de hoy')).toBe('2')
    expect(valorTarjeta('Pendientes')).toBe('1')
    expect(valorTarjeta('Usuarios activos')).toBe('1')
    expect(valorTarjeta('Ingresos estimados')).toContain('120.000')
  })

  it('la barra lateral navega entre secciones y marca la activa', () => {
    ir('Citas')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Citas')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(menu().getByRole('button', { name: /Citas/ })).toHaveClass('active')
    ir('Usuarios')
    expect(screen.getByRole('form', { name: 'Nuevo usuario' })).toBeInTheDocument()
  })

  it('cambiar el estado de una cita actualiza los KPIs del resumen (estado compartido)', () => {
    ir('Citas')
    fireEvent.change(screen.getByLabelText('Cambiar estado de la cita 1'), { target: { value: 'Completada' } })
    ir('Resumen')
    expect(valorTarjeta('Pendientes')).toBe('0')
    expect(valorTarjeta('Ingresos estimados')).toContain('140.000')
  })

  it('eliminar una cita (con confirmación simulada) la quita de la tabla', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    ir('Citas')
    fireEvent.click(screen.getByLabelText('Eliminar la cita 1'))
    expect(within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')).toHaveLength(1)
    expect(screen.queryByText('Pepe')).not.toBeInTheDocument()
  })

  it('agregar un usuario válido lo suma a la lista', () => {
    ir('Usuarios')
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Nueva Recepcionista' } })
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nueva@sanmarcos.cl' } })
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'Recepcionista' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Nuevo usuario' }))
    expect(screen.getByText('Nueva Recepcionista')).toBeInTheDocument()
    expect(screen.getByText('Usuarios del sistema (2)')).toBeInTheDocument()
  })

  it('el botón ☰ abre el menú móvil y el fondo oscuro lo cierra', () => {
    const barraLateral = screen.getByLabelText('Navegación del panel')
    expect(barraLateral).not.toHaveClass('abierto')
    fireEvent.click(screen.getByLabelText('Abrir menú'))
    expect(barraLateral).toHaveClass('abierto')
    fireEvent.click(screen.getByTestId('backdrop'))
    expect(barraLateral).not.toHaveClass('abierto')
  })

  it('Cerrar sesión llama a onLogout', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
