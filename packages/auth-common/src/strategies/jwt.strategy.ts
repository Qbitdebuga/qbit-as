import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, CurrentUser } from '../types/token.types';

/**
 * Configuration options for the JwtStrategy
 */
export interface JwtStrategyOptions {
  /**
   * JWT secret key
   */
  secret: string;
  
  /**
   * JWT issuer
   */
  issuer?: string;
  
  /**
   * JWT audience
   */
  audience?: string;
}

/**
 * Base JWT strategy for NestJS Passport that can be extended by microservices
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates an instance of JwtStrategy
   */
  constructor(options: JwtStrategyOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.secret,
      issuer: options.issuer,
      audience: options.audience,
    });
  }

  /**
   * Validates the JWT payload and returns the user
   * 
   * This method is called by Passport after the token has been verified
   * 
   * @param payload The JWT payload
   * @returns The user extracted from the token
   * @throws UnauthorizedException if validation fails
   */
  async validate(payload: JwtPayload): Promise<CurrentUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Extract specific user properties with defaults
    const { sub, username, email, roles = [], permissions = [], ...rest } = payload;

    return {
      id: sub,
      username,
      email,
      roles,
      permissions,
      ...rest
    };
  }
} 