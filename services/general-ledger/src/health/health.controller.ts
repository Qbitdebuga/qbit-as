import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  DiskHealthIndicator, 
  MemoryHealthIndicator 
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check service health' })
  check() {
    return this.health.check([
      // Database connection check
      () => this.prismaHealth.isHealthy('database'),
      
      // Disk storage check
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
      
      // Memory heap check
      () => this.memory.checkHeap('memory_heap', 0.8),
      
      // Memory RSS check (Resident Set Size)
      () => this.memory.checkRSS('memory_rss', 0.8),
    ]);
  }
} 