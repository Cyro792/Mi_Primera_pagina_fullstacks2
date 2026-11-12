import { ETIQUETA_ESTADO } from '../../services/citas.js'

const CLASES = {
  PENDIENTE: 'text-bg-warning',
  CONFIRMADA: 'text-bg-primary',
  COMPLETADA: 'text-bg-success',
  CANCELADA: 'text-bg-secondary',
}

export default function EstadoBadge({ estado }) {
  return <span className={`badge ${CLASES[estado] ?? 'text-bg-light'}`}>{ETIQUETA_ESTADO[estado] ?? estado}</span>
}
