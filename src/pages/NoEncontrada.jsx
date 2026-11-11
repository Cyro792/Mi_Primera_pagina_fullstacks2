import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import { motion } from 'motion/react'
import Huella from '../components/animaciones/Huella.jsx'

/** Página 404: se muestra cuando la dirección no corresponde a ninguna ruta. */
export default function NoEncontrada() {
  return (
    <Container className="contenedor seccion text-center">
      <div className="d-flex justify-content-center gap-3 mb-3" style={{ color: '#2A6049' }} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} animate={{ opacity: [0.15, 1, 0.15] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }} style={{ rotate: i % 2 ? 20 : -20 }}>
            <Huella tamano={40} />
          </motion.span>
        ))}
      </div>
      <h1 className="font-display">Esta página se nos escapó</h1>
      <p className="texto-suave">La dirección que buscas no existe. Sigamos el rastro de vuelta al inicio.</p>
      <Link to="/" className="btn btn-vet">Volver al inicio</Link>
    </Container>
  )
}
