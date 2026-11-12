import { useState } from 'react'
import { formatoCLP } from '../../utils/stats.js'

const VACIO = { nombre: '', descripcion: '', precio: '', tipo: 'PRODUCTO', stock: '', duracionMin: '', categoriaId: '' }

function aFormulario(p) {
  return {
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    precio: String(p.precio),
    tipo: p.tipo,
    stock: p.stock == null ? '' : String(p.stock),
    duracionMin: p.duracionMin == null ? '' : String(p.duracionMin),
    categoriaId: String(p.categoriaId),
  }
}

/** Convierte el formulario al cuerpo que espera la API (números y solo el campo que corresponde al tipo). */
function aPeticion(v, activo = true) {
  const esServicio = v.tipo === 'SERVICIO'
  return {
    nombre: v.nombre.trim(),
    descripcion: v.descripcion.trim() || null,
    precio: Number(v.precio),
    tipo: v.tipo,
    stock: esServicio ? null : Number(v.stock),
    duracionMin: esServicio ? Number(v.duracionMin) : null,
    categoriaId: Number(v.categoriaId),
    activo,
  }
}

function validarProducto(v) {
  const errores = {}
  if (v.nombre.trim().length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!(Number(v.precio) > 0)) errores.precio = 'El precio debe ser mayor que 0.'
  if (v.tipo === 'PRODUCTO' && !(v.stock !== '' && Number(v.stock) >= 0 && Number.isInteger(Number(v.stock)))) {
    errores.stock = 'Indica el stock (0 o más unidades).'
  }
  if (v.tipo === 'SERVICIO' && !(Number(v.duracionMin) > 0)) errores.duracionMin = 'Indica la duración en minutos.'
  if (!v.categoriaId) errores.categoriaId = 'Selecciona una categoría.'
  return errores
}

/**
 * Catálogo de la tienda (CRUD de productos y servicios). "Dar de baja" lo oculta de la tienda
 * sin borrarlo, porque las boletas antiguas lo siguen nombrando.
 */
export default function ProductosPanel({ productos, categorias, onGuardar, onDarDeBaja }) {
  const [valores, setValores] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cambiar = (e) => {
    setValores({ ...valores, [e.target.name]: e.target.value })
    setErrores((actuales) => ({ ...actuales, [e.target.name]: undefined }))
  }

  const limpiar = () => {
    setEditando(null)
    setValores(VACIO)
    setErrores({})
  }

  const editar = (producto) => {
    setEditando(producto)
    setValores(aFormulario(producto))
    setErrores({})
  }

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validarProducto(valores)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setEnviando(true)
    try {
      await onGuardar(editando?.id ?? null, aPeticion(valores, editando ? editando.activo : true))
      limpiar()
    } catch (problema) {
      setErrores({ general: problema.message, ...problema.errores })
    } finally {
      setEnviando(false)
    }
  }

  const reactivar = async (producto) => {
    try {
      await onGuardar(producto.id, aPeticion(aFormulario(producto), true))
    } catch (problema) {
      setErrores({ general: problema.message })
    }
  }

  const clase = (campo, base = 'form-control') => `${base}${errores[campo] ? ' is-invalid' : ''}`
  const error = (campo) => errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <form className="card shadow-sm" onSubmit={enviar} noValidate aria-label={editando ? 'Editar producto' : 'Nuevo producto'}>
          <div className="card-body">
            <h2 className="h6 mb-3">{editando ? `Editar: ${editando.nombre}` : 'Nuevo producto o servicio'}</h2>
            <div className="mb-3">
              <label htmlFor="p-nombre" className="form-label">Nombre</label>
              <input id="p-nombre" name="nombre" className={clase('nombre')} value={valores.nombre} onChange={cambiar} />
              {error('nombre')}
            </div>
            <div className="mb-3">
              <label htmlFor="p-descripcion" className="form-label">Descripción</label>
              <textarea id="p-descripcion" name="descripcion" rows={2} className={clase('descripcion')} value={valores.descripcion} onChange={cambiar} />
              {error('descripcion')}
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label htmlFor="p-tipo" className="form-label">Tipo</label>
                <select id="p-tipo" name="tipo" className="form-select" value={valores.tipo} onChange={cambiar}>
                  <option value="PRODUCTO">Producto</option>
                  <option value="SERVICIO">Servicio</option>
                </select>
              </div>
              <div className="col-6">
                <label htmlFor="p-precio" className="form-label">Precio (CLP)</label>
                <input id="p-precio" name="precio" type="number" min="1" className={clase('precio')} value={valores.precio} onChange={cambiar} />
                {error('precio')}
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                {valores.tipo === 'PRODUCTO' ? (
                  <>
                    <label htmlFor="p-stock" className="form-label">Stock</label>
                    <input id="p-stock" name="stock" type="number" min="0" className={clase('stock')} value={valores.stock} onChange={cambiar} />
                    {error('stock')}
                  </>
                ) : (
                  <>
                    <label htmlFor="p-duracion" className="form-label">Duración (min)</label>
                    <input id="p-duracion" name="duracionMin" type="number" min="1" className={clase('duracionMin')} value={valores.duracionMin} onChange={cambiar} />
                    {error('duracionMin')}
                  </>
                )}
              </div>
              <div className="col-6">
                <label htmlFor="p-categoria" className="form-label">Categoría</label>
                <select id="p-categoria" name="categoriaId" className={clase('categoriaId', 'form-select')} value={valores.categoriaId} onChange={cambiar}>
                  <option value="">Seleccionar…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {error('categoriaId')}
              </div>
            </div>
            {errores.general && <div className="alert alert-danger small py-2" role="alert">{errores.general}</div>}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success flex-grow-1" disabled={enviando}>
                {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar al catálogo'}
              </button>
              {editando && <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Cancelar</button>}
            </div>
          </div>
        </form>
      </div>

      <div className="col-12 col-xl-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6 mb-3">Catálogo ({productos.length})</h2>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Nombre</th><th>Categoría</th><th className="text-end">Precio</th><th className="text-center">Stock</th><th>Estado</th><th className="text-end">Acciones</th></tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id} className={p.activo ? undefined : 'text-muted'}>
                      <td>{p.nombre}</td>
                      <td className="small">{p.categoriaNombre}</td>
                      <td className="text-end">{formatoCLP(p.precio)}</td>
                      <td className="text-center">{p.tipo === 'SERVICIO' ? `${p.duracionMin} min` : p.stock}</td>
                      <td>{p.activo ? <span className="badge text-bg-success">En venta</span> : <span className="badge text-bg-secondary">De baja</span>}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-success me-2" onClick={() => editar(p)} aria-label={`Editar ${p.nombre}`}>Editar</button>
                        {p.activo ? (
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => window.confirm(`¿Dar de baja "${p.nombre}"? Dejará de verse en la tienda.`) && onDarDeBaja(p.id)} aria-label={`Dar de baja ${p.nombre}`}>
                            Dar de baja
                          </button>
                        ) : (
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => reactivar(p)} aria-label={`Reactivar ${p.nombre}`}>Reactivar</button>
                        )}
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
