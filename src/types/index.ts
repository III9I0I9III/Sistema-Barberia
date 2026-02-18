/* ========================= USERS ========================= */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'barber' | 'admin';
  avatar?: string;
}

/* ========================= BARBERS ========================= */
export interface Barber {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  available: boolean;
}

/* ========================= SERVICES ========================= */
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // en minutos
  image: string;
}

/* ========================= PRODUCTS ========================= */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

/* ========================= BOOKINGS ========================= */
/* 🔥 Nota: el backend devuelve snake_case; el frontend usa camelCase */
export interface Booking {
  id: number;
  userId: number;    // frontend camelCase
  barberId: number;
  serviceId: number;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:mm"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/* ========================= AUTH CONTEXT ========================= */
export interface AuthContextType {
  user: User | null;

  login: (email: string, password: string) => Promise<void>;

  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

  updateProfile: (data: Partial<User>) => void;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;

  deleteAccount: () => Promise<void>;
}

/* ========================= API RESPONSES GENERALES ========================= */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  token?: string;
  user?: User;
}
