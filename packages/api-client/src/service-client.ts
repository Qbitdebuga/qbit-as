/**
 * Service API Client
 * Used for service-to-service communication with automatic token management
 */

import { BaseApiClient, RequestOptions } from './base-client';
import { ServiceTokenRequestDto, ServiceTokenResponseDto } from '@qbit/shared-types';
import { TokenStorage } from './utils/token-storage';

export class ServiceApiClient extends BaseApiClient {
  private readonly serviceId: string;
  private readonly serviceName: string;
  private readonly authUrl: string;
  private tokenExpiry: number | null = null;

  /**
   * Create a new service API client
   * @param baseUrl Base URL for the service API
   * @param serviceId Unique identifier for this service
   * @param serviceName Human-readable name for this service
   * @param authUrl URL for the authentication service (used to get service tokens)
   */
  constructor(
    baseUrl: string, 
    serviceId: string, 
    serviceName: string,
    authUrl: string,
    tokenStorage: typeof TokenStorage = TokenStorage
  ) {
    super(baseUrl, tokenStorage);
    this.serviceId = serviceId;
    this.serviceName = serviceName;
    this.authUrl = authUrl;
  }

  /**
   * Get a service token for authentication with other services
   * Will cache the token and refresh if needed
   * @param scopes Permission scopes to request
   * @returns The service token
   */
  async getServiceToken(scopes: string[] = []): Promise<string> {
    // Check if we have a valid token already
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Otherwise, fetch a new token
    const tokenRequest: ServiceTokenRequestDto = {
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      scopes: scopes
    };

    try {
      // Make the request with skipAuthHeader to avoid circular dependency
      const response = await super.post<ServiceTokenResponseDto>(
        `${this.authUrl}/auth/service-token`, 
        tokenRequest,
        { skipAuthHeader: true }
      );
      
      // Store token and set expiry (subtract 30 seconds for safety margin)
      this.setServiceToken(response.accessToken);
      this.tokenExpiry = Date.now() + (response.expiresIn * 1000) - 30000;
      
      return response.accessToken;
    } catch (error) {
      console.error('Service token acquisition failed:', error);
      throw new Error(`Service authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Make an authenticated request to another service
   * Automatically handles token acquisition and renewal
   * @param method HTTP method
   * @param url URL to call
   * @param data Optional request body
   * @param options Request options
   * @param scopes Permission scopes to request
   * @returns The response data
   */
  async callService<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    options: RequestOptions = {},
    scopes: string[] = []
  ): Promise<T> {
    try {
      // Get a token with the appropriate scopes
      await this.getServiceToken(scopes);
      
      // Make the request using the appropriate method
      switch (method) {
        case 'GET':
          return this.get<T>(url, options);
        case 'POST':
          return this.post<T>(url, data, options);
        case 'PUT':
          return this.put<T>(url, data, options);
        case 'PATCH':
          return this.patch<T>(url, data, options);
        case 'DELETE':
          return this.delete<T>(url, options);
      }
    } catch (error) {
      // If token expired, try to refresh and retry once
      if (error instanceof Error && 
          (error.message.includes('401') || error.message.includes('unauthorized'))) {
        // Clear token and expiry to force refresh
        this.clearServiceToken();
        this.tokenExpiry = null;
        
        // Get a new token and retry
        await this.getServiceToken(scopes);
        
        // Make the request again
        switch (method) {
          case 'GET':
            return this.get<T>(url, options);
          case 'POST':
            return this.post<T>(url, data, options);
          case 'PUT':
            return this.put<T>(url, data, options);
          case 'PATCH':
            return this.patch<T>(url, data, options);
          case 'DELETE':
            return this.delete<T>(url, options);
        }
      }
      
      // If not a token issue or retry failed, just rethrow
      throw error;
    }
  }
} 