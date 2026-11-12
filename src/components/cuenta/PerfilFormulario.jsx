import { useCallback, useState } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import { motion } from 'motion/react'
import Avatar from '../Avatar.jsx'
import AvisoGuardado from './AvisoGuardado.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { AVATARES, COLORES, REGIONES, validarPerfil } from '../../services/perfil.js'

/** Personalización de la cuenta: avatar, color, nombre y datos de contacto. */
export default function PerfilFormulario() {
  const { usuario, guardarPerfil } = useAuth()
  const [valores, setValores] = useState(() => ({
    nombre: usuario.nombre,
    telefono: usuario.telefono,
    region: usuario.region,
    comuna: usuario.comuna,
    direccion: usuario.direccion,
    avatar: usuario.avatar,
  }))
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const cerrarAviso = useCallback(() => setAviso(''), [])

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }
  const cambiarAvatar = (cambios) => setValores((actuales) => ({ ...actuales, avatar: { ...actuales.avatar, ...cambios } }))

  const guardar = async (evento) => {
    evento.preventDefault()
    const encontrados = validarPerfil(valores)
    setErrores(encontrados)
    setError('')
    if (Object.keys(encontrados).length > 0) return
    setGuardando(true)
    try {
      await guardarPerfil(valores)
      setAviso('Cambios guardados')
    } catch (problema) {
      setErrores(problema.errores ?? {})
      setError(problema.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate aria-label="Datos del perfil">
      <h2 className="h5 font-display mb-1">Tu perfil</h2>
      <p className="texto-suave small mb-4">Elige cómo te verás en la clínica y mantén tus datos de contacto al día.</p>

      <div className="personalizacion mb-4">
        <Avatar avatar={valores.avatar} tamano="grande" etiqueta="Vista previa de tu avatar" />
        <div className="flex-grow-1">
          <p className="etiqueta-campo mb-2">Ícono</p>
          <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Ícono del avatar">
            {AVATARES.map((a) => (
              <motion.button
                key={a.icono}
                type="button"
                className={`opcion-avatar${valores.avatar.icono === a.icono ? ' opcion-avatar--activa' : ''}`}
                aria-label={`Ícono ${a.nombre}`}
                aria-pressed={valores.avatar.icono === a.icono}
                onClick={() => cambiarAvatar({ icono: a.icono })}
                whileHover={{ scale: 1.15, rotate: -8 }}
                whileTap={{ scale: 0.9 }}
              >
                {a.icono}
              </motion.button>
            ))}
          </div>
          <p className="etiqueta-campo mb-2">Color</p>
          <div className="d-flex flex-wrap gap-2" role="group" aria-label="Color del avatar">
            {COLORES.map((c) => (
              <motion.button
                key={c.valor}
                type="button"
                className={`opcion-color${valores.avatar.color === c.valor ? ' opcion-color--activa' : ''}`}
                style={{ background: c.valor }}
                aria-label={`Color ${c.nombre}`}
                aria-pressed={valores.avatar.color === c.valor}
                onClick={() => cambiarAvatar({ color: c.valor })}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
              />
            ))}
          </div>
        </div>
      </div>

      <Row className="g-3">
        <Col md={6}>
          <Form.Label htmlFor="perfil-nombre" className="etiqueta-campo">Nombre completo</Form.Label>
          <Form.Control id="perfil-nombre" className="campo" value={valores.nombre} isInvalid={Boolean(errores.nombre)} autoComplete="name" onChange={(e) => cambiar('nombre', e.target.value)} />
          <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="perfil-email" className="etiqueta-campo">Correo</Form.Label>
          <Form.Control id="perfil-email" className="campo" value={usuario.email} readOnly disabled />
          <Form.Text className="texto-suave">El correo identifica tu cuenta y no se puede cambiar.</Form.Text>
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="perfil-telefono" className="etiqueta-campo">Teléfono celular</Form.Label>
          <Form.Control id="perfil-telefono" className="campo" type="tel" placeholder="+56 9 1234 5678" value={valores.telefono} isInvalid={Boolean(errores.telefono)} autoComplete="tel" onChange={(e) => cambiar('telefono', e.target.value)} />
          <Form.Control.Feedback type="invalid">{errores.telefono}</Form.Control.Feedback>
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="perfil-region" className="etiqueta-campo">Región</Form.Label>
          <Form.Select id="perfil-region" className="campo" value={valores.region} isInvalid={Boolean(errores.region)} onChange={(e) => cambiar('region', e.target.value)}>
            <option value="">Seleccionar región…</option>
            {REGIONES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errores.region}</Form.Control.Feedback>
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="perfil-comuna" className="etiqueta-campo">Comuna</Form.Label>
          <Form.Control id="perfil-comuna" className="campo" placeholder="Ej. Rancagua" value={valores.comuna} onChange={(e) => cambiar('comuna', e.target.value)} />
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="perfil-direccion" className="etiqueta-campo">Dirección de despacho</Form.Label>
          <Form.Control id="perfil-direccion" className="campo" placeholder="Calle, número, depto." value={valores.direccion} autoComplete="street-address" onChange={(e) => cambiar('direccion', e.target.value)} />
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}

      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <button type="submit" className="btn btn-vet" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        <AvisoGuardado mensaje={aviso} onCerrar={cerrarAviso} />
      </div>
    </form>
  )
}
