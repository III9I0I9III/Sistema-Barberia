export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'barber' | 'admin';
  avatar?: string;
}

export interface Barber {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  available: boolean;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export interface Booking {
  id: number;
  userId: number;
  barberId: number;
  serviceId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
