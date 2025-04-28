import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceTokenService, GenerateTokenOptions } from './service-token.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('service-tokens')
@Controller('service-tokens')
export class ServiceTokenController {
  constructor(private readonly serviceTokenService: ServiceTokenService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a service token (admin only)' })
  async generateToken(@Body() options: GenerateTokenOptions): Promise<{ token: string }> {
    const token = await this?.serviceTokenService.generateToken(options);
    return { token };
  }
} 