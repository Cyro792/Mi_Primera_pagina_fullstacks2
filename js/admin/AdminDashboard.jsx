import { useState } from 'react'
import { aISO, crearCitasIniciales, usuariosIniciales as USUARIOS_DEMO } from './data.js'
import { siguienteId } from './stats.js'
import Sidebar, { SECCIONES } from './components/Sidebar.jsx'
import ResumenPanel from './components/ResumenPanel.jsx'
import CitasTable from './components/CitasTable.jsx'
import UsuariosPanel from './components/UsuariosPanel.jsx'

// Las props con valor por defecto permiten inyectar datos falsos (mocks) en las pruebas.
export default function AdminDashboard({ onLogout, citasIniciales, usuariosIniciales = USUARIOS_DEMO, hoy = aISO() }) {
  const [seccion, setSeccion] = useState('resumen')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [citas, setCitas] = useState(() => citasIniciales ?? crearCitasIniciales())
  const [usuarios, setUsuarios] = useState(usuariosIniciales)

  const cambiarEstado = (id, estado) => setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)))
  const eliminarCita = (id) => setCitas((prev) => prev.filter((c) => c.id !== id))
  const agregarUsuario = (datos) => setUsuarios((prev) => [...prev, { ...datos, id: siguienteId(prev), activo: true }])
  const toggleActivo = (id) => setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)))

  const titulo = SECCIONES.find((s) => s.id === seccion).etiqueta

  return (
    <div className="admin-shell">
      <Sidebar seccion={seccion} onSeleccionar={setSeccion} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} onLogout={onLogout} />
      {menuAbierto && <div className="admin-backdrop d-lg-none" data-testid="backdrop" onClick={() => setMenuAbierto(false)} />}

      <div className="admin-main">
        <header className="navbar bg-white border-bottom px-3 sticky-top">
          <button type="button" className="btn btn-outline-success d-lg-none" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>☰</button>
          <h1 className="h5 mb-0 ms-2 me-auto">{titulo}</h1>
          <span className="small text-muted d-none d-sm-inline">Sesión: Administrador</span>
        </header>

        <main className="container-fluid p-3 p-md-4">
          {seccion === 'resumen' && <ResumenPanel citas={citas} usuarios={usuarios} hoy={hoy} />}
          {seccion === 'citas' && <CitasTable citas={citas} onCambiarEstado={cambiarEstado} onEliminar={eliminarCita} />}
          {seccion === 'usuarios' && <UsuariosPanel usuarios={usuarios} onAgregar={agregarUsuario} onToggleActivo={toggleActivo} />}
        </main>
      </div>
    </div>
  )
}
