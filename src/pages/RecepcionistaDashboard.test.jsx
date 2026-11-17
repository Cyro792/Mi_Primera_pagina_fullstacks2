import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import RecepcionistaDashboard from './RecepcionistaDashboard.jsx'
import RutaProtegida from '../components/RutaProtegida.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'
import { apiFalsa } from '../test/apiFalsa.js'

async function abrirPanel(onLogout = vi.fn()) {
  renderConApp(
    <RutaProtegida roles={['ADMIN', 'RECEPCIONISTA']}>
      <RecepcionistaDashboard onLogout={onLogout} />
    </RutaProtegida>,
    { ruta: '/recepcion', path: '/recepcion', sesion: USUARIOS.recepcion },
  )
  await screen.findByText('Pepe')
  return onLogout
}
const fila = (mascota) => screen.getByText(mascota).closest('li')

describe('RecepcionistaDashboard (panel de recepción con la API)', () => {
  it('1. Debe mostrar los títulos del panel y la sesión de la recepcionista', async () => {
    await abrirPanel()
    expect(screen.getByRole('heading', { name: 'Gestión de Reservas' })).toBeInTheDocument()
    expect(screen.getByText('Camila Rojas')).toBeInTheDocument()
  })

  it('2. Debe listar las citas que entrega la API (Pepe, Luna y Thor)', async () => {
    await abrirPanel()
    expect(screen.getByText('Luna')).toBeInTheDocument()
    expect(screen.getByText('Thor')).toBeInTheDocument()
    expect(apiFalsa().llamadasA('GET', '/citas')).toHaveLength(1)
  })

  it('3. Debe calcular las métricas: citas de hoy, pendientes y por atender', async () => {
    await abrirPanel()
    const metrica = (texto) => screen.getByText(texto).nextElementSibling.textContent
    expect(metrica('CITAS DE HOY')).toBe('1')
    expect(metrica('PENDIENTES')).toBe('1')
    expect(metrica('POR ATENDER')).toBe('2')
  })

  it('4. Confirmar una cita pendiente la guarda en el servidor', async () => {
    await abrirPanel()
    fireEvent.click(within(fila('Luna')).getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(within(fila('Luna')).queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument())
    expect(apiFalsa().estado.citas.find((c) => c.id === 2).estado).toBe('CONFIRMADA')
    expect(within(fila('Luna')).getByRole('button', { name: 'Marcar atendida' })).toBeInTheDocument()
  })

  it('5. Una cita completada no se puede editar, cancelar ni eliminar', async () => {
    await abrirPanel()
    expect(within(fila('Thor')).queryAllByRole('button')).toHaveLength(0)
  })

  it('6. Crea una reserva nueva con los servicios que entrega la API', async () => {
    await abrirPanel()
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Reserva/i }))
    const modal = screen.getByRole('dialog', { name: 'Nueva Reserva de Atención' })
    expect(within(modal).getAllByRole('option')).toHaveLength(6)

    fireEvent.change(within(modal).getByLabelText('Nombre de la Mascota:'), { target: { value: 'Michi' } })
    fireEvent.change(within(modal).getByLabelText('Nombre del Dueño:'), { target: { value: 'Luc Pérez' } })
    fireEvent.change(within(modal).getByLabelText('Teléfono de contacto:'), { target: { value: '+56 9 1111 2222' } })
    fireEvent.change(within(modal).getByLabelText('Hora:'), { target: { value: '18:45' } })
    fireEvent.change(within(modal).getByLabelText('Servicio:'), { target: { value: '4' } })
    fireEvent.click(within(modal).getByRole('button', { name: 'Guardar Reserva' }))

    expect(await screen.findByText('Michi')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(apiFalsa().llamadasA('POST', '/citas')[0].cuerpo).toMatchObject({ nombreMascota: 'Michi', servicioId: 4, hora: '18:45' })
  })

  it('7. Si el horario está ocupado muestra el mensaje del servidor en el formulario', async () => {
    await abrirPanel()
    const cita = apiFalsa().estado.citas[0]
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Reserva/i }))
    const modal = screen.getByRole('dialog')
    fireEvent.change(within(modal).getByLabelText('Nombre de la Mascota:'), { target: { value: 'Michi' } })
    fireEvent.change(within(modal).getByLabelText('Nombre del Dueño:'), { target: { value: 'Luc' } })
    fireEvent.change(within(modal).getByLabelText('Teléfono de contacto:'), { target: { value: '+56 9 1111 2222' } })
    fireEvent.change(within(modal).getByLabelText('Fecha:'), { target: { value: cita.fecha } })
    fireEvent.change(within(modal).getByLabelText('Hora:'), { target: { value: cita.hora } })
    fireEvent.click(within(modal).getByRole('button', { name: 'Guardar Reserva' }))
    expect(await within(modal).findByRole('alert')).toHaveTextContent('Ya hay una cita agendada')
  })

  it('8. Editar una cita de una mascota registrada conserva la mascota', async () => {
    await abrirPanel()
    fireEvent.click(within(fila('Pepe')).getByRole('button', { name: 'Editar / Cambiar' }))
    const modal = screen.getByRole('dialog', { name: 'Editar Reserva' })
    expect(within(modal).getByText(/Mascota registrada/)).toBeInTheDocument()
    fireEvent.change(within(modal).getByLabelText('Hora:'), { target: { value: '16:00' } })
    fireEvent.click(within(modal).getByRole('button', { name: 'Guardar Reserva' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(apiFalsa().llamadasA('PUT', '/citas/1')[0].cuerpo).toMatchObject({ mascotaId: 1, hora: '16:00' })
  })

  it('9. Eliminar pide confirmación y borra la cita en el servidor', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await abrirPanel()
    fireEvent.click(within(fila('Luna')).getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(screen.queryByText('Luna')).not.toBeInTheDocument())
    expect(apiFalsa().estado.citas.some((c) => c.id === 2)).toBe(false)
  })

  it('11. La recepcionista cambia su contraseña desde "Mi contraseña" y vuelve a la agenda', async () => {
    await abrirPanel()
    fireEvent.click(screen.getByRole('button', { name: /Mi contraseña/ }))
    expect(screen.getByRole('heading', { name: 'Mi contraseña' })).toBeInTheDocument()
    expect(screen.queryByText('Pepe')).not.toBeInTheDocument()

    const cambiar = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
    cambiar('Contraseña actual', 'Recep123!')
    cambiar('Nueva contraseña', 'Sopaipilla1234')
    cambiar('Repite la nueva contraseña', 'Sopaipilla1234')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByText(/Contraseña actualizada/)).toBeInTheDocument()
    expect(apiFalsa().estado.usuarios.find((u) => u.email === 'recepcion@sanmarcos.cl').password).toBe('Sopaipilla1234')

    fireEvent.click(screen.getByRole('button', { name: /Citas y Reservas/ }))
    expect(await screen.findByText('Pepe')).toBeInTheDocument()
  })

  it('10. Debe ejecutar onLogout al hacer clic en cerrar sesión', async () => {
    const onLogout = await abrirPanel()
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }))
    expect(onLogout).toHaveBeenCalled()
  })
})
