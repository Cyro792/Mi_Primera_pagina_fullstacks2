import { useCallback, useState } from 'react'
import Form from 'react-bootstrap/Form'
import AvisoGuardado from './AvisoGuardado.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { cambiarPassword } from '../../services/auth.js'

const VACIO = { actual: '', nueva: '', confirmar: '' }

const CAMPOS = [
  { nombre: 'actual', etiqueta: 'Contraseña actual', autoComplete: 'current-password' },
  { nombre: 'nueva', etiqueta: 'Nueva contraseña', autoComplete: 'new-password' },
  { nombre: 'confirmar', etiqueta: 'Repite la nueva contraseña', autoComplete: 'new-password' },
]

/** Cambio de contraseña: pide la actual para confirmar que es el dueño de la cuenta. */
export default function CambioPassword() {
  const { usuario } = useAuth()
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState('')
  const cerrarAviso = useCallback(() => setAviso(''), [])

  const enviar = (evento) => {
    evento.preventDefault()
    const resultado = cambiarPassword(usuario.email, valores)
    if (!resultado.ok) {
      setErrores(resultado.errores)
      return
    }
    setErrores({})
    setValores(VACIO)
    setAviso('Contraseña actualizada')
  }

  return (
    <form onSubmit={enviar} noValidate aria-label="Cambiar contraseña" style={{ maxWidth: '26rem' }}>
      <h2 className="h5 font-display mb-1">Seguridad</h2>
      <p className="texto-suave small mb-4">Usa al menos 8 caracteres. Te pediremos la contraseña actual para confirmar que eres tú.</p>
      <div className="d-grid gap-3">
        {CAMPOS.map((c) => (
          <div key={c.nombre}>
            <Form.Label htmlFor={`clave-${c.nombre}`} className="etiqueta-campo">{c.etiqueta}</Form.Label>
            <Form.Control
              id={`clave-${c.nombre}`}
              className="campo"
              type="password"
              autoComplete={c.autoComplete}
              value={valores[c.nombre]}
              isInvalid={Boolean(errores[c.nombre])}
              onChange={(e) => setValores((v) => ({ ...v, [c.nombre]: e.target.value }))}
            />
            <Form.Control.Feedback type="invalid">{errores[c.nombre]}</Form.Control.Feedback>
          </div>
        ))}
      </div>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <button type="submit" className="btn btn-vet">Cambiar contraseña</button>
        <AvisoGuardado mensaje={aviso} onCerrar={cerrarAviso} />
      </div>
    </form>
  )
}
