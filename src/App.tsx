import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { Services } from './pages/Services';
import { Products } from './pages/Products';
import { Book } from './pages/Book';
import { BarberPanel } from './pages/BarberPanel';
import { Admin } from './pages/Admin';


// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'client' | 'barber' | 'admin' }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Public routes that don't need the layout
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Routes with layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/products" element={<Products />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/book" element={
                <ProtectedRoute requiredRole="client">
                  <Book />
                </ProtectedRoute>
              } />
              <Route path="/barber-panel" element={
                <ProtectedRoute requiredRole="barber">
                  <BarberPanel />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
