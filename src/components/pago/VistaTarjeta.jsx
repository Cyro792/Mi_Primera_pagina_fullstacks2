import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import LogoMarca from './LogoMarca.jsx'
import { GRADIENTE_NEUTRO, MARCAS, soloDigitos } from '../../utils/tarjeta.js'

const PLANTILLA = '#### #### #### ####'
const PLANTILLA_AMEX = '#### ###### #####'

/** Dígitos que se muestran en la tarjeta: los escritos, o solo los últimos 4 si es una tarjeta guardada. */
function caracteresDelNumero({ numero, ultimos4, marca }) {
  const plantilla = marca === 'AMEX' ? PLANTILLA_AMEX : PLANTILLA
  const huecos = plantilla.replace(/ /g, '').length
  const digitos = ultimos4 ? '•'.repeat(huecos - 4) + ultimos4 : soloDigitos(numero)
  let posicion = 0
  return [...plantilla].map((caracter) => (caracter === '#' ? digitos[posicion++] ?? '•' : ' '))
}

function Fondo({ marca }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={marca ?? 'ninguna'}
        className="tarjeta-fondo"
        style={{ background: MARCAS[marca]?.gradiente ?? GRADIENTE_NEUTRO }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </AnimatePresence>
  )
}

/**
 * Vista previa de la tarjeta que se actualiza mientras se escribe.
 * - Cambia de color según la marca detectada y cada dígito "cae" en su lugar al escribirlo.
 * - Se inclina siguiendo el mouse y gira para mostrar el reverso al escribir el CVV.
 * - Con `ultimos4` muestra una tarjeta guardada (•••• •••• •••• 1234).
 * Es decorativa: los datos reales se leen del formulario, por eso se oculta a los lectores de pantalla.
 */
export default function VistaTarjeta({ marca, numero = '', ultimos4, titular = '', vencimiento = '', cvv = '', volteada = false, compacta = false }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const inclinacionX = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 220, damping: 20 })
  const inclinacionY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 220, damping: 20 })

  const mover = (evento) => {
    const caja = evento.currentTarget.getBoundingClientRect()
    x.set((evento.clientX - caja.left) / caja.width - 0.5)
    y.set((evento.clientY - caja.top) / caja.height - 0.5)
  }
  const soltar = () => {
    x.set(0)
    y.set(0)
  }

  const caracteres = caracteresDelNumero({ numero, ultimos4, marca })
  const largoCvv = MARCAS[marca]?.cvv ?? 3

  return (
    <div className={`tarjeta-escena${compacta ? ' tarjeta-escena--compacta' : ''}`} onPointerMove={mover} onPointerLeave={soltar} aria-hidden="true">
      <motion.div className="tarjeta-inclinacion" style={{ rotateX: inclinacionX, rotateY: inclinacionY }}>
        <motion.div className="tarjeta-credito" animate={{ rotateY: volteada ? 180 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
          {/* Frente */}
          <div className="tarjeta-cara">
            <Fondo marca={marca} />
            <div className="tarjeta-brillo" />
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-2">
                <span className="tarjeta-chip" />
                <span className="tarjeta-contactless">)))</span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={marca ?? 'ninguna'} initial={{ opacity: 0, y: -8, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.8 }} transition={{ duration: 0.25 }}>
                  <LogoMarca marca={marca} className="logo-marca--en-tarjeta" />
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="tarjeta-numero">
              {caracteres.map((caracter, i) =>
                caracter === ' ' ? (
                  <span key={`espacio-${i}`} className="tarjeta-espacio" />
                ) : (
                  <motion.span key={`${i}-${caracter}`} className="tarjeta-digito" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                    {caracter}
                  </motion.span>
                ),
              )}
            </div>

            <div className="d-flex justify-content-between align-items-end gap-3">
              <div className="text-truncate">
                <div className="tarjeta-etiqueta">Titular</div>
                <div className="tarjeta-dato text-truncate">{titular.trim() || 'Nombre del titular'}</div>
              </div>
              <div className="text-end flex-shrink-0">
                <div className="tarjeta-etiqueta">Vence</div>
                <div className="tarjeta-dato">{vencimiento || 'MM/AA'}</div>
              </div>
            </div>
          </div>

          {/* Reverso */}
          <div className="tarjeta-cara tarjeta-cara--reverso">
            <Fondo marca={marca} />
            <div className="tarjeta-banda" />
            <div className="tarjeta-firma">
              <span className="tarjeta-cvv">{'•'.repeat(soloDigitos(cvv).length) || '•'.repeat(largoCvv)}</span>
            </div>
            <div className="tarjeta-reverso-pie">
              <span>Código de seguridad</span>
              <LogoMarca marca={marca} className="logo-marca--en-tarjeta" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
