import { describe, expect, it } from 'vitest'
import {
  datosSeguros,
  describirTarjeta,
  detectarMarca,
  estaVencida,
  formatearNumero,
  formatearVencimiento,
  leerVencimiento,
  pasaLuhn,
  validarCvv,
  validarTarjeta,
} from './tarjeta.js'

// Números de prueba publicados por las marcas: no corresponden a tarjetas reales.
const VISA = '4111 1111 1111 1111'
const MASTERCARD = '5555 5555 5555 4444'
const AMEX = '378282246310005'
const DINERS = '36227206271667'
const HOY = new Date(2026, 10, 10)
const valida = { numero: VISA, titular: 'Ana García', vencimiento: '12/30', cvv: '123' }

describe('tarjeta.js (validación y formato de tarjetas)', () => {
  it('detectarMarca reconoce Visa, Mastercard (series 5 y 2), American Express y Diners', () => {
    expect(detectarMarca(VISA)).toBe('VISA')
    expect(detectarMarca(MASTERCARD)).toBe('MASTERCARD')
    expect(detectarMarca('2221 0000 0000 0009')).toBe('MASTERCARD')
    expect(detectarMarca(AMEX)).toBe('AMEX')
    expect(detectarMarca(DINERS)).toBe('DINERS')
    expect(detectarMarca('9999')).toBeNull()
    expect(detectarMarca('')).toBeNull()
  })

  it('pasaLuhn acepta números válidos y detecta un dígito mal escrito', () => {
    expect(pasaLuhn(VISA)).toBe(true)
    expect(pasaLuhn(AMEX)).toBe(true)
    expect(pasaLuhn('4111 1111 1111 1112')).toBe(false)
    expect(pasaLuhn('4111')).toBe(false)
  })

  it('formatearNumero agrupa de a 4 (American Express 4-6-5) y corta los dígitos sobrantes', () => {
    expect(formatearNumero('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(formatearNumero('4111-1111 11')).toBe('4111 1111 11')
    expect(formatearNumero('3782822463100059999')).toBe('3782 822463 10005')
    expect(formatearNumero('abc')).toBe('')
  })

  it('formatearVencimiento escribe MM/AA y completa el mes con 0', () => {
    expect(formatearVencimiento('1230')).toBe('12/30')
    expect(formatearVencimiento('5')).toBe('05')
    expect(formatearVencimiento('0528')).toBe('05/28')
    expect(formatearVencimiento('12/301')).toBe('12/30')
  })

  it('leerVencimiento y estaVencida: la tarjeta vale hasta el último día de su mes', () => {
    expect(leerVencimiento('13/30')).toBeNull()
    expect(leerVencimiento('1230')).toBeNull()
    expect(estaVencida(leerVencimiento('11/26'), HOY)).toBe(false)
    expect(estaVencida(leerVencimiento('10/26'), HOY)).toBe(true)
    expect(estaVencida(leerVencimiento('01/27'), HOY)).toBe(false)
  })

  it('validarCvv exige 3 dígitos, o 4 en American Express', () => {
    expect(validarCvv('123', 'VISA')).toBeNull()
    expect(validarCvv('12', 'VISA')).toContain('3 dígitos')
    expect(validarCvv('1234', 'AMEX')).toBeNull()
    expect(validarCvv('123', 'AMEX')).toContain('4 dígitos')
    expect(validarCvv('', 'VISA')).toContain('Ingresa')
  })

  it('validarTarjeta no devuelve errores con datos válidos', () => {
    expect(validarTarjeta(valida, { hoy: HOY })).toEqual({})
    expect(validarTarjeta({ ...valida, numero: AMEX, cvv: '1234' }, { hoy: HOY })).toEqual({})
  })

  it('validarTarjeta detecta cada campo incorrecto', () => {
    const errores = validarTarjeta({ numero: '', titular: 'A', vencimiento: '1', cvv: '' }, { hoy: HOY })
    expect(Object.keys(errores).sort()).toEqual(['cvv', 'numero', 'titular', 'vencimiento'])
    expect(validarTarjeta({ ...valida, numero: '9999 9999 9999 9999' }, { hoy: HOY }).numero).toContain('no reconocida')
    expect(validarTarjeta({ ...valida, numero: '4111 1111 1111' }, { hoy: HOY }).numero).toContain('faltan dígitos')
    expect(validarTarjeta({ ...valida, numero: '4111 1111 1111 1112' }, { hoy: HOY }).numero).toContain('no es válido')
    expect(validarTarjeta({ ...valida, vencimiento: '01/24' }, { hoy: HOY }).vencimiento).toContain('vencida')
    expect(validarTarjeta({ ...valida, titular: 'Ana 123' }, { hoy: HOY }).titular).toBeDefined()
  })

  it('validarTarjeta puede omitir el CVV (al guardar una tarjeta en la cuenta)', () => {
    expect(validarTarjeta({ ...valida, cvv: '' }, { pedirCvv: false, hoy: HOY })).toEqual({})
  })

  it('datosSeguros conserva solo marca, últimos 4, titular y vencimiento: nunca el número ni el CVV', () => {
    const segura = datosSeguros(valida)
    expect(segura).toEqual({ marca: 'VISA', ultimos4: '1111', titular: 'ANA GARCÍA', mes: 12, anio: 2030 })
    expect(JSON.stringify(segura)).not.toContain('4111111111111111')
    expect(segura).not.toHaveProperty('cvv')
    expect(segura).not.toHaveProperty('numero')
  })

  it('describirTarjeta muestra la marca y los últimos 4 dígitos', () => {
    expect(describirTarjeta({ marca: 'MASTERCARD', ultimos4: '4444' })).toBe('Mastercard •••• 4444')
  })
})
