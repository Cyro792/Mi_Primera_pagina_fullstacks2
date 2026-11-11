import { AnimatePresence, motion } from 'motion/react'
import { AVATAR_INICIAL } from '../services/perfil.js'

/** Burbuja con el ícono y el color que el cliente eligió. Al cambiar, el ícono "rebota". */
export default function Avatar({ avatar, tamano = 'chico', etiqueta }) {
  const { icono, color } = { ...AVATAR_INICIAL, ...avatar }
  return (
    <span
      className={`avatar avatar--${tamano}`}
      style={{ backgroundColor: color }}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={icono} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 40 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
          {icono}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
