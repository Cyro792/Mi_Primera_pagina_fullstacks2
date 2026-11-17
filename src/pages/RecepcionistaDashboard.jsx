import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita,
  esEstadoFinal,
  ETIQUETA_ESTADO,
  listarCitas,
  solicitarCita,
} from '../services/citas.js'
import { listarProductos } from '../services/productos.js'
import { aISO } from '../utils/data.js'
import { citasDelDia, contarPorEstado } from '../utils/stats.js'
import CambioPassword from '../components/cuenta/CambioPassword.jsx'
import './recepcion.css'

// Formulario en blanco para una cita nueva. La fecha por defecto es hoy (hora local).
const formularioVacio = (servicios = []) => ({
  mascotaId: null,
  nombreMascota: '',
  nombreDueno: '',
  telefonoContacto: '',
  fecha: aISO(),
  hora: '10:00',
  servicioId: servicios[0]?.id ?? '',
  notas: '',
})

const ACCIONES = [
  { desde: 'PENDIENTE', hacia: 'CONFIRMADA', texto: 'Confirmar', clase: 'recepcion-boton--verde' },
  { desde: 'CONFIRMADA', hacia: 'COMPLETADA', texto: 'Marcar atendida', clase: 'recepcion-boton--azul' },
]

/** Panel de recepción: la agenda completa con alta, edición, cambio de estado y eliminación (API). */
export default function RecepcionistaDashboard({ onLogout }) {
  const { usuario } = useAuth()
  // Vista del panel: 'agenda' (citas) o 'clave' (cambiar la propia contraseña).
  const [vista, setVista] = useState('agenda')
  const [citas, setCitas] = useState(null)
  const [servicios, setServicios] = useState([])
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [citaEditando, setCitaEditando] = useState(null)
  const [form, setForm] = useState(formularioVacio)
  const [erroresForm, setErroresForm] = useState({})
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vigente = true
    Promise.all([listarCitas(), listarProductos({ tipo: 'SERVICIO' })])
      .then(([agenda, lista]) => {
        if (!vigente) return
        setCitas(agenda)
        setServicios(lista)
      })
      .catch((problema) => vigente && setError(problema.message))
    return () => {
      vigente = false
    }
  }, [version])

  const recargar = () => setVersion((v) => v + 1)

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

  const hoy = aISO()
  const porEstado = contarPorEstado(citas ?? [])
  const metricas = {
    hoy: citasDelDia(citas ?? [], hoy).length,
    pendientes: porEstado.PENDIENTE,
    activas: porEstado.PENDIENTE + porEstado.CONFIRMADA,
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErroresForm((actuales) => ({ ...actuales, [e.target.name]: undefined }))
  }

  const abrirModal = (cita = null) => {
    setCitaEditando(cita)
    setForm(cita ? { ...cita, telefonoContacto: cita.telefonoContacto ?? '', notas: cita.notas ?? '' } : formularioVacio(servicios))
    setErroresForm({})
    setErrorForm('')
    setMostrarModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (citaEditando) await actualizarCita(citaEditando.id, form)
      else await solicitarCita(form)
      setMostrarModal(false)
      recargar()
    } catch (problema) {
      setErroresForm(problema.errores ?? {})
      setErrorForm(problema.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = (cita) => {
    if (window.confirm(`¿Desea eliminar la cita de ${cita.nombreMascota}?`)) intentar(() => eliminarCita(cita.id))
  }

  const handleCancelar = (cita) => {
    if (window.confirm(`¿Cancelar la cita de ${cita.nombreMascota}?`)) intentar(() => cambiarEstadoCita(cita.id, 'CANCELADA'))
  }

  const campo = (nombre, etiqueta, props = {}) => (
    <div className="recepcion-campo">
      <label htmlFor={`r-${nombre}`}>{etiqueta}</label>
      <input id={`r-${nombre}`} name={nombre} value={form[nombre] ?? ''} onChange={handleChange} aria-invalid={erroresForm[nombre] ? 'true' : undefined} {...props} />
      {erroresForm[nombre] && <span className="recepcion-error">{erroresForm[nombre]}</span>}
    </div>
  )

  return (
    <div className="recepcion">
      <aside className="recepcion-lateral">
        <div>
          <div className="recepcion-marca">
            <h1>Veterinaria</h1>
            <h1 className="recepcion-marca-dorado">San Marcos</h1>
            <p>PANEL DE RECEPCIÓN</p>
          </div>
          <nav className="recepcion-menu" aria-label="Secciones del panel">
            <button type="button" className={vista === 'agenda' ? 'recepcion-menu-activo' : 'recepcion-menu-item'} aria-current={vista === 'agenda' ? 'page' : undefined} onClick={() => setVista('agenda')}>
              ❖ Citas y Reservas
            </button>
            <button type="button" className={vista === 'clave' ? 'recepcion-menu-activo' : 'recepcion-menu-item'} aria-current={vista === 'clave' ? 'page' : undefined} onClick={() => setVista('clave')}>
              ◍ Mi contraseña
            </button>
          </nav>
        </div>
        <button type="button" className="recepcion-salir" onClick={onLogout}>Cerrar sesión</button>
      </aside>

      <main className="recepcion-principal">
        <header className="recepcion-cabecera">
          <h2>{vista === 'clave' ? 'Mi contraseña' : 'Gestión de Reservas'}</h2>
          <span>Sesión: <strong>{usuario?.nombre ?? 'Recepcionista'}</strong></span>
        </header>

        {vista === 'clave' ? (
          <section className="recepcion-lista" style={{ maxWidth: '32rem' }}>
            <CambioPassword />
          </section>
        ) : (
        <>

        <AnimatePresence>
          {error && (
            <motion.div className="alert alert-danger d-flex justify-content-between" role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span>{error}</span>
              <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setError('')} />
            </motion.div>
          )}
        </AnimatePresence>

        <section className="recepcion-metricas">
          <div className="recepcion-metrica recepcion-metrica--verde">
            <span>CITAS DE HOY</span>
            <h3>{metricas.hoy}</h3>
          </div>
          <div className="recepcion-metrica recepcion-metrica--naranja">
            <span>PENDIENTES</span>
            <h3>{metricas.pendientes}</h3>
          </div>
          <div className="recepcion-metrica recepcion-metrica--azul">
            <span>POR ATENDER</span>
            <h3>{metricas.activas}</h3>
          </div>
        </section>

        <section className="recepcion-lista">
          <div className="recepcion-lista-cabecera">
            <h3>Próximas Citas y Reservas</h3>
            <button type="button" className="recepcion-boton recepcion-boton--principal" onClick={() => abrirModal()} disabled={citas === null}>
              + Nueva Reserva
            </button>
          </div>

          {citas === null && !error && <p className="text-muted" role="status">Cargando la agenda…</p>}
          {citas?.length === 0 && <p className="text-muted">No hay citas agendadas.</p>}

          <ul className="recepcion-filas" aria-label="Agenda">
            <AnimatePresence initial={false}>
              {citas?.map((c) => (
                <motion.li key={c.id} layout className="recepcion-fila" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <div>
                    <strong className="recepcion-mascota">{c.nombreMascota}</strong>
                    <span className="recepcion-dueno">· {c.nombreDueno}{c.telefonoContacto ? ` (${c.telefonoContacto})` : ''}</span>
                    <div className="recepcion-detalle">
                      {c.fecha} · {c.hora} hs — <em>{c.servicioNombre}</em>
                    </div>
                  </div>
                  <div className="recepcion-acciones">
                    <span className={`recepcion-estado recepcion-estado--${c.estado.toLowerCase()}`}>{ETIQUETA_ESTADO[c.estado]}</span>
                    {ACCIONES.filter((a) => a.desde === c.estado).map((a) => (
                      <button key={a.hacia} type="button" className={`recepcion-boton ${a.clase}`} onClick={() => intentar(() => cambiarEstadoCita(c.id, a.hacia))}>
                        {a.texto}
                      </button>
                    ))}
                    {!esEstadoFinal(c.estado) && (
                      <>
                        <button type="button" className="recepcion-boton" onClick={() => abrirModal(c)}>Editar / Cambiar</button>
                        <button type="button" className="recepcion-boton" onClick={() => handleCancelar(c)}>Cancelar</button>
                      </>
                    )}
                    {c.estado !== 'COMPLETADA' && (
                      <button type="button" className="recepcion-boton recepcion-boton--rojo" onClick={() => handleEliminar(c)}>Eliminar</button>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>

        <AnimatePresence>
          {mostrarModal && (
            <motion.div className="recepcion-modal-fondo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="recepcion-modal" role="dialog" aria-modal="true" aria-labelledby="recepcion-modal-titulo" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>
                <h3 id="recepcion-modal-titulo">{citaEditando ? 'Editar Reserva' : 'Nueva Reserva de Atención'}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  {form.mascotaId ? (
                    <p className="recepcion-nota">
                      Mascota registrada: <strong>{form.nombreMascota}</strong> de {form.nombreDueno}. Los datos de contacto salen de la cuenta del dueño.
                    </p>
                  ) : (
                    <>
                      {campo('nombreMascota', 'Nombre de la Mascota:', { type: 'text', required: true })}
                      {campo('nombreDueno', 'Nombre del Dueño:', { type: 'text', required: true })}
                      {campo('telefonoContacto', 'Teléfono de contacto:', { type: 'tel', required: true, placeholder: '+56 9 1234 5678' })}
                    </>
                  )}
                  <div className="recepcion-dos-columnas">
                    {campo('fecha', 'Fecha:', { type: 'date', required: true, min: citaEditando ? undefined : hoy })}
                    {campo('hora', 'Hora:', { type: 'time', required: true })}
                  </div>
                  <div className="recepcion-campo">
                    <label htmlFor="r-servicioId">Servicio:</label>
                    <select id="r-servicioId" name="servicioId" value={form.servicioId} onChange={handleChange}>
                      {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                  {campo('notas', 'Notas:', { type: 'text', placeholder: 'Opcional' })}

                  {errorForm && <div className="alert alert-danger small py-2 mb-0" role="alert">{errorForm}</div>}

                  <div className="recepcion-modal-botones">
                    <button type="button" className="recepcion-boton" onClick={() => setMostrarModal(false)}>Cancelar</button>
                    <button type="submit" className="recepcion-boton recepcion-boton--principal" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar Reserva'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </main>
    </div>
  )
}
