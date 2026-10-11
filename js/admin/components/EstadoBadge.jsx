const CLASES = {
  Pendiente: 'text-bg-warning',
  Confirmada: 'text-bg-primary',
  Completada: 'text-bg-success',
  Cancelada: 'text-bg-secondary',
}

export default function EstadoBadge({ estado }) {
  return <span className={`badge ${CLASES[estado] ?? 'text-bg-light'}`}>{estado}</span>
}
