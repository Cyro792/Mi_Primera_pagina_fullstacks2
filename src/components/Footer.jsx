import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const SERVICIOS = ['Consulta General', 'Vacunación', 'Laboratorio', 'Odontología', 'Cirugía', 'Urgencias 24h']

export default function Footer() {
  return (
    <footer className="pie">
      <Container className="contenedor">
        <Row className="gx-4 gy-5 mb-5">
          <Col sm={12} lg={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="marca-icono marca-icono--grande">🐾</span>
              <span className="fs-5 fw-semibold font-display">San Marcos</span>
            </div>
            <p className="pie-texto" style={{ maxWidth: '20rem' }}>
              Clínica Veterinaria San Marcos. Atención médica de excelencia para tu mejor amigo desde 2009.
            </p>
          </Col>
          <Col sm={6} lg={3}>
            <h2 className="pie-titulo">Servicios</h2>
            <ul className="list-unstyled pie-lista">
              {SERVICIOS.map((servicio) => (
                <li key={servicio}>
                  <Link to="/#servicios">{servicio}</Link>
                </li>
              ))}
            </ul>
          </Col>
          <Col sm={6} lg={3}>
            <h2 className="pie-titulo">Contacto</h2>
            <ul className="list-unstyled pie-lista">
              <li>Av. Libertador Gral. Bernardo O'Higgins, Rancagua</li>
              <li>+56 9 4798 8934</li>
              <li>contacto@sanmarcos.cl</li>
              <li className="pie-destacado">Urgencias 24h disponibles</li>
            </ul>
          </Col>
        </Row>
        <div className="pie-legal">
          <span>© 2026 Clínica Veterinaria San Marcos. Todos los derechos reservados.</span>
          <div className="d-flex gap-4">
            <Link to="/tienda">Tienda</Link>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
