// Datos de demostración del panel (en la Evaluación 3 vendrán del backend Spring Boot).
export const SERVICIOS = ['Consulta General', 'Vacunación', 'Laboratorio', 'Odontología', 'Cirugía', 'Urgencia']
export const ESTADOS = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada']
export const ROLES = ['Administrador', 'Recepcionista', 'Dueño']
export const PRECIOS = {
  'Consulta General': 20000,
  'Vacunación': 15000,
  'Laboratorio': 25000,
  'Odontología': 30000,
  'Cirugía': 120000,
  'Urgencia': 45000,
}

// Fecha local en formato YYYY-MM-DD (evita el desfase de toISOString, que usa UTC).
export function aISO(fecha = new Date(), desplazamientoDias = 0) {
  const d = new Date(fecha)
  d.setDate(d.getDate() + desplazamientoDias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function crearCitasIniciales(base = new Date()) {
  return [
    { id: 1, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Consulta General', fecha: aISO(base, 0), hora: '09:30', estado: 'Confirmada' },
    { id: 2, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Vacunación', fecha: aISO(base, 0), hora: '11:00', estado: 'Pendiente' },
    { id: 3, cliente: 'María Fuentes', mascota: 'Rocky', servicio: 'Cirugía', fecha: aISO(base, 1), hora: '10:00', estado: 'Confirmada' },
    { id: 4, cliente: 'Javier Núñez', mascota: 'Michi', servicio: 'Laboratorio', fecha: aISO(base, 1), hora: '15:30', estado: 'Pendiente' },
    { id: 5, cliente: 'Camila Vera', mascota: 'Thor', servicio: 'Odontología', fecha: aISO(base, 2), hora: '12:00', estado: 'Pendiente' },
    { id: 6, cliente: 'Ana García', mascota: 'Pepe', servicio: 'Vacunación', fecha: aISO(base, -3), hora: '16:00', estado: 'Completada' },
    { id: 7, cliente: 'Luis Araya', mascota: 'Kira', servicio: 'Urgencia', fecha: aISO(base, -2), hora: '22:15', estado: 'Completada' },
    { id: 8, cliente: 'Sofía Mora', mascota: 'Canela', servicio: 'Consulta General', fecha: aISO(base, -1), hora: '10:30', estado: 'Cancelada' },
    { id: 9, cliente: 'Pedro Soto', mascota: 'Luna', servicio: 'Consulta General', fecha: aISO(base, -5), hora: '17:00', estado: 'Completada' },
    { id: 10, cliente: 'Valentina Lagos', mascota: 'Simón', servicio: 'Laboratorio', fecha: aISO(base, 3), hora: '09:00', estado: 'Confirmada' },
  ]
}

export const usuariosIniciales = [
  { id: 1, nombre: 'Administrador General', email: 'admin@sanmarcos.cl', rol: 'Administrador', activo: true },
  { id: 2, nombre: 'Camila Rojas', email: 'recepcion@sanmarcos.cl', rol: 'Recepcionista', activo: true },
  { id: 3, nombre: 'Ana García', email: 'ana.garcia@correo.cl', rol: 'Dueño', activo: true },
  { id: 4, nombre: 'Pedro Soto', email: 'pedro.soto@correo.cl', rol: 'Dueño', activo: true },
  { id: 5, nombre: 'María Fuentes', email: 'maria.fuentes@correo.cl', rol: 'Dueño', activo: false },
]
