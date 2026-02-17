import React, { useState } from 'react';
import { Users, Scissors, Calendar, DollarSign, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const MOCK_STATS = {
  totalClients: 156,
  totalBookings: 423,
  totalRevenue: 12580,
  todayBookings: 12,
};

const MOCK_USERS = [
  { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'client', bookings: 5 },
  { id: 2, name: 'María Gómez', email: 'maria@test.com', role: 'barber', bookings: 45 },
  { id: 3, name: 'Carlos Ruiz', email: 'carlos@test.com', role: 'barber', bookings: 38 },
  { id: 4, name: 'Ana Martín', email: 'ana@test.com', role: 'client', bookings: 3 },
  { id: 5, name: 'Pedro López', email: 'pedro@test.com', role: 'client', bookings: 8 },
];

const MOCK_SERVICES = [
  { id: 1, name: 'Corte Clásico', price: 15, bookings: 180 },
  { id: 2, name: 'Afeitado Moderno', price: 12, bookings: 95 },
  { id: 3, name: 'Paquete Completo', price: 35, bookings: 65 },
];

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'services' | 'settings'>('dashboard');

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <p>Acceso denegado</p>
        <p>Necesitas permisos de administrador para ver esta página</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">

      {/* Header */}
      <div className="panel-header">
        <div className="header-icon">
          <BarChart3 className="icon-large amber"/>
        </div>
        <div>
          <h1>Panel de Administración</h1>
          <p>Gestiona tu barbería</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-card">
        {[
          { key: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { key: 'users', icon: Users, label: 'Usuarios' },
          { key: 'services', icon: Scissors, label: 'Servicios' },
          { key: 'settings', icon: Settings, label: 'Ajustes' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            <tab.icon className="icon-small"/>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div>
                <p>Clientes Totales</p>
                <p>{MOCK_STATS.totalClients}</p>
              </div>
              <Users className="icon-medium blue"/>
              <div className="stat-growth green">+12% este mes</div>
            </div>
            <div className="stat-card green">
              <div>
                <p>Reservas Totales</p>
                <p>{MOCK_STATS.totalBookings}</p>
              </div>
              <Calendar className="icon-medium green"/>
              <div className="stat-growth green">+8% esta semana</div>
            </div>
            <div className="stat-card amber">
              <div>
                <p>Ingresos Totales</p>
                <p>${MOCK_STATS.totalRevenue}</p>
              </div>
              <DollarSign className="icon-medium amber"/>
              <div className="stat-growth green">+15% este mes</div>
            </div>
            <div className="stat-card purple">
              <div>
                <p>Hoy</p>
                <p>{MOCK_STATS.todayBookings}</p>
              </div>
              <Scissors className="icon-medium purple"/>
              <div className="stat-growth gray">Reservas para hoy</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="recent-card">
              <h2>Usuarios Recientes</h2>
              {MOCK_USERS.slice(0,4).map(u => (
                <div key={u.id} className="recent-item">
                  <div className="recent-left">
                    <Users className="icon-small gray"/>
                    <div>
                      <p>{u.name}</p>
                      <p className="text-xs">{u.email}</p>
                    </div>
                  </div>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </div>
              ))}
            </div>

            <div className="recent-card">
              <h2>Servicios Populares</h2>
              {MOCK_SERVICES.map(s => (
                <div key={s.id} className="recent-item">
                  <div className="recent-left">
                    <Scissors className="icon-small amber"/>
                    <div>
                      <p>{s.name}</p>
                      <p className="text-xs">${s.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{s.bookings}</p>
                    <p className="text-xs">reservas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="table-card">
          <div className="table-header">
            <h2>Gestión de Usuarios</h2>
            <button className="btn-amber">Agregar Usuario</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Reservas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(u => (
                <tr key={u.id}>
                  <td>
                    <Users className="icon-small gray"/>
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>{u.bookings}</td>
                  <td>
                    <button className="btn-amber-small">Editar</button>
                    <button className="btn-red-small">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="table-card">
          <div className="table-header">
            <h2>Gestión de Servicios</h2>
            <button className="btn-amber">Agregar Servicio</button>
          </div>
          {MOCK_SERVICES.map(s => (
            <div key={s.id} className="service-item">
              <div className="service-left">
                <Scissors className="icon-small amber"/>
                <div>
                  <p>{s.name}</p>
                  <p className="text-xs">{s.bookings} reservas</p>
                </div>
              </div>
              <div className="service-right">
                <p>${s.price}</p>
                <div>
                  <button className="btn-amber-small">Editar</button>
                  <button className="btn-red-small">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="settings-card">
          <h2>Ajustes de la Barbería</h2>
          <div className="settings-form">
            <label>Nombre de la Barbería</label>
            <input type="text" defaultValue="Barbería Elite"/>
            <label>Horario de Atención</label>
            <input type="text" defaultValue="Lunes a Viernes: 9:00 AM - 8:00 PM"/>
            <label>Teléfono</label>
            <input type="tel" defaultValue="(555) 123-4567"/>
            <button className="btn-amber">Guardar Cambios</button>
          </div>
        </div>
      )}

    </div>
  );
};
