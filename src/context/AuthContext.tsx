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
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const mockUsers = [
  { id: 1, name: 'Administrador', email: 'admin@test.com', password: '123456', phone: '555-0001', role: 'admin' as const },
  { id: 2, name: 'Carlos Ruiz', email: 'barbero1@test.com', password: '123456', phone: '555-0002', role: 'barber' as const },
  { id: 3, name: 'Miguel Ángel', email: 'barbero2@test.com', password: '123456', phone: '555-0003', role: 'barber' as const },
  { id: 4, name: 'Juan Pérez', email: 'cliente@test.com', password: '123456', phone: '555-1234', role: 'client' as const },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return { success: true, message: response.message || 'Login successful' };
      }
      
      throw new Error('Invalid response');
    } catch (error: any) {
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        const mockToken = `mock_token_${foundUser.id}_${Date.now()}`;
        
        setUser(userWithoutPassword);
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        return { success: true, message: 'Login successful (Modo demo)' };
      }
      
      return { success: false, message: error?.message || 'Credenciales inválidas' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.register(name, email, password, phone || '');
      
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return { success: true, message: response.message || 'Registro exitoso' };
      }
      
      throw new Error('Invalid response');
    } catch (error: any) {
      if (mockUsers.some(u => u.email === email)) {
        return { success: false, message: 'Email ya registrado' };
      }
      
      const newUser: User = {
        id: mockUsers.length + 1,
        name,
        email,
        phone: phone || '',
        role: 'client',
      };
      
      const mockToken = `mock_token_${newUser.id}_${Date.now()}`;
      
      setUser(newUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, message: 'Registro exitoso (Modo demo)' };
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

  const updateProfile = (data: Partial<User>) => {
    updateUser(data);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw new Error(error?.message || 'Error al cambiar la contraseña');
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await apiService.deleteAccount();
      logout();
    } catch (error: any) {
      throw new Error(error?.message || 'Error al eliminar la cuenta');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      updateUser, 
      updateProfile, 
      changePassword, 
      deleteAccount,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
