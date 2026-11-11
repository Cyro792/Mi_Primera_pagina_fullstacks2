import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/** Mensaje breve de confirmación que aparece y se oculta solo después de unos segundos. */
export default function AvisoGuardado({ mensaje, onCerrar, duracion = 3000 }) {
  useEffect(() => {
    if (!mensaje) return undefined
    const temporizador = setTimeout(onCerrar, duracion)
    return () => clearTimeout(temporizador)
  }, [mensaje, onCerrar, duracion])

  return (
    <AnimatePresence>
      {mensaje && (
        <motion.div className="aviso-guardado" role="status" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
          <span className="aviso-guardado-icono">✓</span> {mensaje}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
