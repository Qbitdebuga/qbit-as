/**
 * Base API Client
 * Provides common functionality for all API clients including:
 * - Authentication (user and service-to-service)
 * - Error handling
 * - Request/response interceptors
 * - CSRF protection
 */

import { TokenStorage } from './utils/token-storage';

// Request types
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  withCredentials?: boolean | null;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  timeout?: number | null;
  skipInterceptors?: boolean | null;
  skipAuthHeader?: boolean | null;
  skipCsrfToken?: boolean | null;
}

// Error response structure
export interface ApiErrorResponse {
  statusCode: number | null;
  message: string | null;
  error?: string | null;
  details?: any;
  timestamp?: string | null;
  path?: string | null;
}

// Interceptor types
export type RequestInterceptor = (config: {
  method: string | null;
  url: string | null;
  data?: any;
  options: RequestOptions;
}) => Promise<{
  method: string | null;
  url: string | null;
  data: any;
  options: RequestOptions;
}>;

export type ResponseInterceptor = <T>(response: T) => Promise<T>;

export type ErrorInterceptor = (error: any) => Promise<any>;

export class BaseApiClient {
  private baseUrl: string | null;
  private tokenStorage: typeof TokenStorage;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private serviceToken?: string | null;

  constructor(baseUrl: string, tokenStorage: typeof TokenStorage = TokenStorage) {
    this.baseUrl = baseUrl;
    this.tokenStorage = tokenStorage;
  }

  /**
   * Add a request interceptor
   * @param interceptor Function that will be called before each request
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this?.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   * @param interceptor Function that will be called after each successful response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this?.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   * @param interceptor Function that will be called after each error
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this?.errorInterceptors.push(interceptor);
  }

  /**
   * Set a service token for service-to-service authentication
   * @param token The service token
   */
  setServiceToken(token: string): void {
    this.serviceToken = token;
  }

  /**
   * Clear the service token
   */
  clearServiceToken(): void {
    this.serviceToken = undefined;
  }

  /**
   * Set a user authentication token
   * @param token The user token
   */
  setToken(token: string): void {
    this?.tokenStorage.updateAccessToken(token);
  }

  /**
   * Clear all user tokens
   */
  clearTokens(): void {
    this?.tokenStorage.clearTokens();
  }

  /**
   * Get the current user token
   */
  get token(): string | null {
    return this?.tokenStorage.getAccessToken();
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, data: any = {}, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', path, data, options);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    let config = {
      method,
      url: path,
      data: data || null,
      options: { ...options },
    };

    try {
      // Apply request interceptors if not skipped
      if (!options.skipInterceptors) {
        for (const interceptor of this.requestInterceptors) {
          config = await interceptor(config);
        }
      }

      const url = new URL(config.url, this.baseUrl);

      // Add query parameters if any
      if (config?.options.params) {
        Object.entries(config?.options.params).forEach(([key, value]) => {
          url?.searchParams.append(key, String(value));
        });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config?.options.headers,
      };

      // Add authentication header if not skipped
      if (!config?.options.skipAuthHeader) {
        // First try service token (for service-to-service auth)
        if (this.serviceToken) {
          headers['Authorization'] = `Bearer ${this.serviceToken}`;
        }
        // Then try user token
        else {
          const token = this?.tokenStorage.getAccessToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      }

      // Add CSRF token if not skipped
      if (!config?.options.skipCsrfToken) {
        const csrfToken = this?.tokenStorage.getCsrfToken();
        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method)) {
          headers['X-XSRF-TOKEN'] = csrfToken;
        }
      }

      // Include credentials for cookies if specified
      const credentials = config?.options.withCredentials ? 'include' : 'same-origin';

      const response = await fetch(url.toString(), {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        credentials,
      });

      if (!response.ok) {
        // Try to parse error response
        const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
        const error = new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );

        // Add additional error information
        Object.assign(error, {
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          data: errorData,
        });

        throw error;
      }

      // For 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      // Parse response based on responseType
      let result: any;
      switch (config?.options.responseType) {
        case 'text':
          result = await response.text();
          break;
        case 'blob':
          result = await response.blob();
          break;
        case 'arraybuffer':
          result = await response.arrayBuffer();
          break;
        case 'json':
        default:
          result = await response.json();
      }

      // Apply response interceptors if not skipped
      if (!config?.options.skipInterceptors) {
        for (const interceptor of this.responseInterceptors) {
          result = await interceptor(result);
        }
      }

      return result;
    } catch (error) {
      // Apply error interceptors if not skipped
      if (!options.skipInterceptors) {
        let processedError = error;
        for (const interceptor of this.errorInterceptors) {
          try {
            processedError = await interceptor(processedError);
          } catch (interceptorError) {
            processedError = interceptorError;
          }
        }
        throw processedError;
      }

      throw error;
    }
  }
}
