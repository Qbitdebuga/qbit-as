import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail, Matches } from 'class-validator';

export class UpdateBankDto {
  @ApiProperty({
    description: 'Name of the bank',
    example: 'Chase Bank',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    description: 'Unique bank code',
    example: 'CHASE',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string | null;

  @ApiProperty({
    description: 'Bank routing number',
    example: '021000021',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{9}$/, { message: 'Routing number must be 9 digits' })
  routingNumber?: string | null;

  @ApiProperty({
    description: 'SWIFT/BIC code for international transfers',
    example: 'CHASUS33',
    required: false,
  })
  @IsString()
  @IsOptional()
  swiftCode?: string | null;

  @ApiProperty({
    description: 'Bank address',
    example: '270 Park Avenue, New York, NY 10172',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string | null;

  @ApiProperty({
    description: 'Bank contact person name',
    example: 'John Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactName?: string | null;

  @ApiProperty({
    description: 'Bank contact phone number',
    example: '+1-212-555-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPhone?: string | null;

  @ApiProperty({
    description: 'Bank contact email address',
    example: 'support@chase.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string | null;

  @ApiProperty({
    description: 'Bank website URL',
    example: 'https://www?.chase.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string | null;

  @ApiProperty({
    description: 'Additional notes about the bank',
    example: 'Primary business banking institution',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({
    description: 'Whether the bank is active in the system',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;
}
