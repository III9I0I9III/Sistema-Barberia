import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Star, Clock } from 'lucide-react';


const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Corte Clásico',
    description: 'Corte de cabello tradicional con terminación perfecta',
    price: 15,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Afeitado Moderno',
    description: 'Afeitado profesional con navaja, toalla caliente y productos premium',
    price: 12,
    duration: 25,
    image: 'https://images.pexels.com/photos/8867486/pexels-photo-8867486.jpeg?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'Estilo y Peinado',
    description: 'Peinado moderno con productos de alta calidad',
    price: 10,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Paquete Completo',
    description: 'Corte + Afeitado + Tratamiento facial',
    price: 35,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
  },
];

const MOCK_BARBERS = [
  {
    id: 1,
    name: 'Carlos "El Maestro"',
    specialty: 'Corte Clásico',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Miguel "El Artista"',
    specialty: 'Estilos Modernos',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  },
];

export const Home: React.FC = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-icon">
            <Scissors className="icon" />
          </div>
          <h1>Bienvenido a <span>Barbados</span></h1>
          <p>Donde el estilo se encuentra con la tradición. Los mejores barberos de la ciudad a tu servicio.</p>
          <div className="hero-buttons">
            <Link to="/book" className="btn-primary">Reservar Ahora</Link>
            <Link to="/services" className="btn-secondary">Ver Servicios</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Ofrecemos una amplia gama de servicios para satisfacer tus necesidades de estilo</p>
        </div>
        <div className="services-grid">
          {MOCK_SERVICES.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-image">
                <img src={service.image} alt={service.name} />
                <div className="service-price">${service.price}</div>
              </div>
              <div className="service-content">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-footer">
                  <div className="service-duration">
                    <Clock className="icon-small" />
                    {service.duration} min
                  </div>
                  <Link to="/book" className="btn-service">Reservar</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Barbers Section */}
      <section className="barbers">
        <div className="section-header">
          <h2>Nuestros Barberos</h2>
          <p>Profesionales con años de experiencia y pasión por el arte</p>
        </div>
        <div className="barbers-grid">
          {MOCK_BARBERS.map((barber) => (
            <div key={barber.id} className="barber-card">
              <img src={barber.image} alt={barber.name} />
              <div className="barber-info">
                <h3>{barber.name}</h3>
                <p className="specialty"><Sparkles className="icon-small" />{barber.specialty}</p>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={i < Math.floor(barber.rating) ? 'star-filled' : 'star-empty'} />
                  ))}
                  <span>{barber.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>¿Listo para cambiar tu estilo?</h2>
        <p>Reserva tu cita hoy mismo y experimenta la diferencia</p>
        <Link to="/register" className="btn-primary">Crear Cuenta Gratis</Link>
      </section>
    </div>
  );
};
