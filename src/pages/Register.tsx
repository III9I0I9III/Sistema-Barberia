import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, phone, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-header">
            <div className="icon-wrapper">
              <Scissors className="icon-main" />
            </div>
            <h2>Crear Cuenta</h2>
            <p>Únete a nuestra barbería</p>
          </div>

          <div className="auth-body">

            {error && (
              <div className="error-box">
                <AlertCircle className="icon-small" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-register">

              <div className="form-group">
                <label>Nombre Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-1234"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>

            </form>

            <div className="auth-footer">
              <p>
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="auth-link">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
