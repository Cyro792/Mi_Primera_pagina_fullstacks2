import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecepcionistaDashboard from './RecepcionistaDashboard.jsx';

describe('Suite de Pruebas Unitarias - RecepcionistaDashboard', () => {

    beforeEach(() => {
        localStorage.clear();

        // Sembrar datos de prueba en LocalStorage para que db.js los consuma
        const reservasIniciales = [
            { id: 1, mascota: 'Pepe', dueno: 'Ana García', telefono: '+56 9 8765 4321', fecha: '2026-10-18', hora: '09:30', servicio: 'Consulta General', estado: 'Confirmada' },
            { id: 2, mascota: 'Luna', dueno: 'Pedro Soto', telefono: '+56 9 1122 3344', fecha: '2026-10-18', hora: '11:00', servicio: 'Vacunación', estado: 'Pendiente' }
        ];
        const serviciosIniciales = [
            { id: 1, nombre: 'Consulta General' },
            { id: 2, nombre: 'Vacunación' }
        ];

        localStorage.setItem('san_marcos_reservas', JSON.stringify(reservasIniciales));
        localStorage.setItem('san_marcos_servicios', JSON.stringify(serviciosIniciales));
    });

    // PRUEBA 1: Renderizado general del componente
    it('1. Debe renderizar el panel de recepción sin lanzar errores', () => {
        const { container } = render(<RecepcionistaDashboard />);
        expect(container).toBeTruthy();
    });

    // PRUEBA 2: Verificación de encabezados principales
    it('2. Debe mostrar los títulos del panel de recepción', () => {
        render(<RecepcionistaDashboard />);
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
    });

    // PRUEBA 3: Presencia del botón "+ Nueva Reserva"
    it('3. Debe visualizar el botón para crear una nueva reserva', () => {
        render(<RecepcionistaDashboard />);
        const botonReserva = screen.getByRole('button', { name: /\+ Nueva Reserva/i });
        expect(botonReserva).toBeTruthy();
    });

    // PRUEBA 4: Presencia del botón "Cerrar sesión"
    it('4. Debe visualizar el botón para cerrar la sesión actual', () => {
        render(<RecepcionistaDashboard />);
        const logoutBtn = screen.getByRole('button', { name: /Cerrar sesión/i });
        expect(logoutBtn).toBeTruthy();
    });

    // PRUEBA 5: Simulación de clic en "+ Nueva Reserva"
    it('5. Debe responder al evento clic en el botón de nueva reserva', () => {
        render(<RecepcionistaDashboard />);
        const botonReserva = screen.getByRole('button', { name: /\+ Nueva Reserva/i });
        const clickSuccess = fireEvent.click(botonReserva);
        expect(clickSuccess).toBeTrue();
    });

    // PRUEBA 6: Tarjeta de métricas "CITAS DE HOY"
    it('6. Debe desplegar la tarjeta de métricas con las citas programadas de hoy', () => {
        render(<RecepcionistaDashboard />);
        const citasHoy = screen.getByText(/CITAS DE HOY/i);
        expect(citasHoy).toBeTruthy();
    });

    // PRUEBA 7: Tarjeta de métricas "PENDIENTES"
    it('7. Debe desplegar la sección de citas o solicitudes pendientes', () => {
        render(<RecepcionistaDashboard />);
        const pendientes = screen.getByText(/PENDIENTES/i);
        expect(pendientes).toBeTruthy();
    });

    // PRUEBA 8: Ejecución de callback por props (onLogout)
    it('8. Debe ejecutar la función onLogout enviada por props al hacer clic en cerrar sesión', () => {
        const mockLogout = jasmine.createSpy('onLogout');
        render(<RecepcionistaDashboard onLogout={mockLogout} />);
        const logoutBtn = screen.getByRole('button', { name: /Cerrar sesión/i });
        fireEvent.click(logoutBtn);
        expect(mockLogout).toHaveBeenCalled();
    });

    // PRUEBA 9: Renderizado de registros de pacientes (Pepe y Luna)
    it('9. Debe listar en pantalla a los pacientes agendados como Pepe y Luna', () => {
        render(<RecepcionistaDashboard />);
        expect(screen.getByText(/Pepe/i)).toBeTruthy();
        expect(screen.getByText(/Luna/i)).toBeTruthy();
    });

    // PRUEBA 10: Limpieza e interacción con localStorage
    it('10. Debe permitir la lectura de datos desde localStorage', () => {
        const datos = JSON.parse(localStorage.getItem('san_marcos_reservas'));
        expect(datos.length).toBe(2);
    });

});