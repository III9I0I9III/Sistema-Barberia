import React, { useState } from 'react';
import { Calendar, Clock, Scissors, User, Check, ChevronRight } from 'lucide-react';
import '../index.css';

const MOCK_SERVICES = [
  { id: 1, name: 'Corte Clásico', price: 15, duration: 30 },
  { id: 2, name: 'Afeitado Moderno', price: 12, duration: 25 },
  { id: 3, name: 'Estilo y Peinado', price: 10, duration: 20 },
  { id: 4, name: 'Paquete Completo', price: 35, duration: 60 },
];

const MOCK_BARBERS = [
  { id: 1, name: 'Carlos "El Maestro"', specialty: 'Corte Clásico', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: 2, name: 'Miguel "El Artista"', specialty: 'Estilos Modernos', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export const Book: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const getService = () => MOCK_SERVICES.find(s => s.id === selectedService);
  const getBarber = () => MOCK_BARBERS.find(b => b.id === selectedBarber);

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const handleConfirm = () => { setConfirmed(true); };

  if (confirmed) {
    return (
      <div className="book-container">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <Check className="icon-large" />
          </div>
          <h1>¡Reserva Confirmada!</h1>
          <p>Tu cita ha sido reservada exitosamente. Te esperamos.</p>

          <div className="confirmation-details">
            <div className="detail-item"><Scissors className="icon-small amber"/> <span>{getService()?.name}</span></div>
            <div className="detail-item"><User className="icon-small amber"/> <span>{getBarber()?.name}</span></div>
            <div className="detail-item"><Calendar className="icon-small amber"/> <span>{selectedDate}</span></div>
            <div className="detail-item"><Clock className="icon-small amber"/> <span>{selectedTime}</span></div>
          </div>

          <button
            onClick={() => {
              setStep(1); setConfirmed(false); setSelectedService(null);
              setSelectedBarber(null); setSelectedDate(''); setSelectedTime('');
            }}
            className="btn-amber"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-container space-y-8">

      {/* Progress Bar */}
      <div className="progress-bar">
        {[1,2,3,4].map((s,i) => (
          <React.Fragment key={s}>
            <div className="step">
              <div className={`step-circle ${step >= s ? 'active' : ''}`}>{s}</div>
              <span className="step-label">
                {s===1 && 'Servicio'}{s===2 && 'Barbero'}{s===3 && 'Fecha'}{s===4 && 'Confirmar'}
              </span>
            </div>
            {i < 3 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-content">

        {/* Step 1 */}
        {step===1 && (
          <div>
            <h2>Selecciona un servicio</h2>
            <div className="grid grid-cols-2 gap-4">
              {MOCK_SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`service-btn ${selectedService===s.id ? 'selected' : ''}`}
                >
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.duration} min</p>
                  </div>
                  <span>${s.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div>
            <h2>Selecciona un barbero</h2>
            <div className="grid grid-cols-2 gap-4">
              {MOCK_BARBERS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBarber(b.id)}
                  className={`barber-btn ${selectedBarber===b.id ? 'selected' : ''}`}
                >
                  <img src={b.image} alt={b.name}/>
                  <div>
                    <h3>{b.name}</h3>
                    <p>{b.specialty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div>
            <div>
              <h2>Selecciona la fecha</h2>
              <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            {selectedDate && (
              <div>
                <h2>Selecciona la hora</h2>
                <div className="grid grid-cols-6 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      onClick={()=>setSelectedTime(t)}
                      className={`time-btn ${selectedTime===t ? 'selected' : ''}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {step===4 && (
          <div>
            <h2>Confirma tu reserva</h2>
            <div className="confirmation-summary">
              <div><span>Servicio</span><span>{getService()?.name}</span></div>
              <div><span>Barbero</span><span>{getBarber()?.name}</span></div>
              <div><span>Fecha</span><span>{selectedDate}</span></div>
              <div><span>Hora</span><span>{selectedTime}</span></div>
              <div><span>Precio</span><span>${getService()?.price}</span></div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          {step>1 ? <button onClick={handleBack} className="btn-back">Atrás</button> : <div/>}
          {step<4 ? (
            <button
              onClick={handleNext}
              disabled={
                (step===1 && !selectedService) ||
                (step===2 && !selectedBarber) ||
                (step===3 && (!selectedDate || !selectedTime))
              }
              className="btn-amber"
            >
              <span>Siguiente</span> <ChevronRight className="icon-small"/>
            </button>
          ) : (
            <button onClick={handleConfirm} className="btn-green">Confirmar Reserva</button>
          )}
        </div>

      </div>
    </div>
  );
};
