import { useState } from 'react'
import { motion } from 'motion/react'

const SIMBOLOS = ['🐾', '🦴', '✨', '🐾', '💚']

function crearPiezas(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.5
    const distancia = 110 + Math.random() * 150
    return {
      id: i,
      simbolo: SIMBOLOS[i % SIMBOLOS.length],
      x: Math.cos(angulo) * distancia,
      y: Math.sin(angulo) * distancia - 40,
      giro: (Math.random() - 0.5) * 540,
      retraso: Math.random() * 0.15,
      tamano: 18 + Math.random() * 16,
    }
  })
}

/** Explosión de huellas y huesitos que celebra una compra exitosa. Es decorativa. */
export default function ConfetiHuellas({ cantidad = 22 }) {
  // Las posiciones al azar se calculan una sola vez, al montar el componente.
  const [piezas] = useState(() => crearPiezas(cantidad))
  return (
    <div className="confeti" aria-hidden="true" data-testid="confeti">
      {piezas.map((p) => (
        <motion.span
          key={p.id}
          className="confeti-pieza"
          style={{ fontSize: p.tamano }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 90], opacity: [0, 1, 1, 0], scale: [0.2, 1.2, 1, 0.8], rotate: p.giro }}
          transition={{ duration: 1.7, delay: p.retraso, ease: 'easeOut' }}
        >
          {p.simbolo}
        </motion.span>
      ))}
    </div>
  )
}
