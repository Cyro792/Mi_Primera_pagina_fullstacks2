import { esEmailValido, validarUsuario } from '../js/admin/validators.js'
import { autenticar, validarLogin } from '../js/auth.js'

describe('validators.js', () => {
  const existentes = [{ id: 1, email: 'admin@sanmarcos.cl' }]

  it('esEmailValido acepta correos correctos y rechaza incorrectos', () => {
    expect(esEmailValido('ana@correo.cl')).toBeTrue()
    expect(esEmailValido('ana@correo')).toBeFalse()
    expect(esEmailValido('ana correo.cl')).toBeFalse()
    expect(esEmailValido(undefined)).toBeFalse()
  })

  it('validarUsuario no devuelve errores con datos válidos', () => {
    expect(validarUsuario({ nombre: 'Ana Pérez', email: 'ana@correo.cl', rol: 'Dueño' }, existentes)).toEqual({})
  })

  it('validarUsuario exige nombre de al menos 3 caracteres, correo y rol', () => {
    const errores = validarUsuario({ nombre: 'A', email: '', rol: '' }, existentes)
    expect(Object.keys(errores).sort()).toEqual(['email', 'nombre', 'rol'])
  })

  it('validarUsuario detecta correos duplicados sin importar mayúsculas', () => {
    const errores = validarUsuario({ nombre: 'Otro Admin', email: 'ADMIN@sanmarcos.cl', rol: 'Administrador' }, existentes)
    expect(errores.email).toContain('Ya existe')
  })
})

describe('auth.js (login)', () => {
  it('validarLogin pide correo y contraseña', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({ email: 'Ingresa tu correo.', password: 'Ingresa tu contraseña.' })
  })

  it('validarLogin revisa formato de correo y largo mínimo de contraseña', () => {
    const errores = validarLogin({ email: 'mal-correo', password: '123' })
    expect(errores.email).toContain('formato')
    expect(errores.password).toContain('8 caracteres')
  })

  it('autenticar acepta credenciales correctas del rol correcto', () => {
    expect(autenticar({ email: ' Admin@sanmarcos.cl ', password: 'Admin123!', role: 'administrador' }).ok).toBeTrue()
  })

  it('autenticar rechaza contraseña incorrecta y rol equivocado', () => {
    expect(autenticar({ email: 'admin@sanmarcos.cl', password: 'Incorrecta1', role: 'administrador' }).ok).toBeFalse()
    expect(autenticar({ email: 'admin@sanmarcos.cl', password: 'Admin123!', role: 'recepcionista' }).error).toContain('perfil')
  })

  it('autenticar acepta una lista de cuentas falsa (mock) inyectada', () => {
    const cuentasFalsas = [{ email: 'test@test.cl', password: 'Password1', role: 'recepcionista' }]
    expect(autenticar({ email: 'test@test.cl', password: 'Password1', role: 'recepcionista' }, cuentasFalsas).ok).toBeTrue()
  })
})
