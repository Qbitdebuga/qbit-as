import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware.js';

@Module({
  providers: [LoggerMiddleware],
  exports: [LoggerMiddleware],
})
export class MiddlewareModule {} 