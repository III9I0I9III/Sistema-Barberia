import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, User, LogOut, Home, ShoppingBag, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio', always: true },
    { path: '/services', icon: Scissors, label: 'Servicios', always: true },
    { path: '/products', icon: ShoppingBag, label: 'Productos', always: true },
    { path: '/book', icon: Calendar, label: 'Reservar', role: 'client' },
    { path: '/barber-panel', icon: Calendar, label: 'Panel Barbero', role: 'barber' },
    { path: '/admin', icon: Home, label: 'Admin', role: 'admin' },
  ];

  return (
    <div className="layout">

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Scissors className="icon"/>
            </div>
            <span className="logo-text">Barbados</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navItems.map(item => {
              if (!item.always && item.role && user?.role !== item.role) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="icon"/>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="user-menu">
            {user ? (
              <div className="user-logged">
                <Link to="/profile" className="user-link">
                  <User className="icon"/>
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="user-logout">
                  <LogOut className="icon"/>
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="user-guest">
                <Link to="/login" className="login-link">Iniciar Sesión</Link>
                <Link to="/register" className="register-btn">Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="nav-mobile">
        {navItems.map(item => {
          if (!item.always && item.role && user?.role !== item.role) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="icon"/>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <div className="logo-icon">
                  <Scissors className="icon"/>
                </div>
                <span className="logo-text">Barbados</span>
              </div>
              <p>Tu estilo, nuestra pasión. Los mejores barberos de Barbados.</p>
            </div>
            <div>
              <h3>Horario</h3>
              <p>Lunes a Viernes: 9:00 AM - 8:00 PM</p>
              <p>Sábados: 10:00 AM - 6:00 PM</p>
              <p>Domingos: Cerrado</p>
            </div>
            <div>
              <h3>Contacto</h3>
              <p>Tel: (555) 123-4567</p>
              <p>Email: info@barbados.com</p>
              <p>Dirección: Calle Principal #123</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Barbados. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
