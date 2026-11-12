import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../context/AuthContext.jsx'
import { cambiarActivoUsuario, crearUsuario, listarUsuarios, obtenerResumen } from '../services/admin.js'
import { cambiarEstadoCita, eliminarCita, listarCitas } from '../services/citas.js'
import { actualizarProducto, crearProducto, darDeBajaProducto, listarCategorias, listarProductos } from '../services/productos.js'
import { aISO } from '../utils/data.js'
import Sidebar, { SECCIONES } from '../components/admin/Sidebar.jsx'
import ResumenPanel from '../components/admin/ResumenPanel.jsx'
import CitasTable from '../components/admin/CitasTable.jsx'
import UsuariosPanel from '../components/admin/UsuariosPanel.jsx'
import ProductosPanel from '../components/admin/ProductosPanel.jsx'
import '../components/admin/admin.css'

/** Pide a la API todo lo que muestra el panel. */
async function cargarPanel() {
  const [resumen, citas, usuarios, productos, categorias] = await Promise.all([
    obtenerResumen(),
    listarCitas(),
    listarUsuarios(),
    listarProductos({ incluirInactivos: true }),
    listarCategorias(),
  ])
  return { resumen, citas, usuarios, productos, categorias }
}

/** Panel del administrador. Todos los datos vienen de la API y cada cambio se guarda en el servidor. */
export default function AdminDashboard({ onLogout, hoy = aISO() }) {
  const { usuario } = useAuth()
  const [seccion, setSeccion] = useState('resumen')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  // Cada vez que cambia "version" se vuelven a pedir los datos (después de crear, editar o eliminar).
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    cargarPanel()
      .then((cargados) => vigente && setDatos(cargados))
      .catch((problema) => vigente && setError(problema.message))
    return () => {
      vigente = false
    }
  }, [version])

  const recargar = () => setVersion((v) => v + 1)

  /** Ejecuta un cambio en el servidor; si falla muestra el mensaje de la API. Siempre recarga los datos. */
  const intentar = async (accion) => {
    setError('')
    try {
      await accion()
    } catch (problema) {
      setError(problema.message)
    } finally {
      recargar()
    }
  }

  // Los formularios muestran los errores por campo, por eso estas dos acciones dejan pasar el error.
  const agregarUsuario = async (nuevo) => {
    await crearUsuario(nuevo)
    recargar()
  }
  const guardarProducto = async (id, producto) => {
    await (id ? actualizarProducto(id, producto) : crearProducto(producto))
    recargar()
  }

  const titulo = SECCIONES.find((s) => s.id === seccion).etiqueta

  return (
    <div className="admin-shell">
      <Sidebar seccion={seccion} onSeleccionar={setSeccion} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} onLogout={onLogout} />
      {menuAbierto && <div className="admin-backdrop d-lg-none" data-testid="backdrop" onClick={() => setMenuAbierto(false)} />}

      <div className="admin-main">
        <header className="navbar bg-white border-bottom px-3 sticky-top">
          <button type="button" className="btn btn-outline-success d-lg-none" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>☰</button>
          <h1 className="h5 mb-0 ms-2 me-auto">{titulo}</h1>
          <span className="small text-muted d-none d-sm-inline">Sesión: {usuario?.nombre ?? 'Administrador'}</span>
        </header>

        <main className="container-fluid p-3 p-md-4">
          <AnimatePresence>
            {error && (
              <motion.div className="alert alert-danger d-flex justify-content-between align-items-start" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <span>{error}</span>
                <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setError('')} />
              </motion.div>
            )}
          </AnimatePresence>

          {datos === null ? (
            !error && <p className="text-muted" role="status">Cargando datos del panel…</p>
          ) : (
            <motion.div key={seccion} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {seccion === 'resumen' && <ResumenPanel resumen={datos.resumen} citas={datos.citas} hoy={hoy} />}
              {seccion === 'citas' && (
                <CitasTable
                  citas={datos.citas}
                  onCambiarEstado={(id, estado) => intentar(() => cambiarEstadoCita(id, estado))}
                  onEliminar={(id) => intentar(() => eliminarCita(id))}
                />
              )}
              {seccion === 'productos' && (
                <ProductosPanel
                  productos={datos.productos}
                  categorias={datos.categorias}
                  onGuardar={guardarProducto}
                  onDarDeBaja={(id) => intentar(() => darDeBajaProducto(id))}
                />
              )}
              {seccion === 'usuarios' && (
                <UsuariosPanel
                  usuarios={datos.usuarios}
                  idActual={usuario?.id}
                  onAgregar={agregarUsuario}
                  onToggleActivo={(u) => intentar(() => cambiarActivoUsuario(u.id, !u.activo))}
                />
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
