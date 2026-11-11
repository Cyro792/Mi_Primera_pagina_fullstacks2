import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import AvisoGuardado from './AvisoGuardado.jsx'
import FormularioTarjeta from '../pago/FormularioTarjeta.jsx'
import VistaTarjeta from '../pago/VistaTarjeta.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { eliminarTarjeta, guardarTarjeta, listarTarjetas, marcarPredeterminada } from '../../services/tarjetas.js'
import { describirTarjeta, detectarMarca, estaVencida, TARJETA_VACIA, textoVencimiento, validarTarjeta } from '../../utils/tarjeta.js'

/** Tarjetas guardadas en la cuenta: agregar, elegir la predeterminada y eliminar. */
export default function TarjetasGuardadas() {
  const { usuario } = useAuth()
  const [tarjetas, setTarjetas] = useState(null)
  const [agregando, setAgregando] = useState(false)
  const [nueva, setNueva] = useState(TARJETA_VACIA)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState('')
  const cerrarAviso = useCallback(() => setAviso(''), [])

  useEffect(() => {
    let vigente = true
    listarTarjetas(usuario.email).then((lista) => {
      if (vigente) setTarjetas(lista)
    })
    return () => {
      vigente = false
    }
  }, [usuario.email])

  const cambiar = (campo, valor) => {
    setNueva((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  const cancelar = () => {
    setAgregando(false)
    setNueva(TARJETA_VACIA)
    setErrores({})
  }

  const agregar = async (evento) => {
    evento.preventDefault()
    const encontrados = validarTarjeta(nueva, { pedirCvv: false })
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const { tarjeta, duplicada } = await guardarTarjeta(usuario.email, nueva)
    setTarjetas(await listarTarjetas(usuario.email))
    cancelar()
    setAviso(duplicada ? `${describirTarjeta(tarjeta)} ya estaba guardada` : `${describirTarjeta(tarjeta)} guardada`)
  }

  const predeterminar = async (tarjeta) => {
    setTarjetas(await marcarPredeterminada(usuario.email, tarjeta.id))
    setAviso(`${describirTarjeta(tarjeta)} es ahora tu tarjeta predeterminada`)
  }

  const eliminar = async (tarjeta) => {
    if (!window.confirm(`¿Eliminar la tarjeta ${describirTarjeta(tarjeta)}?`)) return
    setTarjetas(await eliminarTarjeta(usuario.email, tarjeta.id))
    setAviso(`${describirTarjeta(tarjeta)} eliminada`)
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-1">
        <div>
          <h2 className="h5 font-display mb-1">Tarjetas guardadas</h2>
          <p className="texto-suave small mb-0">Paga más rápido: al comprar solo te pediremos el código de seguridad.</p>
        </div>
        {!agregando && (
          <button type="button" className="btn btn-vet btn-sm" onClick={() => setAgregando(true)}>+ Agregar tarjeta</button>
        )}
      </div>
      <div className="my-3">
        <AvisoGuardado mensaje={aviso} onCerrar={cerrarAviso} />
      </div>

      <AnimatePresence initial={false}>
        {agregando && (
          <motion.form key="agregar" className="tarjeta tarjeta--suave mb-4" onSubmit={agregar} noValidate aria-label="Agregar tarjeta" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="row g-4">
              <div className="col-md-6 order-md-2">
                <VistaTarjeta marca={detectarMarca(nueva.numero)} numero={nueva.numero} titular={nueva.titular} vencimiento={nueva.vencimiento} />
              </div>
              <div className="col-md-6">
                <FormularioTarjeta valores={nueva} onCambiar={cambiar} errores={errores} pedirCvv={false} prefijo="cuenta-tarjeta" />
                <p className="texto-suave small mt-3">Solo guardamos la marca, los últimos 4 dígitos, el titular y el vencimiento.</p>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-vet">Guardar tarjeta</button>
                  <button type="button" className="btn btn-vet-contorno" onClick={cancelar}>Cancelar</button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {tarjetas === null && <p className="texto-suave" role="status">Cargando tus tarjetas…</p>}
      {tarjetas?.length === 0 && !agregando && (
        <div className="tarjeta tarjeta--suave text-center texto-suave">Aún no tienes tarjetas guardadas.</div>
      )}

      <ul className="lista-tarjetas list-unstyled" aria-label="Tus tarjetas">
        <AnimatePresence initial={false}>
          {tarjetas?.map((t) => {
            const vencida = estaVencida(t)
            return (
              <motion.li key={t.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} aria-label={describirTarjeta(t)}>
                <VistaTarjeta compacta marca={t.marca} ultimos4={t.ultimos4} titular={t.titular} vencimiento={textoVencimiento(t)} />
                <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                  {vencida && <span className="insignia insignia--alerta">Vencida</span>}
                  {t.predeterminada ? (
                    <span className="insignia insignia--verde">★ Predeterminada</span>
                  ) : (
                    <button type="button" className="btn btn-link btn-sm p-0 enlace-accion" onClick={() => predeterminar(t)} disabled={vencida}>
                      Usar como predeterminada
                    </button>
                  )}
                  <button type="button" className="btn btn-link btn-sm p-0 ms-auto enlace-accion enlace-accion--peligro" onClick={() => eliminar(t)} aria-label={`Eliminar ${describirTarjeta(t)}`}>
                    Eliminar
                  </button>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
