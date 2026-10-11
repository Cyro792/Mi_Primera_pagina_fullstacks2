import { citasDelDia, citasPorServicio, contarPorEstado, formatoCLP, ingresosEstimados, proximasCitas } from '../stats.js'
import StatCard from './StatCard.jsx'
import BarChart from './BarChart.jsx'
import EstadoBadge from './EstadoBadge.jsx'

export default function ResumenPanel({ citas, usuarios, hoy }) {
  const porEstado = contarPorEstado(citas)
  const activos = usuarios.filter((u) => u.activo).length
  const proximas = proximasCitas(citas, hoy)

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Citas de hoy" valor={citasDelDia(citas, hoy).length} detalle="Sin contar canceladas" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Pendientes" valor={porEstado.Pendiente} detalle="Por confirmar" variante="warning" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Usuarios activos" valor={activos} detalle={`de ${usuarios.length} registrados`} variante="primary" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Ingresos estimados" valor={formatoCLP(ingresosEstimados(citas))} detalle="Citas completadas" variante="success" /></div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7"><BarChart titulo="Citas por servicio" datos={citasPorServicio(citas)} /></div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Próximas citas</h2>
              <ul className="list-group list-group-flush">
                {proximas.map((c) => (
                  <li key={c.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.mascota}</strong> <span className="text-muted">· {c.cliente}</span>
                      <div className="small text-muted">{c.fecha} · {c.hora} · {c.servicio}</div>
                    </div>
                    <EstadoBadge estado={c.estado} />
                  </li>
                ))}
                {proximas.length === 0 && <li className="list-group-item px-0 text-muted">No hay citas próximas.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
