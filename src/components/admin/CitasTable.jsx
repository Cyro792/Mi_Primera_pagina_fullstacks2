import { useState } from 'react'
import { esEstadoFinal, ESTADOS_CITA, estadosSiguientes, ETIQUETA_ESTADO } from '../../services/citas.js'
import { filtrarCitas } from '../../utils/stats.js'
import EstadoBadge from './EstadoBadge.jsx'

/**
 * Agenda completa con filtros. El cambio de estado solo ofrece las transiciones permitidas
 * (las mismas que valida el backend) y las citas completadas no se pueden eliminar.
 */
export default function CitasTable({ citas, onCambiarEstado, onEliminar }) {
  const [estado, setEstado] = useState('TODAS')
  const [texto, setTexto] = useState('')
  const visibles = filtrarCitas(citas, { estado, texto })

  const eliminar = (cita) => {
    if (window.confirm(`¿Eliminar la cita de ${cita.nombreMascota} (${cita.nombreDueno})?`)) onEliminar(cita.id)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por cliente o mascota…"
              aria-label="Buscar cita"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6">
            <select className="form-select" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="TODAS">Todos los estados</option>
              {ESTADOS_CITA.map((e) => (
                <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha</th><th>Cliente</th><th>Mascota</th><th>Servicio</th><th>Estado</th><th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((c) => (
                <tr key={c.id}>
                  <td className="text-nowrap">{c.fecha} · {c.hora}</td>
                  <td>{c.nombreDueno}</td>
                  <td>{c.nombreMascota}</td>
                  <td>{c.servicioNombre}</td>
                  <td><EstadoBadge estado={c.estado} /></td>
                  <td className="text-end text-nowrap">
                    <select
                      className="form-select form-select-sm d-inline-block w-auto me-2"
                      aria-label={`Cambiar estado de la cita ${c.id}`}
                      value={c.estado}
                      disabled={esEstadoFinal(c.estado)}
                      onChange={(e) => onCambiarEstado(c.id, e.target.value)}
                    >
                      {[c.estado, ...estadosSiguientes(c.estado)].map((e) => (
                        <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      aria-label={`Eliminar la cita ${c.id}`}
                      disabled={c.estado === 'COMPLETADA'}
                      title={c.estado === 'COMPLETADA' ? 'Las citas completadas son parte del historial clínico' : undefined}
                      onClick={() => eliminar(c)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">No hay citas que coincidan con el filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
