import React, { useState } from 'react';

export default function RecepcionistaDashboard({ onLogout }) {
    // Datos simulados (Mock Data)
    const [citas, setCitas] = useState([
        { id: 1, dueño: "Ana García", mascota: "Pepe (Perro)", fecha: "2026-10-15", motivo: "Vacunación", estado: "Pendiente" },
        { id: 2, dueño: "Carlos López", mascota: "Mishi (Gato)", fecha: "2026-10-16", motivo: "Consulta General", estado: "Pendiente" }
    ]);
    const [vistaActiva, setVistaActiva] = useState('citas');

    const confirmarCita = (id) => {
        const nuevasCitas = citas.map(cita =>
            cita.id === id ? { ...cita, estado: "Confirmada" } : cita
        );
        setCitas(nuevasCitas);
        alert("Cita confirmada y notificación enviada.");
    };

    const reagendarCita = (id) => {
        const nuevaFecha = prompt("Ingrese nueva fecha (YYYY-MM-DD):");
        if (nuevaFecha) {
            const nuevasCitas = citas.map(cita =>
                cita.id === id ? { ...cita, fecha: nuevaFecha, estado: "Reagendada" } : cita
            );
            setCitas(nuevasCitas);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F6F1] font-sans">
            <header className="bg-[#1C1A17] text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2A6049] flex items-center justify-center text-xl">🐾</div>
                    <div>
                        <h1 className="font-bold text-xl">San Marcos - Recepción</h1>
                    </div>
                </div>
                <button onClick={onLogout} className="text-sm border border-white/20 px-4 py-2 rounded-full hover:bg-white/10">
                    Cerrar Sesión
                </button>
            </header>

            <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-6 px-4 gap-6">
                <nav className="w-full md:w-64 flex flex-row md:flex-col gap-2">
                    <button onClick={() => setVistaActiva('citas')} className={`p-4 text-left rounded-xl font-semibold ${vistaActiva === 'citas' ? 'bg-[#2A6049] text-white' : 'bg-white border border-[#E0DDD5]'}`}>
                         Gestión de Citas
                    </button>
                    <button onClick={() => setVistaActiva('fichas')} className={`p-4 text-left rounded-xl font-semibold ${vistaActiva === 'fichas' ? 'bg-[#2A6049] text-white' : 'bg-white border border-[#E0DDD5]'}`}>
                         Fichas Pacientes
                    </button>
                </nav>

                <main className="flex-1">
                    {vistaActiva === 'citas' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0DDD5]">
                            <h2 className="text-2xl font-bold mb-6">Solicitudes Pendientes</h2>
                            <div className="grid gap-4">
                                {citas.map((cita) => (
                                    <div key={cita.id} className="border border-[#E0DDD5] rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8F6F1]/50">
                                        <div>
                                            <h3 className="font-bold text-lg">{cita.mascota} <span className="text-sm font-normal text-gray-500">({cita.motivo})</span></h3>
                                            <p className="text-sm"> Dueño: {cita.dueño}</p>
                                            <p className="text-sm"> Fecha: <span className="font-medium">{cita.fecha}</span></p>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${cita.estado === 'Confirmada' ? 'bg-green-100 text-green-800' : cita.estado === 'Reagendada' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cita.estado}
                      </span>
                                        </div>
                                        <div className="flex w-full md:w-auto gap-2">
                                            <button onClick={() => confirmarCita(cita.id)} disabled={cita.estado === 'Confirmada'} className="flex-1 bg-[#2A6049] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                Confirmar
                                            </button>
                                            <button onClick={() => reagendarCita(cita.id)} className="flex-1 border border-[#2A6049] text-[#2A6049] px-4 py-2 rounded-lg text-sm font-semibold">
                                                Reagendar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {vistaActiva === 'fichas' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0DDD5] flex flex-col items-center justify-center text-center h-64">
                            <span className="text-4xl mb-3">🛠️</span>
                            <h2 className="text-xl font-bold mb-2">Módulo de Fichas</h2>
                            <p className="text-gray-500 text-sm">Próximamente conexión con API REST.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}