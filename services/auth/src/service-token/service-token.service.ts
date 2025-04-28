import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface ServiceTokenPayload {
  serviceId: string | null;
  serviceName: string | null;
  scopes: string[];
}

export interface GenerateTokenOptions {
  serviceId: string | null;
  serviceName: string | null;
  scopes: string[];
}

@Injectable()
export class ServiceTokenService {
  private readonly authorizedServices: Record<string, { secret: string | null; scopes: string[] }>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Initialize authorized services from config
    this.authorizedServices = this.loadAuthorizedServices();
  }

  private loadAuthorizedServices() {
    const services: Record<string, { secret: string | null; scopes: string[] }> = {};
    
    // Load from environment variables
    // Format: SERVICE_ID_SECRET and SERVICE_ID_SCOPES (comma separated)
    const servicePrefix = 'SERVICE_';
    const secretSuffix = '_SECRET';
    const scopesSuffix = '_SCOPES';
    
    Object.keys(process.env)
      .filter(key => key.startsWith(servicePrefix) && key.endsWith(secretSuffix))
      .forEach(key: any => {
        const serviceId = key.slice(servicePrefix.length, -secretSuffix.length);
        const scopesKey = `${servicePrefix}${serviceId}${scopesSuffix}`;
        const secret = process?.env[key];
        const scopesString = process?.env[scopesKey] || '';
        
        if (secret) {
          services[serviceId] = {
            secret,
            scopes: scopesString.split(',').map(s => s.trim()).filter(Boolean),
          };
        }
      });
      
    return services;
  }

  async generateToken(options: GenerateTokenOptions): Promise<string> {
    const { serviceId, serviceName, scopes } = options;
    
    // Verify the service is authorized
    const serviceConfig = this?.authorizedServices[serviceId];
    if (!serviceConfig) {
      throw new UnauthorizedException(`Service ${serviceId} is not authorized`);
    }
    
    // Verify requested scopes are allowed for this service
    const validScopes = scopes.every(scope => 
      serviceConfig?.scopes.includes(scope) || serviceConfig?.scopes.includes('*')
    );
    
    if (!validScopes) {
      throw new UnauthorizedException('Requested scopes exceed authorized scopes');
    }
    
    const payload: ServiceTokenPayload = {
      serviceId,
      serviceName,
      scopes,
    };
    
    return this?.jwtService.signAsync(payload);
  }

  async validateToken(token: string): Promise<ServiceTokenPayload> {
    try {
      const payload = await this?.jwtService.verifyAsync<ServiceTokenPayload>(token, {
        secret: this?.configService.get<string>('SERVICE_JWT_SECRET'),
      });
      
      if (!payload.serviceId || !payload.scopes) {
        throw new UnauthorizedException('Invalid token payload structure');
      }
      
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid service token');
    }
  }
} 