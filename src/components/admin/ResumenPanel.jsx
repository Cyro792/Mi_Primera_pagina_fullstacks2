import { formatoCLP, proximasCitas } from '../../utils/stats.js'
import StatCard from './StatCard.jsx'
import BarChart from './BarChart.jsx'
import EstadoBadge from './EstadoBadge.jsx'

/** Métricas del negocio. Los números vienen de GET /api/v1/reportes/resumen (calculados en el servidor). */
export default function ResumenPanel({ resumen, citas, hoy }) {
  const proximas = proximasCitas(citas, hoy)
  const masVendidos = resumen.ventasPorProducto.slice(0, 5)

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Citas de hoy" valor={resumen.citasDeHoy} detalle="Sin contar canceladas" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Pendientes" valor={resumen.citasPorEstado.PENDIENTE ?? 0} detalle="Por confirmar" variante="warning" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Clientes activos" valor={resumen.clientesActivos} detalle="Con cuenta en la tienda" variante="primary" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard titulo="Ventas de la tienda" valor={formatoCLP(resumen.ventasTotales)} detalle={`${resumen.boletasPagadas} boletas pagadas`} variante="success" /></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-7"><BarChart titulo="Citas por servicio" datos={resumen.citasPorServicio} /></div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Próximas citas</h2>
              <ul className="list-group list-group-flush">
                {proximas.map((c) => (
                  <li key={c.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.nombreMascota}</strong> <span className="text-muted">· {c.nombreDueno}</span>
                      <div className="small text-muted">{c.fecha} · {c.hora} · {c.servicioNombre}</div>
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

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Lo más vendido</h2>
              {masVendidos.length === 0 ? (
                <p className="text-muted small mb-0">Todavía no hay ventas.</p>
              ) : (
                <table className="table table-sm align-middle mb-0">
                  <thead><tr><th>Producto</th><th className="text-center">Unidades</th><th className="text-end">Monto</th></tr></thead>
                  <tbody>
                    {masVendidos.map((v) => (
                      <tr key={v.productoId}><td>{v.nombre}</td><td className="text-center">{v.unidades}</td><td className="text-end">{formatoCLP(v.monto)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Stock bajo</h2>
              {resumen.productosConStockBajo.length === 0 ? (
                <p className="text-muted small mb-0">Todo el inventario tiene stock suficiente.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {resumen.productosConStockBajo.map((p) => (
                    <li key={p.id} className="list-group-item px-0 d-flex justify-content-between">
                      <span>{p.nombre}</span>
                      <span className={`badge ${p.stock === 0 ? 'text-bg-danger' : 'text-bg-warning'}`}>{p.stock} en stock</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
