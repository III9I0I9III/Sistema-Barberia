const API_BASE_URL = import.meta.env.VITE_API_URL;

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
      if (!response.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  // Auth
  async register(name: string, email: string, password: string, phone: string) {
    return this.request('register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request('login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  // Profile
  async getProfile() { return this.request('profile', { method: 'GET' }); }
  async updateProfile(name: string, phone: string) {
    return this.request('profile', { method: 'PUT', body: JSON.stringify({ name, phone }) });
  }
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }
  async deleteAccount() {
    const data = await this.request('delete-account', { method: 'DELETE' });
    localStorage.removeItem('token');
    return data;
  }

  // Bookings
  async getBookings() { return this.request('bookings', { method: 'GET' }); }
  async createBooking(userId: number, barberId: number, serviceId: number, date: string, time: string) {
    return this.request('bookings', {
      method: 'POST',
      body: JSON.stringify({ userId, barberId, serviceId, date, time }),
    });
  }
  async updateBooking(id: number, status: string) {
    return this.request(`bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  async deleteBooking(id: number) { return this.request(`bookings/${id}`, { method: 'DELETE' }); }

  // Services
  async getServices() { return this.request('services', { method: 'GET' }); }
  async createService(service: any) { return this.request('services', { method: 'POST', body: JSON.stringify(service) }); }

  // Products
  async getProducts() { return this.request('products', { method: 'GET' }); }
  async createProduct(product: any) { return this.request('products', { method: 'POST', body: JSON.stringify(product) }); }

  // Barbers
  async getBarbers() { return this.request('barbers', { method: 'GET' }); }

  // Users (Admin)
  async getUsers() { return this.request('users', { method: 'GET' }); }

  // Messages
  async getMessages(receiverId?: number) {
    const endpoint = receiverId ? `messages?receiver_id=${receiverId}` : 'messages';
    return this.request(endpoint, { method: 'GET' });
  }
  async sendMessage(receiverId: number, message: string) {
    return this.request('messages', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId, message }) });
  }

  // Stats
  async getStats() { return this.request('stats', { method: 'GET' }); }
}

export const apiService = new ApiService();
