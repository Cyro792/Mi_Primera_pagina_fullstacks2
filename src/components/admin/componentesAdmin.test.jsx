import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import StatCard from './StatCard.jsx'
import BarChart from './BarChart.jsx'
import EstadoBadge from './EstadoBadge.jsx'
import CitasTable from './CitasTable.jsx'
import UsuariosPanel from './UsuariosPanel.jsx'

const citas = [
  { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: '2026-10-12', hora: '10:00', estado: 'Confirmada' },
  { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Vacunación', fecha: '2026-10-12', hora: '09:00', estado: 'Pendiente' },
]
const usuarios = [{ id: 1, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'Recepcionista', activo: true }]

describe('StatCard / BarChart / EstadoBadge (props → DOM)', () => {
  it('StatCard muestra título, valor y detalle recibidos por props', () => {
    render(<StatCard titulo="Pendientes" valor={7} detalle="Por confirmar" variante="warning" />)
    const tarjeta = screen.getByTestId('stat-card')
    expect(tarjeta).toHaveTextContent('Pendientes')
    expect(tarjeta).toHaveTextContent('7')
    expect(tarjeta).toHaveTextContent('Por confirmar')
  })

  it('StatCard no renderiza el detalle si no se entrega', () => {
    const { container } = render(<StatCard titulo="Citas" valor={1} />)
    expect(container.querySelectorAll('p')).toHaveLength(2)
  })

  it('BarChart calcula el ancho de cada barra relativo al máximo', () => {
    render(<BarChart titulo="Citas por servicio" datos={[{ etiqueta: 'A', valor: 4 }, { etiqueta: 'B', valor: 2 }]} />)
    const barras = screen.getAllByRole('progressbar')
    expect(barras[0]).toHaveStyle({ width: '100%' })
    expect(barras[1]).toHaveStyle({ width: '50%' })
    expect(barras[1]).toHaveAttribute('aria-valuenow', '2')
  })

  it('BarChart muestra un mensaje cuando no hay datos', () => {
    render(<BarChart titulo="Vacío" datos={[]} />)
    expect(screen.getByText(/Sin datos/)).toBeInTheDocument()
  })

  it('EstadoBadge aplica la clase de Bootstrap según el estado', () => {
    render(<EstadoBadge estado="Completada" />)
    expect(screen.getByText('Completada')).toHaveClass('text-bg-success')
  })
})

describe('CitasTable (estado local, eventos y mocks)', () => {
  let onCambiarEstado, onEliminar

  beforeEach(() => {
    onCambiarEstado = vi.fn()
    onEliminar = vi.fn()
    render(<CitasTable citas={citas} onCambiarEstado={onCambiarEstado} onEliminar={onEliminar} />)
  })

  // Filas del cuerpo de la tabla (sin contar el encabezado).
  const filas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

  it('renderiza una fila por cita', () => {
    expect(filas()).toHaveLength(2)
    expect(filas()[0]).toHaveTextContent('Pepe')
  })

  it('filtra por estado con el select', () => {
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'Pendiente' } })
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Luna')
  })

  it('filtra por texto y muestra mensaje cuando no hay coincidencias', () => {
    fireEvent.change(screen.getByLabelText('Buscar cita'), { target: { value: 'rocky' } })
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('No hay citas')
  })

  it('al cambiar el estado llama onCambiarEstado con el id y el nuevo estado', () => {
    fireEvent.change(screen.getByLabelText('Cambiar estado de la cita 2'), { target: { value: 'Confirmada' } })
    expect(onCambiarEstado).toHaveBeenCalledWith(2, 'Confirmada')
  })

  it('eliminar pide confirmación y solo elimina si el usuario acepta (spy sobre window.confirm)', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    const boton = screen.getByLabelText('Eliminar la cita 1')
    fireEvent.click(boton)
    expect(onEliminar).not.toHaveBeenCalled()
    fireEvent.click(boton)
    expect(confirmar).toHaveBeenCalledTimes(2)
    expect(onEliminar).toHaveBeenCalledTimes(1)
    expect(onEliminar).toHaveBeenCalledWith(1)
  })
})

describe('UsuariosPanel (formulario con validación)', () => {
  let onAgregar, onToggleActivo

  beforeEach(() => {
    onAgregar = vi.fn()
    onToggleActivo = vi.fn()
    render(<UsuariosPanel usuarios={usuarios} onAgregar={onAgregar} onToggleActivo={onToggleActivo} />)
  })

  const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
  const enviar = () => fireEvent.submit(screen.getByRole('form', { name: 'Nuevo usuario' }))

  it('muestra errores y NO llama onAgregar si el formulario está vacío', () => {
    enviar()
    expect(onAgregar).not.toHaveBeenCalled()
    expect(screen.getByText(/al menos 3 caracteres/)).toBeInTheDocument()
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona un rol.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveClass('is-invalid')
  })

  it('muestra error de correo duplicado', () => {
    escribir('Nombre completo', 'Otra Persona')
    escribir('Correo', 'recepcion@sanmarcos.cl')
    escribir('Rol', 'Dueño')
    enviar()
    expect(screen.getByText(/Ya existe un usuario/)).toBeInTheDocument()
    expect(onAgregar).not.toHaveBeenCalled()
  })

  it('con datos válidos llama onAgregar (normalizando datos) y limpia el formulario', () => {
    escribir('Nombre completo', '  Juan Pérez ')
    escribir('Correo', 'JUAN@Correo.cl')
    escribir('Rol', 'Dueño')
    enviar()
    expect(onAgregar).toHaveBeenCalledTimes(1)
    expect(onAgregar).toHaveBeenCalledWith({ nombre: 'Juan Pérez', email: 'juan@correo.cl', rol: 'Dueño' })
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
  })

  it('el botón Desactivar llama onToggleActivo con el id del usuario', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(onToggleActivo).toHaveBeenCalledWith(1)
  })
})
