import React, { useState } from 'react';
import { Calendar, Clock, User, Check, X, Scissors } from 'lucide-react';
import '../index.css';

interface Booking {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 1, clientName: 'Juan Pérez', service: 'Corte Clásico', date: '2024-01-15', time: '09:00', status: 'pending' },
  { id: 2, clientName: 'María López', service: 'Paquete Completo', date: '2024-01-15', time: '10:30', status: 'confirmed' },
  { id: 3, clientName: 'Pedro Gómez', service: 'Afeitado', date: '2024-01-15', time: '14:00', status: 'confirmed' },
  { id: 4, clientName: 'Carlos Ruiz', service: 'Estilo', date: '2024-01-16', time: '11:00', status: 'pending' },
  { id: 5, clientName: 'Ana Martín', service: 'Corte Clásico', date: '2024-01-14', time: '15:00', status: 'completed' },
];

export const BarberPanel: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const updateStatus = (id: number, status: Booking['status']) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="barber-panel">

      {/* Header */}
      <div className="panel-header">
        <div className="header-icon">
          <Scissors className="icon-large amber"/>
        </div>
        <div>
          <h1>Panel del Barbero</h1>
          <p>Gestiona tus citas y servicios</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card yellow">
          <div>
            <p>Pendientes</p>
            <p>{stats.pending}</p>
          </div>
          <Clock className="icon-medium yellow"/>
        </div>
        <div className="stat-card green">
          <div>
            <p>Confirmadas</p>
            <p>{stats.confirmed}</p>
          </div>
          <Check className="icon-medium green"/>
        </div>
        <div className="stat-card blue">
          <div>
            <p>Completadas</p>
            <p>{stats.completed}</p>
          </div>
          <Calendar className="icon-medium blue"/>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-buttons">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'completed', label: 'Completadas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bookings-card">
        <div className="bookings-header">
          <h2>Citas Programadas</h2>
        </div>
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">No hay citas para mostrar</div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-left">
                  <div className="user-icon">
                    <User className="icon-small gray"/>
                  </div>
                  <div>
                    <h3>{booking.clientName}</h3>
                    <p>{booking.service}</p>
                  </div>
                </div>
                <div className="booking-right">
                  <div className="date-time">
                    <p>{booking.date}</p>
                    <p>{booking.time}</p>
                  </div>
                  <span className={`status-badge ${booking.status}`}>{booking.status}</span>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button onClick={() => updateStatus(booking.id, 'confirmed')} title="Confirmar" className="action-btn green">
                        <Check className="icon-small"/>
                      </button>
                      <button onClick={() => updateStatus(booking.id, 'cancelled')} title="Cancelar" className="action-btn red">
                        <X className="icon-small"/>
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button onClick={() => updateStatus(booking.id, 'completed')} className="complete-btn">
                      <Check className="icon-small"/> Completar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
