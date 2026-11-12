// Presentación del catálogo: ícono y fondo de cada producto. Los datos (nombre, precio, stock)
// vienen de la API; esto es solo cómo se ven en pantalla.

const ICONOS = {
  'Consulta General': '🩺',
  'Vacunación': '💉',
  'Laboratorio y Exámenes': '🔬',
  'Odontología': '🦷',
  'Cirugía': '🩹',
  'Urgencias 24h': '🚨',
  'Alimento premium perro adulto 15 kg': '🐶',
  'Alimento gato esterilizado 7,5 kg': '🐱',
  'Collar antipulgas': '📿',
  'Juguete mordedor': '🦴',
  'Shampoo hipoalergénico 500 ml': '🧴',
  'Arena sanitaria 10 kg': '🪣',
}

const FONDOS = {
  1: 'linear-gradient(135deg, #dcebe3 0%, #b9d6c7 100%)',
  2: 'linear-gradient(135deg, #f6e7d6 0%, #edc9a3 100%)',
  3: 'linear-gradient(135deg, #e6e2f3 0%, #c9c1e6 100%)',
  4: 'linear-gradient(135deg, #dbeef3 0%, #b4d9e3 100%)',
}

export function iconoProducto(producto) {
  return ICONOS[producto.nombre] ?? (producto.tipo === 'SERVICIO' ? '🩺' : '🐾')
}

export function fondoProducto(producto) {
  return FONDOS[producto.categoriaId] ?? FONDOS[1]
}
