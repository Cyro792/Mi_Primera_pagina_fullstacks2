import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import CompraExitosa from '../components/CompraExitosa.jsx'
import FormularioTarjeta from '../components/pago/FormularioTarjeta.jsx'
import LogoMarca from '../components/pago/LogoMarca.jsx'
import VistaTarjeta from '../components/pago/VistaTarjeta.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { crearBoleta } from '../services/boletas.js'
import { procesarPago } from '../services/pagos.js'
import { guardarTarjeta, listarTarjetas } from '../services/tarjetas.js'
import { formatoCLP } from '../utils/stats.js'
import { detectarMarca, estaVencida, MARCAS, soloDigitos, TARJETA_VACIA, textoVencimiento, validarCvv, validarTarjeta } from '../utils/tarjeta.js'

const NUEVA = 'nueva'

function Procesando() {
  return (
    <motion.div className="pago-procesando" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="pago-procesando-tarjeta" animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
        💳
      </motion.div>
      <p className="fw-semibold mb-2">Procesando pago seguro…</p>
      <div className="pago-procesando-barra">
        <motion.span initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
      </div>
    </motion.div>
  )
}

/** Opción de la lista de medios de pago (tarjeta guardada o "otra tarjeta"). */
function OpcionMetodo({ activa, deshabilitada, onElegir, children }) {
  return (
    <label className={`metodo${activa ? ' metodo--activo' : ''}${deshabilitada ? ' metodo--deshabilitado' : ''}`}>
      <input type="radio" name="metodo-pago" className="form-check-input mt-0" checked={activa} disabled={deshabilitada} onChange={onElegir} />
      {children}
    </label>
  )
}

/** Paso de pago: elegir una tarjeta guardada o ingresar una nueva, y pagar (pasarela simulada). */
export default function Pago() {
  const { usuario } = useAuth()
  const { items, total, cantidad, vaciar } = useCarrito()
  const [contenedor, animar] = useAnimate()

  const [tarjetas, setTarjetas] = useState(null)
  const [seleccion, setSeleccion] = useState(NUEVA)
  const [nueva, setNueva] = useState(TARJETA_VACIA)
  const [cvvGuardada, setCvvGuardada] = useState('')
  const [guardarNueva, setGuardarNueva] = useState(true)
  const [editandoCvv, setEditandoCvv] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorPago, setErrorPago] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [boleta, setBoleta] = useState(null)

  useEffect(() => {
    let vigente = true
    listarTarjetas(usuario.email).then((lista) => {
      if (!vigente) return
      setTarjetas(lista)
      const preferida = lista.find((t) => t.predeterminada && !estaVencida(t)) ?? lista.find((t) => !estaVencida(t))
      setSeleccion(preferida?.id ?? NUEVA)
      setGuardarNueva(lista.length === 0)
    })
    return () => {
      vigente = false
    }
  }, [usuario.email])

  if (boleta) return <CompraExitosa boleta={boleta} />
  if (items.length === 0) return <Navigate to="/carrito" replace />

  const guardada = tarjetas?.find((t) => t.id === seleccion)

  const elegir = (id) => {
    setSeleccion(id)
    setErrores({})
    setErrorPago('')
    setCvvGuardada('')
  }

  const cambiarNueva = (campo, valor) => {
    setNueva((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  const sacudir = () => {
    if (contenedor.current) animar(contenedor.current, { x: [0, -12, 12, -8, 8, -4, 0] }, { duration: 0.45 })
  }

  const pagar = async (evento) => {
    evento.preventDefault()
    setErrorPago('')

    const encontrados = guardada
      ? (validarCvv(cvvGuardada, guardada.marca) ? { cvv: validarCvv(cvvGuardada, guardada.marca) } : {})
      : validarTarjeta(nueva)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      sacudir()
      return
    }

    setProcesando(true)
    try {
      const pago = await procesarPago(guardada ? { tarjetaGuardada: guardada } : { tarjeta: nueva }, total)
      const creada = await crearBoleta({ cliente: usuario, items, pago })
      if (!guardada && guardarNueva) await guardarTarjeta(usuario.email, nueva)
      setBoleta(creada)
      vaciar()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (problema) {
      setErrorPago(problema.message)
      sacudir()
    } finally {
      // El código de seguridad nunca se conserva, ni siquiera después de un intento fallido.
      setCvvGuardada('')
      setNueva((actual) => ({ ...actual, cvv: '' }))
      setProcesando(false)
    }
  }

  const marcaNueva = detectarMarca(nueva.numero)

  return (
    <section className="seccion">
      <Container className="contenedor">
        <Link to="/carrito" className="enlace-volver">← Volver al carrito</Link>
        <p className="sobretitulo mt-3">Paso final</p>
        <h1 className="font-display mb-4">Pago</h1>

        <form onSubmit={pagar} noValidate aria-label="Pago con tarjeta">
          <Row className="g-4">
            <Col lg={7}>
              <div ref={contenedor} className="tarjeta">
                <h2 className="h5 font-display mb-3">Método de pago</h2>

                {tarjetas === null ? (
                  <p className="texto-suave" role="status">Cargando tus tarjetas…</p>
                ) : (
                  <>
                    {tarjetas.length > 0 && (
                      <div role="radiogroup" aria-label="Método de pago" className="d-grid gap-2 mb-4">
                        {tarjetas.map((t) => {
                          const vencida = estaVencida(t)
                          return (
                            <OpcionMetodo key={t.id} activa={seleccion === t.id} deshabilitada={vencida} onElegir={() => elegir(t.id)}>
                              <LogoMarca marca={t.marca} decorativo />
                              <span className="flex-grow-1">
                                <span className="fw-semibold">{MARCAS[t.marca]?.nombre} •••• {t.ultimos4}</span>
                                <span className="d-block texto-suave small">{t.titular} · vence {textoVencimiento(t)}</span>
                              </span>
                              {vencida ? <span className="insignia insignia--alerta">Vencida</span> : t.predeterminada && <span className="insignia">Predeterminada</span>}
                            </OpcionMetodo>
                          )
                        })}
                        <OpcionMetodo activa={seleccion === NUEVA} onElegir={() => elegir(NUEVA)}>
                          <LogoMarca marca={null} decorativo />
                          <span className="flex-grow-1 fw-semibold">Usar otra tarjeta</span>
                        </OpcionMetodo>
                      </div>
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                      {guardada ? (
                        <motion.div key={`guardada-${guardada.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                          <Row className="g-4 align-items-center">
                            <Col md={7}>
                              <VistaTarjeta marca={guardada.marca} ultimos4={guardada.ultimos4} titular={guardada.titular} vencimiento={textoVencimiento(guardada)} cvv={cvvGuardada} volteada={editandoCvv} />
                            </Col>
                            <Col md={5}>
                              <Form.Label htmlFor="pago-cvv-guardada" className="etiqueta-campo">Código de seguridad (CVV)</Form.Label>
                              <Form.Control
                                id="pago-cvv-guardada"
                                className="campo"
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                placeholder={'•'.repeat(MARCAS[guardada.marca]?.cvv ?? 3)}
                                value={cvvGuardada}
                                isInvalid={Boolean(errores.cvv)}
                                onFocus={() => setEditandoCvv(true)}
                                onBlur={() => setEditandoCvv(false)}
                                onChange={(e) => {
                                  setCvvGuardada(soloDigitos(e.target.value).slice(0, MARCAS[guardada.marca]?.cvv ?? 4))
                                  setErrores({})
                                }}
                              />
                              <Form.Control.Feedback type="invalid">{errores.cvv}</Form.Control.Feedback>
                              <p className="texto-suave small mt-2 mb-0">Por seguridad, el código no se guarda y se pide en cada compra.</p>
                            </Col>
                          </Row>
                        </motion.div>
                      ) : (
                        <motion.div key="nueva" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                          <Row className="g-4">
                            <Col md={6} className="order-md-2">
                              <VistaTarjeta marca={marcaNueva} numero={nueva.numero} titular={nueva.titular} vencimiento={nueva.vencimiento} cvv={nueva.cvv} volteada={editandoCvv} />
                            </Col>
                            <Col md={6}>
                              <FormularioTarjeta valores={nueva} onCambiar={cambiarNueva} errores={errores} onEditandoCvv={setEditandoCvv} prefijo="pago" />
                              <Form.Check
                                id="pago-guardar"
                                className="mt-3"
                                type="checkbox"
                                label="Guardar esta tarjeta en mi cuenta"
                                checked={guardarNueva}
                                onChange={(e) => setGuardarNueva(e.target.checked)}
                              />
                            </Col>
                          </Row>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <AnimatePresence>
                  {errorPago && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Alert variant="danger" className="mt-4 mb-0">{errorPago}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="texto-suave small mt-3 mb-0">
                🔒 Pago simulado: no se realiza ningún cobro. Nunca guardamos el número completo de la tarjeta ni su código de seguridad.
                Para probar, usa <code>4111 1111 1111 1111</code> (aprobada) o <code>4000 0000 0000 0002</code> (rechazada), con cualquier vencimiento futuro.
              </p>
            </Col>

            <Col lg={5}>
              <aside className="tarjeta resumen" aria-label="Resumen del pedido">
                <h2 className="h5 font-display mb-3">Tu pedido</h2>
                <ul className="list-unstyled d-grid gap-2 mb-3">
                  {items.map((item) => (
                    <li key={item.id} className="d-flex justify-content-between gap-3 small">
                      <span>
                        {item.nombre} <span className="texto-suave">× {item.cantidad}</span>
                      </span>
                      <span className="fw-semibold text-nowrap">{formatoCLP(item.precio * item.cantidad)}</span>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between texto-suave small border-top pt-3 mb-2">
                  <span>Productos</span>
                  <span>{cantidad}</span>
                </div>
                <div className="d-flex justify-content-between align-items-baseline mb-3">
                  <span className="fw-semibold">Total</span>
                  <span className="resumen-total font-display" data-testid="total-pago">{formatoCLP(total)}</span>
                </div>
                <button type="submit" className="btn btn-vet w-100 py-2" disabled={procesando || tarjetas === null}>
                  {procesando ? 'Procesando…' : `Pagar ${formatoCLP(total)}`}
                </button>
              </aside>
            </Col>
          </Row>
        </form>
      </Container>

      <AnimatePresence>{procesando && <Procesando />}</AnimatePresence>
    </section>
  )
}
