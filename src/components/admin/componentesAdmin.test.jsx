import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import StatCard from './StatCard.jsx'
import BarChart from './BarChart.jsx'
import EstadoBadge from './EstadoBadge.jsx'
import CitasTable from './CitasTable.jsx'
import UsuariosPanel from './UsuariosPanel.jsx'

// Mismo formato que entrega la API (GET /api/v1/citas y GET /api/v1/usuarios).
const citas = [
  { id: 1, nombreDueno: 'Ana García', nombreMascota: 'Pepe', servicioNombre: 'Consulta General', fecha: '2026-10-12', hora: '10:00', estado: 'CONFIRMADA' },
  { id: 2, nombreDueno: 'Pedro Soto', nombreMascota: 'Luna', servicioNombre: 'Vacunación', fecha: '2026-10-12', hora: '09:00', estado: 'PENDIENTE' },
  { id: 3, nombreDueno: 'Carla Mendoza', nombreMascota: 'Thor', servicioNombre: 'Odontología', fecha: '2026-10-10', hora: '15:30', estado: 'COMPLETADA' },
]
const usuarios = [
  { id: 1, nombre: 'Administrador General', email: 'admin@sanmarcos.cl', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA', activo: true },
]

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

  it('EstadoBadge muestra el estado legible y aplica la clase de Bootstrap', () => {
    render(<EstadoBadge estado="COMPLETADA" />)
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
    expect(filas()).toHaveLength(3)
    expect(filas()[0]).toHaveTextContent('Pepe')
  })

  it('filtra por estado con el select', () => {
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'PENDIENTE' } })
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Luna')
  })

  it('filtra por texto y muestra mensaje cuando no hay coincidencias', () => {
    fireEvent.change(screen.getByLabelText('Buscar cita'), { target: { value: 'rocky' } })
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('No hay citas')
  })

  it('al cambiar el estado llama onCambiarEstado con el id y el nuevo estado', () => {
    fireEvent.change(screen.getByLabelText('Cambiar estado de la cita 2'), { target: { value: 'CONFIRMADA' } })
    expect(onCambiarEstado).toHaveBeenCalledWith(2, 'CONFIRMADA')
  })

  it('solo ofrece los estados a los que se puede pasar (las mismas reglas del backend)', () => {
    const opciones = within(screen.getByLabelText('Cambiar estado de la cita 2')).getAllByRole('option').map((o) => o.value)
    expect(opciones).toEqual(['PENDIENTE', 'CONFIRMADA', 'CANCELADA'])
    expect(screen.getByLabelText('Cambiar estado de la cita 3')).toBeDisabled()
    expect(screen.getByLabelText('Eliminar la cita 3')).toBeDisabled()
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
    render(<UsuariosPanel usuarios={usuarios} idActual={1} onAgregar={onAgregar} onToggleActivo={onToggleActivo} />)
  })

  const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
  const enviar = () => fireEvent.submit(screen.getByRole('form', { name: 'Nuevo usuario' }))

  it('muestra errores y NO llama onAgregar si el formulario está vacío', () => {
    enviar()
    expect(onAgregar).not.toHaveBeenCalled()
    expect(screen.getByText(/al menos 3 caracteres/)).toBeInTheDocument()
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText(/contraseña inicial/)).toBeInTheDocument()
    expect(screen.getByText('Selecciona un rol.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveClass('is-invalid')
  })

  it('muestra error de correo duplicado', () => {
    escribir('Nombre completo', 'Otra Persona')
    escribir('Correo', 'recepcion@sanmarcos.cl')
    escribir('Contraseña inicial', 'Clave1234')
    escribir('Rol', 'CLIENTE')
    enviar()
    expect(screen.getByText(/Ya existe un usuario/)).toBeInTheDocument()
    expect(onAgregar).not.toHaveBeenCalled()
  })

  it('con datos válidos llama onAgregar y limpia el formulario', async () => {
    escribir('Nombre completo', 'Juan Pérez')
    escribir('Correo', 'juan@correo.cl')
    escribir('Contraseña inicial', 'Clave1234')
    escribir('Rol', 'RECEPCIONISTA')
    enviar()
    expect(onAgregar).toHaveBeenCalledTimes(1)
    expect(onAgregar).toHaveBeenCalledWith({ nombre: 'Juan Pérez', email: 'juan@correo.cl', password: 'Clave1234', telefono: '', rol: 'RECEPCIONISTA' })
    await waitFor(() => expect(screen.getByLabelText('Nombre completo')).toHaveValue(''))
  })

  it('si la API rechaza el usuario muestra el error y conserva lo escrito', async () => {
    onAgregar.mockRejectedValueOnce(Object.assign(new Error('Ya existe una cuenta con ese correo.'), { errores: { email: 'Ya existe una cuenta con ese correo.' } }))
    escribir('Nombre completo', 'Juan Pérez')
    escribir('Correo', 'juan@correo.cl')
    escribir('Contraseña inicial', 'Clave1234')
    escribir('Rol', 'CLIENTE')
    enviar()
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cuenta con ese correo.')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Pérez')
  })

  it('el botón Desactivar llama onToggleActivo con el usuario, y no aparece en la propia cuenta', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(onToggleActivo).toHaveBeenCalledWith(usuarios[1])
    expect(screen.getByText('Tu cuenta')).toBeInTheDocument()
  })
})
