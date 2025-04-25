/**
 * API Client for making HTTP requests to the backend services
 * This is a wrapper around the fetch API with additional functionality
 */

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the authentication token for subsequent requests
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
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
  async post<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
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
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    
    // Add query parameters if any
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    // For 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return response.json();
  }
}