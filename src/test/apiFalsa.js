// API falsa para las pruebas: reemplaza fetch y responde como el backend Spring Boot, con los mismos
// datos iniciales (DataSeeder), las mismas reglas principales y el mismo formato de error.
// Así las pruebas recorren el código real del frontend (servicios, contextos y páginas) sin servidor.
import { vi } from 'vitest'

const CUENTAS = [
  { id: 1, nombre: 'Administrador General', email: 'admin@sanmarcos.cl', password: 'Admin123!', rol: 'ADMIN', telefono: null },
  { id: 2, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', password: 'Recep123!', rol: 'RECEPCIONISTA', telefono: '+56 9 5094 8714' },
  { id: 3, nombre: 'Ana García', email: 'ana.garcia@correo.cl', password: 'Cliente123!', rol: 'CLIENTE', telefono: '+56 9 8765 4321' },
]

export const CATEGORIAS = [
  { id: 1, nombre: 'Servicios clínicos', descripcion: 'Atenciones veterinarias que se agendan en la clínica.' },
  { id: 2, nombre: 'Alimentos', descripcion: 'Alimento seco y húmedo para perros y gatos.' },
  { id: 3, nombre: 'Accesorios', descripcion: 'Collares, juguetes y artículos de paseo.' },
  { id: 4, nombre: 'Higiene y cuidado', descripcion: 'Productos de aseo y cuidado diario.' },
]

const servicio = (id, nombre, descripcion, precio, duracionMin) => ({
  id, nombre, descripcion, precio, tipo: 'SERVICIO', stock: null, duracionMin, imagenUrl: null, activo: true, categoriaId: 1,
})
const articulo = (id, nombre, descripcion, precio, stock, categoriaId) => ({
  id, nombre, descripcion, precio, tipo: 'PRODUCTO', stock, duracionMin: null, imagenUrl: null, activo: true, categoriaId,
})

export const PRODUCTOS = [
  servicio(1, 'Consulta General', 'Evaluación clínica completa y orientación al dueño.', 25000, 30),
  servicio(2, 'Vacunación', 'Aplicación de vacunas según el calendario de la mascota.', 18000, 20),
  servicio(3, 'Laboratorio y Exámenes', 'Toma de muestras y exámenes de laboratorio.', 35000, 45),
  servicio(4, 'Odontología', 'Limpieza dental y revisión de encías.', 40000, 60),
  servicio(5, 'Cirugía', 'Procedimientos quirúrgicos programados.', 120000, 120),
  servicio(6, 'Urgencias 24h', 'Atención inmediata fuera de horario.', 50000, 45),
  articulo(7, 'Alimento premium perro adulto 15 kg', 'Alimento seco balanceado para perros adultos.', 42990, 20, 2),
  articulo(8, 'Alimento gato esterilizado 7,5 kg', 'Alimento seco para gatos esterilizados.', 31990, 15, 2),
  articulo(9, 'Collar antipulgas', 'Protección contra pulgas y garrapatas por 8 meses.', 12990, 30, 3),
  articulo(10, 'Juguete mordedor', 'Mordedor de goma resistente para perros.', 5990, 40, 3),
  articulo(11, 'Shampoo hipoalergénico 500 ml', 'Shampoo suave para pieles sensibles.', 8990, 25, 4),
  articulo(12, 'Arena sanitaria 10 kg', 'Arena aglomerante de bajo polvo.', 9990, 18, 4),
]

const MARCAS = { VISA: 'Visa', MASTERCARD: 'Mastercard', AMEX: 'American Express', DINERS: 'Diners Club' }
const SIGUIENTES = { PENDIENTE: ['CONFIRMADA', 'CANCELADA'], CONFIRMADA: ['COMPLETADA', 'CANCELADA'], COMPLETADA: [], CANCELADA: [] }

function marcaDe(digitos) {
  if (digitos.startsWith('4')) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digitos)) return 'MASTERCARD'
  if (/^3[47]/.test(digitos)) return 'AMEX'
  if (/^3(0[0-5]|[68])/.test(digitos)) return 'DINERS'
  return null
}

class Respuesta {
  constructor(status, cuerpo) {
    this.status = status
    this.ok = status >= 200 && status < 300
    this.cuerpo = cuerpo
  }
  async text() {
    return this.cuerpo === undefined ? '' : JSON.stringify(this.cuerpo)
  }
}

const NOMBRES_ERROR = { 400: 'Bad Request', 401: 'Unauthorized', 402: 'Payment Required', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity' }

class ErrorApi extends Error {
  constructor(status, mensaje, errores = null) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}
const falla = (status, mensaje, errores) => {
  throw new ErrorApi(status, mensaje, errores)
}

let instalada = null

/** La API falsa instalada para la prueba actual (setupTests instala una nueva antes de cada prueba). */
export function apiFalsa() {
  return instalada
}

/**
 * Instala la API falsa (reemplaza globalThis.fetch). Devuelve un objeto para preparar datos y
 * revisar lo que pasó: estado (los "datos de la base"), peticiones (cada llamada hecha),
 * iniciarSesionCon(email) (simula la cookie de una sesión abierta) y fallar(metodo, ruta, status, mensaje).
 */
export function instalarApiFalsa() {
  const hoy = new Date()
  const iso = (dias) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() + dias)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const estado = {
    usuarios: CUENTAS.map((c) => ({ ...c, activo: true, region: null, comuna: null, direccion: null, avatarIcono: null, avatarColor: null })),
    categorias: CATEGORIAS.map((c) => ({ ...c })),
    productos: PRODUCTOS.map((p) => ({ ...p })),
    tarjetas: [],
    boletas: [],
    citas: [
      { id: 1, mascotaId: 1, nombreMascota: 'Pepe', nombreDueno: 'Ana García', telefonoContacto: '+56 9 8765 4321', servicioId: 1, fecha: iso(0), hora: '09:30', estado: 'CONFIRMADA', notas: 'Chequeo preventivo anual.' },
      { id: 2, mascotaId: null, nombreMascota: 'Luna', nombreDueno: 'Pedro Soto', telefonoContacto: '+56 9 1122 3344', servicioId: 2, fecha: iso(1), hora: '11:00', estado: 'PENDIENTE', notas: null },
      { id: 3, mascotaId: null, nombreMascota: 'Thor', nombreDueno: 'Carla Mendoza', telefonoContacto: '+56 9 5566 7788', servicioId: 4, fecha: iso(-2), hora: '15:30', estado: 'COMPLETADA', notas: null },
    ],
    cookie: null, // id del usuario dueño de la cookie de renovación (como la guarda el navegador)
  }
  const peticiones = []
  const fallas = []
  let siguienteId = 100

  const usuarioResp = (u) => ({
    id: u.id, nombre: u.nombre, email: u.email, telefono: u.telefono, rol: u.rol, activo: u.activo, region: u.region,
    comuna: u.comuna, direccion: u.direccion, avatarIcono: u.avatarIcono, avatarColor: u.avatarColor, fechaCreacion: '2026-01-01T10:00:00',
  })
  const productoResp = (p) => ({ ...p, categoriaNombre: estado.categorias.find((c) => c.id === p.categoriaId)?.nombre ?? '' })
  const citaResp = (c) => ({ ...c, servicioNombre: estado.productos.find((p) => p.id === c.servicioId)?.nombre, fechaCreacion: '2026-01-01T10:00:00' })
  const ordenarTarjetas = (lista) => [...lista].sort((a, b) => Number(b.predeterminada) - Number(a.predeterminada) || b.id - a.id)
  const sinDueno = ({ usuarioId: _dueno, ...t }) => t
  const tarjetasDe = (id) => ordenarTarjetas(estado.tarjetas.filter((t) => t.usuarioId === id)).map(sinDueno)

  const sesion = (u) => {
    estado.cookie = u.id
    return { accessToken: `token-${u.id}`, tipo: 'Bearer', expiraEn: 900, usuario: usuarioResp(u) }
  }

  function quienEs(cabeceras) {
    const token = cabeceras?.Authorization?.replace('Bearer ', '')
    const u = estado.usuarios.find((x) => `token-${x.id}` === token && x.activo)
    return u ?? null
  }

  function exigir(actor, ...roles) {
    if (!actor) falla(401, 'Necesitas iniciar sesión para usar este recurso.')
    if (roles.length && !roles.includes(actor.rol)) falla(403, 'No tienes permiso para realizar esta acción.')
    return actor
  }

  function validarTarjetaNueva({ numero = '', titular = '', vencimiento = '' }) {
    const digitos = numero.replace(/\D/g, '')
    const errores = {}
    const marca = marcaDe(digitos)
    if (!marca || digitos.length < 13) errores.numero = 'El número de la tarjeta no es válido.'
    if (!titular.trim()) errores.titular = 'Ingresa el nombre del titular.'
    const [mes, anio] = vencimiento.split('/').map(Number)
    if (!mes || !anio) errores.vencimiento = 'Usa el formato MM/AA.'
    if (Object.keys(errores).length) falla(400, 'Revisa los datos de la tarjeta.', errores)
    return { digitos, marca, ultimos4: digitos.slice(-4), titular: titular.trim().toUpperCase(), mes, anio: 2000 + anio }
  }

  function guardarTarjetaDe(usuarioId, segura) {
    const propias = estado.tarjetas.filter((t) => t.usuarioId === usuarioId)
    const existente = propias.find((t) => t.marca === segura.marca && t.ultimos4 === segura.ultimos4 && t.mes === segura.mes && t.anio === segura.anio)
    if (existente) return { tarjeta: existente, duplicada: true }
    const tarjeta = {
      id: siguienteId++, usuarioId, marca: segura.marca, marcaNombre: MARCAS[segura.marca], ultimos4: segura.ultimos4,
      titular: segura.titular, mes: segura.mes, anio: segura.anio, predeterminada: propias.length === 0, vencida: false,
    }
    estado.tarjetas.push(tarjeta)
    return { tarjeta, duplicada: false }
  }

  // Tabla de rutas: [método, patrón, función(contexto) -> [status, cuerpo]]
  const rutas = [
    ['POST', '/auth/login', ({ cuerpo }) => {
      const u = estado.usuarios.find((x) => x.email === cuerpo.email?.toLowerCase() && x.password === cuerpo.password)
      if (!u) falla(401, 'Correo o contraseña incorrectos.')
      if (!u.activo) falla(401, 'Tu cuenta está desactivada. Comunícate con la clínica.')
      return [200, sesion(u)]
    }],
    ['POST', '/auth/registro', ({ cuerpo }) => {
      if (estado.usuarios.some((x) => x.email === cuerpo.email)) falla(409, 'Ya existe una cuenta con ese correo.', { email: 'Ya existe una cuenta con ese correo.' })
      const u = { id: siguienteId++, nombre: cuerpo.nombre, email: cuerpo.email, password: cuerpo.password, rol: 'CLIENTE', telefono: null, activo: true }
      estado.usuarios.push(u)
      return [201, sesion(u)]
    }],
    ['POST', '/auth/refresh', () => {
      const u = estado.usuarios.find((x) => x.id === estado.cookie && x.activo)
      if (!u) falla(401, 'Tu sesión expiró o ya no es válida. Inicia sesión nuevamente.')
      return [200, sesion(u)]
    }],
    ['POST', '/auth/logout', () => {
      estado.cookie = null
      return [204]
    }],
    ['GET', '/perfil', ({ actor }) => [200, usuarioResp(exigir(actor))]],
    ['PUT', '/perfil', ({ actor, cuerpo }) => {
      const u = exigir(actor)
      Object.assign(u, cuerpo)
      return [200, usuarioResp(u)]
    }],
    ['PUT', '/perfil/password', ({ actor, cuerpo }) => {
      const u = exigir(actor)
      if (cuerpo.actual !== u.password) falla(400, 'Revisa los datos enviados.', { actual: 'La contraseña actual no es correcta.' })
      u.password = cuerpo.nueva
      return [204]
    }],
    ['GET', '/categorias', () => [200, estado.categorias]],
    ['GET', '/productos', ({ actor, parametros }) => {
      const verInactivos = parametros.get('incluirInactivos') === 'true' && actor?.rol === 'ADMIN'
      const categoriaId = Number(parametros.get('categoriaId')) || null
      const tipo = parametros.get('tipo')
      const lista = estado.productos.filter((p) => (verInactivos || p.activo) && (!categoriaId || p.categoriaId === categoriaId) && (!tipo || p.tipo === tipo))
      return [200, lista.map(productoResp)]
    }],
    ['GET', '/productos/:id', ({ id }) => {
      const p = estado.productos.find((x) => x.id === id && x.activo)
      if (!p) falla(404, `No existe el producto ${id}.`)
      return [200, productoResp(p)]
    }],
    ['POST', '/productos', ({ actor, cuerpo }) => {
      exigir(actor, 'ADMIN')
      const p = { ...cuerpo, id: siguienteId++, imagenUrl: null, activo: cuerpo.activo ?? true }
      estado.productos.push(p)
      return [201, productoResp(p)]
    }],
    ['PUT', '/productos/:id', ({ actor, id, cuerpo }) => {
      exigir(actor, 'ADMIN')
      const p = estado.productos.find((x) => x.id === id) ?? falla(404, `No existe el producto ${id}.`)
      Object.assign(p, cuerpo)
      return [200, productoResp(p)]
    }],
    ['DELETE', '/productos/:id', ({ actor, id }) => {
      exigir(actor, 'ADMIN')
      const p = estado.productos.find((x) => x.id === id) ?? falla(404, `No existe el producto ${id}.`)
      p.activo = false
      return [204]
    }],
    ['GET', '/tarjetas', ({ actor }) => [200, tarjetasDe(exigir(actor, 'CLIENTE').id)]],
    ['POST', '/tarjetas', ({ actor, cuerpo }) => {
      const u = exigir(actor, 'CLIENTE')
      const { tarjeta, duplicada } = guardarTarjetaDe(u.id, validarTarjetaNueva(cuerpo))
      return [duplicada ? 200 : 201, sinDueno(tarjeta)]
    }],
    ['PATCH', '/tarjetas/:id/predeterminada', ({ actor, id }) => {
      const u = exigir(actor, 'CLIENTE')
      if (!estado.tarjetas.some((t) => t.id === id && t.usuarioId === u.id)) falla(404, `No existe la tarjeta ${id}.`)
      estado.tarjetas.filter((t) => t.usuarioId === u.id).forEach((t) => (t.predeterminada = t.id === id))
      return [200, tarjetasDe(u.id)]
    }],
    ['DELETE', '/tarjetas/:id', ({ actor, id }) => {
      const u = exigir(actor, 'CLIENTE')
      const t = estado.tarjetas.find((x) => x.id === id && x.usuarioId === u.id) ?? falla(404, `No existe la tarjeta ${id}.`)
      estado.tarjetas = estado.tarjetas.filter((x) => x !== t)
      const restantes = ordenarTarjetas(estado.tarjetas.filter((x) => x.usuarioId === u.id))
      if (t.predeterminada && restantes.length) restantes[0].predeterminada = true
      return [204]
    }],
    ['POST', '/boletas', ({ actor, cuerpo }) => {
      const u = exigir(actor, 'CLIENTE')
      const { pago, items } = cuerpo
      if (!pago.cvv) falla(400, 'Revisa los datos enviados.', { cvv: 'Ingresa el código de seguridad.' })
      let medio
      if (pago.tarjetaGuardadaId) {
        medio = estado.tarjetas.find((t) => t.id === pago.tarjetaGuardadaId && t.usuarioId === u.id) ?? falla(404, 'No existe la tarjeta.')
      } else {
        medio = validarTarjetaNueva(pago.tarjeta)
        if (medio.digitos === '4000000000000002') falla(402, 'El banco rechazó la tarjeta. Prueba con otra tarjeta o comunícate con tu banco.')
      }
      const detalles = items.map(({ productoId, cantidad }) => {
        const p = estado.productos.find((x) => x.id === productoId && x.activo) ?? falla(422, `El producto ${productoId} ya no está disponible.`)
        if (p.tipo === 'PRODUCTO' && p.stock < cantidad) falla(409, `Stock insuficiente de "${p.nombre}": quedan ${p.stock}.`)
        return { p, cantidad }
      })
      detalles.forEach(({ p, cantidad }) => {
        if (p.tipo === 'PRODUCTO') p.stock -= cantidad
      })
      if (!pago.tarjetaGuardadaId && pago.guardarTarjeta) guardarTarjetaDe(u.id, medio)
      const boleta = {
        id: siguienteId++, fecha: '2026-11-11T12:00:00', clienteId: u.id, clienteNombre: u.nombre, clienteEmail: u.email, estado: 'PAGADA',
        total: detalles.reduce((t, { p, cantidad }) => t + p.precio * cantidad, 0),
        medioPago: { marca: medio.marca, marcaNombre: MARCAS[medio.marca], ultimos4: medio.ultimos4, codigoAutorizacion: '123456' },
        detalles: detalles.map(({ p, cantidad }) => ({ productoId: p.id, nombre: p.nombre, cantidad, precioUnitario: p.precio, subtotal: p.precio * cantidad })),
      }
      estado.boletas.unshift(boleta)
      return [201, boleta]
    }],
    ['GET', '/boletas/mias', ({ actor }) => {
      const u = exigir(actor, 'CLIENTE')
      return [200, estado.boletas.filter((b) => b.clienteId === u.id)]
    }],
    ['POST', '/citas', ({ cuerpo }) => {
      const errores = {}
      if (!cuerpo.mascotaId && !cuerpo.nombreMascota) errores.nombreMascota = 'Indica el nombre de la mascota.'
      if (!cuerpo.mascotaId && !cuerpo.nombreDueno) errores.nombreDueno = 'Indica el nombre del dueño.'
      if (!cuerpo.mascotaId && !cuerpo.telefonoContacto) errores.telefonoContacto = 'Indica un teléfono de contacto.'
      if (Object.keys(errores).length) falla(400, 'Revisa los datos enviados.', errores)
      if (estado.citas.some((c) => c.fecha === cuerpo.fecha && c.hora === cuerpo.hora && c.estado !== 'CANCELADA')) {
        falla(409, `Ya hay una cita agendada el ${cuerpo.fecha} a las ${cuerpo.hora}. Elige otro horario.`)
      }
      const cita = { ...cuerpo, id: siguienteId++, estado: 'PENDIENTE' }
      estado.citas.push(cita)
      return [201, citaResp(cita)]
    }],
    ['GET', '/citas', ({ actor }) => {
      exigir(actor, 'ADMIN', 'RECEPCIONISTA')
      const lista = [...estado.citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      return [200, lista.map(citaResp)]
    }],
    ['PUT', '/citas/:id', ({ actor, id, cuerpo }) => {
      exigir(actor, 'ADMIN', 'RECEPCIONISTA')
      const c = estado.citas.find((x) => x.id === id) ?? falla(404, `No existe la cita ${id}.`)
      if (!SIGUIENTES[c.estado].length) falla(409, 'La cita ya no se puede modificar.')
      Object.assign(c, cuerpo)
      return [200, citaResp(c)]
    }],
    ['PATCH', '/citas/:id/estado', ({ actor, id, cuerpo }) => {
      exigir(actor, 'ADMIN', 'RECEPCIONISTA')
      const c = estado.citas.find((x) => x.id === id) ?? falla(404, `No existe la cita ${id}.`)
      if (!SIGUIENTES[c.estado].includes(cuerpo.estado)) falla(409, `Una cita ${c.estado.toLowerCase()} no puede pasar a ${cuerpo.estado.toLowerCase()}.`)
      c.estado = cuerpo.estado
      return [200, citaResp(c)]
    }],
    ['DELETE', '/citas/:id', ({ actor, id }) => {
      exigir(actor, 'ADMIN', 'RECEPCIONISTA')
      const c = estado.citas.find((x) => x.id === id) ?? falla(404, `No existe la cita ${id}.`)
      if (c.estado === 'COMPLETADA') falla(409, 'Las citas completadas son parte del historial clínico y no se eliminan.')
      estado.citas = estado.citas.filter((x) => x !== c)
      return [204]
    }],
    // Cada microservicio entrega el reporte de sus propios datos.
    ['GET', '/reportes/citas', ({ actor }) => {
      exigir(actor, 'ADMIN')
      const citasPorEstado = { PENDIENTE: 0, CONFIRMADA: 0, COMPLETADA: 0, CANCELADA: 0 }
      estado.citas.forEach((c) => (citasPorEstado[c.estado] += 1))
      return [200, {
        citasPorEstado,
        citasDeHoy: estado.citas.filter((c) => c.fecha === iso(0) && c.estado !== 'CANCELADA').length,
        citasPorServicio: [{ etiqueta: 'Consulta General', valor: 1 }, { etiqueta: 'Vacunación', valor: 1 }],
      }]
    }],
    ['GET', '/reportes/ventas', ({ actor }) => {
      exigir(actor, 'ADMIN')
      const pagadas = estado.boletas.filter((b) => b.estado === 'PAGADA')
      return [200, { boletasPagadas: pagadas.length, ventasTotales: pagadas.reduce((t, b) => t + b.total, 0), ventasPorProducto: [] }]
    }],
    ['GET', '/reportes/usuarios', ({ actor }) => {
      exigir(actor, 'ADMIN')
      return [200, { clientesActivos: estado.usuarios.filter((u) => u.rol === 'CLIENTE' && u.activo).length }]
    }],
    ['GET', '/reportes/inventario', ({ actor }) => {
      exigir(actor, 'ADMIN')
      return [200, { productosConStockBajo: estado.productos.filter((p) => p.tipo === 'PRODUCTO' && p.stock <= 5).map(productoResp) }]
    }],
    ['GET', '/usuarios', ({ actor }) => {
      exigir(actor, 'ADMIN')
      return [200, estado.usuarios.map(usuarioResp)]
    }],
    ['POST', '/usuarios', ({ actor, cuerpo }) => {
      exigir(actor, 'ADMIN')
      if (estado.usuarios.some((x) => x.email === cuerpo.email)) falla(409, 'Ya existe una cuenta con ese correo.', { email: 'Ya existe una cuenta con ese correo.' })
      const u = { ...cuerpo, id: siguienteId++, activo: true }
      estado.usuarios.push(u)
      return [201, usuarioResp(u)]
    }],
    ['PATCH', '/usuarios/:id/activo', ({ actor, id, cuerpo }) => {
      const yo = exigir(actor, 'ADMIN')
      if (id === yo.id) falla(422, 'No puedes desactivar tu propia cuenta.')
      const u = estado.usuarios.find((x) => x.id === id) ?? falla(404, `No existe el usuario ${id}.`)
      u.activo = cuerpo.activo
      return [200, usuarioResp(u)]
    }],
  ]

  function buscarRuta(metodo, camino) {
    for (const [m, patron, accion] of rutas) {
      if (m !== metodo) continue
      const regex = new RegExp(`^${patron.replace(':id', '(\\d+)')}$`)
      const coincide = camino.match(regex)
      if (coincide) return { accion, id: coincide[1] ? Number(coincide[1]) : null }
    }
    return null
  }

  const fetchFalso = vi.fn(async (url, opciones = {}) => {
    const metodo = opciones.method ?? 'GET'
    const [ruta, query = ''] = url.replace(/^\/api\/v1/, '').split('?')
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined
    peticiones.push({ metodo, ruta, query, cuerpo, cabeceras: opciones.headers })

    const forzada = fallas.find((f) => f.metodo === metodo && f.ruta === ruta)
    const enviarError = (status, mensaje, errores) =>
      new Respuesta(status, { timestamp: '2026-11-11T12:00:00Z', status, error: NOMBRES_ERROR[status], mensaje, ruta: `/api/v1${ruta}`, errores: errores ?? null })
    if (forzada) {
      if (forzada.status === 0) throw new TypeError('Failed to fetch')
      return enviarError(forzada.status, forzada.mensaje, forzada.errores)
    }

    const encontrada = buscarRuta(metodo, ruta)
    if (!encontrada) return enviarError(404, `No existe la ruta ${metodo} ${ruta} en la API falsa.`)
    try {
      const [status, respuesta] = encontrada.accion({
        cuerpo,
        id: encontrada.id,
        parametros: new URLSearchParams(query),
        actor: quienEs(opciones.headers),
      })
      return new Respuesta(status, respuesta)
    } catch (error) {
      if (error instanceof ErrorApi) return enviarError(error.status, error.message, error.errores)
      throw error
    }
  })

  globalThis.fetch = fetchFalso

  instalada = {
    estado,
    peticiones,
    fetch: fetchFalso,
    /** Simula que el navegador ya tiene la cookie de una sesión abierta (como al recargar la página). */
    iniciarSesionCon(email) {
      const u = estado.usuarios.find((x) => x.email === email)
      estado.cookie = u.id
      localStorage.setItem('sanmarcos_sesion_abierta', '1')
      return u
    },
    /** Hace que una ruta responda con error (status 0 = sin conexión). */
    fallar(metodo, ruta, status, mensaje = 'Error simulado.', errores) {
      fallas.push({ metodo, ruta, status, mensaje, errores })
    },
    /** Agrega una tarjeta guardada al cliente indicado. */
    agregarTarjeta(email, datos) {
      const u = estado.usuarios.find((x) => x.email === email)
      const t = { id: siguienteId++, usuarioId: u.id, marcaNombre: MARCAS[datos.marca], predeterminada: false, vencida: false, ...datos }
      estado.tarjetas.push(t)
      return t
    },
    llamadasA(metodo, ruta) {
      return peticiones.filter((p) => p.metodo === metodo && p.ruta === ruta)
    },
  }
  return instalada
}
