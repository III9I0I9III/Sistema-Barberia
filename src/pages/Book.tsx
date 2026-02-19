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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const servicesRes = await apiService.getServices();
      const barbersRes = await apiService.getBarbers();

      setServices(servicesRes.data || []);
      setBarbers(barbersRes.data || []);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleBooking = async () => {

    if (!user) {
      return alert("Debes iniciar sesión 😈");
    }

    if (!selectedService) {
      return alert("Selecciona un servicio");
    }

    if (!selectedBarber) {
      return alert("Selecciona un barbero");
    }

    if (!date || !time) {
      return alert("Selecciona fecha y hora");
    }

    try {
      await apiService.createBooking(
        selectedBarber,
        selectedService,
        date,
        time
      );

      alert("Reserva creada correctamente 🔥");

      // Reset opcional
      setSelectedService(null);
      setSelectedBarber(null);
      setDate('');
      setTime('');

    } catch (error: any) {
      alert(error.message);
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
        {services.map(service => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>

      <select
        value={selectedBarber ?? ''}
        onChange={e => setSelectedBarber(Number(e.target.value))}
      >
        <option value="">Seleccionar barbero</option>
        {barbers.map(barber => (
          <option key={barber.id} value={barber.id}>
            {barber.name}
          </option>
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
