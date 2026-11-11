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
