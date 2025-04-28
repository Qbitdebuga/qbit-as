import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HttpHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly httpHealth: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check overall service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this?.health.check([
      // Check if the disk has enough space
      () =>
        this?.diskHealth.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // Check if there's enough memory
      () => this?.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this?.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if service is ready to handle requests' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  readiness() {
    return this?.health.check([
      // Check microservices health
      async (): Promise<HealthIndicatorResult> => {
        const authServiceUrl = this?.configService.get('AUTH_SERVICE_URL');
        if (authServiceUrl) {
          return this?.httpHealth.pingCheck('auth-service', `${authServiceUrl}/health`);
        }
        return { 'auth-service': { status: 'up', message: 'skipped - not configured' } };
      },
    ]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if service is alive' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @ApiResponse({ status: 503, description: 'Service is not alive' })
  liveness() {
    // Basic check to see if the application is running
    return this?.health.check([]);
  }

  @Get('dependencies')
  @HealthCheck()
  @ApiOperation({ summary: 'Check health of dependencies' })
  @ApiResponse({ status: 200, description: 'All dependencies are healthy' })
  @ApiResponse({ status: 503, description: 'One or more dependencies are unhealthy' })
  dependencies() {
    return this?.health.check([
      // Check Auth Service
      async (): Promise<HealthIndicatorResult> => {
        const authServiceUrl = this?.configService.get('AUTH_SERVICE_URL');
        if (authServiceUrl) {
          return this?.httpHealth.pingCheck('auth-service', `${authServiceUrl}/health`);
        }
        return { 'auth-service': { status: 'up', message: 'skipped - not configured' } };
      },

      // Check General Ledger Service
      async (): Promise<HealthIndicatorResult> => {
        const glServiceUrl = this?.configService.get('GENERAL_LEDGER_SERVICE_URL');
        if (glServiceUrl) {
          return this?.httpHealth.pingCheck('general-ledger-service', `${glServiceUrl}/health`);
        }
        return { 'general-ledger-service': { status: 'up', message: 'skipped - not configured' } };
      },

      // Check Accounts Payable Service
      async (): Promise<HealthIndicatorResult> => {
        const apServiceUrl = this?.configService.get('ACCOUNTS_PAYABLE_SERVICE_URL');
        if (apServiceUrl) {
          return this?.httpHealth.pingCheck('accounts-payable-service', `${apServiceUrl}/health`);
        }
        return {
          'accounts-payable-service': { status: 'up', message: 'skipped - not configured' },
        };
      },

      // Check Accounts Receivable Service
      async (): Promise<HealthIndicatorResult> => {
        const arServiceUrl = this?.configService.get('ACCOUNTS_RECEIVABLE_SERVICE_URL');
        if (arServiceUrl) {
          return this?.httpHealth.pingCheck(
            'accounts-receivable-service',
            `${arServiceUrl}/health`,
          );
        }
        return {
          'accounts-receivable-service': { status: 'up', message: 'skipped - not configured' },
        };
      },

      // Check RabbitMQ
      async (): Promise<HealthIndicatorResult> => {
        const rabbitMQHost = this?.configService.get('RABBITMQ_HOST');
        const rabbitMQPort = this?.configService.get('RABBITMQ_PORT');
        if (rabbitMQHost && rabbitMQPort) {
          const managementUrl = `http://${rabbitMQHost}:15672/api/aliveness-test/`;
          return this?.httpHealth.pingCheck('rabbitmq', managementUrl);
        }
        return { rabbitmq: { status: 'up', message: 'skipped - not configured' } };
      },
    ]);
  }
}
