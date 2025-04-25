import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { formatError } from '../utils/error-handler';
import { getRequiredConfig, getConfig } from '../utils/config-utils';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    // These are required config values that will throw if missing
    this.serviceUrl = getRequiredConfig<string>(configService, 'AUTH_SERVICE_URL');
    this.apiKey = getRequiredConfig<string>(configService, 'AUTH_SERVICE_API_KEY');

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
      const serviceId = getRequiredConfig<string>(this.configService, 'SERVICE_ID');
      const serviceName = getRequiredConfig<string>(this.configService, 'SERVICE_NAME');
      
      const response = await this.httpClient.post('/auth/service-token', {
        serviceId,
        serviceName,
        scopes,
      });
      
      return response.data.accessToken;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get service token: ${message}`, stack);
      throw new Error(`Failed to get service token: ${message}`);
    }
  }

  /**
   * Validate a user token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const response = await this.httpClient.post('/auth/validate-token', { token });
      return response.data;
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Token validation failed: ${message}`, stack);
      throw new Error(`Token validation failed: ${message}`);
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
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Failed to get user by ID: ${message}`, stack);
      throw new Error(`Failed to get user: ${message}`);
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
    } catch (error: unknown) {
      const { message, stack } = formatError(error);
      this.logger.error(`Role check failed: ${message}`, stack);
      return false;
    }
  }
} 