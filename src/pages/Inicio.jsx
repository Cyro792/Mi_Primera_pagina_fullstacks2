import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import Mapa from '../components/Mapa.jsx'
import Aparecer from '../components/animaciones/Aparecer.jsx'
import { Cascada, CascadaItem } from '../components/animaciones/Cascada.jsx'
import Contador from '../components/animaciones/Contador.jsx'
import Huella from '../components/animaciones/Huella.jsx'
import Huellas from '../components/animaciones/Huellas.jsx'
import { crearReserva } from '../services/db.js'

const SERVICIOS = [
  { icono: '🩺', titulo: 'Consulta General', desc: 'Exámenes de bienestar y diagnóstico personalizado.' },
  { icono: '💉', titulo: 'Vacunación', desc: 'Programas completos para proteger a tu mascota.' },
  { icono: '🔬', titulo: 'Laboratorio', desc: 'Análisis de sangre, orina y cultivos con resultados rápidos.' },
  { icono: '🦷', titulo: 'Odontología', desc: 'Limpieza dental profesional y cuidado preventivo.' },
  { icono: '🩹', titulo: 'Cirugía', desc: 'Cirugías realizadas por veterinarios certificados.' },
  { icono: '🚨', titulo: 'Urgencias 24h', desc: 'Atención de emergencias las 24 horas del día.' },
]

const EQUIPO = [
  { nombre: 'Dra. Lucas Sepúlveda', cargo: 'Directora Médica', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format', bio: 'Más de 15 años de experiencia médica.' },
  { nombre: 'Dr. Marcos Ruiz', cargo: 'Cirujano Veterinario', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStAnK3CncjoE_ss9hbUW9vEbCf-64DkbL_GFJiMATNjqGnIJmNVwTFmQJq&s=10', bio: 'Especialista en cirugía ortopédica.' },
  { nombre: 'Dra. Sofía Mora', cargo: 'Odontología & Dermatología', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&auto=format', bio: 'Experta en salud dermatológica.' },
]

// Mismos nombres que usa el panel de recepción, para que la solicitud calce con sus servicios.
const MOTIVOS = ['Consulta General', 'Vacunación', 'Laboratorio y Exámenes', 'Odontología', 'Cirugía', 'Urgencias 24h']

const TITULO = 'El cuidado que tu mascota merece'
// La clínica atiende desde 2009 (se calcula una vez, al cargar la página).
const ANIOS_DE_SERVICIO = new Date().getFullYear() - 2009
const SUAVE = [0.22, 1, 0.36, 1]

// Huellas que flotan sobre la portada: posición, tamaño y ritmo de cada una.
const FLOTANTES = [
  { left: '8%', top: '62%', tamano: 34, duracion: 9, retraso: 0 },
  { left: '22%', top: '24%', tamano: 22, duracion: 11, retraso: 1.5 },
  { left: '58%', top: '70%', tamano: 28, duracion: 10, retraso: 0.8 },
  { left: '74%', top: '30%', tamano: 40, duracion: 13, retraso: 2.2 },
  { left: '88%', top: '58%', tamano: 24, duracion: 8, retraso: 0.4 },
]

function Portada() {
  const seccion = useRef(null)
  // Efecto parallax: al bajar, la foto se mueve más lento que el texto y este se desvanece.
  const { scrollYProgress } = useScroll({ target: seccion, offset: ['start start', 'end start'] })
  const yFoto = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const escalaFoto = useTransform(scrollYProgress, [0, 1], [1.06, 1.2])
  const opacidadTexto = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const yTexto = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <section ref={seccion} className="portada">
      <motion.div className="portada-foto" style={{ y: yFoto, scale: escalaFoto }} />
      <div className="portada-velo" />

      {FLOTANTES.map((h, i) => (
        <span
          key={i}
          className="huella-flotante"
          style={{ left: h.left, top: h.top, animationDuration: `${h.duracion}s`, animationDelay: `${h.retraso}s` }}
          aria-hidden="true"
        >
          <Huella tamano={h.tamano} />
        </span>
      ))}

      <Container className="contenedor portada-contenido">
        <motion.div style={{ opacity: opacidadTexto, y: yTexto }}>
          <motion.p className="portada-sobretitulo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: SUAVE }}>
            Clínica Veterinaria · Rancagua
          </motion.p>

          {/* Cada palabra del título sube desde abajo, una tras otra. */}
          <h1 className="portada-titulo font-display" aria-label={TITULO}>
            {TITULO.split(' ').map((palabra, i) => (
              <span key={i} className="palabra-marco" aria-hidden="true">
                <motion.span className="palabra" initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 0.75, delay: 0.15 + i * 0.08, ease: SUAVE }}>
                  {palabra}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="portada-texto" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.75, ease: SUAVE }}>
            Atención veterinaria de alta calidad con equipo especializado en Rancagua.
          </motion.p>

          <motion.div className="d-flex flex-wrap gap-3" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.95, ease: SUAVE }}>
            <Link to="/#cita" className="btn-cristal btn-cristal--portada">Reservar Cita</Link>
            <Link to="/tienda" className="btn-cristal btn-cristal--claro">Visitar la tienda</Link>
          </motion.div>
        </motion.div>
      </Container>

      <motion.div className="portada-flecha" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true">
        ↓
      </motion.div>
    </section>
  )
}

function Cifras() {
  const cifras = [
    { valor: ANIOS_DE_SERVICIO, sufijo: ' años', texto: 'cuidando mascotas en Rancagua' },
    { valor: EQUIPO.length, sufijo: '', texto: 'especialistas en el equipo médico' },
    { valor: SERVICIOS.length, sufijo: '', texto: 'servicios clínicos disponibles' },
    { valor: 24, sufijo: ' h', texto: 'de atención de urgencias' },
  ]
  return (
    <section className="cifras" aria-label="La clínica en cifras">
      <Container className="contenedor">
        <Row className="g-4 text-center">
          {cifras.map((c, i) => (
            <Col xs={6} lg={3} key={c.texto}>
              <Aparecer retraso={i * 0.08}>
                <div className="cifra-numero font-display">
                  <Contador valor={c.valor} sufijo={c.sufijo} />
                </div>
                <div className="cifra-texto">{c.texto}</div>
              </Aparecer>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

const FORMULARIO_VACIO = { nombre: '', telefono: '', mascota: '', servicio: '', fecha: '', hora: '', mensaje: '' }

function FormularioCita() {
  const [datos, setDatos] = useState(FORMULARIO_VACIO)
  const [enviado, setEnviado] = useState(false)

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    // La solicitud queda como reserva "Pendiente" y aparece en el panel de recepción.
    crearReserva({
      mascota: datos.mascota,
      dueno: datos.nombre,
      telefono: datos.telefono,
      fecha: datos.fecha,
      hora: datos.hora,
      servicio: datos.servicio,
      notas: datos.mensaje,
      estado: 'Pendiente',
    })
    setEnviado(true)
  }

  const reiniciar = () => {
    setEnviado(false)
    setDatos(FORMULARIO_VACIO)
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {enviado ? (
        <motion.div key="exito" className="tarjeta tarjeta--exito text-center" role="status" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          <motion.div className="exito-icono" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}>
            ✓
          </motion.div>
          <h3 className="font-display h4 mb-2">¡Solicitud recibida, {datos.nombre}!</h3>
          <p className="texto-suave mb-4">
            Nos pondremos en contacto al número {datos.telefono} para confirmar la fecha y horario de tu consulta.
          </p>
          <button type="button" className="btn btn-vet" onClick={reiniciar}>Generar otra consulta</button>
        </motion.div>
      ) : (
        <motion.form key="formulario" className="tarjeta tarjeta--formulario" onSubmit={enviar} aria-label="Solicitud de cita" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label htmlFor="cita-nombre" className="etiqueta-campo">Tu Nombre</Form.Label>
              <Form.Control id="cita-nombre" className="campo" type="text" name="nombre" required value={datos.nombre} onChange={cambiar} placeholder="Ej. Ana García" />
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="cita-telefono" className="etiqueta-campo">Teléfono</Form.Label>
              <Form.Control id="cita-telefono" className="campo" type="tel" name="telefono" required value={datos.telefono} onChange={cambiar} placeholder="+56 9 1234 5678" />
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label htmlFor="cita-mascota" className="etiqueta-campo">Nombre de la Mascota</Form.Label>
              <Form.Control id="cita-mascota" className="campo" type="text" name="mascota" required value={datos.mascota} onChange={cambiar} placeholder="Ej. Pepe" />
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="cita-servicio" className="etiqueta-campo">Tipo de Consulta</Form.Label>
              <Form.Select id="cita-servicio" className="campo" name="servicio" required value={datos.servicio} onChange={cambiar}>
                <option value="">Seleccionar motivo...</option>
                {MOTIVOS.map((motivo) => (
                  <option key={motivo} value={motivo}>{motivo}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label htmlFor="cita-fecha" className="etiqueta-campo">Fecha Preferida</Form.Label>
              <Form.Control id="cita-fecha" className="campo" type="date" name="fecha" required value={datos.fecha} onChange={cambiar} />
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="cita-hora" className="etiqueta-campo">Hora Preferida</Form.Label>
              <Form.Control id="cita-hora" className="campo" type="time" name="hora" required value={datos.hora} onChange={cambiar} />
            </Col>
          </Row>

          <div className="mb-4">
            <Form.Label htmlFor="cita-mensaje" className="etiqueta-campo">Detalles del motivo</Form.Label>
            <Form.Control id="cita-mensaje" className="campo" as="textarea" rows={3} name="mensaje" value={datos.mensaje} onChange={cambiar} placeholder="Describe brevemente los síntomas o motivo de la visita..." style={{ resize: 'none' }} />
          </div>

          <button type="submit" className="btn btn-vet w-100 py-3">Solicitar Cita Médica</button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

export default function Inicio() {
  return (
    <>
      <Portada />
      <Cifras />

      {/* SERVICIOS */}
      <section id="servicios" className="seccion">
        <Container className="contenedor">
          <Aparecer>
            <p className="sobretitulo">Lo que hacemos</p>
            <h2 className="titulo-seccion font-display">Nuestros Servicios</h2>
          </Aparecer>
          <Cascada className="row g-4">
            {SERVICIOS.map((s) => (
              <CascadaItem key={s.titulo} className="col-sm-6 col-lg-4">
                <motion.div className="tarjeta tarjeta--servicio h-100" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <span className="servicio-icono">{s.icono}</span>
                  <h3 className="h5 fw-bold mt-3 mb-1">{s.titulo}</h3>
                  <p className="texto-suave mb-0">{s.desc}</p>
                </motion.div>
              </CascadaItem>
            ))}
          </Cascada>
          <Aparecer className="text-center mt-5">
            <Link to="/tienda?categoria=1" className="btn btn-vet-contorno">Ver precios y comprar servicios →</Link>
          </Aparecer>
        </Container>
      </section>

      <Huellas />

      {/* EQUIPO */}
      <section id="equipo" className="seccion seccion--blanca">
        <Container className="contenedor">
          <Aparecer>
            <p className="sobretitulo">Quiénes te atienden</p>
            <h2 className="titulo-seccion font-display">Equipo Médico</h2>
          </Aparecer>
          <Cascada className="row g-4">
            {EQUIPO.map((m) => (
              <CascadaItem key={m.nombre} className="col-sm-4">
                <div className="tarjeta-equipo h-100">
                  <div className="tarjeta-equipo-foto">
                    <img src={m.img} alt={m.nombre} loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="h6 fw-bold mb-1">{m.nombre}</h3>
                    <p className="tarjeta-equipo-cargo">{m.cargo}</p>
                    <p className="texto-suave small mb-0">{m.bio}</p>
                  </div>
                </div>
              </CascadaItem>
            ))}
          </Cascada>
        </Container>
      </section>

      {/* UBICACIÓN Y CONTACTO */}
      <section id="ubicacion" className="seccion">
        <Container className="contenedor">
          <Aparecer>
            <p className="sobretitulo">Dónde estamos</p>
            <h2 className="titulo-seccion font-display">Ubicación</h2>
          </Aparecer>
          <Row className="g-4">
            <Col lg={7}>
              <Aparecer desde="izquierda" className="mapa-marco">
                <Mapa />
              </Aparecer>
            </Col>
            <Col lg={5}>
              <Aparecer desde="derecha" id="contacto" className="tarjeta h-100 d-flex flex-column gap-3">
                <p className="mb-0"><strong>📍 Dirección:</strong> Av. Libertador Bdo. O'Higgins, Rancagua</p>
                <p className="mb-0"><strong>🕒 Horario:</strong> Lun - Vie: 9:00 - 21:00 (Urgencias 24h)</p>
                <p className="mb-0"><strong>📞 Teléfono:</strong> +56 9 5094 8714</p>
                <a href="tel:+56950948714" className="btn btn-vet w-100 mt-auto">Llamar Ahora</a>
              </Aparecer>
            </Col>
          </Row>
        </Container>
      </section>

      {/* AGENDAR CITA */}
      <section id="cita" className="seccion seccion--arena">
        <Container style={{ maxWidth: '42rem' }}>
          <Aparecer className="text-center mb-4">
            <p className="sobretitulo">Cita Online</p>
            <h2 className="titulo-seccion font-display mb-0">Genera tu consulta</h2>
          </Aparecer>
          <Aparecer desde="zoom">
            <FormularioCita />
          </Aparecer>
        </Container>
      </section>
    </>
  )
}
