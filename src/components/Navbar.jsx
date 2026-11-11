import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BsNavbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { ROLES } from '../services/auth.js'
import Avatar from './Avatar.jsx'

const ENLACES = [
  { a: '/#servicios', texto: 'Servicios' },
  { a: '/#equipo', texto: 'Equipo' },
  { a: '/#ubicacion', texto: 'Ubicación' },
  { a: '/tienda', texto: 'Tienda' },
]

function IconoCarrito() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </svg>
  )
}

export default function Navbar() {
  const { usuario, tieneRol, cerrarSesion } = useAuth()
  const { cantidad } = useCarrito()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [conScroll, setConScroll] = useState(false)

  useEffect(() => {
    const alHacerScroll = () => setConScroll(window.scrollY > 560)
    alHacerScroll()
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => window.removeEventListener('scroll', alHacerScroll)
  }, [])

  // Sobre la foto de portada la barra es oscura y translúcida; en el resto del sitio es clara.
  const sobrePortada = pathname === '/' && !conScroll && !abierto
  const cerrar = () => setAbierto(false)

  const salir = () => {
    cerrar()
    cerrarSesion()
    navigate('/')
  }

  return (
    <BsNavbar
      expand="lg"
      fixed="top"
      expanded={abierto}
      onToggle={setAbierto}
      className={`barra ${sobrePortada ? 'barra--oscura' : 'barra--clara'}`}
      variant={sobrePortada ? 'dark' : 'light'}
    >
      <Container className="contenedor">
        <BsNavbar.Brand as={Link} to="/" onClick={cerrar} className="marca font-display">
          <span className="marca-icono">🐾</span>
          San Marcos
        </BsNavbar.Brand>

        <div className="d-flex align-items-center gap-2 order-lg-last">
          <Link to="/carrito" onClick={cerrar} className="boton-carrito" aria-label={`Carrito de compras: ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`}>
            <span id="icono-carrito" className="d-inline-flex">
              <IconoCarrito />
            </span>
            {cantidad > 0 && (
              <motion.span
                key={cantidad}
                className="carrito-contador"
                initial={{ scale: 0.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 13 }}
              >
                {cantidad}
              </motion.span>
            )}
          </Link>
          <BsNavbar.Toggle aria-controls="menu-principal" label="Abrir menú" />
        </div>

        <BsNavbar.Collapse id="menu-principal">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            {ENLACES.map((enlace) => (
              <Nav.Link key={enlace.a} as={Link} to={enlace.a} onClick={cerrar} className="barra-enlace">
                {enlace.texto}
              </Nav.Link>
            ))}

            <Link to="/#cita" onClick={cerrar} className="btn-cristal btn-cristal--verde my-2 my-lg-0 ms-lg-2">
              Reservar Cita
            </Link>

            {usuario ? (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <Avatar avatar={usuario.avatar} />
                    Hola, {usuario.nombre.split(' ')[0]}
                  </span>
                }
                id="menu-usuario" align="end" className="barra-enlace menu-usuario">
                {tieneRol(ROLES.ADMIN) && (
                  <NavDropdown.Item as={Link} to="/admin" onClick={cerrar}>Panel de administración</NavDropdown.Item>
                )}
                {tieneRol(ROLES.ADMIN, ROLES.RECEPCIONISTA) && (
                  <NavDropdown.Item as={Link} to="/recepcion" onClick={cerrar}>Panel de recepción</NavDropdown.Item>
                )}
                {tieneRol(ROLES.CLIENTE) && (
                  <>
                    <NavDropdown.Item as={Link} to="/mi-cuenta" onClick={cerrar}>Mi cuenta</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/mi-cuenta?seccion=tarjetas" onClick={cerrar}>Mis tarjetas</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/mis-compras" onClick={cerrar}>Mis compras</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" type="button" onClick={salir}>Cerrar sesión</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/login" onClick={cerrar} className="btn-cristal btn-cristal--naranja mb-2 mb-lg-0">
                Ingresar
              </Link>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}
