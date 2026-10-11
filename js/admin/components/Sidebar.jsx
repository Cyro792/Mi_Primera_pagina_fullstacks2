export const SECCIONES = [
  { id: 'resumen', etiqueta: 'Resumen', icono: '◈' },
  { id: 'citas', etiqueta: 'Citas', icono: '◎' },
  { id: 'usuarios', etiqueta: 'Usuarios', icono: '◉' },
]

export default function Sidebar({ seccion, onSeleccionar, abierto, onCerrar, onLogout }) {
  return (
    <aside className={`admin-sidebar d-flex flex-column${abierto ? ' abierto' : ''}`} aria-label="Navegación del panel">
      <div className="p-4 border-bottom border-secondary-subtle">
        <div className="admin-brand">Veterinaria</div>
        <div className="admin-brand fst-italic" style={{ color: '#c8952a' }}>San Marcos</div>
        <div className="small text-uppercase mt-2" style={{ letterSpacing: '0.2em', opacity: 0.6 }}>Panel de administración</div>
      </div>
      <nav className="nav flex-column p-3 flex-grow-1">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`nav-link text-start${seccion === s.id ? ' active' : ''}`}
            aria-current={seccion === s.id ? 'page' : undefined}
            onClick={() => { onSeleccionar(s.id); onCerrar() }}
          >
            <span className="me-2">{s.icono}</span>{s.etiqueta}
          </button>
        ))}
      </nav>
      <div className="p-3 border-top border-secondary-subtle">
        <button type="button" className="btn btn-outline-light w-100" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
