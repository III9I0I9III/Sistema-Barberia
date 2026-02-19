import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Service } from '../types';
import  "./index.css";
export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    apiService.getServices().then(res => setServices(res.data));
  }, []);

  return (
    <div>
      <h1>Servicios</h1>

      {services.map(s => (
        <div key={s.id}>
          <p>{s.name}</p>
          <p>${s.price}</p>
        </div>
      ))}
    </div>
  );
};
