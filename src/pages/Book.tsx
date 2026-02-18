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

    await apiService.createBooking(
      user.id,
      selectedBarber!,
      selectedService!,
      date,
      time
    );

    alert("Reserva creada correctamente");
  };

  return (
    <div>
      <h1>Reservar Cita</h1>

      <select onChange={e => setSelectedService(Number(e.target.value))}>
        <option>Seleccionar servicio</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select onChange={e => setSelectedBarber(Number(e.target.value))}>
        <option>Seleccionar barbero</option>
        {barbers.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <input type="date" onChange={e => setDate(e.target.value)} />
      <input type="time" onChange={e => setTime(e.target.value)} />

      <button onClick={handleBooking}>Confirmar</button>
    </div>
  );
};
