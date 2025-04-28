import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    // Log request when it starts
    this?.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Log response when it finishes
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      this?.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${ip} - ${userAgent}`,
      );
    });

    next();
  }
}
