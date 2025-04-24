import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy', schema: { 
    properties: { 
      status: { type: 'string', example: 'ok' }, 
      service: { type: 'string', example: 'banking-service' },
      timestamp: { type: 'string', example: '2023-08-15T12:00:00Z' }
    } 
  }})
  check() {
    return {
      status: 'ok',
      service: 'banking-service',
      timestamp: new Date().toISOString(),
    };
  }
} 