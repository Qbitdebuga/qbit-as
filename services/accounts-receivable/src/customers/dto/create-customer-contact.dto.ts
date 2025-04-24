import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean,
  MaxLength
} from 'class-validator';

export class CreateCustomerContactDto {
  @ApiProperty({ description: 'Contact first name', example: 'John' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Contact last name', example: 'Doe' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({ description: 'Contact email', example: 'john.doe@acme.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '555-987-6543' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Contact position/title', example: 'Purchasing Manager' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ description: 'Is primary contact', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
} 