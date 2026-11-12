// Utilidades de fechas y nombres que se muestran en los paneles.

/** Roles de las cuentas, con el nombre que se muestra en pantalla. */
export const ETIQUETA_ROL = {
  ADMIN: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  CLIENTE: 'Cliente',
}

export const ROLES_USUARIO = Object.keys(ETIQUETA_ROL)

// Fecha local en formato YYYY-MM-DD (evita el desfase de toISOString, que usa UTC).
export function aISO(fecha = new Date(), desplazamientoDias = 0) {
  const d = new Date(fecha)
  d.setDate(d.getDate() + desplazamientoDias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
