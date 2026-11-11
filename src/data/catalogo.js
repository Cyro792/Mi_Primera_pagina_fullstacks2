// Catálogo local de la tienda. Tiene los mismos datos iniciales que carga el backend (DataSeeder),
// con la misma forma que devolverá la API. Solo lo usa src/services/productos.js: cuando el
// frontend se conecte al backend, este archivo deja de usarse y nada más cambia.

export const CATEGORIAS = [
  { id: 1, nombre: 'Servicios clínicos', descripcion: 'Atenciones veterinarias que se agendan en la clínica.' },
  { id: 2, nombre: 'Alimentos', descripcion: 'Alimento seco y húmedo para perros y gatos.' },
  { id: 3, nombre: 'Accesorios', descripcion: 'Collares, juguetes y artículos de paseo.' },
  { id: 4, nombre: 'Higiene y cuidado', descripcion: 'Productos de aseo y cuidado diario.' },
]

const servicio = (id, nombre, descripcion, precio, duracionMin) => ({
  id, nombre, descripcion, precio, tipo: 'SERVICIO', stock: null, duracionMin, activo: true, categoriaId: 1,
})
const articulo = (id, nombre, descripcion, precio, stock, categoriaId) => ({
  id, nombre, descripcion, precio, tipo: 'PRODUCTO', stock, duracionMin: null, activo: true, categoriaId,
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

// Ícono y color de cada producto. Es solo presentación: la API no lo entrega.
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
