import { useCallback, useState } from 'react'
import Form from 'react-bootstrap/Form'
import AvisoGuardado from './AvisoGuardado.jsx'
import { cambiarPassword, validarCambioPassword } from '../../services/auth.js'

const VACIO = { actual: '', nueva: '', confirmar: '' }

const CAMPOS = [
  { nombre: 'actual', etiqueta: 'Contraseña actual', autoComplete: 'current-password' },
  { nombre: 'nueva', etiqueta: 'Nueva contraseña', autoComplete: 'new-password' },
  { nombre: 'confirmar', etiqueta: 'Repite la nueva contraseña', autoComplete: 'new-password' },
]

/** Cambio de contraseña: pide la actual para confirmar que es el dueño de la cuenta. */
export default function CambioPassword() {
  const [valores, setValores] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState('')
  const cerrarAviso = useCallback(() => setAviso(''), [])

  const enviar = async (evento) => {
    evento.preventDefault()
    const encontrados = validarCambioPassword(valores)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setEnviando(true)
    try {
      // El servidor comprueba la contraseña actual y cierra la sesión en los demás dispositivos.
      await cambiarPassword(valores)
      setValores(VACIO)
      setAviso('Contraseña actualizada. Cerramos tu sesión en los demás dispositivos.')
    } catch (problema) {
      // Si la contraseña actual no es correcta, el error se muestra bajo ese campo.
      setErrores(Object.keys(problema.errores ?? {}).length ? problema.errores : { actual: problema.message })
    } finally {
      setEnviando(false)
    }
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
        <button type="submit" className="btn btn-vet" disabled={enviando}>{enviando ? 'Guardando…' : 'Cambiar contraseña'}</button>
        <AvisoGuardado mensaje={aviso} onCerrar={cerrarAviso} />
      </div>
    </form>
  )
}
