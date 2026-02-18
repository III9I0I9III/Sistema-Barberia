import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User, Service } from '../types';
import { useAuth } from '../context/AuthContext';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    apiService.getUsers().then(res => setUsers(res.data));
    apiService.getServices().then(res => setServices(res.data));
  }, []);

  if (user?.role !== "admin") return <div>Acceso denegado</div>;

  return (
    <div>
      <h1>Admin Panel</h1>

      <h2>Usuarios</h2>
      {users.map(u => (
        <div key={u.id}>{u.name} - {u.role}</div>
      ))}

      <h2>Servicios</h2>
      {services.map(s => (
        <div key={s.id}>{s.name} - ${s.price}</div>
      ))}
    </div>
  );
};
