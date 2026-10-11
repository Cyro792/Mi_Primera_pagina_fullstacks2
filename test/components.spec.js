import StatCard from '../js/admin/components/StatCard.jsx'
import BarChart from '../js/admin/components/BarChart.jsx'
import EstadoBadge from '../js/admin/components/EstadoBadge.jsx'
import CitasTable from '../js/admin/components/CitasTable.jsx'
import UsuariosPanel from '../js/admin/components/UsuariosPanel.jsx'
import { clic, enviar, escribir, montar } from './helpers.jsx'

const citas = [
  { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: '2026-10-12', hora: '10:00', estado: 'Confirmada' },
  { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Vacunación', fecha: '2026-10-12', hora: '09:00', estado: 'Pendiente' },
]
const usuarios = [{ id: 1, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'Recepcionista', activo: true }]

describe('StatCard / BarChart / EstadoBadge (props → DOM)', () => {
  let app
  afterEach(() => app?.desmontar())

  it('StatCard muestra título, valor y detalle recibidos por props', () => {
    app = montar(<StatCard titulo="Pendientes" valor={7} detalle="Por confirmar" variante="warning" />)
    const tarjeta = app.contenedor.querySelector('[data-testid="stat-card"]')
    expect(tarjeta.textContent).toContain('Pendientes')
    expect(tarjeta.textContent).toContain('7')
    expect(tarjeta.textContent).toContain('Por confirmar')
  })

  it('StatCard no renderiza el detalle si no se entrega', () => {
    app = montar(<StatCard titulo="Citas" valor={1} />)
    expect(app.contenedor.querySelectorAll('p').length).toBe(2)
  })

  it('BarChart calcula el ancho de cada barra relativo al máximo', () => {
    app = montar(<BarChart titulo="Citas por servicio" datos={[{ etiqueta: 'A', valor: 4 }, { etiqueta: 'B', valor: 2 }]} />)
    const barras = app.contenedor.querySelectorAll('.progress-bar')
    expect(barras[0].style.width).toBe('100%')
    expect(barras[1].style.width).toBe('50%')
    expect(barras[1].getAttribute('aria-valuenow')).toBe('2')
  })

  it('BarChart muestra un mensaje cuando no hay datos', () => {
    app = montar(<BarChart titulo="Vacío" datos={[]} />)
    expect(app.contenedor.textContent).toContain('Sin datos')
  })

  it('EstadoBadge aplica la clase de Bootstrap según el estado', () => {
    app = montar(<EstadoBadge estado="Completada" />)
    expect(app.contenedor.querySelector('span').className).toContain('text-bg-success')
  })
})

describe('CitasTable (estado local, eventos y mocks)', () => {
  let app, onCambiarEstado, onEliminar
  beforeEach(() => {
    onCambiarEstado = jasmine.createSpy('onCambiarEstado')
    onEliminar = jasmine.createSpy('onEliminar')
    app = montar(<CitasTable citas={citas} onCambiarEstado={onCambiarEstado} onEliminar={onEliminar} />)
  })
  afterEach(() => app.desmontar())

  const filas = () => app.contenedor.querySelectorAll('tbody tr')

  it('renderiza una fila por cita', () => {
    expect(filas().length).toBe(2)
    expect(filas()[0].textContent).toContain('Pepe')
  })

  it('filtra por estado con el select', () => {
    escribir(app.contenedor.querySelector('[aria-label="Filtrar por estado"]'), 'Pendiente')
    expect(filas().length).toBe(1)
    expect(filas()[0].textContent).toContain('Luna')
  })

  it('filtra por texto y muestra mensaje cuando no hay coincidencias', () => {
    const buscador = app.contenedor.querySelector('[aria-label="Buscar cita"]')
    escribir(buscador, 'rocky')
    expect(filas().length).toBe(1)
    expect(filas()[0].textContent).toContain('No hay citas')
  })

  it('al cambiar el estado llama onCambiarEstado con el id y el nuevo estado', () => {
    escribir(app.contenedor.querySelector('[aria-label="Cambiar estado de la cita 2"]'), 'Confirmada')
    expect(onCambiarEstado).toHaveBeenCalledWith(2, 'Confirmada')
  })

  it('eliminar pide confirmación y solo elimina si el usuario acepta (spy sobre window.confirm)', () => {
    const confirmar = spyOn(window, 'confirm').and.returnValues(false, true)
    const boton = app.contenedor.querySelector('[aria-label="Eliminar la cita 1"]')
    clic(boton)
    expect(onEliminar).not.toHaveBeenCalled()
    clic(boton)
    expect(confirmar).toHaveBeenCalledTimes(2)
    expect(onEliminar).toHaveBeenCalledOnceWith(1)
  })
})

describe('UsuariosPanel (formulario con validación)', () => {
  let app, onAgregar, onToggleActivo
  beforeEach(() => {
    onAgregar = jasmine.createSpy('onAgregar')
    onToggleActivo = jasmine.createSpy('onToggleActivo')
    app = montar(<UsuariosPanel usuarios={usuarios} onAgregar={onAgregar} onToggleActivo={onToggleActivo} />)
  })
  afterEach(() => app.desmontar())

  it('muestra errores y NO llama onAgregar si el formulario está vacío', () => {
    enviar(app.contenedor.querySelector('form'))
    expect(onAgregar).not.toHaveBeenCalled()
    expect(app.contenedor.querySelectorAll('.invalid-feedback').length).toBe(3)
    expect(app.contenedor.querySelector('#u-nombre').className).toContain('is-invalid')
  })

  it('muestra error de correo duplicado', () => {
    escribir(app.contenedor.querySelector('#u-nombre'), 'Otra Persona')
    escribir(app.contenedor.querySelector('#u-email'), 'recepcion@sanmarcos.cl')
    escribir(app.contenedor.querySelector('#u-rol'), 'Dueño')
    enviar(app.contenedor.querySelector('form'))
    expect(app.contenedor.textContent).toContain('Ya existe un usuario')
    expect(onAgregar).not.toHaveBeenCalled()
  })

  it('con datos válidos llama onAgregar (normalizando datos) y limpia el formulario', () => {
    escribir(app.contenedor.querySelector('#u-nombre'), '  Juan Pérez ')
    escribir(app.contenedor.querySelector('#u-email'), 'JUAN@Correo.cl')
    escribir(app.contenedor.querySelector('#u-rol'), 'Dueño')
    enviar(app.contenedor.querySelector('form'))
    expect(onAgregar).toHaveBeenCalledOnceWith({ nombre: 'Juan Pérez', email: 'juan@correo.cl', rol: 'Dueño' })
    expect(app.contenedor.querySelector('#u-nombre').value).toBe('')
  })

  it('el botón Desactivar llama onToggleActivo con el id del usuario', () => {
    clic([...app.contenedor.querySelectorAll('button')].find((b) => b.textContent === 'Desactivar'))
    expect(onToggleActivo).toHaveBeenCalledWith(1)
  })
})
