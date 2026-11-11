import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { motion } from 'motion/react'
import { useCarrito } from '../context/CarritoContext.jsx'
import { fondoProducto, iconoProducto } from '../data/catalogo.js'
import { obtenerProducto } from '../services/productos.js'
import { maximoPermitido } from '../utils/carrito.js'
import { formatoCLP } from '../utils/stats.js'

/** Detalle de un producto (/producto/:id) con selector de cantidad. */
export default function DetalleProducto() {
  const { id } = useParams()
  // key: al pasar de un producto a otro, el detalle parte de cero (cargando y cantidad 1).
  return <Detalle key={id} id={id} />
}

function Detalle({ id }) {
  const { items, agregar } = useCarrito()
  // undefined = cargando, null = no existe.
  const [producto, setProducto] = useState(undefined)
  const [cantidad, setCantidad] = useState(1)

  useEffect(() => {
    let vigente = true
    obtenerProducto(id).then((encontrado) => {
      if (vigente) setProducto(encontrado)
    })
    return () => {
      vigente = false
    }
  }, [id])

  if (producto === undefined) {
    return (
      <Container className="contenedor seccion text-center texto-suave" role="status">
        Cargando producto…
      </Container>
    )
  }

  if (producto === null) {
    return (
      <Container className="contenedor seccion text-center">
        <h1 className="font-display h3">Producto no encontrado</h1>
        <p className="texto-suave">El producto que buscas no existe o ya no está disponible.</p>
        <Link to="/tienda" className="btn btn-vet">Volver a la tienda</Link>
      </Container>
    )
  }

  const esServicio = producto.tipo === 'SERVICIO'
  const enCarrito = items.find((i) => i.id === producto.id)?.cantidad ?? 0
  const disponible = maximoPermitido(producto) - enCarrito
  const sinStock = disponible <= 0

  const alAgregar = (evento) => {
    agregar(producto, cantidad, evento.currentTarget)
    setCantidad(1)
  }

  return (
    <section className="seccion">
      <Container className="contenedor">
        <Link to="/tienda" className="enlace-volver">← Volver a la tienda</Link>
        <Row className="gx-4 gy-5 align-items-center mt-1">
          <Col md={6}>
            <motion.div
              className="detalle-imagen"
              style={{ background: fondoProducto(producto) }}
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            >
              <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
                {iconoProducto(producto)}
              </motion.span>
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
              <p className="sobretitulo">{producto.categoriaNombre}</p>
              <h1 className="font-display mb-3">{producto.nombre}</h1>
              <p className="texto-suave fs-5">{producto.descripcion}</p>

              <div className="d-flex flex-wrap gap-2 my-3">
                <span className="insignia">{esServicio ? 'Servicio de la clínica' : 'Producto'}</span>
                {esServicio ? (
                  <span className="insignia">Duración: {producto.duracionMin} min</span>
                ) : (
                  <span className="insignia">{producto.stock} en stock</span>
                )}
              </div>

              <div className="detalle-precio font-display">{formatoCLP(producto.precio)}</div>

              <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                <div className="cantidad" role="group" aria-label="Cantidad">
                  <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1} aria-label="Disminuir cantidad">−</button>
                  <output aria-live="polite">{cantidad}</output>
                  <button type="button" onClick={() => setCantidad((c) => Math.min(disponible, c + 1))} disabled={cantidad >= disponible} aria-label="Aumentar cantidad">+</button>
                </div>
                <button type="button" className="btn btn-vet px-4 py-2" onClick={alAgregar} disabled={sinStock}>
                  {sinStock ? 'Sin stock disponible' : 'Agregar al carrito'}
                </button>
              </div>

              {enCarrito > 0 && (
                <p className="texto-suave small mt-3 mb-0">
                  Ya tienes {enCarrito} en tu carrito. <Link to="/carrito">Ver carrito</Link>
                </p>
              )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
