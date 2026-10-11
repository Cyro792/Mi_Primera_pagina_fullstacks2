import React, { useState, useEffect } from 'react';

export default function RecepcionistaDashboard({ onLogout }) {
    const [citas, setCitas] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [formData, setFormData] = useState({
        mascota: '',
        dueno: '',
        fecha: '',
        hora: '',
        servicio: 'Consulta General',
        estado: 'Pendiente'
    });

    // Cargar citas iniciales o de localStorage
    useEffect(() => {
        const citasGuardadas = JSON.parse(localStorage.getItem('citas_san_marcos')) || [
            { id: 1, mascota: 'Pepe', dueno: 'Ana García', fecha: '2026-10-11', hora: '09:30', servicio: 'Consulta General', estado: 'Confirmada' },
            { id: 2, mascota: 'Luna', dueno: 'Pedro Soto', fecha: '2026-10-11', hora: '11:00', servicio: 'Vacunación', estado: 'Pendiente' },
            { id: 3, mascota: 'Rocky', dueno: 'María Fuentes', fecha: '2026-10-12', hora: '10:00', servicio: 'Cirugía', estado: 'Confirmada' },
            { id: 4, mascota: 'Michi', dueno: 'Javier Núñez', fecha: '2026-10-12', hora: '15:30', servicio: 'Laboratorio', estado: 'Pendiente' },
            { id: 5, mascota: 'Thor', dueno: 'Camila Vera', fecha: '2026-10-13', hora: '12:00', servicio: 'Odontología', estado: 'Pendiente' }
        ];
        setCitas(citasGuardadas);
    }, []);

    const guardarCitasEnStorage = (nuevasCitas) => {
        setCitas(nuevasCitas);
        localStorage.setItem('citas_san_marcos', JSON.stringify(nuevasCitas));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const abrirModalCrear = () => {
        setEditandoId(null);
        setFormData({
            mascota: '',
            dueno: '',
            fecha: '',
            hora: '09:00',
            servicio: 'Consulta General',
            estado: 'Pendiente'
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (cita) => {
        setEditandoId(cita.id);
        setFormData(cita);
        setMostrarModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editandoId) {
            // Modificar / Cambiar reserva
            const citasActualizadas = citas.map((c) => (c.id === editandoId ? { ...formData, id: editandoId } : c));
            guardarCitasEnStorage(citasActualizadas);
        } else {
            // Crear nueva reserva
            const nuevaCita = { id: Date.now(), ...formData };
            guardarCitasEnStorage([...citas, nuevaCita]);
        }
        setMostrarModal(false);
    };

    const cambiarEstado = (id, nuevoEstado) => {
        const citasActualizadas = citas.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c));
        guardarCitasEnStorage(citasActualizadas);
    };

    const citasHoy = citas.filter(c => c.fecha === '2026-10-11');
    const pendientes = citas.filter(c => c.estado === 'Pendiente');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f6f8' }}>

            {/* MENÚ LATERAL IZQUIERDO (Mismo diseño que Admin) */}
            <aside style={{ width: '260px', backgroundColor: '#1e382b', color: '#ffffff', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.6rem', color: '#e2f0d9', margin: 0, fontWeight: '600' }}>Veterinaria</h1>
                        <h1 style={{ fontSize: '1.6rem', color: '#c5a059', fontStyle: 'italic', margin: 0, fontWeight: '400' }}>San Marcos</h1>
                        <p style={{ fontSize: '0.75rem', color: '#a0b4a8', marginTop: '0.8rem', letterSpacing: '1px' }}>PANEL DE RECEPCIÓN</p>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', backgroundColor: '#2d4d3c', color: '#fff', fontWeight: '500', cursor: 'pointer' }}>
                            ❖ Citas y Reservas
                        </div>
                    </nav>
                </div>

                <button
                    onClick={onLogout}
                    style={{ width: '100%', padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid #4a6b58', color: '#e2f0d9', borderRadius: '20px', cursor: 'pointer', textAlign: 'center' }}
                >
                    Cerrar sesión
                </button>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ flex: 1, padding: '2rem 3rem' }}>

                {/* ENCABEZADO SUPERIOR */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', margin: 0 }}>Gestión de Reservas</h2>
                    <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Sesión: <strong>Recepcionista</strong></span>
                </header>

                {/* TARJETAS RESUMEN DE CITAS */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #27ae60', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold' }}>CITAS DE HOY</span>
                        <h3 style={{ fontSize: '2rem', margin: '0.3rem 0 0 0', color: '#2c3e50' }}>{citasHoy.length}</h3>
                    </div>

                    <div style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #f39c12', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold' }}>PENDIENTES</span>
                        <h3 style={{ fontSize: '2rem', margin: '0.3rem 0 0 0', color: '#2c3e50' }}>{pendientes.length}</h3>
                    </div>
                </section>

                {/* LISTADO Y BOTÓN PARA NUEVA RESERVA */}
                <section style={{ backgroundColor: '#fff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>Próximas Citas y Reservas</h3>
                        <button
                            onClick={abrirModalCrear}
                            style={{ backgroundColor: '#1e382b', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            + Nueva Reserva
                        </button>
                    </div>

                    {/* LISTA DE CITAS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {citas.map((cita) => (
                            <div key={cita.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                    <strong style={{ fontSize: '1.05rem', color: '#2c3e50' }}>{cita.mascota}</strong>
                                    <span style={{ color: '#7f8c8d', marginLeft: '0.5rem' }}>· {cita.dueno}</span>
                                    <div style={{ fontSize: '0.85rem', color: '#95a5a6', marginTop: '0.2rem' }}>
                                        {cita.fecha} · {cita.hora} hs — <em>{cita.servicio}</em>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    {/* Etiqueta de Estado */}
                                    <span style={{
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        backgroundColor: cita.estado === 'Confirmada' ? '#0066ff' : cita.estado === 'Pendiente' ? '#ffcc00' : '#e74c3c'
                                    }}>
                    {cita.estado}
                  </span>

                                    {/* Acciones del Recepcionista: Cambiar / Editar */}
                                    <button
                                        onClick={() => abrirModalEditar(cita)}
                                        style={{ backgroundColor: '#ecf0f1', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Editar / Cambiar
                                    </button>

                                    {cita.estado === 'Pendiente' && (
                                        <button
                                            onClick={() => cambiarEstado(cita.id, 'Confirmada')}
                                            style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Confirmar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* MODAL PARA AGENDAR / MODIFICAR RESERVA */}
            {mostrarModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '10px', width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#1e382b' }}>{editandoId ? 'Cambiar Reserva' : 'Agendar Nueva Reserva'}</h3>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Nombre de la Mascota</label>
                            <input type="text" name="mascota" value={formData.mascota} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Dueño</label>
                            <input type="text" name="dueno" value={formData.dueno} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Fecha</label>
                                <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Hora</label>
                                <input type="time" name="hora" value={formData.hora} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Servicio</label>
                            <select name="servicio" value={formData.servicio} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="Consulta General">Consulta General</option>
                                <option value="Vacunación">Vacunación</option>
                                <option value="Laboratorio">Laboratorio</option>
                                <option value="Odontología">Odontología</option>
                                <option value="Cirugía">Cirugía</option>
                                <option value="Urgencia">Urgencia</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#1e382b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
