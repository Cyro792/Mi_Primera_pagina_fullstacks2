import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useCarrito } from '../context/CarritoContext.jsx'
import { fondoProducto, iconoProducto } from '../data/catalogo.js'
import { maximoPermitido } from '../utils/carrito.js'
import { formatoCLP } from '../utils/stats.js'

/** Tarjeta de un producto o servicio de la tienda, con botón para agregarlo al carrito. */
export default function ProductoCard({ producto }) {
  const { items, agregar } = useCarrito()
  const [recienAgregado, setRecienAgregado] = useState(false)

  const enCarrito = items.find((i) => i.id === producto.id)?.cantidad ?? 0
  const agotado = enCarrito >= maximoPermitido(producto)
  const esServicio = producto.tipo === 'SERVICIO'

  useEffect(() => {
    if (!recienAgregado) return undefined
    const temporizador = setTimeout(() => setRecienAgregado(false), 1300)
    return () => clearTimeout(temporizador)
  }, [recienAgregado])

  const alAgregar = (evento) => {
    agregar(producto, 1, evento.currentTarget)
    setRecienAgregado(true)
  }

  return (
    <motion.article className="producto-tarjeta h-100" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
      <Link to={`/producto/${producto.id}`} className="producto-imagen" style={{ background: fondoProducto(producto) }} aria-label={`Ver detalle de ${producto.nombre}`}>
        <motion.span className="producto-icono" whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.12 }} transition={{ duration: 0.6 }}>
          {iconoProducto(producto)}
        </motion.span>
        <span className="insignia insignia--tipo">{esServicio ? `Servicio · ${producto.duracionMin} min` : 'Producto'}</span>
      </Link>

      <div className="producto-cuerpo">
        <p className="producto-categoria">{producto.categoriaNombre}</p>
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-descripcion">{producto.descripcion}</p>

        <div className="d-flex align-items-end justify-content-between mt-auto pt-3">
          <div>
            <div className="producto-precio">{formatoCLP(producto.precio)}</div>
            {!esServicio && <div className="producto-stock">{producto.stock} disponibles</div>}
          </div>
          <button
            type="button"
            className={`btn btn-vet btn-sm${recienAgregado ? ' btn-vet--listo' : ''}`}
            onClick={alAgregar}
            disabled={agotado}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            {agotado ? 'Sin stock' : recienAgregado ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
