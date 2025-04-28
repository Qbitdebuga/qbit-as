import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ServiceTokenOptions {
  scopes: string[];
}

@Injectable()
export class AuthService {
  private authServiceUrl: string | null;
  private serviceId: string | null;
  private serviceName: string | null;
  private serviceSecret: string | null;
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this?.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3002');
    this.serviceId = 'gl';
    this.serviceName = 'General Ledger Service';
    this.serviceSecret = this?.configService.get<string>('SERVICE_GL_SECRET', '');
  }

  /**
   * Get a valid service token, either from cache or by requesting a new one
   */
  async getServiceToken(options: ServiceTokenOptions = { scopes: ['gl:read', 'gl:write'] }): Promise<string> {
    try {
      if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > Date.now()) {
        return this.token;
      }

      // Request a new token
      const response = await axios.post(`${this.authServiceUrl}/service-tokens`, {
        serviceId: this.serviceId,
        serviceName: this.serviceName,
        scopes: options.scopes,
      }, {
        headers: {
          'Authorization': `Bearer ${this.serviceSecret}`,
          'Content-Type': 'application/json',
        },
      });

      this.token = response?.data.token;
      
      // Set expiration time to slightly less than actual to account for clock skew
      // Default to 1 hour before expiry if we can't determine it
      const expiresInMs = 23 * 60 * 60 * 1000; // 23 hours
      this.tokenExpiresAt = Date.now() + expiresInMs;
      
      return this.token;
    } catch (error: any) {
      console.error('Failed to obtain service token:', error);
      throw new Error(`Failed to obtain service token: ${error.message}`);
    }
  }

  /**
   * Add authorization header to request config
   */
  async getAuthHeaders(options: ServiceTokenOptions = { scopes: ['gl:read', 'gl:write'] }): Promise<{ Authorization: string }> {
    const token = await this.getServiceToken(options);
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Force refresh the token
   */
  async refreshToken(options: ServiceTokenOptions = { scopes: ['gl:read', 'gl:write'] }): Promise<string> {
    this.token = null;
    this.tokenExpiresAt = null;
    return this.getServiceToken(options);
  }
} 