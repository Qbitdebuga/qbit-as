import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PinoLoggerService } from './pino-logger.service';

/**
 * Middleware for logging HTTP requests using Pino logger
 * Provides high-performance HTTP request logging
 */
@Injectable()
export class PinoLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {
    this.logger.setContext('HTTP');
  }

  /**
   * Process HTTP request and log details
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = this.getIp(req);
    
    // Log request start
    this.logger.log(`${method} ${originalUrl} - Request received`, { 
      ip, 
      userAgent,
      requestId: req.headers['x-request-id'] || '',
      route: originalUrl
    });

    // Track request timing
    const start = Date.now();

    // When response is finished, log the details
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      
      const logObject = { 
        ip, 
        statusCode, 
        duration, 
        contentLength, 
        requestId: req.headers['x-request-id'] || '',
        route: originalUrl
      };
      
      // Log level depends on status code
      if (statusCode >= 500) {
        this.logger.error(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, undefined, logObject);
      } else if (statusCode >= 400) {
        this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, logObject);
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, logObject);
      }
    });

    next();
  }

  /**
   * Get client IP address from request
   */
  private getIp(request: Request): string {
    // Check X-Forwarded-For header for proxy setups
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // If comma-separated list, get the first IP (client IP)
      const ips = Array.isArray(forwardedFor) 
        ? forwardedFor[0] 
        : forwardedFor.split(',')[0].trim();
      return ips;
    }

    return request.ip || 
      request.connection?.remoteAddress || 
      'unknown';
  }
} 