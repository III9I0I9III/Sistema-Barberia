import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Service, Barber } from '../types';
import { useAuth } from '../context/AuthContext';

export const Book: React.FC = () => {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    apiService.getServices().then(res => setServices(res.data));
    apiService.getBarbers().then(res => setBarbers(res.data));
  }, []);

  const handleBooking = async () => {
    if (!user) return alert("Debes iniciar sesión");

    if (!selectedService) return alert("Selecciona un servicio");
    if (!selectedBarber) return alert("Selecciona un barbero");
    if (!date) return alert("Selecciona una fecha");
    if (!time) return alert("Selecciona una hora");

    try {
      await apiService.createBooking(
        user.id,
        selectedBarber,
        selectedService,
        date,
        time
      );

      alert("Reserva creada correctamente 😈🔥");

      // Limpieza de formulario
      setSelectedService(null);
      setSelectedBarber(null);
      setDate('');
      setTime('');

    } catch (error) {
      console.error(error);
      alert("Error al crear la reserva 💀");
    }
  };

  return (
    <div>
      <h1>Reservar Cita</h1>

      <select
        value={selectedService ?? ''}
        onChange={e => setSelectedService(Number(e.target.value))}
      >
        <option value="">Seleccionar servicio</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={selectedBarber ?? ''}
        onChange={e => setSelectedBarber(Number(e.target.value))}
      >
        <option value="">Seleccionar barbero</option>
        {barbers.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <input
        type="time"
        value={time}
        onChange={e => setTime(e.target.value)}
      />

      <button onClick={handleBooking}>
        Confirmar
      </button>
    </div>
  );
};
