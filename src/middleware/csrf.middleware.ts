import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csurf from 'csurf';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware for CSRF protection using csurf
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfProtection: any;

  constructor(private readonly configService: ConfigService) {
    this.csrfProtection = csurf({
      cookie: {
        httpOnly: true,
        secure: this.configService.get<boolean>('app.cookie.secure', false),
        sameSite: this.configService.get<'lax' | 'strict' | 'none'>('app.cookie.sameSite', 'lax'),
      }
    });
  }

  /**
   * Apply the CSRF middleware to the request
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for login endpoint
    if (req.path === '/api/auth/login') {
      return next();
    }

    // Apply CSRF protection
    this.csrfProtection(req, res, (err: any) => {
      if (err) {
        return next(err);
      }

      // Add CSRF token to response header for client-side use
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: this.configService.get<boolean>('app.cookie.secure', false),
        sameSite: this.configService.get<'lax' | 'strict' | 'none'>('app.cookie.sameSite', 'lax'),
      });

      next();
    });
  }
} 