import { useState } from 'react'

function RoleCard({ role, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onSelect(role.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '200px',
        padding: '36px 28px',
        background: hovered ? 'rgba(245,240,230,0.12)' : 'rgba(245,240,230,0.05)',
        border: `1px solid ${hovered ? 'rgba(168,200,180,0.5)' : 'rgba(245,240,230,0.12)'}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ fontSize: '22px', color: hovered ? '#a8c8b4' : '#5a7a68', marginBottom: '16px', transition: 'color 0.25s' }}>
        {role.icon}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#f5f0e8', letterSpacing: '0.02em', marginBottom: '8px' }}>
        {role.label}
      </div>
      <div style={{ fontSize: '12px', color: '#7a9a88', lineHeight: 1.5, letterSpacing: '0.01em' }}>
        {role.desc}
      </div>
      <div style={{ marginTop: '20px', fontSize: '11px', letterSpacing: '0.15em', color: hovered ? '#a8c8b4' : '#4a6a58', textTransform: 'uppercase', transition: 'color 0.25s' }}>
        Ingresar →
      </div>
    </button>
  )
}

function RoleSelect({ onSelect }) {
  const roles = [
    { id: 'recepcionista', label: 'Recepcionista', desc: 'Gestión de citas y atención al cliente', icon: '◎' },
    { id: 'administrador', label: 'Administrador', desc: 'Control total del sistema', icon: '◈' },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1b3a2a 0%, #2d4f3a 40%, #e8e4d8 100%)', fontFamily: 'var(--font-sans)' }}
    >
      <a
        href="/"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          backgroundColor: 'rgba(245, 240, 230, 0.1)',
          color: '#f5f0e8',
          border: '1px solid rgba(245, 240, 230, 0.25)',
          borderRadius: '9999px',
          fontSize: '12px',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(245, 240, 230, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(168, 200, 180, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(245, 240, 230, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.25)'
        }}
      >
        <span>←</span> Volver a la página principal
      </a>
      <svg
        className="fixed pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.07 }}
        width="700" height="700" viewBox="0 0 700 700" fill="none"
      >
        <circle cx="350" cy="350" r="300" stroke="#e8e4d8" strokeWidth="0.8" />
        <circle cx="350" cy="350" r="240" stroke="#e8e4d8" strokeWidth="0.8" />
        <circle cx="350" cy="350" r="180" stroke="#e8e4d8" strokeWidth="0.8" />
      </svg>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 300, color: '#f5f0e8', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Veterinaria
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 300, fontStyle: 'italic', color: '#a8c8b4', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            San Marcos
          </div>
          <div style={{ marginTop: '20px', fontSize: '10px', letterSpacing: '0.35em', color: 'white', textTransform: 'uppercase' }}>
            Selecciona tu perfil
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {roles.map(r => (
            <RoleCard key={String(r.id)} role={r} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({
  label, type, value, onChange, placeholder, focused, onFocus, onBlur,
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: focused ? '#2d6a4a' : '#8a9e92', marginBottom: '10px', transition: 'color 0.2s', fontFamily: 'var(--font-sans)' }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onFocus={onFocus} onBlur={onBlur} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '14px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${focused ? '#2d6a4a' : 'rgba(0,0,0,0.15)'}`, color: '#1b3a2a', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.25s', boxSizing: 'border-box' }}
      />
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState(null)

  if (!role) {
    return <RoleSelect onSelect={setRole} />
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1b3a2a 0%, #2d4f3a 40%, #e8e4d8 100%)', fontFamily: 'var(--font-sans)' }}>
      {/* Left — abstract visual panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 50%, #243d2e 0%, transparent 70%)' }} />

        <svg className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-58%, -52%)' }} width="600" height="600" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="260" stroke="#c8952a" strokeWidth="0.5" opacity="0.35" />
          <circle cx="300" cy="300" r="210" stroke="#c8952a" strokeWidth="0.5" opacity="0.2" />
          <circle cx="300" cy="300" r="160" stroke="#c8952a" strokeWidth="1" opacity="0.15" />
        </svg>

        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 900" fill="none">
          <line x1="-50" y1="900" x2="750" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.12" />
          <line x1="-200" y1="900" x2="600" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.08" />
          <line x1="100" y1="900" x2="900" y2="-100" stroke="#c8952a" strokeWidth="0.4" opacity="0.08" />
        </svg>

        <svg className="absolute" style={{ bottom: '-60px', left: '-80px' }} width="420" height="420" viewBox="0 0 420 420" fill="none">
          <circle cx="100" cy="320" r="200" fill="#c8952a" opacity="0.04" />
          <circle cx="100" cy="320" r="200" stroke="#c8952a" strokeWidth="0.6" opacity="0.2" />
        </svg>

        <svg className="absolute" style={{ top: '18%', right: '12%' }} width="80" height="80" viewBox="0 0 80 80">
          {[0, 20, 40, 60].map(x => [0, 20, 40, 60].map(y => (
            <circle key={`${x}-${y}`} cx={x + 10} cy={y + 10} r="1.2" fill="#c8952a" opacity="0.4" />
          )))}
        </svg>

        <div className="absolute" style={{ left: '52px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center center', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.35em', color: '#c8952a', opacity: 0.5, whiteSpace: 'nowrap' }}>
          ACCESO · SISTEMA
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 6vw, 80px)', fontWeight: 300, color: '#f5f0e8', lineHeight: 0.9, letterSpacing: '-0.02em' }}>Veterinaria</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 6vw, 80px)', fontWeight: 300, fontStyle: 'italic', color: '#c8952a', lineHeight: 0.9, letterSpacing: '-0.02em' }}>San Marcos</div>
            <div style={{ width: '40px', height: '1px', background: '#c8952a', margin: '28px auto 0', opacity: 0.6 }} />
            <div style={{ marginTop: '14px', fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.3em', color: '#666', textTransform: 'uppercase' }}>Acceso al Sistema</div>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-col justify-between w-full lg:w-105 xl:w-120 shrink-0 relative" style={{ background: 'rgba(245, 240, 230, 0.92)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(200,190,170,0.4)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-10 py-8" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <button
            onClick={() => setRole(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.2em', color: '#8a9e92', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#2d6a4a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8a9e92')}
          >
            <span style={{ fontSize: '14px' }}>←</span> Volver
          </button>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2d6a4a', opacity: 0.7 }} />
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-10 xl:px-14">
          <div style={{ marginBottom: '52px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 300, color: '#1b3a2a', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Bienvenido,
              <br />
              <span style={{ fontStyle: 'italic', color: '#2d6a4a' }}>
                {role === 'administrador' ? 'Administrador.' : 'Recepcionista.'}
              </span>
            </div>
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#7a8f82', letterSpacing: '0.01em', lineHeight: 1.6 }}>
              Inicia sesión para continuar en tu espacio.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Field label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="nombre@ejemplo.com" focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••••" focused={focused === 'password'} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button style={{ fontSize: '12px', color: '#7a8f82', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', transition: 'color 0.2s', fontFamily: 'var(--font-sans)' }} onMouseEnter={e => (e.currentTarget.style.color = '#2d6a4a')} onMouseLeave={e => (e.currentTarget.style.color = '#7a8f82')}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              style={{ marginTop: '12px', width: '100%', padding: '16px 24px', background: '#1b3a2a', color: '#e8e4d8', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', transition: 'background 0.25s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2d6a4a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1b3a2a'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Iniciar sesión
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: '11px', color: '#8a9e92', letterSpacing: '0.1em' }}>O</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
            </div>

            <button
              style={{ width: '100%', padding: '15px 24px', background: 'transparent', color: '#8a9e92', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', fontFamily: 'var(--font-sans)', transition: 'border-color 0.25s, color 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2d6a4a'; e.currentTarget.style.color = '#2d6a4a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; e.currentTarget.style.color = '#8a9e92' }}
            >
              Crear una cuenta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-7" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#aab8b0', letterSpacing: '0.05em' }}>© 2026 Veterinaria San Marcos</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacidad', 'Términos'].map(item => (
              <button key={item} style={{ fontSize: '11px', color: '#aab8b0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#2d6a4a')} onMouseLeave={e => (e.currentTarget.style.color = '#aab8b0')}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
