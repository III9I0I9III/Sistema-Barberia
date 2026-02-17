import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar sesión guardada
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // LOGIN REAL
  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);

      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return { success: true, message: response.message || 'Login exitoso' };
      }

      return { success: false, message: 'Respuesta inválida del servidor' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error del servidor' };
    }
  };

  // REGISTER REAL
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await apiService.register(name, email, password, phone || '');

      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return { success: true, message: response.message || 'Registro exitoso' };
      }

      return { success: false, message: 'Respuesta inválida del servidor' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error del servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw new Error(error?.message || 'Error al cambiar contraseña');
    }
  };

  const deleteAccount = async () => {
    try {
      await apiService.deleteAccount();
      logout();
    } catch (error: any) {
      throw new Error(error?.message || 'Error al eliminar cuenta');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        changePassword,
        deleteAccount,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
