import { getAuthToken, setAuthToken, setUserRole, removeAuthToken } from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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

const buildUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

const buildHeaders = (token: string | null, customHeaders?: Record<string, string>) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
  ...customHeaders,
});

const handleUnauthorized = () => {
  removeAuthToken();
};

const storeAuthData = (responseData: { token?: string; role?: string } | null) => {
  if (responseData?.token) setAuthToken(responseData.token);
  if (responseData?.role) setUserRole(Number(responseData.role));
};

export const apiClient = {
  async request<T, D = unknown>(
    endpoint: string,
    method: RequestMethod = 'GET',
    data?: D,
    customOptions: Omit<RequestOptions, 'body'> = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const url = buildUrl(endpoint);

    const options: RequestInit = {
      method,
      headers: buildHeaders(token, customOptions.headers),
      credentials: customOptions.credentials || 'include',
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);

      if (response.status === 401) {
        handleUnauthorized();
        return { data: null, error: 'Unauthorized. Please refresh your page.', status: 401 };
      }

      const responseData = response.status !== 204
        ? await response.json().catch(() => null)
        : null;

      storeAuthData(responseData);

      if (!response.ok) {
        return {
          data: responseData as T,
          error: responseData?.message || `${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      return { data: responseData, error: null, status: response.status };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  },

  post<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, 'POST', data, options);
  },

  logout<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST');
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