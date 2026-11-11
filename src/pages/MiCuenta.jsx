import { Link, useSearchParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { AnimatePresence, motion } from 'motion/react'
import Avatar from '../components/Avatar.jsx'
import CambioPassword from '../components/cuenta/CambioPassword.jsx'
import PerfilFormulario from '../components/cuenta/PerfilFormulario.jsx'
import TarjetasGuardadas from '../components/cuenta/TarjetasGuardadas.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const SECCIONES = [
  { id: 'perfil', etiqueta: 'Perfil', icono: '🐾', Componente: PerfilFormulario },
  { id: 'tarjetas', etiqueta: 'Tarjetas', icono: '💳', Componente: TarjetasGuardadas },
  { id: 'seguridad', etiqueta: 'Seguridad', icono: '🔒', Componente: CambioPassword },
]

/** Cuenta del cliente: personalización del perfil, tarjetas guardadas y contraseña (/mi-cuenta?seccion=). */
export default function MiCuenta() {
  const { usuario } = useAuth()
  const [parametros, setParametros] = useSearchParams()
  const activa = SECCIONES.find((s) => s.id === parametros.get('seccion')) ?? SECCIONES[0]
  const { Componente } = activa

  return (
    <>
      <header className="cabecera-pagina">
        <Container className="contenedor">
          <div className="d-flex align-items-center gap-3">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }}>
              <Avatar avatar={usuario.avatar} tamano="grande" etiqueta={`Avatar de ${usuario.nombre}`} />
            </motion.div>
            <div>
              <p className="sobretitulo mb-1">Mi cuenta</p>
              <h1 className="font-display cabecera-titulo mb-0">Hola, {usuario.nombre.split(' ')[0]}</h1>
              <p className="texto-suave mb-0">{usuario.email}</p>
            </div>
          </div>
        </Container>
      </header>

      <section className="seccion pt-4">
        <Container className="contenedor">
          <Row className="g-4">
            <Col lg={3}>
              <nav className="menu-cuenta" aria-label="Secciones de la cuenta">
                {SECCIONES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`menu-cuenta-opcion${activa.id === s.id ? ' menu-cuenta-opcion--activa' : ''}`}
                    aria-current={activa.id === s.id ? 'page' : undefined}
                    onClick={() => setParametros({ seccion: s.id })}
                  >
                    {activa.id === s.id && <motion.span layoutId="indicador-cuenta" className="menu-cuenta-indicador" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                    <span className="position-relative">{s.icono} {s.etiqueta}</span>
                  </button>
                ))}
                <Link to="/mis-compras" className="menu-cuenta-opcion">
                  <span className="position-relative">🧾 Mis compras</span>
                </Link>
              </nav>
            </Col>
            <Col lg={9}>
              <div className="tarjeta p-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={activa.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                    <Componente />
                  </motion.div>
                </AnimatePresence>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}
