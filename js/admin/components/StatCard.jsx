export default function StatCard({ titulo, valor, detalle, variante = 'success' }) {
  return (
    <div className="card shadow-sm h-100" style={{ borderLeft: `4px solid var(--bs-${variante})` }} data-testid="stat-card">
      <div className="card-body">
        <p className="text-uppercase small text-muted mb-1">{titulo}</p>
        <p className="h3 mb-1">{valor}</p>
        {detalle && <p className="small text-muted mb-0">{detalle}</p>}
      </div>
    </div>
  )
}
