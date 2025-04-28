import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SpanKind, SpanStatusCode } from '../index';
import { withSpan } from '../tracer';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const spanName = `HTTP ${req.method} ${req.path}`;
    
    return withSpan(
      spanName,
      async (span) => {
        // Add HTTP request attributes to the span
        span.setAttribute('http.method', req.method);
        span.setAttribute('http.url', req.originalUrl);
        span.setAttribute('http.host', req?.headers.host || '');
        span.setAttribute('http.user_agent', req?.headers['user-agent'] || '');
        
        // Store original end method
        const originalEnd = res.end;
        
        // Override end method to capture response status
        // @ts-ignore - Ignore typing issues with res.end override
        res.end = function(...args: any[]) {
          // Record response attributes
          span.setAttribute('http.status_code', res.statusCode);
          
          // Set appropriate span status based on HTTP status code
          if (res.statusCode >= 400) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `HTTP Error ${res.statusCode}`,
            });
            
            // For error responses, add error attributes
            span.setAttribute('error.type', 'HTTP');
            span.setAttribute('error.message', `HTTP Error ${res.statusCode}`);
          }
          
          // Call original end method
          // @ts-ignore - Ignore type issues with apply
          return originalEnd.apply(this, args);
        };
        
        // Continue with request processing
        next();
      },
      SpanKind.SERVER,
      {}
    );
  }
} 