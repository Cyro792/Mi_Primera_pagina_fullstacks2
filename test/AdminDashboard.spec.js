import AdminDashboard from '../js/admin/AdminDashboard.jsx'
import { clic, enviar, escribir, montar } from './helpers.jsx'

const HOY = '2026-10-12'
const citas = [
  { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: HOY, hora: '10:00', estado: 'Pendiente' },
  { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Cirugía', fecha: HOY, hora: '12:00', estado: 'Completada' },
]
const usuarios = [{ id: 1, nombre: 'Admin', email: 'admin@sanmarcos.cl', rol: 'Administrador', activo: true }]

describe('AdminDashboard (integración: estado elevado + navegación)', () => {
  let app, onLogout
  const ir = (nombre) => clic([...app.contenedor.querySelectorAll('.admin-sidebar .nav-link')].find((b) => b.textContent.includes(nombre)))
  const valorTarjeta = (titulo) =>
    [...app.contenedor.querySelectorAll('[data-testid="stat-card"]')].find((t) => t.textContent.includes(titulo)).querySelector('.h3').textContent

  beforeEach(() => {
    onLogout = jasmine.createSpy('onLogout')
    app = montar(<AdminDashboard onLogout={onLogout} citasIniciales={citas} usuariosIniciales={usuarios} hoy={HOY} />)
  })
  afterEach(() => app.desmontar())

  it('muestra el resumen con los KPIs calculados desde los datos recibidos', () => {
    expect(valorTarjeta('Citas de hoy')).toBe('2')
    expect(valorTarjeta('Pendientes')).toBe('1')
    expect(valorTarjeta('Usuarios activos')).toBe('1')
    expect(valorTarjeta('Ingresos estimados')).toContain('120.000')
  })

  it('la barra lateral navega entre secciones y marca la activa', () => {
    ir('Citas')
    expect(app.contenedor.querySelector('h1').textContent).toBe('Citas')
    expect(app.contenedor.querySelector('table')).not.toBeNull()
    expect(app.contenedor.querySelector('.nav-link.active').textContent).toContain('Citas')
    ir('Usuarios')
    expect(app.contenedor.querySelector('form[aria-label="Nuevo usuario"]')).not.toBeNull()
  })

  it('cambiar el estado de una cita actualiza los KPIs del resumen (estado compartido)', () => {
    ir('Citas')
    escribir(app.contenedor.querySelector('[aria-label="Cambiar estado de la cita 1"]'), 'Completada')
    ir('Resumen')
    expect(valorTarjeta('Pendientes')).toBe('0')
    expect(valorTarjeta('Ingresos estimados')).toContain('140.000')
  })

  it('eliminar una cita (con confirmación simulada) la quita de la tabla', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    ir('Citas')
    clic(app.contenedor.querySelector('[aria-label="Eliminar la cita 1"]'))
    expect(app.contenedor.querySelectorAll('tbody tr').length).toBe(1)
  })

  it('agregar un usuario válido lo suma a la lista', () => {
    ir('Usuarios')
    escribir(app.contenedor.querySelector('#u-nombre'), 'Nueva Recepcionista')
    escribir(app.contenedor.querySelector('#u-email'), 'nueva@sanmarcos.cl')
    escribir(app.contenedor.querySelector('#u-rol'), 'Recepcionista')
    enviar(app.contenedor.querySelector('form'))
    expect(app.contenedor.textContent).toContain('Nueva Recepcionista')
    expect(app.contenedor.textContent).toContain('Usuarios del sistema (2)')
  })

  it('el botón ☰ abre el menú móvil y el fondo oscuro lo cierra', () => {
    const sidebar = app.contenedor.querySelector('.admin-sidebar')
    expect(sidebar.className).not.toContain('abierto')
    clic(app.contenedor.querySelector('[aria-label="Abrir menú"]'))
    expect(sidebar.className).toContain('abierto')
    clic(app.contenedor.querySelector('[data-testid="backdrop"]'))
    expect(sidebar.className).not.toContain('abierto')
  })

  it('Cerrar sesión llama a onLogout', () => {
    clic([...app.contenedor.querySelectorAll('button')].find((b) => b.textContent === 'Cerrar sesión'))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
