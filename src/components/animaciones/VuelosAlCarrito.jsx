import { motion } from 'motion/react'
import { useCarrito } from '../../context/CarritoContext.jsx'

const MITAD = 18

function destino() {
  const icono = document.getElementById('icono-carrito')
  if (!icono) return { x: window.innerWidth - 60, y: 30 }
  const { left, top, width, height } = icono.getBoundingClientRect()
  return { x: left + width / 2, y: top + height / 2 }
}

/**
 * Dibuja el ícono de cada producto recién agregado "volando" en arco desde el botón
 * hasta el carrito de la barra de navegación. Los vuelos los registra CarritoContext.
 */
export default function VuelosAlCarrito() {
  const { vuelos, terminarVuelo } = useCarrito()
  return (
    <div aria-hidden="true">
      {vuelos.map((vuelo) => {
        const fin = destino()
        const cima = Math.min(vuelo.y, fin.y) - 90
        return (
          <motion.span
            key={vuelo.id}
            className="vuelo-carrito"
            initial={{ x: vuelo.x - MITAD, y: vuelo.y - MITAD, scale: 1, opacity: 1 }}
            animate={{ x: fin.x - MITAD, y: [vuelo.y - MITAD, cima, fin.y - MITAD], scale: [1, 1.5, 0.35], opacity: [1, 1, 0.5] }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onAnimationComplete={() => terminarVuelo(vuelo.id)}
          >
            {vuelo.icono}
          </motion.span>
        )
      })}
    </div>
  )
}
