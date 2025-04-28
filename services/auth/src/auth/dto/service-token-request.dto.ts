import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceTokenRequestDto {
  @ApiProperty({
    description: 'Name of the service requesting a token',
    example: 'general-ledger-service',
  })
  @IsString()
  @IsNotEmpty()
  serviceName: string = '';

  @ApiProperty({
    description: 'API key to authenticate the service',
    example: 'api-key-for-service-authentication',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string = '';

  @ApiProperty({
    description: 'List of scopes requested for this token',
    example: ['read:users', 'create:journal-entries'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  scope: string[] = [];

  @ApiProperty({
    description: 'Optional token expiration time (default is 1h)',
    example: '2h',
    required: false,
  })
  @IsOptional()
  @IsString()
  expiresIn?: string | null;
} 