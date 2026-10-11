import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecepcionistaDashboard from './RecepcionistaDashboard';

describe('Pruebas Unitarias - RecepcionistaDashboard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Debe renderizar el panel de recepción y el botón de nueva reserva', () => {
        render(<RecepcionistaDashboard />);
        expect(screen.getByText(/Panel de Recepción/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generar Nueva Reserva/i })).toBeInTheDocument();
    });

    test('Debe mostrar el formulario al hacer clic en "Generar Nueva Reserva"', () => {
        render(<RecepcionistaDashboard />);
        const boton = screen.getByRole('button', { name: /Generar Nueva Reserva/i });

        fireEvent.click(boton);

        expect(screen.getByLabelText(/Nombre del Cliente:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Habitación:/i)).toBeInTheDocument();
    });

    test('Debe permitir al recepcionista crear una reserva correctamente', () => {
        render(<RecepcionistaDashboard />);

        fireEvent.click(screen.getByRole('button', { name: /Generar Nueva Reserva/i }));

        fireEvent.change(screen.getByLabelText(/Nombre del Cliente:/i), { target: { value: 'Juan Pérez' } });
        fireEvent.change(screen.getByLabelText(/Habitación:/i), { target: { value: '102' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Inicio:/i), { target: { value: '2026-10-15' } });
        fireEvent.change(screen.getByLabelText(/Fecha de Fin:/i), { target: { value: '2026-10-18' } });

        fireEvent.click(screen.getByRole('button', { name: /Guardar Reserva/i }));

        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
        expect(screen.getByText(/Habitación 102/i)).toBeInTheDocument();

        const reservasGuardadas = JSON.parse(localStorage.getItem('reservas'));
        expect(reservasGuardadas).toHaveLength(1);
        expect(reservasGuardadas[0].cliente).toBe('Juan Pérez');
    });
});