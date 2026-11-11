// Validación y formato de tarjetas de pago, como funciones puras (sin React ni almacenamiento).
//
// Regla de seguridad del proyecto: el número completo y el código de seguridad (CVV) solo se usan
// para validar y pagar en el momento. Nunca se guardan: de una tarjeta solo se conserva la marca,
// los últimos 4 dígitos, el titular y el vencimiento (ver datosSeguros).

export const MARCAS = {
  VISA: { nombre: 'Visa', largos: [13, 16, 19], cvv: 3, gradiente: 'linear-gradient(135deg, #142a6e 0%, #2f5fd0 55%, #6f9cf5 100%)' },
  MASTERCARD: { nombre: 'Mastercard', largos: [16], cvv: 3, gradiente: 'linear-gradient(135deg, #1f1f24 0%, #43312c 50%, #c2561c 100%)' },
  AMEX: { nombre: 'American Express', largos: [15], cvv: 4, gradiente: 'linear-gradient(135deg, #0b5f73 0%, #1a8fa6 55%, #7cc8d6 100%)' },
  DINERS: { nombre: 'Diners Club', largos: [14, 16], cvv: 3, gradiente: 'linear-gradient(135deg, #2b2f3a 0%, #55627a 55%, #a3b1c6 100%)' },
}

/** Valores iniciales del formulario de una tarjeta. */
export const TARJETA_VACIA = { numero: '', titular: '', vencimiento: '', cvv: '' }

/** Fondo de la tarjeta cuando todavía no se reconoce la marca (colores de la clínica). */
export const GRADIENTE_NEUTRO = 'linear-gradient(135deg, #1b3a2a 0%, #2a6049 55%, #74b49b 100%)'

export function soloDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

/** Reconoce la marca por los primeros dígitos. Devuelve 'VISA', 'MASTERCARD', 'AMEX', 'DINERS' o null. */
export function detectarMarca(numero) {
  const n = soloDigitos(numero)
  if (/^4/.test(n)) return 'VISA'
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(n)) return 'MASTERCARD'
  if (/^3[47]/.test(n)) return 'AMEX'
  if (/^3(0[0-5]|[68])/.test(n)) return 'DINERS'
  return null
}

/** Algoritmo de Luhn: detecta números mal escritos (un dígito cambiado o dos dígitos invertidos). */
export function pasaLuhn(numero) {
  const n = soloDigitos(numero)
  if (n.length < 12) return false
  let suma = 0
  for (let i = 0; i < n.length; i++) {
    let digito = Number(n[n.length - 1 - i])
    if (i % 2 === 1) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
  }
  return suma % 10 === 0
}

/** Largo máximo de dígitos según la marca. */
function largoMaximo(marca) {
  return marca ? Math.max(...MARCAS[marca].largos) : 19
}

/** Formatea el número mientras se escribe: grupos de 4 (American Express: 4-6-5). */
export function formatearNumero(valor) {
  const marca = detectarMarca(valor)
  const n = soloDigitos(valor).slice(0, largoMaximo(marca))
  if (marca === 'AMEX') return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(' ')
  return n.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Formatea el vencimiento como MM/AA mientras se escribe. "5" pasa a "05". */
export function formatearVencimiento(valor) {
  let n = soloDigitos(valor).slice(0, 4)
  if (n.length === 1 && Number(n) > 1) n = `0${n}`
  return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n
}

/** Convierte "MM/AA" en { mes, anio }, o null si el texto no es una fecha válida. */
export function leerVencimiento(texto) {
  const partes = /^(\d{2})\/(\d{2})$/.exec(texto ?? '')
  if (!partes) return null
  const mes = Number(partes[1])
  if (mes < 1 || mes > 12) return null
  return { mes, anio: 2000 + Number(partes[2]) }
}

/** Una tarjeta sirve hasta el último día de su mes de vencimiento. */
export function estaVencida({ mes, anio }, hoy = new Date()) {
  return anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)
}

export function textoVencimiento({ mes, anio }) {
  return `${String(mes).padStart(2, '0')}/${String(anio).slice(-2)}`
}

/** Devuelve el mensaje de error del CVV, o null si es válido. */
export function validarCvv(cvv, marca) {
  const largo = marca ? MARCAS[marca].cvv : null
  const n = soloDigitos(cvv)
  if (!n) return 'Ingresa el código de seguridad.'
  if (largo ? n.length !== largo : n.length < 3 || n.length > 4) {
    return `El código de seguridad debe tener ${largo ?? '3 o 4'} dígitos.`
  }
  return null
}

/**
 * Valida todos los datos de una tarjeta nueva. Devuelve { campo: 'mensaje' }; vacío si es válida.
 * pedirCvv: false al guardar una tarjeta en la cuenta (el CVV solo se pide al pagar).
 */
export function validarTarjeta({ numero = '', titular = '', vencimiento = '', cvv = '' }, { pedirCvv = true, hoy = new Date() } = {}) {
  const errores = {}
  const digitos = soloDigitos(numero)
  const marca = detectarMarca(digitos)

  if (!digitos) errores.numero = 'Ingresa el número de la tarjeta.'
  else if (!marca) errores.numero = 'Tarjeta no reconocida. Aceptamos Visa, Mastercard, American Express y Diners Club.'
  else if (!MARCAS[marca].largos.includes(digitos.length)) errores.numero = 'Al número de la tarjeta le faltan dígitos.'
  else if (!pasaLuhn(digitos)) errores.numero = 'El número de la tarjeta no es válido. Revisa que esté bien escrito.'

  if (titular.trim().length < 3 || !/^[\p{L}\s.'-]+$/u.test(titular.trim())) {
    errores.titular = 'Ingresa el nombre como aparece en la tarjeta.'
  }

  const fecha = leerVencimiento(vencimiento)
  if (!fecha) errores.vencimiento = 'Usa el formato MM/AA.'
  else if (estaVencida(fecha, hoy)) errores.vencimiento = 'La tarjeta está vencida.'
  else if (fecha.anio > hoy.getFullYear() + 20) errores.vencimiento = 'Revisa el año de vencimiento.'

  if (pedirCvv) {
    const errorCvv = validarCvv(cvv, marca)
    if (errorCvv) errores.cvv = errorCvv
  }
  return errores
}

/** Lo único que se conserva de una tarjeta: nunca el número completo ni el CVV. */
export function datosSeguros({ numero, titular, vencimiento }) {
  const digitos = soloDigitos(numero)
  const { mes, anio } = leerVencimiento(vencimiento)
  return {
    marca: detectarMarca(digitos),
    ultimos4: digitos.slice(-4),
    titular: titular.trim().toUpperCase(),
    mes,
    anio,
  }
}

/** Texto corto para mostrar una tarjeta, por ejemplo "Visa •••• 1111". */
export function describirTarjeta({ marca, ultimos4 }) {
  return `${MARCAS[marca]?.nombre ?? 'Tarjeta'} •••• ${ultimos4}`
}
