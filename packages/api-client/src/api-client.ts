import { TokenStorage } from './utils/token-storage';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string | null;
  private tokenStorage: typeof TokenStorage;

  constructor(baseUrl: string, tokenStorage: typeof TokenStorage) {
    this.baseUrl = baseUrl;
    this.tokenStorage = tokenStorage;
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    // Add query parameters if any
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url?.searchParams.append(key, value);
      });
    }

    const token = this?.tokenStorage.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // For 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return await response.json();
  }

  public async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  public async post<T>(path: string, data: any = {}, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  public async put<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  public async patch<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', path, data, options);
  }

  public async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
  public setToken(token: string) {
    this?.tokenStorage.updateAccessToken(token);
  }

  public clearToken() {
    this?.tokenStorage.clearTokens();
  }

  public get token(): string | null {
    return this?.tokenStorage.getAccessToken();
  }
}
