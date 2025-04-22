import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { AccountType, AccountSubType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account code, must be unique' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Account description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Account type',
    enum: AccountType,
    enumName: 'AccountType'
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  type!: AccountType;

  @ApiProperty({ 
    description: 'Account subtype',
    enum: AccountSubType,
    enumName: 'AccountSubType'
  })
  @IsEnum(AccountSubType)
  @IsNotEmpty()
  subtype!: AccountSubType;

  @ApiProperty({ 
    description: 'Whether the account is active',
    default: true,
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Parent account ID, if any',
    required: false 
  })
  @IsUUID('4')
  @IsOptional()
  parentId?: string;
} 