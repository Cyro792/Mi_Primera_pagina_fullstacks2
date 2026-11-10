// Base de Datos Simulada para Veterinaria San Marcos (LocalStorage)

const STORAGE_KEYS = {
    RESERVAS: 'san_marcos_reservas',
    MASCOTAS: 'san_marcos_mascotas',
    CLIENTES: 'san_marcos_clientes',
    SERVICIOS: 'san_marcos_servicios',
};

// Datos Semilla Iniciales
const reservasIniciales = [
    {
        id: 1,
        mascota: 'Pepe',
        dueno: 'Ana García',
        rutDueno: '18.456.789-0',
        telefono: '+56 9 8765 4321',
        fecha: '2026-10-18',
        hora: '09:30',
        servicio: 'Consulta General',
        veterinario: 'Dra. Lucas Sepúlveda',
        estado: 'Confirmada',
        notas: 'Chequeo preventivo anual.',
    },
    {
        id: 2,
        mascota: 'Luna',
        dueno: 'Pedro Soto',
        rutDueno: '15.123.456-7',
        telefono: '+56 9 1122 3344',
        fecha: '2026-10-18',
        hora: '11:00',
        servicio: 'Vacunación',
        veterinario: 'Dr. Marcos Ruiz',
        estado: 'Pendiente',
        notas: 'Refuerzo de vacuna séxtuple.',
    },
    {
        id: 3,
        mascota: 'Thor',
        dueno: 'Carla Mendoza',
        rutDueno: '19.876.543-2',
        telefono: '+56 9 5566 7788',
        fecha: '2026-10-19',
        hora: '15:30',
        servicio: 'Odontología',
        veterinario: 'Dra. Sofía Mora',
        estado: 'Pendiente',
        notas: 'Limpieza dental y revisión de encías.',
    },
];

const serviciosIniciales = [
    { id: 1, nombre: 'Consulta General', precio: 25000, duracionMin: 30 },
    { id: 2, nombre: 'Vacunación', precio: 18000, duracionMin: 20 },
    { id: 3, nombre: 'Laboratorio y Exámenes', precio: 35000, duracionMin: 45 },
    { id: 4, nombre: 'Odontología', precio: 40000, duracionMin: 60 },
    { id: 5, nombre: 'Cirugía', precio: 120000, duracionMin: 120 },
    { id: 6, nombre: 'Urgencias 24h', precio: 50000, duracionMin: 45 },
];

// Inicialización de datos
const initDB = () => {
    if (!localStorage.getItem(STORAGE_KEYS.RESERVAS)) {
        localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservasIniciales));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICIOS)) {
        localStorage.setItem(STORAGE_KEYS.SERVICIOS, JSON.stringify(serviciosIniciales));
    }
};

initDB();

// ==========================================
// OPERACIONES CRUD DE RESERVAS / CITAS
// ==========================================

// READ: Obtener todas las reservas
export const getReservas = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVAS)) || [];
};

// READ: Filtrar reservas por estado o fecha
export const getReservasPorEstado = (estado) => {
    return getReservas().filter((r) => r.estado.toLowerCase() === estado.toLowerCase());
};

// CREATE: Registrar una nueva reserva de atención
export const crearReserva = (nuevaReserva) => {
    const reservas = getReservas();
    const registro = {
        id: Date.now(),
        estado: nuevaReserva.estado || 'Pendiente',
        fechaCreacion: new Date().toISOString(),
        ...nuevaReserva,
    };
    reservas.unshift(registro);
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas));
    return registro;
};

// UPDATE: Modificar los datos o estado de una reserva
export const actualizarReserva = (id, datosActualizados) => {
    const reservas = getReservas().map((reserva) =>
        reserva.id === Number(id) ? { ...reserva, ...datosActualizados } : reserva
    );
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas));
};

// DELETE: Cancelar o eliminar una reserva
export const eliminarReserva = (id) => {
    const reservas = getReservas().filter((reserva) => reserva.id !== Number(id));
    localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas));
};

// ==========================================
// CONSULTAS DE SERVICIOS Y MÉTRICAS
// ==========================================

export const getServicios = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICIOS)) || [];
};

export const getMetricasHoy = () => {
    const reservas = getReservas();
    const hoyStr = new Date().toISOString().split('T')[0];

    const citasHoy = reservas.filter((r) => r.fecha === hoyStr).length;
    const pendientes = reservas.filter((r) => r.estado === 'Pendiente').length;
    const confirmadas = reservas.filter((r) => r.estado === 'Confirmada').length;

    return { citasHoy, pendientes, confirmadas, total: reservas.length };
};