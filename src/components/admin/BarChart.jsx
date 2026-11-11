export default function BarChart({ titulo, datos }) {
  const max = Math.max(1, ...datos.map((d) => d.valor))
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h2 className="h6 mb-3">{titulo}</h2>
        {datos.length === 0 && <p className="text-muted small mb-0">Sin datos para mostrar.</p>}
        {datos.map((d) => (
          <div key={d.etiqueta} className="mb-2">
            <div className="d-flex justify-content-between small">
              <span>{d.etiqueta}</span>
              <strong>{d.valor}</strong>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${(d.valor / max) * 100}%` }}
                aria-valuenow={d.valor}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={d.etiqueta}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
