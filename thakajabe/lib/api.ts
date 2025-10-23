import { env } from './env';
import { getPixelCookies } from './cookies';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = env.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // Add pixel cookies for server-side tracking
    if (typeof window !== 'undefined') {
      const { fbp, fbc } = getPixelCookies();
      if (fbp) {
        defaultHeaders['x-fbp'] = fbp;
      }
      if (fbc) {
        defaultHeaders['x-fbc'] = fbc;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Upload multiple files
  async uploadMultiple<T>(endpoint: string, files: File[]): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const api = {
  // Auth
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      apiClient.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    profile: () => apiClient.get('/auth/profile'),
  },

  // Products/Rooms
  rooms: {
    list: <T = any>(params?: { page?: number; limit?: number; category?: string; search?: string }) =>
      apiClient.get<T>('/products', params),
    search: <T = any>(queryString: string) => apiClient.get<T>(`/rooms/search?${queryString}`),
    get: <T = any>(id: string) => apiClient.get<T>(`/products/${id}`),
    create: (data: any) => apiClient.post('/products', data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Bookings
  bookings: {
    create: (data: any) => apiClient.post('/bookings/create', data),
    list: <T = any>(params?: any) => apiClient.get<T>('/bookings/mine', params),
    get: <T = any>(id: string) => apiClient.get<T>(`/bookings/${id}`),
    cancel: (id: string) => apiClient.post(`/bookings/${id}/cancel`),
  },

  // Payments
  payments: {
    create: <T = any>(data: any) => apiClient.post<T>('/payments/ssl/create', data),
    verify: <T = any>(params: { val_id: string; tran_id: string }) =>
      apiClient.post<T>('/payments/ssl/verify', params),
    status: <T = any>(transactionId: string) => apiClient.get<T>(`/payments/status/${transactionId}`),
  },

  // Uploads
  uploads: {
    image: (file: File) => apiClient.upload('/uploads/image', file),
    delete: (filename: string) => apiClient.delete(`/uploads/image/${filename}`),
    // Room images
    roomImages: <T = any>(roomId: string, files: File[]) => apiClient.uploadMultiple<T>(`/uploads/rooms/${roomId}/images`, files),
    deleteRoomImages: <T = any>(roomId: string, imageUrls: string[]) => apiClient.post<T>(`/uploads/rooms/${roomId}/images`, { imageUrls }),
  },

  // Chat
  chat: {
    getThreadIds: () => apiClient.get('/chat/threads/ids'),
    getThreads: (params?: any) => apiClient.get('/chat/threads', { params }),
    createThread: (data: any) => apiClient.post('/chat/threads', data),
    sendMessage: (data: any) => apiClient.post('/chat/messages', data),
    getMessages: (threadId: string, params?: any) => apiClient.get(`/chat/threads/${threadId}/messages`, { params }),
  },

  // Admin endpoints
  admin: {
    stats: () => apiClient.get('/admin/stats'),
    hosts: () => apiClient.get('/admin/hosts'),
    bookings: () => apiClient.get('/admin/bookings'),
    rooms: () => apiClient.get('/admin/rooms'),
    approveHost: (id: string, data: any) => apiClient.post(`/admin/hosts/${id}/approve`, data),
    rejectHost: (id: string, data: any) => apiClient.post(`/admin/hosts/${id}/reject`, data),
    approveRoom: (id: string, data: any) => apiClient.post(`/admin/rooms/${id}/approve`, data),
    rejectRoom: (id: string, data: any) => apiClient.post(`/admin/rooms/${id}/reject`, data),
  },

  // Host endpoints
  hosts: {
    stats: () => apiClient.get('/hosts/stats'),
    rooms: () => apiClient.get('/hosts/rooms'),
    bookings: () => apiClient.get('/hosts/bookings'),
    profile: () => apiClient.get('/hosts/me'),
    updateProfile: (data: any) => apiClient.put('/hosts/me', data),
    createRoom: (data: any) => apiClient.post('/hosts/rooms', data),
    updateRoom: (id: string, data: any) => apiClient.put(`/hosts/rooms/${id}`, data),
    deleteRoom: (id: string) => apiClient.delete(`/hosts/rooms/${id}`),
  },
};
