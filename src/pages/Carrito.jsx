import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import { AnimatePresence, motion } from 'motion/react'
import Huella from '../components/animaciones/Huella.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { fondoProducto, iconoProducto } from '../data/catalogo.js'
import { ROLES } from '../services/auth.js'
import { maximoPermitido } from '../utils/carrito.js'
import { formatoCLP } from '../utils/stats.js'

function CarritoVacio() {
  return (
    <Container className="contenedor seccion text-center">
      <motion.div className="vacio-icono" animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}>
        <Huella tamano={72} />
      </motion.div>
      <h1 className="font-display h3 mt-3">Tu carrito está vacío</h1>
      <p className="texto-suave">Agrega servicios o productos de la tienda para comenzar tu compra.</p>
      <Link to="/tienda" className="btn btn-vet">Ir a la tienda</Link>
    </Container>
  )
}

/** Carrito de compras: revisar ítems y cambiar cantidades antes de ir a pagar (/pago). */
export default function Carrito() {
  const { items, total, cantidad, cambiarCantidad, quitar, vaciar } = useCarrito()
  const { usuario, tieneRol } = useAuth()

  if (items.length === 0) return <CarritoVacio />

  return (
    <section className="seccion">
      <Container className="contenedor">
        <p className="sobretitulo">Tu compra</p>
        <h1 className="font-display mb-4">Carrito de compras</h1>

        <Row className="g-4">
          <Col lg={8}>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    className="carrito-item"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60, height: 0, marginBottom: -16, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="carrito-item-icono" style={{ background: fondoProducto(item) }} aria-hidden="true">
                      {iconoProducto(item)}
                    </div>
                    <div className="flex-grow-1">
                      <Link to={`/producto/${item.id}`} className="carrito-item-nombre">{item.nombre}</Link>
                      <div className="texto-suave small">{formatoCLP(item.precio)} c/u</div>
                    </div>
                    <div className="cantidad cantidad--chica" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                      <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} aria-label={`Quitar una unidad de ${item.nombre}`}>−</button>
                      <output>{item.cantidad}</output>
                      <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} disabled={item.cantidad >= maximoPermitido(item)} aria-label={`Agregar una unidad de ${item.nombre}`}>+</button>
                    </div>
                    <div className="carrito-item-subtotal">{formatoCLP(item.precio * item.cantidad)}</div>
                    <button type="button" className="carrito-item-quitar" onClick={() => quitar(item.id)} aria-label={`Eliminar ${item.nombre} del carrito`}>×</button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <button type="button" className="btn btn-link texto-suave mt-3 px-0" onClick={vaciar}>Vaciar carrito</button>
          </Col>

          <Col lg={4}>
            <aside className="tarjeta resumen" aria-label="Resumen de la compra">
              <h2 className="h5 font-display mb-3">Resumen</h2>
              <div className="d-flex justify-content-between texto-suave mb-2">
                <span>Productos</span>
                <span>{cantidad}</span>
              </div>
              <div className="d-flex justify-content-between align-items-baseline border-top pt-3 mb-3">
                <span className="fw-semibold">Total</span>
                {/* Al cambiar el total, el número "salta" para llamar la atención. */}
                <motion.span key={total} className="resumen-total font-display" data-testid="total-carrito" initial={{ scale: 1.25, color: '#C96A2E' }} animate={{ scale: 1, color: '#1C1A17' }} transition={{ duration: 0.35 }}>
                  {formatoCLP(total)}
                </motion.span>
              </div>

              {!usuario && (
                <>
                  <Link to="/login" state={{ desde: '/carrito' }} className="btn btn-vet w-100">Inicia sesión para comprar</Link>
                  <p className="texto-suave small mt-2 mb-0">Tu carrito se guarda mientras inicias sesión.</p>
                </>
              )}
              {usuario && tieneRol(ROLES.CLIENTE) && (
                <Link to="/pago" className="btn btn-vet w-100">Ir a pagar</Link>
              )}
              {usuario && !tieneRol(ROLES.CLIENTE) && (
                <Alert variant="warning" className="py-2 small mb-0">
                  Las compras se realizan con una cuenta de cliente. Tu cuenta es del personal de la clínica.
                </Alert>
              )}
              <p className="texto-suave small mt-3 mb-0">En el siguiente paso eliges tu tarjeta. Pago simulado: no se realiza ningún cobro real.</p>
            </aside>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
