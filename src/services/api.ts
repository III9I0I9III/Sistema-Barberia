const API_BASE_URL = 'http://localhost/backend/api';

interface ApiResponse {
  data?: any;
  error?: string;
  message?: string;
  token?: string;
  user?: any;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  // Auth
  async register(name: string, email: string, password: string, phone: string): Promise<ApiResponse> {
    return this.request('register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Services
  async getServices(): Promise<ApiResponse> {
    return this.request('services', { method: 'GET' });
  }

  async createService(service: any): Promise<ApiResponse> {
    return this.request('services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  }

  // Products
  async getProducts(): Promise<ApiResponse> {
    return this.request('products', { method: 'GET' });
  }

  async createProduct(product: any): Promise<ApiResponse> {
    return this.request('products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Barbers
  async getBarbers(): Promise<ApiResponse> {
    return this.request('barbers', { method: 'GET' });
  }

  // Users (Admin)
  async getUsers(): Promise<ApiResponse> {
    return this.request('users', { method: 'GET' });
  }

  // Profile
  async getProfile(): Promise<ApiResponse> {
    return this.request('profile', { method: 'GET' });
  }

  async updateProfile(name: string, phone: string): Promise<ApiResponse> {
    return this.request('profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    return this.request('delete-account', { method: 'DELETE' });
  }

  // Bookings
  async getBookings(): Promise<ApiResponse> {
    return this.request('bookings', { method: 'GET' });
  }

  async createBooking(booking: any): Promise<ApiResponse> {
    return this.request('bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBooking(id: number, status: string): Promise<ApiResponse> {
    return this.request(`bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteBooking(id: number): Promise<ApiResponse> {
    return this.request(`bookings/${id}`, { method: 'DELETE' });
  }

  // Messages
  async getMessages(receiverId?: number): Promise<ApiResponse> {
    const endpoint = receiverId ? `messages?receiver_id=${receiverId}` : 'messages';
    return this.request(endpoint, { method: 'GET' });
  }

  async sendMessage(receiverId: number, message: string): Promise<ApiResponse> {
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message }),
    });
  }

  // Stats (Admin)
  async getStats(): Promise<ApiResponse> {
    return this.request('stats', { method: 'GET' });
  }
}

export const apiService = new ApiService();
