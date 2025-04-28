import { ApiClient } from '../api-client';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

/**
 * Base class for API client implementations
 * Provides HTTP methods and common functionality for service-specific clients
 */
export class ApiClientBase {
  protected apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Performs a GET request
   */
  protected async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this?.apiClient.get<T>(path, options);
  }

  /**
   * Performs a POST request
   */
  protected async post<T>(path: string, data: any = {}, options: RequestOptions = {}): Promise<T> {
    return this?.apiClient.post<T>(path, data, options);
  }

  /**
   * Performs a PUT request
   */
  protected async put<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this?.apiClient.put<T>(path, data, options);
  }

  /**
   * Performs a PATCH request
   */
  protected async patch<T>(path: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this?.apiClient.patch<T>(path, data, options);
  }

  /**
   * Performs a DELETE request
   */
  protected async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this?.apiClient.delete<T>(path, options);
  }
} 