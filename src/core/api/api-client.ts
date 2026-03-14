import { getAuthToken, setAuthToken, setUserRole, removeAuthToken, setUserId, updateTokenExpiry } from '@/core/auth/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// http://127.0.0.1:8000

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

// ⚡ PERFORMANCE: Memoized header construction to avoid recreating objects
const headerCache = new Map<string, Record<string, string>>();

const buildHeaders = (token: string | null, customHeaders?: Record<string, string>): Record<string, string> => {
  const cacheKey = `${token || 'none'}-${JSON.stringify(customHeaders || {})}`;

  if (headerCache.has(cacheKey)) {
    return headerCache.get(cacheKey)!;
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // ⚡ PERFORMANCE: Enable HTTP caching for GET requests
    'Cache-Control': 'public, max-age=120', // 2 minutes
    // ⚡ PERFORMANCE: Keep connection alive for connection pooling
    'Connection': 'keep-alive',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...customHeaders,
  };

  headerCache.set(cacheKey, headers);

  // Clear cache periodically to prevent memory leaks
  if (headerCache.size > 100) {
    const keysIterator = headerCache.keys();
    const firstKey = keysIterator.next().value;
    if (firstKey) {
      headerCache.delete(firstKey);
    }
  }

  return headers;
};

const handleUnauthorized = () => {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

const storeAuthData = (responseData: { token?: string; role?: number; user?: { id: number }; expires_at?: string } | null) => {
  if (responseData?.token) setAuthToken(responseData.token, responseData.expires_at);
  if (responseData?.role) setUserRole(responseData.role);
  if (responseData?.user?.id) setUserId(responseData.user.id);
  // Update token expiry if provided (for token refresh endpoint responses)
  if (responseData?.expires_at && !responseData?.token) {
    updateTokenExpiry(responseData.expires_at);
  }
};

// Define public endpoints that don't require authentication
const isPublicEndpoint = (endpoint: string): boolean => {
  const publicEndpoints = [
    'users/login',
    'users/store',
    'verify-email',
    'resend-verification',
    'campuses/all',
    'offices/all',
    'degreeCourse/',
    'reservations/all',
    'reservations/assets/',
  ];

  return publicEndpoints.some(publicPath => endpoint.includes(publicPath));
};

// Define endpoints that definitely require authentication
const isProtectedEndpoint = (endpoint: string): boolean => {
  const protectedPatterns = [
    '/me',
    'logout',
    'assets/all',
    'assets/store',
    'assets/',
    'event/reservation',
    // Note: 'reservations/{id}' (single ID) is protected, but 'reservations/all' is public
  ];

  // Special case: reservations/{id} is protected, but reservations/all and reservations/assets/{id} are public
  if (endpoint.startsWith('reservations/')) {
    // If it's /all or /assets/, it's public
    if (endpoint.includes('/all') || endpoint.includes('/assets/')) {
      return false;
    }
    // Otherwise it's a single reservation by ID, which is protected
    return /^reservations\/\d+$/.test(endpoint) || /^reservations\/\d+\/move$/.test(endpoint);
  }

  return protectedPatterns.some(pattern => endpoint.includes(pattern));
};

export const apiClient = {
  async request<T, D = unknown>(
    endpoint: string,
    method: RequestMethod = 'GET',
    data?: D,
    customOptions: Omit<RequestOptions, 'body'> & { signal?: AbortSignal } = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const url = buildUrl(endpoint);

    // Only fail fast if it's a protected endpoint and token is missing
    if (!token && !isPublicEndpoint(endpoint) && isProtectedEndpoint(endpoint)) {
      return {
        data: null,
        error: 'Authentication required. Please log in.',
        status: 401
      };
    }

    const options: RequestInit = {
      method,
      headers: buildHeaders(token, customOptions.headers),
      credentials: customOptions.credentials || 'include',
      // ⚡ PERFORMANCE: Support AbortSignal for request cancellation
      signal: customOptions.signal,
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);

      if (response.status === 401) {
        handleUnauthorized();
        return {
          data: null,
          error: 'Unauthorized. Please log in again.',
          status: 401
        };
      }

      const responseData = response.status !== 204
        ? await response.json().catch(() => null)
        : null;

      // Store auth data on successful login/auth/token-refresh responses
      if (response.ok && (endpoint === 'users/login' || endpoint === '/me' || endpoint === '/update-token-expiration')) {
        storeAuthData(responseData);
      }

      if (!response.ok) {
        return {
          data: responseData as T,
          error: responseData?.message || `${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      return { data: responseData, error: null, status: response.status };
    } catch (error) {
      // ⚡ PERFORMANCE: Don't treat AbortError as actual error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: 'Request cancelled',
          status: 0
        };
      }

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