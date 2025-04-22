import axios from 'axios';

export interface ServiceTokenClientOptions {
  authServiceUrl: string;
  serviceId: string;
  serviceName: string;
  serviceSecret: string;
}

export class ServiceTokenClient {
  private authServiceUrl: string;
  private serviceId: string;
  private serviceName: string;
  private serviceSecret: string;
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(options: ServiceTokenClientOptions) {
    this.authServiceUrl = options.authServiceUrl;
    this.serviceId = options.serviceId;
    this.serviceName = options.serviceName;
    this.serviceSecret = options.serviceSecret;
  }

  /**
   * Get a valid service token, either from cache or by requesting a new one
   */
  async getToken(scopes: string[] = []): Promise<string> {
    // Check if we have a valid token already
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > Date.now()) {
      return this.token;
    }

    // Request a new token
    try {
      const response = await axios.post(`${this.authServiceUrl}/service-tokens`, {
        serviceId: this.serviceId,
        serviceName: this.serviceName,
        scopes,
      }, {
        headers: {
          'Authorization': `Bearer ${this.serviceSecret}`,
          'Content-Type': 'application/json',
        },
      });

      this.token = response.data.token;
      
      // Set expiration time to slightly less than actual to account for clock skew
      // Default to 1 hour before expiry if we can't determine it
      const expiresInMs = 23 * 60 * 60 * 1000; // 23 hours
      this.tokenExpiresAt = Date.now() + expiresInMs;
      
      return this.token;
    } catch (error) {
      console.error('Failed to obtain service token:', error);
      throw new Error(`Failed to obtain service token: ${error.message}`);
    }
  }

  /**
   * Add authorization header to request config
   */
  async getAuthHeader(scopes: string[] = []): Promise<{ Authorization: string }> {
    const token = await this.getToken(scopes);
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Force refresh the token
   */
  async refreshToken(scopes: string[] = []): Promise<string> {
    this.token = null;
    this.tokenExpiresAt = null;
    return this.getToken(scopes);
  }
} 