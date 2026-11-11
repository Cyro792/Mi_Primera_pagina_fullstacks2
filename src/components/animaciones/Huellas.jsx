import { motion } from 'motion/react'
import Huella from './Huella.jsx'

const rastro = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.16 } },
}

const paso = {
  oculto: { opacity: 0, scale: 0.3 },
  visible: { opacity: [0, 1, 0.45], scale: [0.3, 1.15, 1], transition: { duration: 0.9, times: [0, 0.45, 1] } },
}

/**
 * Rastro de huellas que "camina" de izquierda a derecha cuando la sección entra en pantalla.
 * Las huellas alternan arriba y abajo, como los pasos de una mascota. Es decorativo.
 */
export default function Huellas({ cantidad = 9, color = '#2A6049' }) {
  return (
    <motion.div
      className="rastro-huellas"
      style={{ color }}
      variants={rastro}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      aria-hidden="true"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <motion.span key={i} variants={paso} style={{ display: 'inline-flex', y: i % 2 === 0 ? -10 : 10, rotate: i % 2 === 0 ? 78 : 102 }}>
          <Huella tamano={26} />
        </motion.span>
      ))}
    </motion.div>
  )
}
