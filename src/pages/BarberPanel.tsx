import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Booking } from '../types';

export const BarberPanel: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await apiService.getBookings();
    setBookings(data.data);
  };

  const updateStatus = async (id: number, status: string) => {
    await apiService.updateBooking(id, status);
    loadBookings();
  };

  return (
    <div>
      <h1>Panel Barbero</h1>

      {bookings.map(b => (
        <div key={b.id}>
          <p>{b.date} - {b.time}</p>
          <p>Status: {b.status}</p>

          <button onClick={() => updateStatus(b.id, 'confirmed')}>Confirmar</button>
          <button onClick={() => updateStatus(b.id, 'completed')}>Completar</button>
        </div>
      ))}
    </div>
  );
};
