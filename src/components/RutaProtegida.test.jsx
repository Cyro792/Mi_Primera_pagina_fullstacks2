import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import RutaProtegida from './RutaProtegida.jsx'
import { renderConApp, USUARIOS } from '../testUtils.jsx'

function PantallaLogin() {
  const { state } = useLocation()
  return <p>Pantalla de login (venías de {state?.desde})</p>
}

const protegida = (
  <RutaProtegida roles={['ADMIN']}>
    <p>Contenido solo para administradores</p>
  </RutaProtegida>
)
const opciones = { ruta: '/admin', path: '/admin', otrasRutas: { '/login': <PantallaLogin /> } }

describe('RutaProtegida (restricción de acceso por rol)', () => {
  it('sin sesión redirige al login y recuerda la página que se quería ver', () => {
    renderConApp(protegida, opciones)
    expect(screen.getByText('Pantalla de login (venías de /admin)')).toBeInTheDocument()
    expect(screen.queryByText('Contenido solo para administradores')).not.toBeInTheDocument()
  })

  it('al recargar con sesión abierta espera a recuperarla antes de decidir', async () => {
    renderConApp(protegida, { ...opciones, sesion: USUARIOS.admin })
    expect(screen.getByRole('status')).toHaveTextContent('Recuperando tu sesión')
    expect(await screen.findByText('Contenido solo para administradores')).toBeInTheDocument()
  })

  it('si la sesión guardada ya no es válida, envía al login', async () => {
    localStorage.setItem('sanmarcos_sesion_abierta', '1')
    renderConApp(protegida, opciones)
    expect(await screen.findByText('Pantalla de login (venías de /admin)')).toBeInTheDocument()
  })

  it('con sesión pero sin el rol necesario muestra "Acceso restringido" y oculta el contenido', async () => {
    renderConApp(protegida, { ...opciones, sesion: USUARIOS.cliente })
    expect(await screen.findByRole('alert')).toHaveTextContent('Acceso restringido')
    expect(screen.queryByText('Contenido solo para administradores')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mi página de inicio' })).toHaveAttribute('href', '/tienda')
  })

  it('una recepcionista tampoco puede entrar a una ruta solo de administrador', async () => {
    renderConApp(protegida, { ...opciones, sesion: USUARIOS.recepcion })
    expect(await screen.findByRole('alert')).toHaveTextContent('Acceso restringido')
  })

  it('sin lista de roles basta con tener sesión iniciada', async () => {
    renderConApp(<RutaProtegida><p>Zona privada</p></RutaProtegida>, { ...opciones, sesion: USUARIOS.cliente })
    expect(await screen.findByText('Zona privada')).toBeInTheDocument()
  })
})
