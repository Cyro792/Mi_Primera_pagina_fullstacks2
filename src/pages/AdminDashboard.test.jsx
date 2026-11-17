import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import AdminDashboard from './AdminDashboard.jsx'
import RutaProtegida from '../components/RutaProtegida.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { apiFalsa } from '../test/apiFalsa.js'

const menu = () => within(screen.getByLabelText('Navegación del panel'))
const ir = (nombre) => fireEvent.click(menu().getByRole('button', { name: new RegExp(nombre) }))
const valorTarjeta = (titulo) =>
  screen.getAllByTestId('stat-card').find((t) => t.textContent.includes(titulo)).querySelector('.h3').textContent
const filas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

async function abrirPanel(onLogout = vi.fn()) {
  renderConApp(
    <RutaProtegida roles={['ADMIN']}>
      <AdminDashboard onLogout={onLogout} />
    </RutaProtegida>,
    { ruta: '/admin', path: '/admin', sesion: USUARIOS.admin },
  )
  await screen.findAllByTestId('stat-card')
  return onLogout
}

describe('AdminDashboard (panel de administración con la API)', () => {
  it('muestra el resumen con los KPIs que calcula el servidor', async () => {
    await abrirPanel()
    // El resumen junta los reportes de los cuatro microservicios.
    for (const reporte of ['citas', 'ventas', 'usuarios', 'inventario']) {
      expect(apiFalsa().llamadasA('GET', `/reportes/${reporte}`)).toHaveLength(1)
    }
    expect(valorTarjeta('Citas de hoy')).toBe('1')
    expect(valorTarjeta('Pendientes')).toBe('1')
    expect(valorTarjeta('Clientes activos')).toBe('1')
    expect(screen.getByText('Sesión: Administrador General')).toBeInTheDocument()
  })

  it('la barra lateral navega entre secciones y marca la activa', async () => {
    await abrirPanel()
    ir('Citas')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Citas')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(menu().getByRole('button', { name: /Citas/ })).toHaveClass('active')
    ir('Usuarios')
    expect(screen.getByRole('form', { name: 'Nuevo usuario' })).toBeInTheDocument()
  })

  it('cambiar el estado de una cita lo guarda en el servidor y actualiza el resumen', async () => {
    await abrirPanel()
    ir('Citas')
    fireEvent.change(screen.getByLabelText('Cambiar estado de la cita 2'), { target: { value: 'CONFIRMADA' } })
    await waitFor(() => expect(apiFalsa().estado.citas.find((c) => c.id === 2).estado).toBe('CONFIRMADA'))
    ir('Resumen')
    await waitFor(() => expect(valorTarjeta('Pendientes')).toBe('0'))
  })

  it('una cita completada no se puede eliminar ni cambiar de estado', async () => {
    await abrirPanel()
    ir('Citas')
    expect(screen.getByLabelText('Eliminar la cita 3')).toBeDisabled()
    expect(screen.getByLabelText('Cambiar estado de la cita 3')).toBeDisabled()
  })

  it('eliminar una cita (con confirmación) la borra en el servidor y de la tabla', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await abrirPanel()
    ir('Citas')
    expect(filas()).toHaveLength(3)
    fireEvent.click(screen.getByLabelText('Eliminar la cita 2'))
    await waitFor(() => expect(filas()).toHaveLength(2))
    expect(screen.queryByText('Luna')).not.toBeInTheDocument()
  })

  it('si la API rechaza un cambio, muestra su mensaje', async () => {
    apiFalsa().fallar('DELETE', '/citas/2', 409, 'La cita no se puede eliminar.')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await abrirPanel()
    ir('Citas')
    fireEvent.click(screen.getByLabelText('Eliminar la cita 2'))
    expect(await screen.findByRole('alert')).toHaveTextContent('La cita no se puede eliminar.')
  })

  it('agrega un usuario del personal con contraseña inicial', async () => {
    await abrirPanel()
    ir('Usuarios')
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Nueva Recepcionista' } })
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nueva@sanmarcos.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña inicial'), { target: { value: 'Clave1234' } })
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'RECEPCIONISTA' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Nuevo usuario' }))
    expect(await screen.findByText('Nueva Recepcionista')).toBeInTheDocument()
    expect(screen.getByText('Usuarios del sistema (4)')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/usuarios')[0].cuerpo).toMatchObject({ email: 'nueva@sanmarcos.cl', rol: 'RECEPCIONISTA' })
  })

  it('no permite desactivar la propia cuenta, pero sí la de otros', async () => {
    await abrirPanel()
    ir('Usuarios')
    const filaPropia = screen.getByText('admin@sanmarcos.cl').closest('tr')
    expect(within(filaPropia).getByText('Tu cuenta')).toBeInTheDocument()
    const filaAna = screen.getByText('ana.garcia@correo.cl').closest('tr')
    fireEvent.click(within(filaAna).getByRole('button', { name: 'Desactivar' }))
    expect(await within(filaAna).findByText('Inactivo')).toBeInTheDocument()
  })

  it('administra el catálogo: crea un producto y da de baja otro', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await abrirPanel()
    ir('Productos')
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Cama para gato' } })
    fireEvent.change(screen.getByLabelText('Precio (CLP)'), { target: { value: '19990' } })
    fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al catálogo' }))
    expect(await screen.findByText('Cama para gato')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/productos')[0].cuerpo).toMatchObject({ precio: 19990, stock: 5, duracionMin: null, categoriaId: 3 })

    fireEvent.click(screen.getByRole('button', { name: 'Dar de baja Juguete mordedor' }))
    expect(await screen.findByRole('button', { name: 'Reactivar Juguete mordedor' })).toBeInTheDocument()
  })

  it('el botón ☰ abre el menú móvil y el fondo oscuro lo cierra', async () => {
    await abrirPanel()
    const barraLateral = screen.getByLabelText('Navegación del panel')
    expect(barraLateral).not.toHaveClass('abierto')
    fireEvent.click(screen.getByLabelText('Abrir menú'))
    expect(barraLateral).toHaveClass('abierto')
    fireEvent.click(screen.getByTestId('backdrop'))
    expect(barraLateral).not.toHaveClass('abierto')
  })

  it('el administrador cambia su propia contraseña en "Mi contraseña"', async () => {
    await abrirPanel()
    ir('Mi contraseña')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mi contraseña')
    const cambiar = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

    // Con la contraseña actual equivocada, el servidor la rechaza y el error aparece bajo ese campo.
    cambiar('Contraseña actual', 'NoEsLaClave1')
    cambiar('Nueva contraseña', 'Empanada1234')
    cambiar('Repite la nueva contraseña', 'Empanada1234')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument()

    cambiar('Contraseña actual', 'Admin123!')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByText(/Contraseña actualizada/)).toBeInTheDocument()
    expect(apiFalsa().estado.usuarios.find((u) => u.email === 'admin@sanmarcos.cl').password).toBe('Empanada1234')
  })

  it('Cerrar sesión llama a onLogout', async () => {
    const onLogout = await abrirPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
