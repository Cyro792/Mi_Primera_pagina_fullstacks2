import { useState } from 'react'
import { ESTADOS } from '../data.js'
import { filtrarCitas } from '../stats.js'
import EstadoBadge from './EstadoBadge.jsx'

export default function CitasTable({ citas, onCambiarEstado, onEliminar }) {
  const [estado, setEstado] = useState('Todas')
  const [texto, setTexto] = useState('')
  const visibles = filtrarCitas(citas, { estado, texto })

  const eliminar = (cita) => {
    if (window.confirm(`¿Eliminar la cita de ${cita.mascota} (${cita.cliente})?`)) onEliminar(cita.id)
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
              <option value="Todas">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
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
                  <td>{c.cliente}</td>
                  <td>{c.mascota}</td>
                  <td>{c.servicio}</td>
                  <td><EstadoBadge estado={c.estado} /></td>
                  <td className="text-end text-nowrap">
                    <select
                      className="form-select form-select-sm d-inline-block w-auto me-2"
                      aria-label={`Cambiar estado de la cita ${c.id}`}
                      value={c.estado}
                      onChange={(e) => onCambiarEstado(c.id, e.target.value)}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Eliminar la cita ${c.id}`} onClick={() => eliminar(c)}>
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
