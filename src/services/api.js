// Cliente HTTP para la API REST del backend (Spring Boot, /api/v1). Usa fetch.
//
// Cómo se maneja la sesión (JWT):
// - El token de ACCESO (dura 15 minutos) se guarda solo en memoria, en esta variable. No se guarda en
//   localStorage: así un script malicioso no lo puede leer del almacenamiento.
// - El token de RENOVACIÓN lo guarda el navegador en una cookie HttpOnly que JavaScript no puede leer.
//   Con ella, POST /auth/refresh entrega un token de acceso nuevo; por eso la sesión sobrevive a
//   una recarga de la página.
// - Si una petición responde 401 porque el token de acceso venció, se renueva y se reintenta una vez.

/** En desarrollo Vite redirige /api al backend; en producción Nginx hace lo mismo. */
export const URL_API = import.meta.env?.VITE_API_URL ?? '/api/v1'

const ESPERA_REINTENTO_MS = import.meta.env?.MODE === 'test' ? 0 : 400

const SIN_CONEXION ='No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'

/** Error de la API con el código HTTP y, si los hay, los errores por campo ({ email: '...' }). */
export class ApiError extends Error {
  constructor(status, mensaje, errores = {}) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.errores = errores ?? {}
  }
}

let tokenAcceso = null
let renovacionEnCurso = null
let alPerderSesion = () => {}

export function guardarToken(token) {
  tokenAcceso = token
}

export function hayToken() {
  return tokenAcceso !== null
}

/** AuthContext registra aquí qué hacer cuando la sesión ya no se puede renovar (cerrarla en pantalla). */
export function alExpirarSesion(funcion) {
  alPerderSesion = funcion
}

async function leerCuerpo(respuesta) {
  if (respuesta.status === 204) return null
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

async function enviar(ruta, { metodo = 'GET', cuerpo, conToken = true } = {}) {
  const cabeceras = { Accept: 'application/json' }
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (conToken && tokenAcceso) cabeceras.Authorization = `Bearer ${tokenAcceso}`
  try {
    return await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      // Necesario para que el navegador envíe y guarde la cookie de renovación.
      credentials: 'include',
    })
  } catch {
    throw new ApiError(0, SIN_CONEXION)
  }
}

/**
 * Pide un token de acceso nuevo con la cookie de renovación. Si se llama varias veces a la vez
 * (por ejemplo, dos peticiones vencidas), se hace UNA sola renovación: cada cookie sirve una vez y
 * usarla dos veces haría que el servidor la tome como robada y cierre todas las sesiones.
 * Resuelve con la sesión ({ accessToken, usuario, ... }) o rechaza con ApiError.
 */
export function renovarSesion() {
  if (!renovacionEnCurso) {
    renovacionEnCurso = (async () => {
      let respuesta = await enviar('/auth/refresh', { metodo: 'POST', conToken: false })
      if (respuesta.status === 401) {
        // Si otra pestaña renovó en ese mismo instante, el navegador ya tiene la cookie nueva:
        // se espera un momento y se intenta una vez más con ella.
        await new Promise((resolve) => setTimeout(resolve, ESPERA_REINTENTO_MS))
        respuesta = await enviar('/auth/refresh', { metodo: 'POST', conToken: false })
      }
      const datos = await leerCuerpo(respuesta)
      if (!respuesta.ok) {
        tokenAcceso = null
        throw new ApiError(respuesta.status, datos?.mensaje ?? 'Tu sesión expiró. Inicia sesión nuevamente.')
      }
      tokenAcceso = datos.accessToken
      return datos
    })().finally(() => {
      renovacionEnCurso = null
    })
  }
  return renovacionEnCurso
}

/**
 * Hace una petición a la API y devuelve el cuerpo de la respuesta ya convertido desde JSON.
 * - metodo: GET, POST, PUT, PATCH o DELETE.  - cuerpo: objeto que se envía como JSON.
 * - completa: true para recibir { status, datos } (por ejemplo, para distinguir 200 de 201).
 * Si la respuesta no es 2xx lanza ApiError con el mensaje que envía el backend.
 */
export async function api(ruta, { metodo = 'GET', cuerpo, completa = false } = {}) {
  let respuesta = await enviar(ruta, { metodo, cuerpo })

  // El token de acceso venció: se renueva una vez y se repite la petición.
  if (respuesta.status === 401 && tokenAcceso) {
    try {
      await renovarSesion()
    } catch {
      alPerderSesion()
      throw new ApiError(401, 'Tu sesión expiró. Inicia sesión nuevamente.')
    }
    respuesta = await enviar(ruta, { metodo, cuerpo })
  }

  const datos = await leerCuerpo(respuesta)
  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, datos?.mensaje ?? `Error ${respuesta.status} al comunicarse con el servidor.`, datos?.errores)
  }
  return completa ? { status: respuesta.status, datos } : datos
}

/** Convierte { a: 1, b: undefined } en "?a=1" (omite los vacíos). */
export function consulta(parametros = {}) {
  const limpios = Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return limpios.length ? `?${new URLSearchParams(limpios)}` : ''
}
