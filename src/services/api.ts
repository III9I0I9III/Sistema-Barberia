const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse {
  data?: any;
  error?: string;
  message?: string;
  token?: string;
  user?: any;
}

class ApiService {

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse> {

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

      const text = await response.text();

      // 🔥 Render a veces devuelve HTML en errores
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("😈 NON-JSON RESPONSE:", text);
        throw new Error("Servidor devolvió algo que NO es JSON");
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error ${response.status}`);
      }

      return data;

    } catch (error: any) {
      console.error("😈 API ERROR:", error.message);
      throw new Error(error.message || 'Network error');
    }
  }

  /* ========================= AUTH ========================= */

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

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  /* ========================= BOOKINGS ========================= */

  async getBookings() {
    return this.request('bookings', { method: 'GET' });
  }

  async createBooking(
    barberId: number,
    serviceId: number,
    date: string,
    time: string
  ) {
    return this.request('bookings', {
      method: 'POST',
      body: JSON.stringify({
        barber_id: barberId,
        service_id: serviceId,
        date,
        time,
      }),
    });
  }

  /* ========================= SERVICES ========================= */

  async getServices() {
    return this.request('services', { method: 'GET' });
  }

  /* ========================= PRODUCTS ========================= */

  async getProducts() {
    return this.request('products', { method: 'GET' });
  }

  /* ========================= BARBERS ========================= */

  async getBarbers() {
    return this.request('barbers', { method: 'GET' });
  }
}

export const apiService = new ApiService();
