import { motion, useScroll, useSpring } from 'motion/react'

/** Línea superior que se va llenando a medida que se baja por la página. */
export default function BarraProgreso() {
  const { scrollYProgress } = useScroll()
  const escala = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 })
  return <motion.div className="barra-progreso" style={{ scaleX: escala }} aria-hidden="true" />
}
