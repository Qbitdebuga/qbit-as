import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly authServiceUrl: string;
  private serviceToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    if (!this.authServiceUrl) {
      this.logger.error('AUTH_SERVICE_URL is not defined in environment variables');
      throw new Error('AUTH_SERVICE_URL is not defined');
    }
  }

  /**
   * Get an authentication token for service-to-service communication
   */
  private async getServiceToken(): Promise<string> {
    // Check if token exists and is still valid (with 5 minute buffer)
    if (this.serviceToken && this.tokenExpiration && this.tokenExpiration > new Date(Date.now() + 5 * 60 * 1000)) {
      return this.serviceToken;
    }

    try {
      const serviceId = this.configService.get<string>('SERVICE_ID');
      const serviceSecret = this.configService.get<string>('SERVICE_SECRET');

      if (!serviceId || !serviceSecret) {
        throw new Error('Service credentials not properly configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/service/token`, {
          serviceId,
          serviceSecret,
        }),
      );

      this.serviceToken = response.data.accessToken;

      // Decode token to get expiration
      const decoded = this.jwtService.decode(this.serviceToken);
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        this.tokenExpiration = new Date(decoded.exp * 1000);
      } else {
        // Default to 1 hour if exp cannot be determined
        this.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
      }

      return this.serviceToken;
    } catch (error) {
      this.logger.error(`Failed to get service token: ${error.message}`, error.stack);
      throw new Error(`Authentication with Auth service failed: ${error.message}`);
    }
  }

  /**
   * Make an authenticated request to the Auth service
   */
  private async makeAuthenticatedRequest<T>(
    url: string,
    method: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const token = await this.getServiceToken();
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (method === 'GET') {
        response = await firstValueFrom(
          this.httpService.get(url, requestConfig),
        );
      } else if (method === 'POST') {
        response = await firstValueFrom(
          this.httpService.post(url, data, requestConfig),
        );
      } else if (method === 'PUT') {
        response = await firstValueFrom(
          this.httpService.put(url, data, requestConfig),
        );
      } else if (method === 'DELETE') {
        response = await firstValueFrom(
          this.httpService.delete(url, requestConfig),
        );
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Request to Auth service failed: ${error.message}`, error.stack);
      throw new Error(`Request to Auth service failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDto> {
    try {
      return this.makeAuthenticatedRequest<UserDto>(
        `${this.authServiceUrl}/users/${userId}`,
        'GET',
      );
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get users by IDs
   */
  async getUsersByIds(userIds: string[]): Promise<UserDto[]> {
    try {
      return this.makeAuthenticatedRequest<UserDto[]>(
        `${this.authServiceUrl}/users/batch`,
        'POST',
        { userIds },
      );
    } catch (error) {
      this.logger.error(`Failed to get users by IDs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate a user JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.makeAuthenticatedRequest<any>(
        `${this.authServiceUrl}/auth/validate-token`,
        'POST',
        { token },
      );
    } catch (error) {
      this.logger.error(`Failed to validate token: ${error.message}`, error.stack);
      throw error;
    }
  }
} 