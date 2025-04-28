import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean,
  MaxLength,
  IsNotEmpty
} from 'class-validator';

export class CreateCustomerContactDto {
  @ApiProperty({
    description: 'First name of the contact',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName!: string | null;

  @ApiProperty({
    description: 'Last name of the contact',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName!: string | null;

  @ApiPropertyOptional({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Phone number of the contact',
    example: '555-123-4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Position/title of the contact',
    example: 'Purchasing Manager',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @ApiPropertyOptional({
    description: 'Whether this is the primary contact',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean | null;
} 