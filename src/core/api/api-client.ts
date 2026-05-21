import {
  ensureCsrfCookie,
  invalidateCsrfCookie,
  readXsrfToken,
} from "@/core/auth/csrf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL && typeof window !== "undefined") {
  console.error(
    "[api-client] NEXT_PUBLIC_API_URL is not configured. " +
      "Set it in .env.local (e.g. NEXT_PUBLIC_API_URL=http://localhost:8000/api). " +
      "API requests will fail until this is configured."
  );
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions<D = unknown> = {
  headers?: Record<string, string>;
  body?: D;
  credentials?: RequestCredentials;
  cache?: RequestCache;
};

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

const STATE_CHANGING_METHODS: ReadonlySet<RequestMethod> = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const buildUrl = (endpoint: string): string => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

const buildHeaders = (
  method: RequestMethod,
  customHeaders?: Record<string, string>
): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Connection: "keep-alive",
    ...customHeaders,
  };

  if (STATE_CHANGING_METHODS.has(method)) {
    const xsrf = readXsrfToken();
    if (xsrf) {
      headers["X-XSRF-TOKEN"] = xsrf;
    }
  }

  return headers;
};

const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
};

async function performRequest<T, D>(
  endpoint: string,
  method: RequestMethod,
  data: D | undefined,
  customOptions: Omit<RequestOptions, "body"> & { signal?: AbortSignal }
): Promise<ApiResponse<T>> {
  if (STATE_CHANGING_METHODS.has(method)) {
    await ensureCsrfCookie();
  }

  const url = buildUrl(endpoint);
  const options: RequestInit = {
    method,
    headers: buildHeaders(method, customOptions.headers),
    credentials: customOptions.credentials || "include",
    cache: customOptions.cache,
    signal: customOptions.signal,
    ...(data !== undefined && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, options);

  if (response.status === 401) {
    handleUnauthorized();
    return {
      data: null,
      error: "Unauthorized. Please log in again.",
      status: 401,
    };
  }

  const responseData =
    response.status !== 204
      ? await response.json().catch(() => null)
      : null;

  if (!response.ok) {
    return {
      data: responseData as T,
      error:
        responseData?.message ||
        `${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }

  return { data: responseData, error: null, status: response.status };
}

export const apiClient = {
  async request<T, D = unknown>(
    endpoint: string,
    method: RequestMethod = "GET",
    data?: D,
    customOptions: Omit<RequestOptions, "body"> & { signal?: AbortSignal } = {}
  ): Promise<ApiResponse<T>> {
    try {
      let response = await performRequest<T, D>(
        endpoint,
        method,
        data,
        customOptions
      );

      // CSRF token rotated between page load and this request — refresh and retry once.
      if (response.status === 419) {
        invalidateCsrfCookie();
        await ensureCsrfCookie();
        response = await performRequest<T, D>(
          endpoint,
          method,
          data,
          customOptions
        );
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { data: null, error: "Request cancelled", status: 0 };
      }
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "GET", undefined, options);
  },

  post<T, D>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, "POST", data, options);
  },

  logout<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "POST");
  },

  put<T, D>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, "PUT", data, options);
  },

  delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "DELETE", undefined, options);
  },

  patch<T, D>(
    endpoint: string,
    data: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(endpoint, "PATCH", data, options);
  },
};
