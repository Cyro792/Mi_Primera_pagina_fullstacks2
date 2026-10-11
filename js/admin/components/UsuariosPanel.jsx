import { useState } from 'react'
import { ROLES } from '../data.js'
import { validarUsuario } from '../validators.js'

const VACIO = { nombre: '', email: '', rol: '' }

export default function UsuariosPanel({ usuarios, onAgregar, onToggleActivo }) {
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    const nuevos = validarUsuario(valores, usuarios)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    onAgregar({ nombre: valores.nombre.trim(), email: valores.email.trim().toLowerCase(), rol: valores.rol })
    setValores(VACIO)
  }

  const clase = (campo) => `form-control${errores[campo] ? ' is-invalid' : ''}`

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <form className="card shadow-sm" onSubmit={enviar} noValidate aria-label="Nuevo usuario">
          <div className="card-body">
            <h2 className="h6 mb-3">Nuevo usuario</h2>
            <div className="mb-3">
              <label htmlFor="u-nombre" className="form-label">Nombre completo</label>
              <input id="u-nombre" name="nombre" className={clase('nombre')} value={valores.nombre} onChange={cambiar} />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="u-email" className="form-label">Correo</label>
              <input id="u-email" name="email" type="email" className={clase('email')} value={valores.email} onChange={cambiar} />
              {errores.email && <div className="invalid-feedback">{errores.email}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="u-rol" className="form-label">Rol</label>
              <select id="u-rol" name="rol" className={`form-select${errores.rol ? ' is-invalid' : ''}`} value={valores.rol} onChange={cambiar}>
                <option value="">Seleccionar…</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errores.rol && <div className="invalid-feedback">{errores.rol}</div>}
            </div>
            <button type="submit" className="btn btn-success w-100">Agregar usuario</button>
          </div>
        </form>
      </div>

      <div className="col-12 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6 mb-3">Usuarios del sistema ({usuarios.length})</h2>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th className="text-end">Acción</th></tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td><span className="badge text-bg-light border">{u.rol}</span></td>
                      <td>{u.activo ? <span className="badge text-bg-success">Activo</span> : <span className="badge text-bg-secondary">Inactivo</span>}</td>
                      <td className="text-end">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onToggleActivo(u.id)}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
