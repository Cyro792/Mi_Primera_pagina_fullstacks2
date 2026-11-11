import { motion } from 'motion/react'

const contenedor = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const elemento = {
  oculto: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

/** Contenedor cuyos hijos <CascadaItem> aparecen uno tras otro al entrar en pantalla. */
export function Cascada({ children, inmediata = false, ...resto }) {
  const disparo = inmediata
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount: 0.15 } }
  return (
    <motion.div variants={contenedor} initial="oculto" {...disparo} {...resto}>
      {children}
    </motion.div>
  )
}

export function CascadaItem({ children, ...resto }) {
  return (
    <motion.div variants={elemento} {...resto}>
      {children}
    </motion.div>
  )
}
