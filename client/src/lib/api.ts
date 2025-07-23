// API configuration for Spring Boot backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface ApiError {
  message: string;
  status?: number;
}

export class ApiException extends Error {
  public readonly status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new ApiException(errorMessage, response.status);
    }

    const data = await response.json();
    
    // Handle Spring Boot API response format
    if (data.success === false) {
      throw new ApiException(data.message || 'API request failed');
    }
    
    // Return the data property for successful responses
    return data.data || data;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();

// API Types (matching Spring Boot DTOs)
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}

export interface DashboardMetrics {
  totalSales: string;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  unreadAlerts: number;
}

export interface ProductDTO {
  id: number;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  categoryName?: string;
  vendorName?: string;
  rating: number;
  reviewCount: number;
  totalRevenue?: number;
  unitsSold?: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
}

export interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// API Functions
export const authApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),
  
  register: (userData: any) =>
    apiClient.post<{ message: string }>('/auth/register', userData),
};

export const dashboardApi = {
  getMetrics: () =>
    apiClient.get<DashboardMetrics>('/dashboard/metrics'),
  
  getSalesChart: () =>
    apiClient.get<SalesChartData[]>('/dashboard/sales-chart'),
};

export const productsApi = {
  getAll: (page = 0, size = 10) =>
    apiClient.get<PageResponse<ProductDTO>>(`/products?page=${page}&size=${size}`),
  
  getTopSelling: (limit = 10) =>
    apiClient.get<ProductDTO[]>(`/products/top-selling?limit=${limit}`),
  
  getLowStock: (threshold = 10) =>
    apiClient.get<ProductDTO[]>(`/products/low-stock?threshold=${threshold}`),
  
  search: (query: string, page = 0, size = 10) =>
    apiClient.get<PageResponse<ProductDTO>>(`/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`),
};

export const alertsApi = {
  getAll: (page = 0, size = 10) =>
    apiClient.get<PageResponse<Alert>>(`/alerts?page=${page}&size=${size}`),
  
  getUnread: () =>
    apiClient.get<Alert[]>('/alerts/unread'),
  
  getBySeverity: (severity: string) =>
    apiClient.get<Alert[]>(`/alerts/severity/${severity}`),
  
  getByType: (type: string) =>
    apiClient.get<Alert[]>(`/alerts/type/${type}`),
  
  markAsRead: (alertId: number) =>
    apiClient.post<Alert>(`/alerts/${alertId}/mark-read`),
  
  getUnreadCount: () =>
    apiClient.get<number>('/alerts/count/unread'),
};