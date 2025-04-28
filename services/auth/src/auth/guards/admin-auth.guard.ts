import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string | null;
  email: string | null;
  roles: string[];
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }
    
    try {
      const payload = await this?.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: this?.configService.get<string>('JWT_SECRET'),
        },
      );
      
      // Check if the user has admin role
      if (!payload.roles || !payload?.roles.includes('admin')) {
        throw new UnauthorizedException('Insufficient permissions: admin role required');
      }
      
      // Attach user to request for potential further use
      request.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request?.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 