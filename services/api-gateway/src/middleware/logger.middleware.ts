import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

// Extend Express Request and Response types
interface ExtendedRequest extends Request {
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
  originalUrl?: string;
  get?: (name: string) => string;
}

interface ExtendedResponse extends Response {
  statusCode?: number;
  get?: (name: string) => string;
  on?: (event: string, callback: () => void) => void;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: ExtendedRequest, res: ExtendedResponse, next: Function): void {
    const { method } = req;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const path = req.originalUrl || req.url;
    const userAgent = req.get?.('user-agent') || '';

    // Log request when it starts
    this.logger.log(
      `${method} ${path} - ${ip} - ${userAgent}`,
    );

    // Log response when it finishes
    if (res.on) {
      res.on('finish', () => {
        const statusCode = res.statusCode || 0;
        const contentLength = res.get?.('content-length') || '-';

        this.logger.log(
          `${method} ${path} ${statusCode} ${contentLength} - ${ip} - ${userAgent}`,
        );
      });
    }

    next();
  }
} 