import { 
  ServiceTokenRequestDto, 
  ServiceTokenResponseDto,
  ValidateTokenResponseDto
} from '@qbit/shared-types';

/**
 * Service Auth Client for service-to-service authentication
 * This client is used for secure communication between microservices
 */
export class ServiceAuthClient {
  private readonly apiUrl: string | null;
  private readonly serviceId: string | null;
  private readonly serviceName: string | null;
  private serviceToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    apiUrl: string, 
    serviceId: string, 
    serviceName: string
  ) {
    this.apiUrl = apiUrl;
    this.serviceId = serviceId;
    this.serviceName = serviceName;
  }

  /**
   * Get a service token for authentication with other services
   * Will cache the token and refresh if needed
   */
  async getServiceToken(scopes: string[]): Promise<string> {
    // Check if we have a valid token already
    if (this.serviceToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.serviceToken;
    }

    // Otherwise, fetch a new token
    const tokenRequest: ServiceTokenRequestDto = {
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      scopes
    };

    try {
      const response = await fetch(`${this.apiUrl}/auth/service-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenRequest)
      });

      if (!response.ok) {
        throw new Error(`Failed to get service token: ${response.statusText}`);
      }

      const tokenData: ServiceTokenResponseDto = await response.json();
      
      // Store token and set expiry (subtract 1 minute for safety margin)
      this.serviceToken = tokenData.accessToken;
      this.tokenExpiry = Date.now() + (tokenData.expiresIn * 1000) - 60000;
      
      return tokenData.accessToken;
    } catch (error) {
      console.error('Service token acquisition failed:', error);
      throw new Error(`Service authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate a service token
   */
  async validateToken(token: string): Promise<ValidateTokenResponseDto> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/validate-service-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        return { valid: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Service token validation failed:', error);
      return { valid: false };
    }
  }

  /**
   * Make an authenticated request to another service
   */
  async makeAuthenticatedRequest<T>(
    url: string, 
    options: RequestInit = {}, 
    scopes: string[] = []
  ): Promise<T> {
    // Get a token with the appropriate scopes
    const token = await this.getServiceToken(scopes);

    // Add the token to the request headers
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }
}