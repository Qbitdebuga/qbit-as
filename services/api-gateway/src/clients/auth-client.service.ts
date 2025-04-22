import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    this.apiKey = this.configService.get<string>('AUTH_SERVICE_API_KEY');

    if (!this.serviceUrl) {
      this.logger.error('AUTH_SERVICE_URL not configured');
      throw new Error('Auth service URL not configured');
    }

    this.httpClient = axios.create({
      baseURL: this.serviceUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    this.logger.log(`Auth client initialized with URL: ${this.serviceUrl}`);
  }

  /**
   * Get service authentication token for service-to-service communication
   */
  async getServiceToken(scopes: string[]): Promise<string> {
    try {
      const response = await this.httpClient.post('/auth/service-token', {
        serviceId: this.configService.get('SERVICE_ID'),
        serviceName: this.configService.get('SERVICE_NAME'),
        scopes,
      });
      
      return response.data.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get service token: ${error.message}`, error.stack);
      throw new Error(`Failed to get service token: ${error.message}`);
    }
  }

  /**
   * Validate a user token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const response = await this.httpClient.post('/auth/validate-token', { token });
      return response.data;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`, error.stack);
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }

  /**
   * Get user info by ID
   */
  async getUserById(userId: string, serviceToken: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${error.message}`, error.stack);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Check if user has the required roles
   */
  async checkUserRoles(userId: string, requiredRoles: string[], serviceToken: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/auth/check-roles', 
        { userId, requiredRoles },
        {
          headers: {
            'Authorization': `Bearer ${serviceToken}`
          }
        }
      );
      return response.data.hasAccess;
    } catch (error) {
      this.logger.error(`Role check failed: ${error.message}`, error.stack);
      return false;
    }
  }
} 