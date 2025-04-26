import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ServiceTokenOptions {
  scopes: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private authServiceUrl: string;
  private serviceId: string;
  private serviceName: string;
  private serviceApiKey: string;
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3002');
    this.serviceId = this.configService.get<string>('SERVICE_ID', 'banking');
    this.serviceName = this.configService.get<string>('SERVICE_NAME', 'Banking Service');
    this.serviceApiKey = this.configService.get<string>('SERVICE_API_KEY', '');
    
    this.logger.log(`Auth service initialized with URL: ${this.authServiceUrl}`);
  }

  /**
   * Get a valid service token, either from cache or by requesting a new one
   */
  async getServiceToken(options: ServiceTokenOptions = { scopes: ['banking:read', 'banking:write'] }): Promise<string> {
    try {
      if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > Date.now()) {
        return this.token;
      }

      // Request a new token
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/service-token`, {
          serviceId: this.serviceId,
          serviceName: this.serviceName,
          scopes: options.scopes,
        }, {
          headers: {
            'X-API-Key': this.serviceApiKey,
            'Content-Type': 'application/json',
          },
        })
      );

      this.token = response.data.accessToken;
      
      // Set expiration time to slightly less than actual to account for clock skew
      // Default to 1 hour before expiry if we can't determine it
      const expiresInMs = 23 * 60 * 60 * 1000; // 23 hours
      this.tokenExpiresAt = Date.now() + expiresInMs;
      
      this.logger.log('Successfully obtained service token');
      return this.token;
    } catch (error: any) {
      this.logger.error(`Failed to obtain service token: ${error.message}`, error.stack);
      throw new Error(`Failed to obtain service token: ${error.message}`);
    }
  }

  /**
   * Add authorization header to request config
   */
  async getAuthHeaders(options: ServiceTokenOptions = { scopes: ['banking:read', 'banking:write'] }): Promise<{ Authorization: string }> {
    const token = await this.getServiceToken(options);
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Force refresh the token
   */
  async refreshToken(options: ServiceTokenOptions = { scopes: ['banking:read', 'banking:write'] }): Promise<string> {
    this.token = null;
    this.tokenExpiresAt = null;
    return this.getServiceToken(options);
  }
} 