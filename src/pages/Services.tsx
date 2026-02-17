import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Scissors } from 'lucide-react';
import '../index.css';

const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Corte Clásico',
    description: 'Corte de cabello tradicional con terminación perfecta, lavado y peinado incluido.',
    price: 15,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop',
    category: 'Corte',
  },
  {
    id: 2,
    name: 'Afeitado Moderno',
    description: 'Afeitado con navaja, toalla caliente, aceites y cremas premium.',
    price: 12,
    duration: 25,
    image: 'https://images.pexels.com/photos/8867486/pexels-photo-8867486.jpeg?auto=format&fit=crop&w=400&q=80',
    category: 'Afeitado',
  },
  {
    id: 3,
    name: 'Estilo y Peinado',
    description: 'Peinado moderno con productos de alta calidad para cualquier ocasión.',
    price: 10,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=400&fit=crop',
    category: 'Peinado',
  },
  {
    id: 4,
    name: 'Paquete Completo',
    description: 'Corte + Afeitado + Tratamiento facial. El paquete premium para el caballero moderno.',
    price: 35,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop',
    category: 'Paquete',
  },
  {
    id: 5,
    name: 'Recorte de Barba',
    description: 'Ajuste y definición de barba con productos especializados.',
    price: 8,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop',
    category: 'Barba',
  },
  {
    id: 6,
    name: 'Tratamiento Capilar',
    description: 'Tratamiento revitalizante para cabello y cuero cabelludo.',
    price: 20,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
    category: 'Tratamiento',
  },
];

export const Services: React.FC = () => {
  return (
    <div className="services-container">

      <div className="services-header">
        <h1>Nuestros Servicios</h1>
        <p>
          Descubre nuestra amplia gama de servicios diseñados para satisfacer todas tus necesidades de estilo y cuidado personal.
        </p>
      </div>

      <div className="services-grid">
        {MOCK_SERVICES.map((service) => (
          <div key={service.id} className="service-card">

            <div className="service-image">
              <img src={service.image} alt={service.name} />
              <div className="image-overlay" />

              <div className="category-badge">
                <span>{service.category}</span>
              </div>

              <div className="price-badge">
                <span>${service.price}</span>
              </div>
            </div>

            <div className="service-content">
              <h3>{service.name}</h3>
              <p className="description">{service.description}</p>

              <div className="service-footer">
                <div className="duration">
                  <Clock className="icon-small" />
                  <span>{service.duration} min</span>
                </div>

                <Link to="/book" className="reserve-btn">
                  <Scissors className="icon-small" />
                  <span>Reservar</span>
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2>¿Necesitas un servicio personalizado?</h2>
        <p>Contáctanos para consultas sobre servicios especiales</p>
        <a href="tel:+5551234567" className="cta-button">
          <span>Llámanos: (555) 123-4567</span>
        </a>
      </div>

    </div>
  );
};
