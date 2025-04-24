import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  PrismaHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private diskHealth: DiskHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.diskHealth.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
} 