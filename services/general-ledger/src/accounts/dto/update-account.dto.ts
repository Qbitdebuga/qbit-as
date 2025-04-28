import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { AccountType, AccountSubType } from '../enums/account.enums.js';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto.js';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsEnum(AccountSubType)
  subtype?: AccountSubType;
} 