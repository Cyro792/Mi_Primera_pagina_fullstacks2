import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

/** Número que cuenta desde 0 hasta su valor cuando entra en pantalla. */
export default function Contador({ valor, duracion = 1.6, prefijo = '', sufijo = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, amount: 0.6 })
  const sinMovimiento = useReducedMotion()
  const [animado, setAnimado] = useState(0)

  useEffect(() => {
    if (!visible || sinMovimiento) return undefined
    const animacion = animate(0, valor, {
      duration: duracion,
      ease: 'easeOut',
      onUpdate: (actual) => setAnimado(Math.round(actual)),
    })
    return () => animacion.stop()
  }, [visible, valor, duracion, sinMovimiento])

  // Con "reducir movimiento" activado se muestra el valor final directamente.
  const mostrado = sinMovimiento ? valor : animado

  return (
    <span ref={ref} aria-label={`${prefijo}${valor}${sufijo}`}>
      {prefijo}
      {mostrado.toLocaleString('es-CL')}
      {sufijo}
    </span>
  )
}
