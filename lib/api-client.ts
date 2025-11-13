import { getAuthToken, setAuthToken, setUserRole, removeAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type RequestOptions<D = unknown> = {
  headers?: Record<string, string>;
  body?: D;
  credentials?: RequestCredentials;
};

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

/**
 * Centralized API client for making requests to the backend
 */
export const apiClient = {
  /**
   * Core request method
   */
  async request<T, D = unknown>(
    endpoint: string, 
    method: RequestMethod = 'GET', 
    data?: D, 
    customOptions: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = getAuthToken();
    
    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...customOptions.headers,
      },
      credentials: customOptions.credentials || 'include',
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized - remove token and redirect to login
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return {
          data: null,
          error: 'Unauthorized',
          status: 401
        };
      }
      
      // Parse response data if available
      const responseData = response.status !== 204 ? await response.json().catch(() => null) : null;
      
      // Store token and role if returned from login/register
      if (responseData?.token) {
        setAuthToken(responseData.token);
      }
      if (responseData?.role) {
        setUserRole(responseData.role);
      }
      
      if (!response.ok) {
        return {
          data: null,
          error: responseData?.message || `${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      return {
        data: responseData,
        error: null,
        status: response.status
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  },

  // Convenience methods
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  },

  post<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, 'POST', data, options);
  },

  put<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, 'PUT', data, options);
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  },
  
  patch<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, 'PATCH', data, options);
  }
};