import { motion } from 'motion/react'

const DESPLAZAMIENTOS = {
  abajo: { y: 36 },
  izquierda: { x: -48 },
  derecha: { x: 48 },
  zoom: { scale: 0.9 },
}

/**
 * Hace que su contenido aparezca suavemente la primera vez que entra en pantalla al hacer scroll.
 * desde: dirección desde la que entra ('abajo', 'izquierda', 'derecha' o 'zoom').
 */
export default function Aparecer({ children, desde = 'abajo', retraso = 0, etiqueta = 'div', ...resto }) {
  const Etiqueta = motion[etiqueta]
  return (
    <Etiqueta
      initial={{ opacity: 0, ...DESPLAZAMIENTOS[desde] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}
