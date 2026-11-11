import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Accordion from 'react-bootstrap/Accordion'
import Table from 'react-bootstrap/Table'
import Aparecer from '../components/animaciones/Aparecer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { listarBoletasDe } from '../services/boletas.js'
import { formatoCLP } from '../utils/stats.js'
import { describirTarjeta } from '../utils/tarjeta.js'

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' })

/** Historial de compras del cliente con sesión iniciada. Solo accesible con rol CLIENTE. */
export default function MisCompras() {
  const { usuario } = useAuth()
  const [boletas, setBoletas] = useState(null)

  useEffect(() => {
    let vigente = true
    listarBoletasDe(usuario.email).then((lista) => {
      if (vigente) setBoletas(lista)
    })
    return () => {
      vigente = false
    }
  }, [usuario.email])

  return (
    <section className="seccion">
      <Container className="contenedor" style={{ maxWidth: '52rem' }}>
        <p className="sobretitulo">Tu cuenta</p>
        <h1 className="font-display mb-4">Mis compras</h1>

        {boletas === null && <p className="texto-suave" role="status">Cargando tus compras…</p>}

        {boletas?.length === 0 && (
          <div className="tarjeta text-center">
            <p className="texto-suave">Todavía no has realizado compras.</p>
            <Link to="/tienda" className="btn btn-vet">Ir a la tienda</Link>
          </div>
        )}

        {boletas?.length > 0 && (
          <Aparecer>
            <Accordion defaultActiveKey={String(boletas[0].id)} className="compras">
              {boletas.map((boleta) => (
                <Accordion.Item eventKey={String(boleta.id)} key={boleta.id}>
                  <Accordion.Header>
                    <span className="fw-semibold me-3">Boleta N° {boleta.id}</span>
                    <span className="texto-suave small me-auto">{formatoFecha.format(new Date(boleta.fecha))}</span>
                    <span className="fw-semibold me-3">{formatoCLP(boleta.total)}</span>
                  </Accordion.Header>
                  <Accordion.Body>
                    {boleta.medioPago && (
                      <p className="texto-suave small mb-2">
                        💳 Pagado con {describirTarjeta(boleta.medioPago)} · Autorización {boleta.medioPago.codigoAutorizacion}
                      </p>
                    )}
                    <Table responsive size="sm" className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boleta.detalles.map((d) => (
                          <tr key={d.productoId}>
                            <td>{d.nombre}</td>
                            <td className="text-center">{d.cantidad}</td>
                            <td className="text-end">{formatoCLP(d.precioUnitario)}</td>
                            <td className="text-end">{formatoCLP(d.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Aparecer>
        )}
      </Container>
    </section>
  )
}
