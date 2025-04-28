import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceTokenService } from './service-token.service.js';
import type { GenerateTokenOptions } from './service-token.service.js';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';

@ApiTags('service-tokens')
@Controller('service-tokens')
export class ServiceTokenController {
  constructor(private readonly serviceTokenService: ServiceTokenService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a service token (admin only)' })
  async generateToken(@Body() options: GenerateTokenOptions): Promise<{ token: string }> {
    const token = await this.serviceTokenService.generateToken(options);
    return { token };
  }
} 