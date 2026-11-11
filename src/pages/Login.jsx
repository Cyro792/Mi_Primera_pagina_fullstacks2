import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext.jsx'
import { rutaInicialDe, validarLogin, validarRegistro } from '../services/auth.js'

const SUAVE = [0.22, 1, 0.36, 1]

function Campo({ id, etiqueta, tipo, valor, onChange, placeholder, error, autoComplete }) {
  return (
    <div className="login-campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <span id={`${id}-error`} role="alert" className="login-error">{error}</span>}
    </div>
  )
}

/** Panel decorativo de la izquierda: círculos y líneas doradas que giran lentamente. */
function Arte() {
  return (
    <div className="login-arte" aria-hidden="true">
      <div className="login-arte-fondo" />
      <svg className="login-arte-circulos" width="600" height="600" viewBox="0 0 600 600" fill="none">
        <circle className="giro-lento" cx="300" cy="300" r="260" stroke="#c8952a" strokeWidth="0.6" strokeDasharray="4 14" opacity="0.5" />
        <circle className="giro-lento giro-lento--inverso" cx="300" cy="300" r="210" stroke="#c8952a" strokeWidth="0.6" strokeDasharray="2 10" opacity="0.35" />
        <circle cx="300" cy="300" r="160" stroke="#c8952a" strokeWidth="1" opacity="0.18" />
      </svg>
      <svg className="login-arte-lineas" preserveAspectRatio="none" viewBox="0 0 700 900" fill="none">
        <line x1="-50" y1="900" x2="750" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.12" />
        <line x1="-200" y1="900" x2="600" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.08" />
        <line x1="100" y1="900" x2="900" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.08" />
      </svg>
      <div className="login-arte-lateral">ACCESO · SISTEMA</div>
      <motion.div className="login-arte-marca" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: SUAVE }}>
        <div className="login-arte-titulo">Veterinaria</div>
        <div className="login-arte-titulo login-arte-titulo--dorado">San Marcos</div>
        <div className="login-arte-regla" />
        <div className="login-arte-pie">Acceso al Sistema</div>
      </motion.div>
    </div>
  )
}

/** Inicio de sesión y registro. El rol lo define la cuenta: después de entrar se redirige según el rol. */
export default function Login() {
  const { usuario, iniciarSesion, registrar } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const desde = ubicacion.state?.desde

  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [aviso, setAviso] = useState('')

  // Si ya hay sesión (por ejemplo, tras recargar), no se muestra el formulario.
  if (usuario) {
    return <Navigate to={desde ?? rutaInicialDe(usuario.rol)} replace />
  }

  const esLogin = modo === 'login'

  const cambiarModo = () => {
    setModo(esLogin ? 'registro' : 'login')
    setErrores({})
    setErrorGeneral('')
    setAviso('')
    setPassword('')
    setConfirmar('')
  }

  const entrar = (e) => {
    e.preventDefault()
    const encontrados = validarLogin({ email, password })
    setErrores(encontrados)
    setErrorGeneral('')
    if (Object.keys(encontrados).length > 0) return
    const resultado = iniciarSesion({ email, password })
    if (!resultado.ok) {
      setErrorGeneral(resultado.error)
      return
    }
    navigate(desde ?? rutaInicialDe(resultado.usuario.rol), { replace: true })
  }

  const crearCuenta = (e) => {
    e.preventDefault()
    const encontrados = validarRegistro({ nombre, email, password, confirmar })
    setErrores(encontrados)
    setErrorGeneral('')
    setAviso('')
    if (Object.keys(encontrados).length > 0) return
    const resultado = registrar({ nombre, email, password })
    if (!resultado.ok) {
      setErrorGeneral(resultado.error)
      return
    }
    setModo('login')
    setPassword('')
    setConfirmar('')
    setAviso('¡Cuenta creada! Ahora inicia sesión con tu correo y contraseña.')
  }

  return (
    <div className="login-pantalla">
      <Arte />

      <div className="login-panel">
        <div className="login-barra">
          <Link to="/" className="login-volver">
            <span aria-hidden="true">←</span> Volver al sitio
          </Link>
          <div className="login-punto" />
        </div>

        <motion.div key={modo} className="login-cuerpo" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: SUAVE }}>
          <div className="login-encabezado">
            <h1 className="login-titulo">
              {esLogin ? 'Bienvenido,' : 'Crea tu cuenta,'}
              <br />
              <em>{esLogin ? 'de vuelta.' : 'es gratis.'}</em>
            </h1>
            <p className="login-subtitulo">
              {esLogin ? 'Inicia sesión para continuar en tu espacio.' : 'Regístrate como cliente para comprar y agendar.'}
            </p>
          </div>

          <form noValidate onSubmit={esLogin ? entrar : crearCuenta} className="login-formulario" aria-label={esLogin ? 'Iniciar sesión' : 'Crear cuenta'}>
            {!esLogin && <Campo id="login-nombre" etiqueta="Nombre completo" tipo="text" valor={nombre} onChange={setNombre} placeholder="Tu nombre" error={errores.nombre} autoComplete="name" />}
            <Campo id="login-email" etiqueta="Correo electrónico" tipo="email" valor={email} onChange={setEmail} placeholder="nombre@ejemplo.com" error={errores.email} autoComplete="email" />
            <Campo id="login-password" etiqueta="Contraseña" tipo="password" valor={password} onChange={setPassword} placeholder="••••••••••" error={errores.password} autoComplete={esLogin ? 'current-password' : 'new-password'} />
            {!esLogin && <Campo id="login-confirmar" etiqueta="Confirmar contraseña" tipo="password" valor={confirmar} onChange={setConfirmar} placeholder="••••••••••" error={errores.confirmar} autoComplete="new-password" />}

            {aviso && <div role="status" className="login-aviso">{aviso}</div>}
            {errorGeneral && <div role="alert" className="login-error">{errorGeneral}</div>}

            <button type="submit" className="login-boton">{esLogin ? 'Iniciar sesión' : 'Crear cuenta'}</button>

            <div className="login-separador"><span>O</span></div>

            <button type="button" className="login-boton login-boton--secundario" onClick={cambiarModo}>
              {esLogin ? 'Crear una cuenta' : 'Ya tengo una cuenta'}
            </button>
          </form>
        </motion.div>

        <div className="login-pie">
          <span>© 2026 Veterinaria San Marcos</span>
          <Link to="/tienda">Tienda</Link>
        </div>
      </div>
    </div>
  )
}
