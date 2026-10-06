import { ApiErrorResponse, ApiSuccessResponse } from '../types/api.types';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Maps HTTP status codes to user-friendly messages when backend doesn't provide a specific message
 */
function getFriendlyErrorMessage(status: number, serverMessage?: string): string {
  if (serverMessage && serverMessage.trim().length > 0) {
    return serverMessage;
  }

  switch (status) {
    case 401:
      return 'Sesi telah berakhir atau Anda belum login. Silakan masuk kembali.';
    case 403:
      return 'Anda tidak memiliki hak akses untuk halaman atau aksi ini.';
    case 404:
      return 'Data atau halaman yang Anda cari tidak ditemukan.';
    case 409:
      return 'Terjadi konflik data (misal: email atau data sudah terdaftar).';
    case 500:
    default:
      return 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.';
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: defaultHeaders,
        credentials: 'include' // Strict HTTP-only cookie inclusion
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }

    let responseData: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    }

    if (!response.ok) {
      const errorPayload = responseData as ApiErrorResponse | null;
      const status = response.status;
      const errorCode = errorPayload?.error?.code || `HTTP_${status}`;
      const rawMessage = errorPayload?.error?.message;
      const details = errorPayload?.error?.details;
      const message = getFriendlyErrorMessage(status, rawMessage);

      throw new ApiError(status, errorCode, message, details);
    }

    const successData = responseData as ApiSuccessResponse<T>;
    return successData.data;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
