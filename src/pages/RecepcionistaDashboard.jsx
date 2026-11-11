import { useState } from 'react';
import {
    getReservas,
    crearReserva,
    actualizarReserva,
    eliminarReserva,
    getMetricasHoy,
    getServicios
} from '../services/db.js';
import { aISO } from '../utils/data.js';
import './recepcion.css';

// Formulario en blanco para una reserva nueva. La fecha por defecto es hoy (hora local).
const formularioVacio = () => ({
    mascota: '',
    dueno: '',
    rutDueno: '',
    telefono: '',
    fecha: aISO(),
    hora: '10:00',
    servicio: 'Consulta General',
    estado: 'Pendiente',
    notas: ''
});

export default function RecepcionistaDashboard({ onLogout }) {
    // Los datos se leen de db.js al montar el panel.
    const [reservas, setReservas] = useState(() => getReservas());
    const [metricas, setMetricas] = useState(() => getMetricasHoy());
    const [servicios, setServicios] = useState(() => getServicios());
    const [mostrarModal, setMostrarModal] = useState(false);
    const [reservaEditando, setReservaEditando] = useState(null);

    // Estado del formulario
    const [form, setForm] = useState(formularioVacio);

    const cargarDatos = () => {
        setReservas(getReservas());
        setMetricas(getMetricasHoy());
        setServicios(getServicios());
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const abrirModalNuevo = () => {
        setReservaEditando(null);
        setForm(formularioVacio());
        setMostrarModal(true);
    };

    const abrirModalEditar = (reserva) => {
        setReservaEditando(reserva);
        setForm(reserva);
        setMostrarModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reservaEditando) {
            actualizarReserva(reservaEditando.id, form);
        } else {
            crearReserva(form);
        }
        setMostrarModal(false);
        cargarDatos();
    };

    const handleCambiarEstado = (id, nuevoEstado) => {
        actualizarReserva(id, { estado: nuevoEstado });
        cargarDatos();
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Desea cancelar y eliminar esta reserva?')) {
            eliminarReserva(id);
            cargarDatos();
        }
    };

    return (
        <div className="recepcion" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f8' }}>
            {/* Sidebar / Barra Lateral */}
            <aside className="recepcion-lateral" style={{ width: '260px', backgroundColor: '#1e382b', color: '#fff', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.6rem', color: '#e2f0d9', margin: 0, fontWeight: '600' }}>Veterinaria</h1>
                        <h1 style={{ fontSize: '1.6rem', color: '#c5a059', fontStyle: 'italic', margin: 0, fontWeight: '400' }}>San Marcos</h1>
                        <p style={{ fontSize: '0.75rem', color: '#a0b4a8', marginTop: '0.8rem', letterSpacing: '1px' }}>PANEL DE RECEPCIÓN</p>
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', backgroundColor: '#2d4d3c', color: '#fff', fontWeight: '500' }}>
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

            {/* Área Principal de Contenido */}
            <main className="recepcion-principal" style={{ flex: 1, padding: '2rem 3rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', margin: 0 }}>Gestión de Reservas</h2>
                    <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            Sesión: <strong>Recepcionista</strong>
          </span>
                </header>

                {/* Métrica / Resumen de Citas */}
                <section className="recepcion-metricas" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #27ae60', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold' }}>CITAS DE HOY</span>
                        <h3 style={{ fontSize: '2rem', margin: '0.3rem 0 0', color: '#2c3e50' }}>{metricas.citasHoy}</h3>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #f39c12', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold' }}>PENDIENTES</span>
                        <h3 style={{ fontSize: '2rem', margin: '0.3rem 0 0', color: '#2c3e50' }}>{metricas.pendientes}</h3>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #2980b9', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL AGENDADAS</span>
                        <h3 style={{ fontSize: '2rem', margin: '0.3rem 0 0', color: '#2c3e50' }}>{metricas.total}</h3>
                    </div>
                </section>

                {/* Tabla / Lista de Reservas de Pacientes */}
                <section style={{ backgroundColor: '#fff', padding: '1.8rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>Próximas Citas y Reservas</h3>
                        <button
                            onClick={abrirModalNuevo}
                            style={{ backgroundColor: '#1e382b', color: '#fff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            + Nueva Reserva
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reservas.map((r) => (
                            <div key={r.id} className="recepcion-fila" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                    <strong style={{ fontSize: '1.05rem', color: '#2c3e50' }}>{r.mascota}</strong>
                                    <span style={{ color: '#7f8c8d', marginLeft: '0.5rem' }}>· {r.dueno} ({r.telefono})</span>
                                    <div style={{ fontSize: '0.85rem', color: '#95a5a6', marginTop: '0.2rem' }}>
                                        {r.fecha} · {r.hora} hs — <em>{r.servicio}</em>
                                    </div>
                                </div>
                                <div className="recepcion-acciones" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: r.estado === 'Confirmada' ? '#27ae60' : r.estado === 'Atendido' ? '#2980b9' : '#f39c12'
                  }}>
                    {r.estado}
                  </span>

                                    {r.estado === 'Pendiente' && (
                                        <button
                                            onClick={() => handleCambiarEstado(r.id, 'Confirmada')}
                                            style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Confirmar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => abrirModalEditar(r)}
                                        style={{ backgroundColor: '#ecf0f1', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Editar / Cambiar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(r.id)}
                                        style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Modal Formulario Crear / Editar */}
                {mostrarModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '10px', width: '450px', maxWidth: '90%' }}>
                            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{reservaEditando ? 'Editar Reserva' : 'Nueva Reserva de Atención'}</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Nombre de la Mascota:</label>
                                <input type="text" name="mascota" value={form.mascota} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                                <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Nombre del Dueño:</label>
                                <input type="text" name="dueno" value={form.dueno} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                                <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Teléfono de contacto:</label>
                                <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Fecha:</label>
                                        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Hora:</label>
                                        <input type="time" name="hora" value={form.hora} onChange={handleChange} required style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                    </div>
                                </div>

                                <label style={{ fontSize: '0.85rem', color: '#2c3e50', fontWeight: 'bold' }}>Servicio:</label>
                                <select name="servicio" value={form.servicio} onChange={handleChange} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                    {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                                </select>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '0.6rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                                    <button type="submit" style={{ padding: '0.6rem 1rem', background: '#1e382b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar Reserva</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}