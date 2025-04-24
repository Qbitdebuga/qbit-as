import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheckService, 
  HealthCheck, 
  DiskHealthIndicator, 
  MemoryHealthIndicator,
  HttpHealthIndicator,
  HealthIndicatorResult
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
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
    return this.health.check([
      // Check if the database is up and responding
      () => this.prismaHealth.isHealthy('database'),
      
      // Check if the disk has enough space
      () => this.diskHealth.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
      
      // Check if there's enough memory
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300MB
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if service is ready to handle requests' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  readiness() {
    return this.health.check([
      // Only check database connectivity for readiness
      () => this.prismaHealth.isHealthy('database'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Check if service is alive' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @ApiResponse({ status: 503, description: 'Service is not alive' })
  liveness() {
    // Basic check to see if the application is running
    return this.health.check([]);
  }

  @Get('dependencies')
  @HealthCheck()
  @ApiOperation({ summary: 'Check health of dependencies' })
  @ApiResponse({ status: 200, description: 'All dependencies are healthy' })
  @ApiResponse({ status: 503, description: 'One or more dependencies are unhealthy' })
  dependencies() {
    return this.health.check([
      // Check database connectivity
      () => this.prismaHealth.isHealthy('database'),
      
      // Check external services (e.g. RabbitMQ) if configured
      async (): Promise<HealthIndicatorResult> => {
        const rabbitMQUrl = this.configService.get('RABBITMQ_URL');
        if (rabbitMQUrl) {
          const managementUrl = rabbitMQUrl.replace('amqp://', 'http://').replace(':5672', ':15672/api/aliveness-test/');
          return this.httpHealth.pingCheck('rabbitmq', managementUrl);
        }
        return { rabbitmq: { status: 'up', message: 'skipped - not configured' } };
      },
    ]);
  }
} 