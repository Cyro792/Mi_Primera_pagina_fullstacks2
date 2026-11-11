import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { motion } from 'motion/react'
import ConfetiHuellas from './animaciones/ConfetiHuellas.jsx'
import { describirTarjeta } from '../utils/tarjeta.js'
import { formatoCLP } from '../utils/stats.js'

/** Confirmación de una compra pagada: visto animado, confeti y datos de la boleta. */
export default function CompraExitosa({ boleta }) {
  return (
    <Container className="contenedor seccion">
      <motion.div className="tarjeta tarjeta--exito text-center mx-auto position-relative" style={{ maxWidth: '34rem' }} role="status" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
        <ConfetiHuellas />
        <svg className="exito-visto" viewBox="0 0 64 64" aria-hidden="true">
          <motion.circle cx="32" cy="32" r="28" fill="none" stroke="#2A6049" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
          <motion.path d="M20 33 l9 9 l16 -18" fill="none" stroke="#2A6049" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5 }} />
        </svg>
        <h1 className="font-display h3 mb-2">¡Gracias por tu compra!</h1>
        <p className="texto-suave mb-1">Tu boleta N° {boleta.id} fue generada correctamente.</p>
        <p className="fw-semibold mb-1">Total pagado: {formatoCLP(boleta.total)}</p>
        {boleta.medioPago && (
          <p className="texto-suave small mb-4">
            Pagado con {describirTarjeta(boleta.medioPago)} · Autorización {boleta.medioPago.codigoAutorizacion}
          </p>
        )}
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to="/mis-compras" className="btn btn-vet">Ver mis compras</Link>
          <Link to="/tienda" className="btn btn-vet-contorno">Seguir comprando</Link>
        </div>
      </motion.div>
    </Container>
  )
}
