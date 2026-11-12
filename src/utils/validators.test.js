import { describe, expect, it } from 'vitest'
import { esEmailValido, validarUsuario } from './validators.js'

describe('validators.js', () => {
  const existentes = [{ id: 1, email: 'admin@sanmarcos.cl' }]

  it('esEmailValido acepta correos correctos y rechaza incorrectos', () => {
    expect(esEmailValido('ana@correo.cl')).toBe(true)
    expect(esEmailValido('ana@correo')).toBe(false)
    expect(esEmailValido('ana correo.cl')).toBe(false)
    expect(esEmailValido(undefined)).toBe(false)
  })

  it('validarUsuario no devuelve errores con datos válidos', () => {
    expect(validarUsuario({ nombre: 'Ana Pérez', email: 'ana@correo.cl', password: 'Clave1234', rol: 'CLIENTE' }, existentes)).toEqual({})
  })

  it('validarUsuario exige nombre de al menos 3 caracteres, correo, contraseña inicial y un rol válido', () => {
    const errores = validarUsuario({ nombre: 'A', email: '', password: '123', rol: 'Dueño' }, existentes)
    expect(Object.keys(errores).sort()).toEqual(['email', 'nombre', 'password', 'rol'])
  })

  it('validarUsuario detecta correos duplicados sin importar mayúsculas', () => {
    const errores = validarUsuario({ nombre: 'Otro Admin', email: 'ADMIN@sanmarcos.cl', password: 'Clave1234', rol: 'ADMIN' }, existentes)
    expect(errores.email).toContain('Ya existe')
  })
})
