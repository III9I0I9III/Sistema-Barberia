import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">

          <div className="login-header">
            <div className="icon-wrapper">
              <Scissors className="icon-main" />
            </div>
            <h2>Bienvenido de nuevo</h2>
            <p>Inicia sesión en tu cuenta</p>
          </div>

          <div className="login-body">

            {error && (
              <div className="error-box">
                <AlertCircle className="icon-small" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form">

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="form-options">
                <div className="remember">
                  <input id="remember-me" name="remember-me" type="checkbox" />
                  <label htmlFor="remember-me">Recordarme</label>
                </div>
                <div>
                  <a href="#" className="forgot-link">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>

            </form>

            <div className="register-section">
              <p>
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="register-link">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <div className="demo-section">
              <p>
                Demo: cliente@test.com / 123456
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
